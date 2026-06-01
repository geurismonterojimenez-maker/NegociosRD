/**
 * Tu Negocio RD - Dominican Republic Financial, Labor, and Business Calculations Suite (2026)
 * Strictly calibrated to the DGII, Ministerio de Trabajo, and TSS Dominican frameworks.
 */

// ==========================================
// --- LABOR ADDITIONS / CALCULATIONS ---
// ==========================================

// Double Salary / 13th Month / Regalía Pascual
export function calculateRegaliaPascualDetail(monthlySalary: number, monthsWorked: number) {
  const normSalary = Math.max(0, monthlySalary);
  const normMonths = Math.max(0, Math.min(12, monthsWorked));
  const totalEarned = normSalary * normMonths;
  const regaliaAmount = totalEarned / 12;

  return {
    monthlySalary: normSalary,
    monthsWorked: normMonths,
    totalEarned,
    regaliaAmount,
    formula: "Suma de salarios ordinarios del año / 12",
    legalSource: "Artículo 219 del Código de Trabajo de la República Dominicana",
    workedRatio: `${normMonths}/12`
  };
}

// Overtime / Horas Extras (Art. 203)
export function calculateHorasExtras(
  monthlySalary: number,
  hoursAbove44To68Rate: number, // Normal over 44 up to 68 weekly hours (+35%)
  hoursAbove68Rate: number,     // Heavy over 68 weekly hours (+100%)
  holidayHoursRate: number      // Holiday/Weekend hours (+100%)
) {
  const normSalary = Math.max(0, monthlySalary);
  const dailySalary = Number((normSalary / 23.83).toFixed(2));
  const hourlySalary = Number((dailySalary / 8).toFixed(2)); // Standard 8-hour shift

  const excessRateFactor = 1.35; // +35%
  const doubleRateFactor = 2.00; // +100%

  const amount44To68 = Number((hoursAbove44To68Rate * hourlySalary * excessRateFactor).toFixed(2));
  const amountAbove68 = Number((hoursAbove68Rate * hourlySalary * doubleRateFactor).toFixed(2));
  const amountHoliday = Number((holidayHoursRate * hourlySalary * doubleRateFactor).toFixed(2));

  const totalOvertimeEarned = Number((amount44To68 + amountAbove68 + amountHoliday).toFixed(2));
  const finalSalaryWithOT = Number((normSalary + totalOvertimeEarned).toFixed(2));

  return {
    monthlySalary: normSalary,
    dailySalary,
    hourlySalary,
    hours44To68: hoursAbove44To68Rate,
    amount44To68,
    hoursAbove68: hoursAbove68Rate,
    amountAbove68,
    hoursHoliday: holidayHoursRate,
    amountHoliday,
    totalOvertimeEarned,
    finalSalaryWithOT,
    formula: "H. Extra (44-68h): Horas * Valor Hora * 1.35; H. Extra (>68h o Festivo): Horas * Valor Hora * 2.00",
    legalSource: "Artículos 203 y 204 del Código de Trabajo de la Rep. Dom."
  };
}

// Night Shift Premium / Trabajo Nocturno (Art. 204)
export function calculateTrabajoNocturno(monthlySalary: number, nightHours: number) {
  const normSalary = Math.max(0, monthlySalary);
  const dailySalary = Number((normSalary / 23.83).toFixed(2));
  const hourlySalary = Number((dailySalary / 8).toFixed(2));

  const premiumFactor = 0.15; // +15% premium for night work
  const rawNightPay = hourlySalary * nightHours;
  const nightPremiumAmount = Number((nightHours * hourlySalary * premiumFactor).toFixed(2));
  const totalNightIncome = Number((rawNightPay + nightPremiumAmount).toFixed(2));

  return {
    monthlySalary: normSalary,
    hourlySalary,
    nightHours,
    nightPremiumAmount,
    totalNightIncome,
    formula: "Recargo Nocturno = Horas Nocturnas * Valor Hora * 15%",
    legalSource: "Artículo 204 del Código de Trabajo de la República Dominicana (Recargo del 15% entre las 9:00 PM y las 7:00 AM)"
  };
}

