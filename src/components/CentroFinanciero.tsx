import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Calculator, 
  Trash2, Plus, Info, RefreshCw, BarChart, DollarSign, PieChart, ShieldAlert, Download, Printer, Zap
} from 'lucide-react';
import { printElementById } from '../lib/print';

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number; // annual percentage rate
  term: number;  // remaining months
  monthlyPayment: number;
  dueDay: number; // Day of the month of vencimiento (1 - 31)
}

const downloadCsvFile = (filename: string, csvContent: string) => {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getDaysUntilDue = (dueDay: number) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Start of today (00:00:00) so we don't think a payment due today is past
  const todayStart = new Date(currentYear, currentMonth, today.getDate());
  
  // Due date for this month
  let dueDate = new Date(currentYear, currentMonth, dueDay);
  
  if (dueDate < todayStart) {
    // If due date this month has passed, shift to next month
    dueDate = new Date(currentYear, currentMonth + 1, dueDay);
  }
  
  const diffTime = dueDate.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function CentroFinanciero() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [income, setIncome] = useState<number>(65000); // Default RD$65k average professional income

  // New debt form state
  const [name, setName] = useState('');
  const [balance, setBalance] = useState<number>(150000);
  const [rate, setRate] = useState<number>(14.5); // Average RD bank interest rate
  const [term, setTerm] = useState<number>(24);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(7200);
  const [dueDay, setDueDay] = useState<number>(10);

  // Consolidation simulator state
  const [consolidationRate, setConsolidationRate] = useState<number>(10.5); // Promising consolidation offer rate
  const [consolidationTerm, setConsolidationTerm] = useState<number>(36);
  const [closingCosts, setClosingCosts] = useState<number>(5000); // Administrative commission

  // Accelerator options for snowball vs avalanche strategy
  const [extraPayment, setExtraPayment] = useState<number>(5000);

  useEffect(() => {
    const cachedDebts = localStorage.getItem('negociord_debts');
    if (cachedDebts) {
      setDebts(JSON.parse(cachedDebts));
    } else {
      // Default placeholder debts to look professional
      const defaultDebts: Debt[] = [
        { id: 'd1', name: 'Préstamo Auto Banreservas', balance: 450000, rate: 12.9, term: 48, monthlyPayment: 12050, dueDay: 5 },
        { id: 'd2', name: 'Tarjeta de Crédito Popular', balance: 85000, rate: 28.0, term: 12, monthlyPayment: 8200, dueDay: 15 },
        { id: 'd3', name: 'ExtraCrédito BHD', balance: 120000, rate: 18.5, term: 24, monthlyPayment: 6020, dueDay: 28 }
      ];
      setDebts(defaultDebts);
      localStorage.setItem('negociord_debts', JSON.stringify(defaultDebts));
    }
  }, []);

  const saveDebts = (list: Debt[]) => {
    setDebts(list);
    localStorage.setItem('negociord_debts', JSON.stringify(list));
  };

  // Add Debt handler
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Direct check of custom pmtr French formula to estimate if manual payment is missing
    let finalPayment = monthlyPayment;
    if (monthlyPayment <= 0) {
      const r = (rate / 100) / 12;
      finalPayment = r > 0 ? (balance * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1) : balance / term;
    }

    const newDebt: Debt = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      balance: Number(balance) || 0,
      rate: Number(rate) || 0,
      term: Number(term) || 0,
      monthlyPayment: Math.round(finalPayment),
      dueDay: Number(dueDay) || 10
    };

    const updated = [...debts, newDebt];
    saveDebts(updated);

    // reset fields
    setName('');
    setBalance(100000);
    setRate(12);
    setTerm(24);
    setMonthlyPayment(0);
    setDueDay(10);
  };

  const handleDeleteDebt = (id: string, debtName: string) => {
    const filtered = debts.filter(d => d.id !== id);
    saveDebts(filtered);
  };

  // Calculate global summary variables
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMonthlyPayments = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const averageRate = debts.length 
    ? debts.reduce((sum, d) => sum + (d.rate * d.balance), 0) / totalBalance 
    : 0;

  // Debt-to-Income (DTI) ratio and health indicator
  const dtiRatio = income > 0 ? (totalMonthlyPayments / income) * 100 : 0;
  const healthStatus = dtiRatio > 40 
    ? { label: 'Crítico / Sobreendeudado', color: 'text-rose-600 bg-rose-50 border-rose-200', advice: 'Su DTI supera el 40%. Es altamente aconsejable consolidar estas deudas a un menor interés o aplicar el método bola de nieve.' }
    : dtiRatio > 25 
      ? { label: 'Moderado', color: 'text-amber-600 bg-amber-50 border-amber-200', advice: 'Se encuentra en margen aceptable, pero reducir deudas mejorará su capacidad financiera.' }
      : { label: 'Excelente / Sano', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', advice: 'Tiene un excelente nivel de deuda. Siga manteniendo este control para finanzas óptimas.' };

  // CONSOLIDATION MATHEMATICS
  const consolidationScenario = (() => {
    if (debts.length === 0) return null;
    
    // Add administrative closing cost to balance to get consolidation target
    const totalConsolidationBalance = totalBalance + closingCosts;
    const r = (consolidationRate / 100) / 12;
    const n = consolidationTerm;

    let monthlyConsolidationPayment = 0;
    if (r > 0) {
      monthlyConsolidationPayment = (totalConsolidationBalance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyConsolidationPayment = totalConsolidationBalance / n;
    }

    // Estimate current interest to be paid over remaining terms
    let currentTotalInterestToBePaid = 0;
    debts.forEach(d => {
      currentTotalInterestToBePaid += (d.monthlyPayment * d.term) - d.balance;
    });

    const newTotalPaidOverTerm = monthlyConsolidationPayment * n;
    const consolidationInterestPaid = newTotalPaidOverTerm - totalConsolidationBalance;

    // Monthly saving comparison
    const monthlySaving = totalMonthlyPayments - monthlyConsolidationPayment;
    const totalCostComparison = (totalMonthlyPayments * Math.max(...debts.map(d => d.term))) - newTotalPaidOverTerm;

    return {
      consolidatedBalance: totalConsolidationBalance,
      newPayment: Math.round(monthlyConsolidationPayment),
      monthlySaving: Math.round(monthlySaving),
      totalSavingPotential: Math.round(currentTotalInterestToBePaid - consolidationInterestPaid - closingCosts),
      currentTotalInterest: Math.max(0, Math.round(currentTotalInterestToBePaid))
    };
  })();

  // Export debts database to CSV/Google Sheets format
  const handleExportDebtsCSV = () => {
    if (debts.length === 0) return;
    const headers = ['ID', 'Concepto o Acreedor', 'Saldo Deudor Actual (RD$)', 'Tasa de Interes Anual (%)', 'Plazo Restante (Meses)', 'Cuota Mensual (RD$)'];
    const rows = debts.map(d => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      d.balance,
      d.rate,
      d.term,
      d.monthlyPayment
    ]);
    const summaryRows = [
      '',
      'Resumen financiero',
      `Ingreso mensual neto,${income}`,
      `Saldo total,${totalBalance}`,
      `Cuota mensual total,${totalMonthlyPayments}`,
      `DTI,${dtiRatio.toFixed(2)}%`,
      `Tasa ponderada,${averageRate.toFixed(2)}%`,
      consolidationScenario ? `Cuota consolidada estimada,${consolidationScenario.newPayment}` : '',
      consolidationScenario ? `Ahorro mensual estimado,${consolidationScenario.monthlySaving}` : '',
    ].filter(Boolean);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(',')), ...summaryRows].join('\n');
    downloadCsvFile("mis_deudas_tu_negocio_rd.csv", csvContent);
  };

  // Snowball vs Avalanche simulation engine
  const strategySimulation = (() => {
    if (debts.length === 0) return null;

    // Baseline stats (flat minimum amortizations without any extra payments, assuming simple terms)
    let baselineTotalInterest = 0;
    let worstTerm = 0;
    debts.forEach(d => {
      const interests = (d.monthlyPayment * d.term) - d.balance;
      baselineTotalInterest += Math.max(0, interests);
      if (d.term > worstTerm) worstTerm = d.term;
    });

    const runSim = (strategy: 'snowball' | 'avalanche') => {
      let activeDebts = debts.map(d => ({
        name: d.name,
        balance: d.balance,
        rate: d.rate,
        minPayment: d.monthlyPayment
      }));

      let months = 0;
      let totalInterestPaid = 0;
      const maxMonthsLimit = 240; // 20 years safety cap

      while (activeDebts.some(d => d.balance > 0) && months < maxMonthsLimit) {
        months++;

        // Filter debts that are unpaid
        const unpaid = activeDebts.filter(d => d.balance > 0);
        if (unpaid.length === 0) break;

        // Apply interest accrual first
        unpaid.forEach(d => {
          const monthlyRate = (d.rate / 100) / 12;
          const interestAccrued = d.balance * monthlyRate;
          totalInterestPaid += interestAccrued;
          d.balance += interestAccrued;
        });

        // Compute total minimum payment required this month
        let totalMinPaymentThisMonth = 0;
        unpaid.forEach(d => {
          totalMinPaymentThisMonth += d.minPayment;
        });

        // Budget is total minimums + extra payment
        let budget = totalMinPaymentThisMonth + extraPayment;

        // Step 1: Satisfy minimum payments
        unpaid.forEach(d => {
          const minToPay = Math.min(d.balance, d.minPayment);
          d.balance -= minToPay;
          budget -= minToPay;
        });

        // Step 2: Apply remaining budget to the prioritized debt
        if (budget > 0 && unpaid.length > 0) {
          // Sort remaining unpaid list by strategic criteria:
          if (strategy === 'snowball') {
            unpaid.sort((a, b) => a.balance - b.balance); // lowest balance first for behavior win
          } else {
            unpaid.sort((a, b) => b.rate - a.rate); // highest interest rate first for math win
          }
          
          let target = unpaid[0];
          const extraToApply = Math.min(target.balance, budget);
          target.balance -= extraToApply;
          budget -= extraToApply;
        }
      }

      return { months, interest: Math.round(totalInterestPaid) };
    };

    const snowball = runSim('snowball');
    const avalanche = runSim('avalanche');

    return {
      baselineMonths: worstTerm,
      baselineInterest: Math.round(baselineTotalInterest),
      snowballMonths: snowball.months,
      snowballInterest: snowball.interest,
      avalancheMonths: avalanche.months,
      avalancheInterest: avalanche.interest
    };
  })();

  return (
    <div className="p-4 md:p-6 2xl:p-8 space-y-6 min-w-0" id="financial-center-print-preview" data-print-kind="report-document">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest block mb-1">Módulo Premium Administrativo de Cartera</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-2">
            <PieChart className="text-[#0F766E]" size={28} />
            Centro Financiero RD
          </h1>
          <p className="text-gray-500 text-xs mt-1">Comparador avanzado de obligaciones de consumo e hipotecario, índice de endeudamiento DTI y simulador de unificación de deudas.</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border p-2.5 rounded-lg text-xs print:hidden" id="dti-income-box">
          <label htmlFor="dti-income-input" className="font-semibold text-gray-500">Sus Ingresos Mensuales Netos:</label>
          <div className="flex items-center font-mono font-bold text-gray-900">
            <span className="text-[#0F766E]">RD$</span>
            <input 
              id="dti-income-input"
              type="number" 
              placeholder="0"
              value={income || ''}
              onChange={(e) => {
                const val = e.target.value;
                setIncome(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
              }}
              className="w-24 bg-transparent outline-none pl-1 font-bold text-gray-900 border-none select-all font-mono"
            />
          </div>
        </div>
      </div>

      {/* Overview stats: DTI, Total, and Average rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0" id="debt-dashboard-stats">
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Saldo Deudor Activo</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-905 font-mono">RD$ {totalBalance.toLocaleString('en-US')}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Distribuido en {debts.length} compromisos</p>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Erogación Mensual de Pago</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-905 font-mono">RD$ {totalMonthlyPayments.toLocaleString('en-US')}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Equivalente a abonos ordinarios</p>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Índice DTI (Sobreendeudamiento)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-gray-905 font-mono">{dtiRatio.toFixed(1)}%</span>
            <span className="text-[10px] text-gray-400">del ingreso mensual</span>
          </div>
          <div className={`mt-2 p-1.5 rounded text-[9px] font-bold uppercase w-max tracking-wide ${healthStatus.color}`}>
            {healthStatus.label}
          </div>
        </div>
      </div>

      {/* Advisory recommendation block based on DTI ratio */}
      <div className="bg-teal-50/30 border border-teal-100/50 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="text-[#0F766E] flex-shrink-0 mt-0.5" size={18} />
        <div className="text-xs">
          <span className="font-bold text-[#0F766E] block mb-0.5">Diagnóstico y Recomendación Profesional Especializada:</span>
          <p className="text-gray-600 font-medium leading-relaxed">{healthStatus.advice}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 min-w-0" id="debts-interactive-workspace">
        
        {/* Left pane: Add and List current debts */}
        <div className="space-y-4 min-w-0">
          
          {/* Debts Table */}
          <div className="bg-white border border-gray-150 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-150 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-650 uppercase tracking-wider">Desglose de Deudas Activas</span>
                <span className="text-[10px] text-gray-400 font-bold font-mono">| Tasa Ponderada: {averageRate.toFixed(1)}%</span>
              </div>
              <button
                type="button"
                onClick={handleExportDebtsCSV}
                disabled={debts.length === 0}
                className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 rounded flex items-center gap-1 cursor-pointer disabled:opacity-50 transition"
                title="Exportar cartera a CSV compatible con Excel"
              >
                <Download size={12} className="text-[#0F766E]" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => printElementById('financial-center-print-preview', 'Tu Negocio RD - Diagnostico financiero')}
                disabled={debts.length === 0}
                className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 rounded flex items-center gap-1 cursor-pointer disabled:opacity-50 transition"
                title="Imprimir diagnostico financiero"
              >
                <Printer size={12} className="text-[#0F766E]" />
                <span>Imprimir PDF</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-3">Concepto/Acreedor</th>
                    <th className="p-3 text-right">Saldo Deudor</th>
                    <th className="p-3 text-center">Tasa Anual</th>
                    <th className="p-3 text-center">Plazo Remanente</th>
                    <th className="p-3 text-right">Cuota Mensual</th>
                    <th className="p-3 text-center">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {debts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No hay obligaciones agregadas en la lista comercial. Añada deudas debajo.
                      </td>
                    </tr>
                  ) : (
                    debts.map((d) => {
                      const day = d.dueDay || 10;
                      const daysLeft = getDaysUntilDue(day);
                      return (
                        <tr key={d.id} className={`hover:bg-gray-50/50 transition-colors ${daysLeft <= 7 ? 'bg-amber-50/10' : ''}`}>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-gray-900">{d.name}</span>
                              {daysLeft === 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse uppercase tracking-wider">
                                  <AlertTriangle size={10} className="stroke-[3]" />
                                  ¡Vence Hoy!
                                </span>
                              )}
                              {daysLeft === 1 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wider">
                                  <AlertTriangle size={10} className="stroke-[2.5]" />
                                  Vence Mañana
                                </span>
                              )}
                              {daysLeft > 1 && daysLeft <= 7 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                  <AlertTriangle size={10} />
                                  Vence en {daysLeft} días
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 font-medium flex items-center gap-1">
                              <span>Día de pago ordinario:</span>
                              <span className="font-bold text-gray-500">{day} de cada mes</span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-gray-800">RD$ {d.balance.toLocaleString('en-US')}</td>
                          <td className="p-3 text-center font-mono font-bold text-[#0F766E]">{d.rate}%</td>
                          <td className="p-3 text-center font-semibold text-gray-650">{d.term} meses</td>
                          <td className="p-3 text-right font-mono font-bold text-gray-800">RD$ {d.monthlyPayment.toLocaleString('en-US')}</td>
                          <td className="p-3 text-center text-gray-400 hover:text-rose-600 cursor-pointer" onClick={() => handleDeleteDebt(d.id, d.name)}>
                            <Trash2 size={14} className="mx-auto" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add debt form */}
          <form onSubmit={handleAddDebt} className="bg-white border border-gray-150 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-gray-850 flex items-center gap-1 border-b pb-2.5">
              <Plus size={16} className="text-[#0F766E]" />
              Agregar Compromiso Creditor / Tarjeta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="debt-name-input" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Nombre Deuda/Banco</label>
                <input 
                  id="debt-name-input"
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. T. Crédito Popular"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="debt-balance-input" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Saldo Deudor Actual (RD$)</label>
                <input 
                  id="debt-balance-input"
                  type="number" 
                  required
                  placeholder="Ej. 50000"
                  value={balance || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBalance(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="debt-rate-input" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Tasa de Interés Anual (%)</label>
                <input 
                  id="debt-rate-input"
                  type="number" 
                  step="0.01"
                  required
                  placeholder="Ej. 18.0"
                  value={rate || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRate(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2">
              <div>
                <label htmlFor="debt-term-input" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Meses Remanentes de Pago</label>
                <input 
                  id="debt-term-input"
                  type="number" 
                  required
                  placeholder="Ej. 12"
                  value={term || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTerm(val === '' ? 1 : Math.max(1, parseInt(val) || 1));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="debt-monthly-payment-input" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Cuota Mensual (0 para Autofórmula)</label>
                <input 
                  id="debt-monthly-payment-input"
                  type="number" 
                  placeholder="Autocalcular cuota fija"
                  value={monthlyPayment || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMonthlyPayment(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="debt-due-day-input" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Día de Pago del Mes (1-31)</label>
                <input 
                  id="debt-due-day-input"
                  type="number" 
                  min="1"
                  max="31"
                  required
                  placeholder="Ej. 10"
                  value={dueDay || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDueDay(val === '' ? 1 : Math.min(31, Math.max(1, parseInt(val) || 1)));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-semibold font-mono"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded cursor-pointer hover:opacity-95 transition-all shadow-xs"
            >
              Registrar Deuda en Cartera
            </button>
          </form>

          {/* Pure CSS SVG Debt Distribution Proportion Bar */}
          {debts.length > 0 && (
            <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3.5">Distribución de Saldos por Acreedor</span>
              <div className="h-6 w-full rounded-md overflow-hidden flex bg-gray-100 border border-gray-150">
                {debts.map((d, index) => {
                  const percentage = totalBalance > 0 ? (d.balance / totalBalance) * 100 : 0;
                  const idxcolor = index % 3 === 0 ? 'bg-[#0F766E]' : index % 3 === 1 ? 'bg-orange-400' : 'bg-teal-300';
                  return (
                    <div 
                      key={d.id} 
                      style={{ width: `${percentage}%` }} 
                      className={`${idxcolor} h-full transition-all`} 
                      title={`${d.name}: RD$ ${d.balance.toLocaleString()} (${percentage.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-[11px] font-medium text-gray-500">
                {debts.map((d, index) => {
                  const idxcolor = index % 3 === 0 ? 'text-[#0F766E]' : index % 3 === 1 ? 'text-orange-500' : 'text-teal-500';
                  return (
                    <div key={d.id} className="flex items-center gap-1.5">
                      <span className={`inline-block w-3 h-3 rounded ${index % 3 === 0 ? 'bg-[#0F766E]' : index % 3 === 1 ? 'bg-orange-400' : 'bg-teal-300'}`}></span>
                      <span>{d.name} ({((d.balance / totalBalance) * 100).toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right pane: Debt consolidation simulator */}
        <div className="min-w-0">
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-gray-850 flex items-center gap-1.5 border-b pb-2.5">
              <RefreshCw className="text-[#0F766E] animate-spin-slow" size={16} />
              Simulador de Unificación de Deudas (Consolidación)
            </h3>

            <p className="text-xs text-gray-500 leading-normal font-sans">
              Consolidar implica adquirir un préstamo único con condiciones ventajosas para liquidar todas las deudas vigentes y quedarse pagando una única cuota de menor impacto financiero mensual.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="consolidation-rate" className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">Tasa Ofertada Consolidación (% Anual)</label>
                <input 
                  id="consolidation-rate"
                  type="number" 
                  step="0.1"
                  placeholder="0"
                  value={consolidationRate || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConsolidationRate(val === '' ? 12 : Math.max(1, parseFloat(val) || 1));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="consolidation-term" className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">Plazo Convenido (Meses)</label>
                <input 
                  id="consolidation-term"
                  type="number" 
                  placeholder="0"
                  value={consolidationTerm || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConsolidationTerm(val === '' ? 12 : Math.max(1, parseInt(val) || 1));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label htmlFor="consolidation-costs" className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">Gastos de Cierre Administrativos (RD$)</label>
                <input 
                  id="consolidation-costs"
                  type="number" 
                  placeholder="0"
                  value={closingCosts || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClosingCosts(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>
            </div>

            {consolidationScenario ? (
              <div className="bg-gray-55/80 border rounded-xl p-4 space-y-3 mt-4 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-500">Monto del Préstamo Unificado:</span>
                  <span className="font-mono font-bold text-gray-900">RD$ {consolidationScenario.consolidatedBalance.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b pb-3.5 min-w-0">
                  <div className="min-w-0">
                    <span className="text-gray-400 block font-medium">Cuota Consolidada:</span>
                    <span className="font-extrabold text-teal-800 font-mono text-sm break-words">RD$ {consolidationScenario.newPayment.toLocaleString()}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-gray-400 block font-medium">Ahorro Mensual Neto:</span>
                    <span className={`font-extrabold font-mono text-sm break-words ${consolidationScenario.monthlySaving >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      RD$ {consolidationScenario.monthlySaving.toLocaleString()}
                    </span>
                  </div>
                </div>

                {consolidationScenario.totalSavingPotential > 0 ? (
                  <div className="bg-emerald-50/50 border border-emerald-150 rounded-lg p-3 text-emerald-800 space-y-1">
                    <span className="font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <CheckCircle size={14} />
                      Consolidación Altamente Recomendable!
                    </span>
                    <p className="text-[11px] text-gray-600">Al comparar el interés acumulado que pagaría en los meses remanentes de todas sus cuentas individuales contra el préstamo único, obtendría un ahorro potencial neto estimado de <span className="font-bold text-gray-950 font-mono">RD$ {consolidationScenario.totalSavingPotential.toLocaleString()}</span>.</p>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-150 rounded-lg p-3 text-rose-800 space-y-1">
                    <span className="font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <ShieldAlert size={14} />
                      Alerta de Deuda de Largo Plazo
                    </span>
                    <p className="text-[11px] text-gray-600">Extender el plazo a {consolidationTerm} meses podría hacerle pagar más intereses totales que el saldo acumulado actual de sus deudas individuales, a pesar de que su cuota mensual resulte de conveniencia inmediata.</p>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-4 border rounded text-center text-gray-400 italic">
                Añada compromisos en la tabla para calcular el escenario de unificación.
              </div>
            )}

          </div>

          {/* Accelerator Strat Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-4 mt-6" id="debud-accelerator-section">
            <h3 className="font-extrabold text-sm text-gray-850 flex items-center gap-1.5 border-b pb-2.5">
              <Zap className="text-orange-500 fill-orange-100" size={16} />
              Acelerador de Deudas: Alud vs. Bola de Nieve
            </h3>

            <p className="text-xs text-gray-500 leading-normal font-sans">
              Compare e implemente estrategias de pago acelerado aportando una cuota extra fija cada mes para quedar libre de deudas en tiempo récord.
            </p>

            <div>
              <label htmlFor="extra-payment-slider" className="text-[10px] uppercase font-bold text-gray-500 block mb-1 flex justify-between">
                <span>Inyección Mensual Extraordinaria:</span>
                <span className="text-[#0F766E] font-bold font-mono">RD$ {extraPayment.toLocaleString()}</span>
              </label>
              <input 
                id="extra-payment-slider"
                type="range" 
                min="1000" 
                max="25000" 
                step="500" 
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full accent-[#0F766E] cursor-pointer"
              />
              <span className="text-[9px] text-gray-400 block mt-1">Este monto extra se aplicará prioritariamente al saldo principal del acreedor de la estrategia seleccionada.</span>
            </div>

            {strategySimulation ? (
              <div className="space-y-4 text-xs mt-3">
                
                {/* Method 1: Avalanche */}
                <div className="p-3 bg-teal-50/40 rounded-lg border border-teal-100 space-y-1">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="font-bold text-teal-800 tracking-tight">Método Alud (Avalanche)</span>
                    <span className="text-[9px] bg-[#0F766E] text-white rounded font-bold px-1.5 py-0.5 uppercase tracking-wide">Más Ahorro de Dinero</span>
                  </div>
                  <p className="text-[11px] text-gray-650">Prioriza deudas con la <strong>mayor tasa de interés</strong> , minimizando el costo total en intereses de tu cartera.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] min-w-0">
                    <div className="bg-white p-2 rounded border border-teal-100 min-w-0">
                      <span className="text-[9px] text-gray-400 block font-sans">Meses para Liquidar</span>
                      <strong className="text-[#0F766E] font-extrabold">{strategySimulation.avalancheMonths} meses</strong> 
                      <span className="text-[9px] text-gray-400 block font-sans">Ahorro: {strategySimulation.baselineMonths - strategySimulation.avalancheMonths} meses</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-teal-100 min-w-0">
                      <span className="text-[9px] text-gray-400 block font-sans">Gasto Total Interés</span>
                      <strong className="text-teal-900 break-all">RD$ {strategySimulation.avalancheInterest.toLocaleString()}</strong>
                      <span className="text-[9px] text-emerald-700 block font-sans">Ahorro: RD$ {(strategySimulation.baselineInterest - strategySimulation.avalancheInterest).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Method 2: Snowball */}
                <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100 space-y-1">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="font-bold text-amber-800 tracking-tight">Método Bola de Nieve (Snowball)</span>
                    <span className="text-[9px] bg-amber-600 text-white rounded font-bold px-1.5 py-0.5 uppercase tracking-wide">Victoria Psicológica</span>
                  </div>
                  <p className="text-[11px] text-gray-650">Prioriza deudas de <strong>menor saldo activo</strong> , brindando triunfos tempranos para sostener la disciplina de ahorro.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] min-w-0">
                    <div className="bg-white p-2 rounded border border-amber-100 min-w-0">
                      <span className="text-[9px] text-gray-400 block font-sans">Meses para Liquidar</span>
                      <strong className="text-amber-800 font-extrabold">{strategySimulation.snowballMonths} meses</strong>
                      <span className="text-[9px] text-gray-400 block font-sans">Ahorro: {strategySimulation.baselineMonths - strategySimulation.snowballMonths} meses</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-100 min-w-0">
                      <span className="text-[9px] text-gray-400 block font-sans">Gasto Total Interés</span>
                      <strong className="text-amber-950 break-all">RD$ {strategySimulation.snowballInterest.toLocaleString()}</strong>
                      <span className="text-[9px] text-emerald-700 block font-sans">Ahorro: RD$ {(strategySimulation.baselineInterest - strategySimulation.snowballInterest).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Advice */}
                <div className="p-2.5 bg-gray-50 border rounded text-[11px] text-gray-650 font-sans flex gap-1.5 leading-snug">
                  <Info size={14} className="text-[#0F766E] shrink-0 mt-0.5" />
                  <span>
                    <strong>Veredicto Tu Negocio RD:</strong> Alud le ahorra <span className="font-bold font-mono text-gray-900">RD$ {(strategySimulation.snowballInterest - strategySimulation.avalancheInterest).toLocaleString()}</span> de intereses adicionales comparado con Bola de Nieve. Sin embargo, Bola de Nieve es excelente si requiere motivaciones rápidas.
                  </span>
                </div>

              </div>
            ) : (
              <div className="p-4 border rounded text-center text-gray-400 italic text-xs">
                Añada compromisos de deuda en la tabla para simular la aceleración de pagos.
              </div>
            )}
          </div>

          </div>
        </div>

        <div className="hidden print:flex border-t border-gray-200 pt-3 text-[10px] text-gray-500 justify-between gap-4 print-avoid-break">
        <span>Diagnostico financiero generado por Tu Negocio RD</span>
        <span>Emitido: {new Date().toLocaleDateString('es-DO')} | DTI: {dtiRatio.toFixed(1)}%</span>
      </div>

    </div>

  );
}
