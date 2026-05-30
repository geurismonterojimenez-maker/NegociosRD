import { PrestamoResult, AmortizationRow } from '../../types';

/**
 * Calcula el cuadro de amortización francés de un préstamo (personal o hipotecario)
 * con desgloses detallados de principal, interés y seguros típicos dominicanos.
 * 
 * @param principal Monto del capital solicitado
 * @param tasaAnual Tasa de interés anual (porcentaje, e.g. 12.5 para 12.5%)
 * @param plazoMeses Plazo en meses (e.g. 12 para 1 año, 240 para 20 años)
 * @param esHipotecario Si es un préstamo hipotecario (aplica cálculos de seguros de vida y de propiedad)
 */
export function calculateAmortization(
  principal: number,
  tasaAnual: number,
  plazoMeses: number,
  esHipotecario: boolean = false
): PrestamoResult {
  const montoSolicitado = Math.max(1000, principal);
  const rAnual = Math.max(0.1, tasaAnual) / 100;
  const rMensual = rAnual / 12;
  const meses = Math.max(1, plazoMeses);

  // Calcular cuota fija mensual base (sin seguros) usando la fórmula de cuota francesa
  let cuotaBase = 0;
  if (rMensual === 0) {
    cuotaBase = Number((montoSolicitado / meses).toFixed(2));
  } else {
    cuotaBase = Number(
      (
        (montoSolicitado * rMensual * Math.pow(1 + rMensual, meses)) /
        (Math.pow(1 + rMensual, meses) - 1)
      ).toFixed(2)
    );
  }

  // Seguros mensuales típicos para préstamos hipotecarios en RD (APAP, Banreservas, etc.)
  // Seguro de Vida: aprox. 0.05% mensual sobre saldo insoluto o saldo inicial (tomaremos sobre saldo inicial)
  // Seguro de Propiedad/Incendio: aprox. 0.08% anualizado cobrado mensualmente (ej. 0.0067% mensual sobre principal)
  let tasaSeguroVidaMensual = esHipotecario ? 0.0004 : 0; // 0.04% mensual
  let tasaSeguroPropiedadMensual = esHipotecario ? 0.0006 : 0; // 0.06% mensual

  const vidaSeguroConstante = Number((montoSolicitado * tasaSeguroVidaMensual).toFixed(2));
  const propiedadSeguroConstante = Number((montoSolicitado * tasaSeguroPropiedadMensual).toFixed(2));
  const totalSegurosMensual = Number((vidaSeguroConstante + propiedadSeguroConstante).toFixed(2));

  const cuotaTotalMensual = Number((cuotaBase + totalSegurosMensual).toFixed(2));

  let balancePendiente = montoSolicitado;
  const tablaAmortizacion: AmortizationRow[] = [];
  let totalInteresPagado = 0;
  let totalSeguroPagado = 0;

  for (let i = 1; i <= meses; i++) {
    const interesMonto = Number((balancePendiente * rMensual).toFixed(2));
    let principalMonto = Number((cuotaBase - interesMonto).toFixed(2));

    // Ajuste para la última cuota para evitar discrepancias de decimales
    if (i === meses) {
      principalMonto = Number(balancePendiente.toFixed(2));
    }

    balancePendiente = Number((balancePendiente - principalMonto).toFixed(2));
    balancePendiente = Math.max(0, balancePendiente);

    const seguroVida = vidaSeguroConstante;
    const seguroPropiedad = propiedadSeguroConstante;

    totalInteresPagado += interesMonto;
    totalSeguroPagado += seguroVida + seguroPropiedad;

    tablaAmortizacion.push({
      period: i,
      cuotaTotal: Number((principalMonto + interesMonto + seguroVida + seguroPropiedad).toFixed(2)),
      interesMonto,
      principalMonto,
      seguroVida,
      seguroPropiedad,
      balancePendiente
    });
  }

  totalInteresPagado = Number(totalInteresPagado.toFixed(2));
  totalSeguroPagado = Number(totalSeguroPagado.toFixed(2));
  const totalPagadoFinal = Number((montoSolicitado + totalInteresPagado + totalSeguroPagado).toFixed(2));

  return {
    montoPrincipal: montoSolicitado,
    tasaAnual,
    plazoMeses: meses,
    cuotaBase,
    segurosMensual: {
      vida: vidaSeguroConstante,
      propiedad: propiedadSeguroConstante,
      total: totalSegurosMensual
    },
    cuotaTotalMensual,
    totalInteresPagado,
    totalSeguroPagado,
    totalPagadoFinal,
    tablaAmortizacion
  };
}