// Wage per Hour / Salario por Hora
export function calculateSalarioPorHora(monthlySalary: number, dailyHours: number = 8) {
  const normSalary = Math.max(0, monthlySalary);
  const dailySalary = Number((normSalary / 23.83).toFixed(2));
  const hourlySalary = Number((dailySalary / Math.max(1, dailyHours)).toFixed(2));

  return {
    monthlySalary: normSalary,
    dailyHours,
    dailySalary,
    hourlySalary,
    formula: "Salario Diario = Salario Mensual / 23.83; Salario por Hora = Salario Diario / Horas por Día",
    legalSource: "Resoluciones vigentes del Comité Nacional de Salarios"
  };
}

// Biweekly Wage / Salario Quincenal
export function calculateSalarioQuincenal(monthlySalary: number) {
  const normSalary = Math.max(0, monthlySalary);
  const quincenalSalary = Number((normSalary / 2).toFixed(2));
  const dailySalary = Number((normSalary / 23.83).toFixed(2));

  return {
    monthlySalary: normSalary,
    quincenalSalary,
    dailySalary,
    formula: "Salario Quincenal = Salario Mensual / 2. Coeficiente diario = Salario Mensual / 23.83",
    legalSource: "Código Laboral Dominicano"
  };
}

// Bonuses / Bonificaciones de Ley (Participación en Utilidades - Art. 223)
export function calculateBonificaciones(monthlySalary: number, yearsOfService: number, sharePercentage: number = 10) {
  const normSalary = Math.max(0, monthlySalary);
  const dailySalary = Number((normSalary / 23.83).toFixed(2));
  
  let daysEligible = 0;
  if (yearsOfService > 0) {
    if (yearsOfService < 3) {
      daysEligible = 45; // 45 days for service under 3 years
    } else {
      daysEligible = 60; // 60 days for service 3+ years
    }
  }

  const bonusAmount = Number((daysEligible * dailySalary).toFixed(2));

  return {
    monthlySalary: normSalary,
    yearsOfService,
    daysEligible,
    dailySalary,
    sharePercentage,
    bonusAmount,
    formula: "Si Antigüedad < 3 años: 45 días de salario ordinario diario. Si Antigüedad >= 3 años: 60 días.",
    legalSource: "Artículos 223 al 227 del Código de Trabajo de la República Dominicana"
  };
}

// Pending Vacations / Vacaciones Pendientes
export function calculateVacacionesPendientes(monthlySalary: number, monthsWorkedInYear: number, overdueDays: number = 0) {
  const normSalary = Math.max(0, monthlySalary);
  const dailySalary = Number((normSalary / 23.83).toFixed(2));

  // Dominican Scale for partial year vacations:
  let vacationDays = 0;
  if (monthsWorkedInYear === 5) vacationDays = 6;
  else if (monthsWorkedInYear === 6) vacationDays = 7;
  else if (monthsWorkedInYear === 7) vacationDays = 8;
  else if (monthsWorkedInYear === 8) vacationDays = 9;
  else if (monthsWorkedInYear === 9) vacationDays = 10;
  else if (monthsWorkedInYear === 10) vacationDays = 11;
  else if (monthsWorkedInYear >= 11) vacationDays = 12;

  const proportionalVacationPay = Number((vacationDays * dailySalary).toFixed(2));
  const overdueVacationPay = Number((overdueDays * dailySalary).toFixed(2));
  const totalVacationPay = Number((proportionalVacationPay + overdueVacationPay).toFixed(2));

  return {
    monthlySalary: normSalary,
    monthsWorkedInYear,
    vacationDays,
    overdueDays,
    proportionalVacationPay,
    overdueVacationPay,
    totalVacationPay,
    formula: "Pago Vacaciones = (Días Proporcionales de Escala + Días Vencidos Pendientes) * Salario Diario",
    legalSource: "Artículos 177 y 180 del Código de Trabajo"
  };
}

// Proportional Christmas Bonus / Regalía Proporcional
export function calculateRegaliaProporcional(totalSalaryEarnedInYear: number) {
  const normTotal = Math.max(0, totalSalaryEarnedInYear);
  const regaliaProporcional = Number((normTotal / 12).toFixed(2));

  return {
    totalSalaryEarnedInYear: normTotal,
    regaliaProporcional,
    formula: "Regalía Pascual = Suma de todos los salarios devengados en el año actual / 12",
    legalSource: "Artículo 219 del Código de Trabajo, libre de retenciones impositivas y de la TSS."
  };
}

