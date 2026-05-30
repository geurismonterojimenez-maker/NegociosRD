import { TAX_RATES } from '../../config/tax-rates';
import { PrestacionesResult } from '../../types';

/**
 * Calcula las prestaciones laborales de un trabajador dominicano según lo estipulado por el Código de Trabajo.
 * 
 * @param salarioMensual Salario bruto recibido mensualmente
 * @param fechaIngreso Fecha de contratación (YYYY-MM-DD)
 * @param fechaSalida Fecha de terminación (YYYY-MM-DD)
 * @param incluyePreaviso Si el empleador omitió el preaviso (en cuyo caso se paga)
 * @param incluyeCesantia Si el empleado tiene derecho a auxilio de cesantía (ej. desahucio por el empleador)
 * @param vacacionesPendientes El número de meses trabajados en el año actual sin haber tomado vacaciones (o 'tomadas' si ya las disfrutó)
 * @param mesesGozadosRegalia Cuántos meses del año calendario actual ha trabajado para el salario de navidad proporcional
 */
export function calculatePrestaciones(
  salarioMensual: number,
  fechaIngreso: string,
  fechaSalida: string,
  incluyePreaviso: boolean,
  incluyeCesantia: boolean,
  vacacionesPendientes: 'pendientes_completas' | 'proporcional' | 'ninguna',
  mesesGozadosRegalia: number
): PrestacionesResult {
  const normSalary = Math.max(0, salarioMensual);
  
  // Constante divisionaria oficial de salarios mensuales a diarios: 23.83
  const factorDivision = TAX_RATES.laboralFactoresDivision.mensual;
  const salarioDiario = Number((normSalary / factorDivision).toFixed(2));

  // Calcular tiempo de servicio a partir de las fechas
  const ingreso = new Date(fechaIngreso);
  const salida = new Date(fechaSalida);
  
  let totalDiasTrabajados = 0;
  if (!isNaN(ingreso.getTime()) && !isNaN(salida.getTime())) {
    const diffTime = Math.abs(salida.getTime() - ingreso.getTime());
    totalDiasTrabajados = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Estimar años, meses, días del tiempo de servicio
  let anos = 0;
  let meses = 0;
  let dias = 0;

  if (totalDiasTrabajados > 0) {
    let diffAnos = salida.getFullYear() - ingreso.getFullYear();
    let diffMeses = salida.getMonth() - ingreso.getMonth();
    let diffDias = salida.getDate() - ingreso.getDate();

    if (diffDias < 0) {
      diffMeses -= 1;
      // Obtener días del mes anterior
      const tempDate = new Date(salida.getFullYear(), salida.getMonth(), 0);
      diffDias += tempDate.getDate();
    }
    if (diffMeses < 0) {
      diffAnos -= 1;
      diffMeses += 12;
    }
    anos = diffAnos;
    meses = diffMeses;
    dias = diffDias;
  }

  const desglose: string[] = [];
  desglose.push(`Salario mensual: RD$ ${normSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  desglose.push(`Fórmula salario diario aplicable (Cobro Mensual): Salario Mensual / 23.83`);
  desglose.push(`Salario ordinario diario: RD$ ${salarioDiario.toFixed(2)}`);
  desglose.push(`Tiempo de servicio calculado: ${anos} año(s), ${meses} mes(es) y ${dias} día(s) (Total de ${totalDiasTrabajados} días).`);

  // 1. CÁLCULO DE PREAVISO (Art. 76 del Código de Trabajo)
  let preavisoDias = 0;
  let preavisoMonto = 0;
  
  if (incluyePreaviso) {
    const mesesTotales = (anos * 12) + meses;
    
    if (mesesTotales >= 3 && mesesTotales < 6) {
      preavisoDias = 7;
    } else if (mesesTotales >= 6 && mesesTotales < 12) {
      preavisoDias = 14;
    } else if (mesesTotales >= 12) {
      preavisoDias = 28;
    }

    preavisoMonto = Number((preavisoDias * salarioDiario).toFixed(2));
    if (preavisoDias > 0) {
      desglose.push(`Preaviso omitido por el empleador: Le corresponden ${preavisoDias} días de preaviso de acuerdo a la antigüedad elegida.`);
    } else {
      desglose.push(`Preaviso: Menor a 3 meses de servicio, no le corresponde preaviso según ley.`);
    }
  } else {
    desglose.push(`Preaviso: Ya fue otorgado/laborado por el trabajador, por tanto no se compensa económicamente en la liquidación.`);
  }

  // 2. CÁLCULO DE CESANTÍA (Art. 80 del Código de Trabajo)
  let cesantiaDias = 0;
  let cesantiaMonto = 0;

  if (incluyeCesantia) {
    const mesesTotales = (anos * 12) + meses;
    
    // Por los años completos
    if (anos >= 1 && anos < 5) {
      cesantiaDias += anos * 21;
    } else if (anos >= 5) {
      cesantiaDias += anos * 23;
    } else {
      // Fracción menor a un año inicial
      if (meses >= 3 && meses < 6) {
        cesantiaDias += 6;
      } else if (meses >= 6 && meses < 12) {
        cesantiaDias += 13;
      }
    }

    // Por las fracciones de año si trabajó más de 1 año
    if (anos >= 1) {
      if (meses >= 3 && meses < 6) {
        cesantiaDias += 6;
      } else if (meses >= 6 && meses < 12) {
        cesantiaDias += 13;
      }
    }

    cesantiaMonto = Number((cesantiaDias * salarioDiario).toFixed(2));
    if (cesantiaDias > 0) {
      desglose.push(`Auxilio de Cesantía aplicable: Le corresponden ${cesantiaDias} días de indemnización.`);
    } else {
      desglose.push(`Cesantía: Antigüedad menor a 3 meses, por ley no acumula cesantía.`);
    }
  } else {
    desglose.push(`Cesantía: No aplica (ej. renuncia voluntaria o dimisión justificada no comprobada).`);
  }

  // 3. CÁLCULO DE VACACIONES (Art. 177 - 180 del Código de Trabajo)
  let vacacionesDias = 0;
  let vacacionesMonto = 0;

  if (vacacionesPendientes === 'pendientes_completas') {
    if (anos >= 1 && anos < 5) {
      vacacionesDias = 14;
    } else if (anos >= 5) {
      vacacionesDias = 18;
    } else {
      // Proporcional si no llega al año pero tiene más de 5 meses
      if (meses === 5) vacacionesDias = 6;
      else if (meses === 6) vacacionesDias = 7;
      else if (meses === 7) vacacionesDias = 8;
      else if (meses === 8) vacacionesDias = 9;
      else if (meses === 9) vacacionesDias = 10;
      else if (meses === 10) vacacionesDias = 11;
      else if (meses >= 11) vacacionesDias = 12;
    }
  } else if (vacacionesPendientes === 'proporcional') {
    // Escala proporcional de meses trabajados en el año actual sin haber tomado vacaciones
    const mesesFraccion = meses % 12;
    if (mesesFraccion === 5) vacacionesDias = 6;
    else if (mesesFraccion === 6) vacacionesDias = 7;
    else if (mesesFraccion === 7) vacacionesDias = 8;
    else if (mesesFraccion === 8) vacacionesDias = 9;
    else if (mesesFraccion === 9) vacacionesDias = 10;
    else if (mesesFraccion === 10) vacacionesDias = 11;
    else if (mesesFraccion >= 11) vacacionesDias = 12;
    else if (mesesFraccion >= 12 || anos >= 1) {
      vacacionesDias = anos >= 5 ? 18 : 14;
    }
  }

  vacacionesMonto = Number((vacacionesDias * salarioDiario).toFixed(2));
  if (vacacionesDias > 0) {
    desglose.push(`Vacaciones no tomadas compensadas: Se añaden ${vacacionesDias} días de salario ordinario.`);
  } else {
    desglose.push(`Vacaciones: Ya fueron tomadas por el empleado durante el período actual.`);
  }

  // 4. CÁLCULO DE REGALÍA PASCUAL (Salario de Navidad, Art. 219 del Código de Trabajo)
  // Consiste en la duodécima parte de lo ganado en el año calendario en curso (1/12)
  const regaliaMesesContemplados = Math.max(0, Math.min(12, mesesGozadosRegalia));
  // Total ganado aproximado en base al salario de contratación
  const totalSalariosGanadosEsteAno = normSalary * regaliaMesesContemplados;
  const regaliaMonto = Number((totalSalariosGanadosEsteAno / 12).toFixed(2));
  
  desglose.push(`Salario de Navidad Proporcional (Regalía Pascual): Acumuló ${regaliaMesesContemplados} mes(es) laborados este año con salario de RD$ ${normSalary.toLocaleString('en-US')}. Dividido entre 12.`);

  const liquidacionTotal = Number((preavisoMonto + cesantiaMonto + vacacionesMonto + regaliaMonto).toFixed(2));

  return {
    salarioMensual: normSalary,
    tipoCobro: 'mensual',
    salarioDiario,
    fechaIngreso,
    fechaSalida,
    tiempoServicio: {
      anos,
      meses,
      dias,
      totalDiasTrabajados
    },
    aplicaPreaviso: incluyePreaviso && preavisoDias > 0,
    aplicaCesantia: incluyeCesantia && cesantiaDias > 0,
    aplicaVacaciones: vacacionesDias > 0,
    aplicaRegalia: regaliaMonto > 0,
    
    preavisoMonto,
    preavisoDias,
    
    cesantiaMonto,
    cesantiaDias,
    
    vacacionesMonto,
    vacacionesDias,
    
    regaliaMonto,
    regaliaMesesContemplados,
    
    liquidacionTotal,
    desgloseExplicativo: desglose
  };
}
export function getProportionMonthsCurrentYear(entryMonth: number, exitMonth: number): number {
  return exitMonth; // Default straightforward proxy
}
