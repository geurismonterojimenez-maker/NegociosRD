import { TAX_RATES } from '../../config/tax-rates';
import { TssResult, SalarioNetoResult } from '../../types';
import { calculateIsrAsalariado } from './isr';

/**
 * Calcula de forma detallada los montos correspondientes a la TSS (Tesoreria de la Seguridad Social)
 * para el empleado y el empleador.
 * @param baseSalary Salario base cotizable
 */
export function calculateTSSDetails(baseSalary: number): TssResult {
  const normSalary = Math.max(0, baseSalary);
  const baseTSS = TAX_RATES.topesCotizables.salarioMinimoTSS;
  const maxCotizableAFP = baseTSS * TAX_RATES.topesCotizables.afpMultiplicador; // e.g. RD$ 386,000
  const maxCotizableSFS = baseTSS * TAX_RATES.topesCotizables.sfsMultiplicador; // e.g. RD$ 193,000
  const maxCotizableSRL = baseTSS * TAX_RATES.topesCotizables.srlMultiplicador; // e.g. RD$ 77,200

  // 1. Empleado
  const cotizableAfpEmp = Math.min(normSalary, maxCotizableAFP);
  const cotizableSfsEmp = Math.min(normSalary, maxCotizableSFS);

  const afpEmpleado = Number((cotizableAfpEmp * TAX_RATES.tssEmpleado.afp).toFixed(2));
  const sfsEmpleado = Number((cotizableSfsEmp * TAX_RATES.tssEmpleado.sfs).toFixed(2));
  const totalEmpleado = Number((afpEmpleado + sfsEmpleado).toFixed(2));

  // 2. Empleador (Patronal)
  // Las empresas cotizan sobre el AFP (7.10%), SFS (7.09%), SRL (1.20% promedio - topado a 4 salarios mínimos)
  const cotizableAfpPatr = Math.min(normSalary, maxCotizableAFP);
  const cotizableSfsPatr = Math.min(normSalary, maxCotizableSFS);
  const cotizableSrl = Math.min(normSalary, maxCotizableSRL);

  const afpEmpleador = Number((cotizableAfpPatr * TAX_RATES.tssEmpleador.afp).toFixed(2));
  const sfsEmpleador = Number((cotizableSfsPatr * TAX_RATES.tssEmpleador.sfs).toFixed(2));
  const srlEmpleador = Number((cotizableSrl * TAX_RATES.tssEmpleador.srlBase).toFixed(2));
  
  // INFOTEP es el 1% del salario ordinario mensual consolidado a cargo exclusivo del empleador
  const infotepEmpleador = Number((normSalary * TAX_RATES.tssEmpleador.infotep).toFixed(2));
  
  const totalEmpleador = Number((afpEmpleador + sfsEmpleador + srlEmpleador + infotepEmpleador).toFixed(2));

  return {
    salarioBase: normSalary,
    empleado: {
      afp: afpEmpleado,
      sfs: sfsEmpleado,
      total: totalEmpleado
    },
    empleador: {
      afp: afpEmpleador,
      sfs: sfsEmpleador,
      srl: srlEmpleador,
      infotep: infotepEmpleador,
      total: totalEmpleador
    },
    totalesSectores: Number((totalEmpleado + totalEmpleador).toFixed(2))
  };
}

/**
 * Calcula el desglose completo del salario neto
 * @param salarioBruto Salario bruto mensual
 */
export function calculateSalarioNeto(salarioBruto: number): SalarioNetoResult {
  const normSalary = Math.max(0, salarioBruto);
  
  // 1. Calcular descuentos de TSS
  const tss = calculateTSSDetails(normSalary);
  
  // 2. Calcular retenciones de ISR
  const isrResult = calculateIsrAsalariado(normSalary, true);
  
  const totalDescuentos = Number((tss.empleado.total + isrResult.monthlyIsrAmount).toFixed(2));
  const salarioNeto = Number((normSalary - totalDescuentos).toFixed(2));
  const porcentajeNeto = normSalary > 0 ? Number(((salarioNeto / normSalary) * 100).toFixed(2)) : 0;

  return {
    salarioBruto: normSalary,
    afpMonto: tss.empleado.afp,
    sfsMonto: tss.empleado.sfs,
    isrMonto: isrResult.monthlyIsrAmount,
    totalDescuentos,
    salarioNeto,
    porcentajeNeto,
    patronalEstimado: {
      afp: tss.empleador.afp,
      sfs: tss.empleador.sfs,
      srl: tss.empleador.srl,
      infotep: tss.empleador.infotep,
      total: tss.empleador.total
    }
  };
}