// Employee Cost to Employer / Costo Empleado para Empresa
export function calculateCostoEmpleado(monthlySalary: number, arlRiskRate: number = 1.20) {
  const normSalary = Math.max(0, monthlySalary);

  // Employer TSS Rates (Tapas/Cap apply on standard TSS formulas)
  const afpEmployerRate = 0.0710; // 7.10%
  const sfsEmployerRate = 0.0709; // 7.09%
  const arlEmployerRate = Math.max(0, arlRiskRate) / 100; // Average 1.20%
  const infotepEmployerRate = 0.0100; // 1.00%

  // Compute social cost
  const baseSalary = normSalary;
  const afpEmployerCost = Number((baseSalary * afpEmployerRate).toFixed(2));
  const sfsEmployerCost = Number((baseSalary * sfsEmployerRate).toFixed(2));
  const arlEmployerCost = Number((baseSalary * arlEmployerRate).toFixed(2));
  const infotepEmployerCost = Number((baseSalary * infotepEmployerRate).toFixed(2));

  const totalTssCost = Number((afpEmployerCost + sfsEmployerCost + arlEmployerCost + infotepEmployerCost).toFixed(2));

  // Statutory provisions (provisión legal acumulada)
  const regaliaProvision = Number((normSalary / 12).toFixed(2)); // ~8.33% (13th salary)
  const cesantiaProvision = Number((normSalary * 0.05).toFixed(2)); // estimated ~5.00% for severance liability
  const preavisoProvision = Number((normSalary * 0.02).toFixed(2)); // estimated ~2.00%
  const vacacionesProvision = Number((normSalary * (14 / 23.83 / 12)).toFixed(2)); // estimated holiday provision ~4.8%

  const totalProvisions = Number((regaliaProvision + cesantiaProvision + preavisoProvision + vacacionesProvision).toFixed(2));
  const totalEmployerMonthlyCost = Number((normSalary + totalTssCost + totalProvisions).toFixed(2));
  const increasePercentage = Number(((totalEmployerMonthlyCost / normSalary - 1) * 100).toFixed(2));

  return {
    baseSalary: normSalary,
    afpEmployerCost,
    sfsEmployerCost,
    arlEmployerCost,
    infotepEmployerCost,
    totalTssCost,
    regaliaProvision,
    cesantiaProvision,
    preavisoProvision,
    vacacionesProvision,
    totalProvisions,
    totalEmployerMonthlyCost,
    increasePercentage,
    formula: "Costo Total = Sueldo Base + TSS Patronal (AFP, SFS, SRL, INFOTEP) + Provisiones de Ley (Regalía, Cesantía, Vacaciones)",
    legalSource: "Ley 87-01 de Seguridad Social y Código de Trabajo de la República Dominicana"
  };
}


// ==========================================
// --- FINANCIAL ADDITIONS / CALCULATIONS ---
// ==========================================

// Savings Target Planner / Calculadora de Ahorro
export function calculateMetaAhorro(targetAmount: number, months: number, annualYield: number = 0) {
  const normTarget = Math.max(0, targetAmount);
  const normMonths = Math.max(1, months);
  const rateMonthly = (annualYield / 12) / 100;

  let monthlyInflowNeeded = 0;
  if (rateMonthly > 0) {
    // Formula for Future Value of an Ordinary Annuity: PMT = FV / [((1 + r)^n - 1) / r]
    monthlyInflowNeeded = Number((normTarget / (((Math.pow(1 + rateMonthly, normMonths) - 1) / rateMonthly) * (1 + rateMonthly))).toFixed(2));
  } else {
    monthlyInflowNeeded = Number((normTarget / normMonths).toFixed(2));
  }

  const totalInvestedSelf = Number((monthlyInflowNeeded * normMonths).toFixed(2));
  const totalInterestEarned = Number(Math.max(0, normTarget - totalInvestedSelf).toFixed(2));

  return {
    targetAmount: normTarget,
    months,
    annualYield,
    monthlyInflowNeeded,
    totalInvestedSelf,
    totalInterestEarned,
    formula: annualYield > 0 
      ? "PMT = Meta * r_mensual / [((1 + r_mensual)^meses - 1) * (1 + r_mensual)]"
      : "Ahorro Mensual = Meta / Meses",
    explanation: `Para alcanzar una meta de RD$ ${normTarget.toLocaleString('en-US')} en ${months} meses, usted requiere programar un ahorro mensual constante de RD$ ${monthlyInflowNeeded.toLocaleString('en-US')}.`
  };
}

