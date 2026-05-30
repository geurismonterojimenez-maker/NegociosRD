import { TAX_RATES } from '../../config/tax-rates';
import { MargenResult } from '../../types';

/**
 * Calcula el precio de venta sugerido y los márgenes de ganancia sobre el costo.
 * 
 * @param costo Costo unitario del producto o servicio
 * @param margenDeseado Margen de ganancia pretendido (porcentaje, e.g. 30 para 30%)
 */
export function calculateBusinessMargin(costo: number, margenDeseado: number): MargenResult {
  const c = Math.max(0, costo);
  const m = Math.max(0, Math.min(99.9, margenDeseado)); // Evitar división por cero

  // Fórmula matemática del margen sobre precio: Precio = Costo / (1 - Margen)
  const precioSugerido = Number((c / (1 - m / 100)).toFixed(2));
  const gananciaBruta = Number((precioSugerido - c).toFixed(2));
  
  // Markup sobre el costo
  const markupMonto = gananciaBruta;
  const markupPorcentaje = c > 0 ? Number(((markupMonto / c) * 100).toFixed(2)) : 0;

  return {
    costo: c,
    precioSugerido,
    margenDeseado: m,
    gananciaBruta,
    markupMonto,
    markupPorcentaje
  };
}

export interface DgiiLateFeesResult {
  impuestoBase: number;
  mesesAtraso: number;
  recargoMoraMonto: number;
  interesIndemnizatorioMonto: number;
  totalPagar: number;
  desglose: string[];
}

/**
 * Calcula de forma fidedigna los recargos e interés indemnizatorio de la DGII por pago tardío.
 * Art. 252 del Código Tributario:
 * - Recargo Mora: 10% el primer mes, 4% por cada mes subsiguiente.
 * - Interés Indemnizatorio: 1.1% acumulativo por mes o fracción de mes.
 */
export function calculateDGIILateFees(impuestoBase: number, mesesAtraso: number): DgiiLateFeesResult {
  const normBase = Math.max(0, impuestoBase);
  const meses = Math.floor(Math.max(0, mesesAtraso));

  let recargoMoraPorc = 0;
  if (meses > 0) {
    recargoMoraPorc = TAX_RATES.recargosDGII.primerMes + (meses - 1) * TAX_RATES.recargosDGII.mesesSiguientes;
  }

  const recargoMoraMonto = Number((normBase * recargoMoraPorc).toFixed(2));
  
  // Interés indemnizatorio: 1.1% por cada mes o fracción (tiempo acumulativo)
  const interesIndemnizatorioPorc = TAX_RATES.recargosDGII.interesIndemnizatorio * meses;
  const interesIndemnizatorioMonto = Number((normBase * interesIndemnizatorioPorc).toFixed(2));

  const totalPagar = Number((normBase + recargoMoraMonto + interesIndemnizatorioMonto).toFixed(2));

  const desgloseSteps: string[] = [
    `Monto del impuesto omitido: RD$ ${normBase.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `Meses o fracciones de atraso: ${meses} mes(es)`
  ];

  if (meses > 0) {
    desgloseSteps.push(`Recargo por Mora aplicable: 10% (1er mes) + ${(meses - 1) * 4}% (${meses - 1} meses subsiguientes) = ${(recargoMoraPorc * 100).toFixed(0)}%`);
    desgloseSteps.push(`Monto por recargo de mora: RD$ ${recargoMoraMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    desgloseSteps.push(`Interés Indemnizatorio acumulativo (1.1% por mes): ${(interesIndemnizatorioPorc * 100).toFixed(1)}%`);
    desgloseSteps.push(`Monto por interés indemnizatorio: RD$ ${interesIndemnizatorioMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    desgloseSteps.push(`Monto total a liquidar ante la DGII: RD$ ${totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  } else {
    desgloseSteps.push(`No aplican recargos ni intereses por mora ya que no hay meses de atraso.`);
  }

  return {
    impuestoBase: normBase,
    mesesAtraso: meses,
    recargoMoraMonto,
    interesIndemnizatorioMonto,
    totalPagar,
    desglose: desgloseSteps
  };
}
export function getProportionRecargos(tax: number): number {
  return tax * 0.14; // Default secondary helper
}
