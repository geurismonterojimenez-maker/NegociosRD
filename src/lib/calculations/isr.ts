import { TAX_RATES } from '../../config/tax-rates';
import { IsrResult } from '../../types';

/**
 * Calcula el Impuesto Sobre la Renta (ISR) de un profesional independiente o asalariado.
 * @param monthlySalary Salario mensual bruto
 * @param applyTssDeduction Si se deben deducir previamente los aportes de AFP y SFS (obligatorio para asalariados de nómina)
 */
export function calculateIsrAsalariado(monthlySalary: number, applyTssDeduction: boolean = true): IsrResult {
  const grossMonthly = Math.max(0, monthlySalary);
  
  // 1. Calcular TSS para empleados (AFP y SFS con sus topes de salario cotizable)
  let monthlyAfp = 0;
  let monthlySfs = 0;
  
  const baseTSS = TAX_RATES.topesCotizables.salarioMinimoTSS;
  const maxCotizableAFP = baseTSS * TAX_RATES.topesCotizables.afpMultiplicador; // 20 salarios mínimos = RD$ 386,000.00
  const maxCotizableSFS = baseTSS * TAX_RATES.topesCotizables.sfsMultiplicador; // 10 salarios mínimos = RD$ 193,000.00

  if (applyTssDeduction) {
    // AFP: Se descuenta el 2.87% del salario, topado al máximo establecido por Ley
    const salarioCotizableAFP = Math.min(grossMonthly, maxCotizableAFP);
    monthlyAfp = Number((salarioCotizableAFP * TAX_RATES.tssEmpleado.afp).toFixed(2));
    
    // SFS: Se descuenta el 3.04% del salario, topado al máximo establecido por Ley
    const salarioCotizableSFS = Math.min(grossMonthly, maxCotizableSFS);
    monthlySfs = Number((salarioCotizableSFS * TAX_RATES.tssEmpleado.sfs).toFixed(2));
  }

  const totalTssDeduction = Number((monthlyAfp + monthlySfs).toFixed(2));
  
  // Salario Mensual imponible para fines de ISR (Salario tras aportes TSS)
  const monthlyImponibleIsr = Math.max(0, grossMonthly - totalTssDeduction);
  
  // ISR de la DGII se calcula sobre montos anualizados
  const annualImponibleIsr = Number((monthlyImponibleIsr * 12).toFixed(2));
  
  let annualIsrAmount = 0;
  const steps: string[] = [];
  
  // 2. Aplicar escala impositiva anual de la DGII
  const scales = TAX_RATES.isrEscalasAnuales;
  
  steps.push(`Salario bruto mensual: RD$ ${grossMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  if (applyTssDeduction) {
    steps.push(`Aporte mensual AFP (2.87%): RD$ ${monthlyAfp.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Tope cotizable: RD$ ${maxCotizableAFP.toLocaleString('en-US')})`);
    steps.push(`Aporte mensual SFS (3.04%): RD$ ${monthlySfs.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Tope cotizable: RD$ ${maxCotizableSFS.toLocaleString('en-US')})`);
    steps.push(`Total deducciones de TSS: RD$ ${totalTssDeduction.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }
  steps.push(`Ingreso neto mensual para fines de ISR: RD$ ${monthlyImponibleIsr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  steps.push(`Monto anualizado sujeto a ISR (Multiplicado por 12): RD$ ${annualImponibleIsr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  // Determinar la escala en la que cae el salario anualizado
  let scaleApplied = scales[0];
  for (const scale of scales) {
    if (annualImponibleIsr >= scale.limiteMinimo && annualImponibleIsr <= scale.limiteMaximo) {
      scaleApplied = scale;
      break;
    }
  }

  if (scaleApplied.tasa === 0) {
    annualIsrAmount = 0;
    steps.push(`Monto de RD$ ${annualImponibleIsr.toLocaleString('en-US', { minimumFractionDigits: 2 })} es menor o igual al exento anual (RD$ 416,220.00). El empleado está Exento de ISR.`);
  } else {
    const excedente = Number((annualImponibleIsr - scaleApplied.excedenteRestar).toFixed(2));
    const porcMonto = Number((excedente * scaleApplied.tasa).toFixed(2));
    annualIsrAmount = Number((scaleApplied.tasaFijaAdicional + porcMonto).toFixed(2));

    steps.push(`La renta anual cae en el rango impositivo de ${scaleApplied.tasa * 100}% (Renta de RD$ ${scaleApplied.limiteMinimo.toLocaleString('en-US')} a RD$ ${scaleApplied.limiteMaximo === Infinity ? 'en adelante' : scaleApplied.limiteMaximo.toLocaleString('en-US')}).`);
    steps.push(`Excedente sobre el límite inferior de RD$ ${scaleApplied.excedenteRestar.toLocaleString('en-US', { minimumFractionDigits: 2 })}: RD$ ${excedente.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    steps.push(`Impuesto porcentual (${scaleApplied.tasa * 100}% del excedente): RD$ ${porcMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    if (scaleApplied.tasaFijaAdicional > 0) {
      steps.push(`Impuesto fijo adicional correspondiente al tramo anterior: RD$ ${scaleApplied.tasaFijaAdicional.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    }
    steps.push(`Total de ISR anual acumulado: RD$ ${annualIsrAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }

  const monthlyIsrAmount = Number((annualIsrAmount / 12).toFixed(2));
  const effectiveIsrRate = grossMonthly > 0 ? Number(((monthlyIsrAmount / grossMonthly) * 100).toFixed(2)) : 0;

  if (annualIsrAmount > 0) {
    steps.push(`Retención mensual de ISR (Total anual / 12 meses): RD$ ${monthlyIsrAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    steps.push(`Tasa efectiva de retención sobre el salario bruto mensual: ${effectiveIsrRate}%`);
  }

  return {
    monthlyGross: grossMonthly,
    annualGross: grossMonthly * 12,
    monthlyTssDeduction: {
      afp: monthlyAfp,
      sfs: monthlySfs,
      total: totalTssDeduction
    },
    monthlyImponibleIsr,
    annualImponibleIsr,
    annualIsrAmount,
    monthlyIsrAmount,
    effectiveIsrRate,
    calculationSteps: steps
  };
}