// Simple Interest / Interés Simple
export function calculateSimpleInterest(principal: number, annualRate: number, termsInMonths: number) {
  const p = Math.max(0, principal);
  const r = Math.max(0, annualRate) / 100;
  const t = Math.max(0, termsInMonths) / 12; // in years

  const interestGained = Number((p * r * t).toFixed(2));
  const finalBalance = Number((p + interestGained).toFixed(2));

  return {
    principal: p,
    annualRate,
    termsInMonths,
    interestGained,
    finalBalance,
    formula: "I = P * r * t",
    explanation: `El interés simple de RD$ ${p.toLocaleString('en-US')} al ${annualRate}% anualizado por un plazo de ${termsInMonths} meses es de RD$ ${interestGained.toLocaleString('en-US')}.`
  };
}

// Compound Interest / Interés Compuesto
export function calculateCompoundInterest(
  principal: number, 
  annualRate: number, 
  termsInMonths: number, 
  compoundingPeriodsPerYear: number = 12, // monthly
  monthlyContribution: number = 0
) {
  const p = Math.max(0, principal);
  const r = Math.max(0, annualRate) / 100;
  const months = Math.max(0, termsInMonths);
  const n = Math.max(1, compoundingPeriodsPerYear);
  const c = Math.max(0, monthlyContribution);

  let balance = p;
  let totalContributed = p;
  const stepLogs = [];

  for (let m = 1; m <= months; m++) {
    // Apply compounding return rate on current balance (monthly basis if n=12)
    const monthlyRate = r / n;
    const gained = balance * monthlyRate;
    balance += gained;
    if (c > 0) {
      balance += c;
      totalContributed += c;
    }
  }

  balance = Number(balance.toFixed(2));
  const interestEarned = Number((balance - totalContributed).toFixed(2));

  return {
    principal: p,
    monthlyContribution: c,
    annualRate,
    termsInMonths,
    interestEarned,
    finalBalance: balance,
    totalContributed,
    formula: "A = P * (1 + r/n)^(nt) + Contribuciones * Accumulator",
    explanation: `Su saldo final estimado mediante interés compuesto luego de ${termsInMonths} meses es de RD$ ${balance.toLocaleString('en-US')}, habiendo aportado RD$ ${totalContributed.toLocaleString('en-US')} y devengado RD$ ${interestEarned.toLocaleString('en-US')} en rendimientos.`
  };
}

// Future Value / Valor Futuro (FV)
export function calculateFutureValue(presentValue: number, annualRate: number, periodsInYears: number) {
  const pv = Math.max(0, presentValue);
  const r = Math.max(0, annualRate) / 100;
  const t = Math.max(0, periodsInYears);

  const futureValue = Number((pv * Math.pow(1 + r, t)).toFixed(2));
  const interestPremium = Number((futureValue - pv).toFixed(2));

  return {
    presentValue: pv,
    annualRate,
    periodsInYears: t,
    futureValue,
    interestPremium,
    formula: "VF = VP * (1 + r)^t",
    explanation: `Un capital de RD$ ${pv.toLocaleString('en-US')} invertido al ${annualRate}% anualizado generaría un valor futuro de RD$ ${futureValue.toLocaleString('en-US')} en ${t} años.`
  };
}

// Present Value / Valor Presente (PV)
export function calculatePresentValue(futureValue: number, annualRate: number, periodsInYears: number) {
  const fv = Math.max(0, futureValue);
  const r = Math.max(0, annualRate) / 100;
  const t = Math.max(0, periodsInYears);

  const presentValue = Number((fv / Math.pow(1 + r, t)).toFixed(2));
  const discountingLoss = Number((fv - presentValue).toFixed(2));

  return {
    futureValue: fv,
    annualRate,
    periodsInYears: t,
    presentValue,
    discountingLoss,
    formula: "VP = VF / (1 + r)^t",
    explanation: `Para conseguir un fondo final de RD$ ${fv.toLocaleString('en-US')} en los próximos ${t} de años con una tasa de descuento de ${annualRate}%, hoy debe depositar un monto base de RD$ ${presentValue.toLocaleString('en-US')}.`
  };
}

