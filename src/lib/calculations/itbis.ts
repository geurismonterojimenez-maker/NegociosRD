import { TAX_RATES } from '../../config/tax-rates';
import { ItbisResult } from '../../types';

/**
 * Calcula el ITBIS a partir de un valor base (ITBIS Excluido)
 * @param amount Monto neto
 * @param rate Tasa decimal de ITBIS (e.g. 0.18, 0.16)
 */
export function calculateItbisExcluido(amount: number, rate: number = TAX_RATES.itbis.general): ItbisResult {
  const normAmount = Math.max(0, amount);
  const itbisAmount = Number((normAmount * rate).toFixed(2));
  const totalWithItbis = Number((normAmount + itbisAmount).toFixed(2));

  return {
    baseAmount: normAmount,
    itbisRate: rate,
    itbisAmount,
    totalWithItbis,
    isIncluded: false,
    explanation: `Se calcula el ITBIS multiplicando el valor base (RD$ ${normAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}) por la tasa del ${(rate * 100)}% (RD$ ${itbisAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}). El total es la suma de ambos valores (RD$ ${totalWithItbis.toLocaleString('en-US', { minimumFractionDigits: 2 })}).`
  };
}

/**
 * Calcula el valor neto y el ITBIS a partir de un total con el ITBIS ya incluido (ITBIS Incluido)
 * @param total Amount total pagado
 * @param rate Tasa decimal de ITBIS (e.g. 0.18, 0.16)
 */
export function calculateItbisIncluido(total: number, rate: number = TAX_RATES.itbis.general): ItbisResult {
  const normTotal = Math.max(0, total);
  
  // Fórmula: Base = Total / (1 + Tasa)
  const baseAmount = Number((normTotal / (1 + rate)).toFixed(2));
  const itbisAmount = Number((normTotal - baseAmount).toFixed(2));

  return {
    baseAmount,
    itbisRate: rate,
    itbisAmount,
    totalWithItbis: normTotal,
    isIncluded: true,
    explanation: `Para extraer el ITBIS incluido del ${(rate * 100)}%, se divide el monto total (RD$ ${normTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}) entre ${(1 + rate)} para hallar el valor neto (RD$ ${baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}). El ITBIS es la diferencia restante (RD$ ${itbisAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}).`
  };
}