// Advanced Loan Comparison / Comparador de Préstamos
export function compareLoanScenarios(
  monto: number,
  tasaA: number,
  plazoMesesA: number,
  tasaB: number,
  plazoMesesB: number
) {
  const p = Math.max(0, monto);
  
  // Scenario A
  const rA = (tasaA / 12) / 100;
  const cuotaA = rA > 0 ? Number((p * (rA * Math.pow(1 + rA, plazoMesesA)) / (Math.pow(1 + rA, plazoMesesA) - 1)).toFixed(2)) : Number((p / plazoMesesA).toFixed(2));
  const totalPagadoA = cuotaA * plazoMesesA;
  const interesTotalA = totalPagadoA - p;

  // Scenario B
  const rB = (tasaB / 12) / 100;
  const cuotaB = rB > 0 ? Number((p * (rB * Math.pow(1 + rB, plazoMesesB)) / (Math.pow(1 + rB, plazoMesesB) - 1)).toFixed(2)) : Number((p / plazoMesesB).toFixed(2));
  const totalPagadoB = cuotaB * plazoMesesB;
  const interesTotalB = totalPagadoB - p;

  const diferenciaCuota = Number((cuotaA - cuotaB).toFixed(2));
  const diferenciaInteres = Number((interesTotalA - interesTotalB).toFixed(2));

  return {
    monto: p,
    escAl: { tasa: tasaA, plazo: plazoMesesA, cuota: cuotaA, totalInteres: interesTotalA, totalPagado: totalPagadoA },
    escB: { tasa: tasaB, plazo: plazoMesesB, cuota: cuotaB, totalInteres: interesTotalB, totalPagado: totalPagadoB },
    diferenciaCuota,
    diferenciaInteres,
    mejorOp: interesTotalA < interesTotalB ? "Escenario A" : "Escenario B",
    ahorroTotalPosible: Math.abs(diferenciaInteres),
    formula: "Cálculo francés de cuota de intereses fijos amortizables: PMT = [P * r * (1+r)^n] / [(1+r)^n - 1]"
  };
}

// Loan Refinancing Analyzer / Calculadora de Refinanciamiento
export function calculateRefinancingSavings(
  balancePendiente: number,
  tasaActual: number,
  mesesRestantes: number,
  nuevaTasa: number,
  nuevaTasaCargoComision: number = 0 // gastos de cierre o comisión de desembolso
) {
  const p = Math.max(0, balancePendiente);
  const rAct = (tasaActual / 12) / 100;
  const rNue = (nuevaTasa / 12) / 100;

  // Cuota actual estimada
  const cuotaActual = rAct > 0 
    ? (p * (rAct * Math.pow(1 + rAct, mesesRestantes))) / (Math.pow(1 + rAct, mesesRestantes) - 1)
    : p / mesesRestantes;

  // Nueva cuota con principal + comisión refinanciada
  const nuevoPrincipal = p + nuevaTasaCargoComision;
  const nuevaCuota = rNue > 0 
    ? (nuevoPrincipal * (rNue * Math.pow(1 + rNue, mesesRestantes))) / (Math.pow(1 + rNue, mesesRestantes) - 1)
    : nuevoPrincipal / mesesRestantes;

  const totalCostoViejo = cuotaActual * mesesRestantes;
  const totalCostoNuevo = nuevaCuota * mesesRestantes;
  const ahorroTotalInversion = Number((totalCostoViejo - totalCostoNuevo).toFixed(2));

  return {
    balancePendiente: p,
    cuotaActual: Number(cuotaActual.toFixed(2)),
    nuevaCuota: Number(nuevaCuota.toFixed(2)),
    ahorroCuotaMensual: Number((cuotaActual - nuevaCuota).toFixed(2)),
    totalCostoViejo: Number(totalCostoViejo.toFixed(2)),
    totalCostoNuevo: Number(totalCostoNuevo.toFixed(2)),
    ahorroTotalInversion,
    gastosCierreRefinanciados: nuevaTasaCargoComision,
    esRentable: ahorroTotalInversion > 0,
    formula: "Cuota Nueva vs Antigua empleando Principal de Deuda + Penalidad de Cancelación Anticipada"
  };
}


// ==========================================
// --- BUSINESS ADDITIONS / CALCULATIONS ---
// ==========================================

// Profit Margin / Calculadora de Margen de Utilidad Bruto y Neto
export function calculateBusinessMargins(revenue: number, costOfGoodsSold: number, operatingExpenses: number = 0) {
  const rev = Math.max(0, revenue);
  const cogs = Math.max(0, costOfGoodsSold);
  const opex = Math.max(0, operatingExpenses);

  const gananciaBruta = rev - cogs;
  const margenBrutoPorcentaje = rev > 0 ? (gananciaBruta / rev) * 100 : 0;

  const utilidadesNetas = gananciaBruta - opex;
  const margenNetoPorcentaje = rev > 0 ? (utilidadesNetas / rev) * 100 : 0;

  return {
    revenue: rev,
    cogs,
    opex,
    gananciaBruta,
    margenBrutoPorcentaje: Number(margenBrutoPorcentaje.toFixed(2)),
    utilidadesNetas,
    margenNetoPorcentaje: Number(margenNetoPorcentaje.toFixed(2)),
    formula: "Margen Bruto = (Suma Ventas - Costo Directo) / Ventas * 100; Margen Neto = Utilidades Netas / Ventas * 100"
  };
}

// Break-Even Point / Punto de Equilibrio (Artículos de Venta)
export function calculatePuntoEquilibrio(fixedCosts: number, unitPrice: number, unitVariableCost: number) {
  const fc = Math.max(0, fixedCosts);
  const up = Math.max(0, unitPrice);
  const uvc = Math.max(0, unitVariableCost);

  // Unidades = Costos Fijos / (Precio de Venta - Costo Variable Unitario)
  const marginPerUnit = up - uvc;
  const breakEvenUnits = marginPerUnit > 0 ? Math.ceil(fc / marginPerUnit) : Infinity;
  const breakEvenRevenue = breakEvenUnits !== Infinity ? Number((breakEvenUnits * up).toFixed(2)) : Infinity;

  return {
    fixedCosts: fc,
    unitPrice: up,
    unitVariableCost: uvc,
    marginPerUnit,
    breakEvenUnits,
    breakEvenRevenue,
    formula: "Unidades PE = Costo Fijo / (Precio Unidad - Costo Variable Unidad)",
    explanation: `Usted requiere vender como mínimo ${breakEvenUnits === Infinity ? 'N/A' : breakEvenUnits.toLocaleString('en-US')} unidades de su servicio/producto, equivalentes a RD$ ${breakEvenRevenue === Infinity ? 'N/A' : breakEvenRevenue.toLocaleString('en-US')} para cubrir sus costos fijos operativos sin incurrir en ganancias ni pérdidas.`
  };
}

// Return on Investment / ROI
export function calculateReturnOnInvestment(netProfit: number, investmentCost: number) {
  const profit = netProfit;
  const cost = Math.max(1, investmentCost);

  const roiRatio = (profit / cost) * 100;

  return {
    netProfit: profit,
    investmentCost: cost,
    roiRatio: Number(roiRatio.toFixed(2)),
    formula: "ROI (%) = (Ganancia Neta - Costo de Inversión) / Costo de Inversión * 100"
  };
}

// Cash Flow Status / Flujo de Caja
export function calculateCashFlow(
  initialCash: number,
  inflows: { desc: string; m: number }[],
  outflows: { desc: string; m: number }[]
) {
  const init = Math.max(0, initialCash);
  const totalInflows = inflows.reduce((acc, curr) => acc + Math.max(0, curr.m), 0);
  const totalOutflows = outflows.reduce((acc, curr) => acc + Math.max(0, curr.m), 0);
  const netFlow = totalInflows - totalOutflows;
  const endingCash = init + netFlow;

  return {
    initialCash: init,
    totalInflows,
    totalOutflows,
    netFlow,
    endingCash,
    isPositive: netFlow >= 0,
    formula: "Saldo Final = Saldo Inicial + Entradas de Efectivo - Salidas de Efectivo"
  };
}
