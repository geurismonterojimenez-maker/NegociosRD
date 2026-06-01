import React, { useState, useEffect } from 'react';
import { CalculatorInfo } from '../types';
import { 
  DollarSign, TrendingUp, Sparkles, FileText, ShieldAlert, Download, Printer, Copy,
  RefreshCw, ChevronRight, Calculator, Calendar, HelpCircle, Layers, Award
} from 'lucide-react';
import { 
  calculateMetaAhorro, 
  calculateSimpleInterest, 
  calculateCompoundInterest, 
  calculateFutureValue, 
  calculatePresentValue, 
  compareLoanScenarios, 
  calculateRefinancingSavings 
} from '../lib/calculations/all_new_calculations';
import { logUsage } from '../lib/firebase';
import { printElementById } from '../lib/print';

interface FinanzasCalculatorsProps {
  calc: CalculatorInfo;
  onBack: () => void;
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

export default function FinanzasCalculators({ calc, onBack }: FinanzasCalculatorsProps) {
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [printSize, setPrintSize] = useState<'letter' | 'legal'>('letter');

  // Input states
  const [principalInput, setPrincipalInput] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(11.5);
  const [termsInMonths, setTermsInMonths] = useState<number>(36);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(2000);
  const [periodsInYears, setPeriodsInYears] = useState<number>(5);
  const [targetAmountInput, setTargetAmountInput] = useState<number>(500000);
  const [monthlyExpensesComp, setMonthlyExpensesComp] = useState<number>(25000);

  // Scenario Comparison Inputs
  const [montoS, setMontoS] = useState<number>(300000);
  const [tasaA, setTasaA] = useState<number>(12);
  const [plazoA, setPlazoA] = useState<number>(36);
  const [tasaB, setTasaB] = useState<number>(14.5);
  const [plazoB, setPlazoB] = useState<number>(48);

  // Refinancing Inputs
  const [deudaPendiente, setDeudaPendiente] = useState<number>(400000);
  const [tasaRefActual, setTasaRefActual] = useState<number>(15.0);
  const [mesesRefRestan, setMesesRefRestan] = useState<number>(24);
  const [tasaRefNueva, setTasaRefNueva] = useState<number>(11.5);
  const [refComisiones, setRefComisiones] = useState<number>(5000);

  // Grace Period and extra amortizations for advanced loan calculations
  const [plazoGracia, setPlazoGracia] = useState<number>(0);
  const [seguroVidaAnual, setSeguroVidaAnual] = useState<number>(0.06); // % of loans
  const [seguroPropiedadAnual, setSeguroPropiedadAnual] = useState<number>(0.12);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem(`history-${calc.id}`);
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, [calc.id]);

  const triggerFeedback = (msg: string) => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveResult = (val: number, label: string) => {
    const fresh = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-DO', { hour: '2-digit', minute: '2-digit' }),
      result: val,
      detail: label,
    };
    const updated = [fresh, ...history.slice(0, 9)];
    setHistory(updated);
    localStorage.setItem(`history-${calc.id}`, JSON.stringify(updated));
    logUsage(calc.id, `Guardó cálculo en historial local. Principal: RD$ ${principalInput.toLocaleString()}`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`history-${calc.id}`);
  };

  // Run financial logic based on ID
  const compute = () => {
    switch (calc.id) {
      case 'ahorro-plan':
        return calculateMetaAhorro(targetAmountInput, termsInMonths, annualRate);
      case 'interes-simple':
        return calculateSimpleInterest(principalInput, annualRate, termsInMonths);
      case 'interes-compuesto':
        return calculateCompoundInterest(principalInput, annualRate, termsInMonths, 12, monthlyContribution);
      case 'valor-futuro':
        return calculateFutureValue(principalInput, annualRate, periodsInYears);
      case 'valor-presente':
        return calculatePresentValue(principalInput, annualRate, periodsInYears);
      case 'inversion-render': {
        // Compound plus future metrics
        const res = calculateCompoundInterest(principalInput, annualRate, periodsInYears * 12, 12, monthlyContribution);
        return {
          ...res,
          formula: "Rendimientos netos compounding mensuales",
          legalSource: "Interés devengado por depósitos a plazo en el Mercado Financiero Dominicano"
        };
      }
      case 'prestamo-avanzado': {
        // Amortization incorporating life/property insurance and grace period
        const r = (annualRate / 12) / 100;
        const usefulMonths = Math.max(1, termsInMonths - plazoGracia);
        
        // Base Cuota Francés
        const cuotaBase = r > 0 
          ? (principalInput * (r * Math.pow(1 + r, usefulMonths))) / (Math.pow(1 + r, usefulMonths) - 1)
          : principalInput / usefulMonths;

        const svida = (principalInput * (seguroVidaAnual / 100)) / 12;
        const sprop = (principalInput * (seguroPropiedadAnual / 100)) / 12;
        const cuotaTotal = cuotaBase + svida + sprop;

        const totalInteres = (cuotaBase * usefulMonths) - principalInput;
        const totalPagado = cuotaTotal * termsInMonths;

        return {
          principal: principalInput,
          rate: annualRate,
          months: termsInMonths,
          cuotaTotal,
          cuotaBase,
          svida,
          sprop,
          totalInteres,
          totalPagado,
          plazoGracia,
          formula: "PMT_Total = PMT_Frances + Seguros. Se aplica periodo de gracia",
          legalSource: "Normativa de Transparencia de la Superintendencia de Bancos de la Rep. Dom."
        };
      }
      case 'comparador-prestamos':
        return compareLoanScenarios(montoS, tasaA, plazoA, tasaB, plazoB);
      case 'amortizacion-completa': {
        // Amortization table logic (similar to loan but return structured periods)
        const r = (annualRate / 12) / 100;
        const pmt = r > 0 ? (principalInput * (r * Math.pow(1 + r, termsInMonths)) / (Math.pow(1 + r, termsInMonths) - 1)) : (principalInput / termsInMonths);
        
        let remPrincipal = principalInput;
        const rows = [];
        for (let i = 1; i <= Math.min(120, termsInMonths); i++) {
          const interestShare = remPrincipal * r;
          const principalShare = pmt - interestShare;
          remPrincipal = Math.max(0, remPrincipal - principalShare);
          rows.push({
            period: i,
            cuota: pmt,
            interes: interestShare,
            abono: principalShare,
            restante: remPrincipal
          });
        }

        return {
          principal: principalInput,
          rate: annualRate,
          months: termsInMonths,
          monthlyCuota: pmt,
          totalInterest: pmt * termsInMonths - principalInput,
          rows,
          formula: "Amortización Francesa: Cuota Constante con amortización de capital creciente",
          legalSource: "Reglamento Bancario Dominicano"
        };
      }
      case 'refinanciamiento-analizador':
        return calculateRefinancingSavings(deudaPendiente, tasaRefActual, mesesRefRestan, tasaRefNueva, refComisiones);
      default:
        return null;
    }
  };

  const result = compute();

  const handleCopy = () => {
    if (!result) return;
    let text = `Cálculo Financiero: ${calc.name}\n`;
    if ('interestGained' in result) {
      text += `Interés devengado: RD$ ${result.interestGained.toLocaleString('en-US')}\nSaldo Final: RD$ ${result.finalBalance.toLocaleString('en-US')}\n`;
    } else if ('finalBalance' in result) {
      text += `Saldo Final Acumulado: RD$ ${result.finalBalance.toLocaleString('en-US')}\n`;
    } else if ('cuotaTotal' in result) {
      text += `Cuota Mensual Estimada: RD$ ${result.cuotaTotal.toLocaleString('en-US')}\n`;
    } else if ('ahorroTotalPosible' in result) {
      text += `Ahorro de Préstamo Posible: RD$ ${result.ahorroTotalPosible.toLocaleString('en-US')}\nMejor opción: ${result.mejorOp}\n`;
    } else if ('ahorroTotalInversion' in result) {
      text += `Ahorro Total por Refinanciamiento: RD$ ${result.ahorroTotalInversion.toLocaleString('en-US')}\nEs rentable: ${result.esRentable ? 'SÍ' : 'NO'}\n`;
    }
    navigator.clipboard.writeText(text);
    triggerFeedback('¡Copiado!');
    logUsage(calc.id, `Copió los resultados financieros al portapapeles. Principal: RD$ ${principalInput.toLocaleString()}`);
  };

  const handleExcelExport = () => {
    if (!result) return;
    let csv = "Clave,Valor\n";
    csv += `"Herramienta","${calc.name.replace(/"/g, '""')}"\n`;
    csv += `"Fecha de emision","${new Date().toLocaleDateString('es-DO')}"\n`;
    Object.entries(result).forEach(([k, v]) => {
      if (k !== 'rows' && typeof v !== 'object') {
        csv += `"${k}","${v}"\n`;
      }
    });
    if ('rows' in result && Array.isArray(result.rows)) {
      csv += "\nTabla de Amortizacion\nMes,Cuota,Interes,Abono Principal,Balance Restante\n";
      result.rows.forEach((r: any) => {
        csv += `${r.period},${r.cuota.toFixed(2)},${r.interes.toFixed(2)},${r.abono.toFixed(2)},${r.restante.toFixed(2)}\n`;
      });
    }
    downloadCsvFile(`tu_negocio_rd_finanzas_${calc.id}.csv`, csv);
    logUsage(calc.id, `Exportó resultados financieros a un archivo CSV. Principal: RD$ ${principalInput.toLocaleString()}`);
  };

  const getToolMetadata = () => {
    switch (calc.id) {
      case 'ahorro-plan':
        return {
          legalSource: "Criterios del Sistema y Fondos de Inversión de Rentas Fijas en RD.",
          formula: "Cuota Ahorro meta = Capital / Factor de Capitalización de anualidad vencida.",
          example: "Para lograr un inicial de RD$ 500,000.00 en 36 meses con una tasa promedio del 8% anualizada, usted requerirá ahorrar RD$ 12,075.00 mensuales.",
          faq: [
            { q: "¿En qué instituciones rinden más los fondos de ahorro en RD?", a: "Los fondos mutuos de cooperativas de ahorros así como los puestos de bolsa regulados por la SIMV ofrecen rendimientos superiores a las cuentas corrientes tradicionales." }
          ]
        };
      case 'interes-simple':
        return {
          legalSource: "Banco Central y Superintendencia de Bancos de la RD.",
          formula: "I = P * i * t (Interés = Principal * tasa * tiempo anualizado).",
          example: "RD$ 100,000.00 a una tasa nominal de 12% por 6 meses ganaría RD$ 6,000.00 de interés total neto.",
          faq: [
            { q: "¿Dónde se aplica típicamente el interés simple?", a: "Se aplica principalmente en la banca a préstamos personales de cortísimo plazo, penalidades de retraso y pagarés comerciales simples." }
          ]
        };
      case 'interes-compuesto':
        return {
          legalSource: "Prácticas Generales de Ingeniería Económica Internacional y Banca de RD.",
          formula: "Balances = P * (1 + i)^t con contribuciones adicionales capitalizadas.",
          example: "Ahorrando RD$ 50,000.00 iniciales más RD$ 2,000.00 al mes por 3 años a una tasa de 10% anual, sumaría RD$ 143,450.00 al final.",
          faq: [
            { q: "¿Qué beneficios aporta el interés compuesto?", a: "Permite acelerar exponencialmente el crecimiento de su dinero dado que los intereses ganados en cada período son reinvertidos y generan nuevos rendimientos." }
          ]
        };
      default:
        return {
          legalSource: "Superintendencia de Bancos de la República Dominicana (Leyes Financieras).",
          formula: "PMT = (Principal * r) / (1 - (1+r)^-n).",
          example: "Cálculo estándar bancario.",
          faq: [
            { q: "¿Cómo protegerse del incremento de tasas de préstamos?", a: "Al adquirir un préstamo, trate de negociar contratos comerciales de 'Tasa Fija' a largo plazo (e.g. 3 o 5 años) para evitar el riesgo de alzas de política monetaria." }
          ]
        };
    }
  };

  const meta = getToolMetadata();

  return (
    <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs block */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Calculator size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Datos Financieros</h3>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Tensiones e inflación de RD</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Conditional input renderers per financial calculator */}
            {calc.id !== 'comparador-prestamos' && calc.id !== 'refinanciamiento-analizador' && (
              <>
                {calc.id === 'ahorro-plan' ? (
                  <div>
                    <label htmlFor="fin-target-amount" className="block text-xs font-bold text-gray-700 uppercase mb-1">Meta de Ahorro Deseada (RD$)</label>
                    <input
                      id="fin-target-amount"
                      type="number"
                      placeholder="0"
                      value={targetAmountInput || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTargetAmountInput(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="fin-principal" className="block text-xs font-bold text-gray-700 uppercase mb-1">Capital Principal (RD$)</label>
                    <input
                      id="fin-principal"
                      type="number"
                      placeholder="0"
                      value={principalInput || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPrincipalInput(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="fin-annual-rate" className="block text-xs font-bold text-gray-700 uppercase mb-1">Tasa de Interés Anual (%)</label>
                  <input
                    id="fin-annual-rate"
                    type="number"
                    step="0.05"
                    placeholder="0"
                    value={annualRate || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnnualRate(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                    }}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {calc.id !== 'valor-futuro' && calc.id !== 'valor-presente' && (
                  <div>
                    <label htmlFor="fin-terms-months" className="block text-xs font-bold text-gray-700 uppercase mb-1">Plazo total (En Meses)</label>
                    <input
                      id="fin-terms-months"
                      type="number"
                      placeholder="e.g. 1"
                      value={termsInMonths || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTermsInMonths(val === '' ? 1 : Math.max(1, parseInt(val) || 1));
                      }}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                {calc.id === 'interes-compuesto' && (
                  <div>
                    <label htmlFor="fin-monthly-contrib" className="block text-xs font-bold text-gray-700 uppercase mb-1">Aporte Mensual Adicional (RD$)</label>
                    <input
                      id="fin-monthly-contrib"
                      type="number"
                      placeholder="0"
                      value={monthlyContribution || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMonthlyContribution(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                {(calc.id === 'valor-futuro' || calc.id === 'valor-presente') && (
                  <div>
                    <label htmlFor="fin-periods-years" className="block text-xs font-bold text-gray-700 uppercase mb-1">Plazo de la Inversión (En Años)</label>
                    <input
                      id="fin-periods-years"
                      type="number"
                      placeholder="e.g. 1"
                      value={periodsInYears || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPeriodsInYears(val === '' ? 1 : Math.max(1, parseInt(val) || 1));
                      }}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                {calc.id === 'prestamo-avanzado' && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t">
                    <div>
                      <label htmlFor="fin-plazo-gracia" className="block text-[10px] font-bold text-gray-500 uppercase">Meses Gracia</label>
                      <input
                        id="fin-plazo-gracia"
                        type="number"
                        placeholder="0"
                        value={plazoGracia || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlazoGracia(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                        }}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-center focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="fin-seguro-vida" className="block text-[10px] font-bold text-gray-500 uppercase">Seguro Vida (% Anual)</label>
                      <input
                        id="fin-seguro-vida"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={seguroVidaAnual || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeguroVidaAnual(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                        }}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-center focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Comparador de Préstamos renderers */}
            {calc.id === 'comparador-prestamos' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="fin-monto-s" className="block text-xs font-bold text-gray-700 uppercase mb-1">Monto del Financiamiento (RD$)</label>
                  <input
                    id="fin-monto-s"
                    type="number"
                    placeholder="0"
                    value={montoS || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMontoS(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border rounded-xl">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Escenario A</span>
                    <input
                      type="number"
                      placeholder="Tasa A (%)"
                      aria-label="Tasa A (%)"
                      value={tasaA || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTasaA(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold"
                    />
                    <input
                      type="number"
                      placeholder="Plazo A (meses)"
                      aria-label="Plazo A (meses)"
                      value={plazoA || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlazoA(val === '' ? 1 : Math.max(1, parseInt(val) || 1));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Escenario B</span>
                    <input
                      type="number"
                      placeholder="Tasa B (%)"
                      aria-label="Tasa B (%)"
                      value={tasaB || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTasaB(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold"
                    />
                    <input
                      type="number"
                      placeholder="Plazo B (meses)"
                      aria-label="Plazo B (meses)"
                      value={plazoB || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlazoB(val === '' ? 1 : Math.max(1, parseInt(val) || 1));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Refinanciamiento renderers */}
            {calc.id === 'refinanciamiento-analizador' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="fin-deuda-pendiente" className="block text-xs font-bold text-gray-700 uppercase mb-1">Deuda Pendiente (RD$)</label>
                  <input
                    id="fin-deuda-pendiente"
                    type="number"
                    placeholder="0"
                    value={deudaPendiente || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDeudaPendiente(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                    }}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 border rounded-xl">
                  <div>
                    <label htmlFor="fin-tasa-ref-actual" className="block text-[10px] font-bold text-gray-500 uppercase">Tasa Actual (%)</label>
                    <input
                      id="fin-tasa-ref-actual"
                      type="number"
                      placeholder="0"
                      value={tasaRefActual || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTasaRefActual(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label htmlFor="fin-tasa-ref-nueva" className="block text-[10px] font-bold text-gray-500 uppercase font-semibold">Tasa Nueva (%)</label>
                    <input
                      id="fin-tasa-ref-nueva"
                      type="number"
                      placeholder="0"
                      value={tasaRefNueva || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTasaRefNueva(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-emerald-600 font-bold"
                    />
                  </div>
                  <div>
                    <label htmlFor="fin-meses-ref" className="block text-[10px] font-bold text-gray-500 uppercase">Meses Restantes</label>
                    <input
                      id="fin-meses-ref"
                      type="number"
                      placeholder="0"
                      value={mesesRefRestan || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMesesRefRestan(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-center"
                    />
                  </div>
                  <div>
                    <label htmlFor="fin-ref-comisiones" className="block text-[10px] font-bold text-gray-500 uppercase">Gastos de Cierre (RD$)</label>
                    <input
                      id="fin-ref-comisiones"
                      type="number"
                      placeholder="0"
                      value={refComisiones || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRefComisiones(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => {
                if (result) {
                  let val = 0;
                  let lab = "";
                  if ('finalBalance' in result) {
                    val = result.finalBalance;
                    lab = `Rendimientos compounding (${termsInMonths} meses)`;
                  } else if ('cuotaTotal' in result) {
                    val = result.cuotaTotal;
                    lab = `Cuota préstamo avanzado`;
                  } else if ('ahorroTotalPosible' in result) {
                    val = result.ahorroTotalPosible;
                    lab = `Ahorro comparador de prestamos`;
                  } else if ('ahorroTotalInversion' in result) {
                    val = result.ahorroTotalInversion;
                    lab = `Ahorro de refinanciamiento`;
                  }
                  handleSaveResult(val, lab);
                  triggerFeedback('¡Guardado!');
                }
              }}
              className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 cursor-pointer flex items-center gap-1 active:scale-95"
            >
              Guardar a mi Historial
            </button>
            <button
              onClick={handleCopy}
              className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <Copy size={12} />
              {copied ? '¡Copiado!' : 'Copiar Reporte'}
            </button>
          </div>
        </div>

        {/* Right Outputs block */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Print CSS for Letter / Legal paper support */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page {
                size: ${printSize === 'legal' ? 'legal' : 'letter'} portrait !important;
                margin: 1.5cm !important;
              }
            }
          `}} />
          <div id="finanzas-calculator-print-preview" data-print-kind="report-document" className="bg-[#FAFAFA] border rounded-2xl p-6 md:p-8 space-y-5">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block flex items-center gap-1 border-b pb-2">
              <Sparkles size={12} className="text-emerald-600 animate-pulse" />
              Resultado de la corrida financiera
            </span>

            {/* Giant KPI metric */}
            {result && (
              <div className="py-2">
                <span className="text-xs text-gray-500 font-semibold block">
                  {calc.id === 'ahorro-plan' ? 'Ahorro Mensual Requerido' : 'Saldo o Beneficio Final Estimado'}
                </span>
                <div className="text-3xl md:text-4xl font-extrabold text-[#030712] mt-1 font-sans">
                  RD${' '}
                  {(() => {
                    const r = result as any;
                    if (!r) return "0.00";
                    if ('monthlyInflowNeeded' in r) return Number(r.monthlyInflowNeeded).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('interestGained' in r) return Number(r.interestGained).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('finalBalance' in r) return Number(r.finalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('futureValue' in r) return Number(r.futureValue).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('presentValue' in r) return Number(r.presentValue).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('cuotaTotal' in r) return Number(r.cuotaTotal).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('ahorroTotalPosible' in r) return Number(r.ahorroTotalPosible).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('ahorroTotalInversion' in r) return Number(r.ahorroTotalInversion).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('monthlyCuota' in r) return Number(r.monthlyCuota).toLocaleString('en-US', { minimumFractionDigits: 2 });
                    return "0.00";
                  })()}
                </div>

                {/* Compare loan decision tags */}
                {calc.id === 'comparador-prestamos' && result && 'mejorOp' in result && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl inline-block text-left">
                    <p className="text-xs text-emerald-800 font-semibold">
                      La mejor alternativa financiera es: <strong className="font-bold uppercase text-emerald-950 font-mono">{result.mejorOp}</strong>, 
                      ahorrándole un aproximado de <strong className="font-bold">RD$ {result.ahorroTotalPosible.toLocaleString('en-US')}</strong> en intereses.
                    </p>
                  </div>
                )}

                {calc.id === 'refinanciamiento-analizador' && result && 'esRentable' in result && (
                  <div className={`mt-3 p-3 rounded-xl inline-block text-left border ${result.esRentable ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <p className="text-xs font-semibold">
                      {result.esRentable 
                        ? `¡Sí es rentable! Al refinanciar su préstamo con estos parámetros se ahorrará RD$ ${result.ahorroTotalInversion.toLocaleString('en-US')} totales de intereses.`
                        : `No es financieramente rentable refinanciar dado que los gastos de cierre absorben la caída de tasa impositiva.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Structured details table */}
            {result && (
              <div className="border rounded-xl bg-white p-4.5 space-y-3 text-xs text-gray-650 font-medium">
                <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block border-b pb-1.5 mb-2 border-dashed">
                  Metrícaje detallado de Amortización:
                </span>

                {calc.id === 'ahorro-plan' && 'totalInvestedSelf' in result && (
                  <>
                    <div className="flex justify-between"><span>Suma total de aportes propios:</span><span className="font-mono text-gray-900">RD$ {result.totalInvestedSelf.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Intereses ganados a favor:</span><span className="font-mono text-emerald-600 font-bold">RD$ {result.totalInterestEarned.toLocaleString('en-US')}</span></div>
                  </>
                )}

                {calc.id === 'interes-compuesto' && 'totalContributed' in result && (
                  <>
                    <div className="flex justify-between"><span>Capital aportado base + mensual:</span><span className="font-mono text-gray-950">RD$ {result.totalContributed.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Suma acumulada de retornos compounding:</span><span className="font-mono text-emerald-600 font-bold">RD$ {result.interestEarned.toLocaleString('en-US')}</span></div>
                  </>
                )}

                {calc.id === 'prestamo-avanzado' && 'cuotaBase' in result && (
                  <>
                    <div className="flex justify-between"><span>Cuota amortización base regular:</span><span className="font-mono">RD$ {result.cuotaBase.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Prima seguro de vida mensual:</span><span className="font-mono">RD$ {result.svida.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Prima seguro de daños mensual:</span><span className="font-mono">RD$ {result.sprop.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Suma intereses netos pagados por préstamo:</span><span className="font-mono text-rose-600 font-bold">RD$ {result.totalInteres.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Meses de Gracia concedido (0 pago):</span><span className="font-bold">{result.plazoGracia} Meses</span></div>
                  </>
                )}

                {calc.id === 'comparador-prestamos' && 'escAl' in result && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-3 mb-2 min-w-0">
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1 min-w-0">
                      <strong className="text-xs text-gray-900 block font-bold">Préstamo A</strong>
                      <p className="text-[10px] text-gray-500 break-words">Cuota: <span className="font-mono">RD$ {result.escAl.cuota.toLocaleString('en-US')}</span></p>
                      <p className="text-[10px] text-gray-500 break-words">Total Interés: <span className="font-mono">RD$ {result.escAl.totalInteres.toLocaleString('en-US')}</span></p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1 min-w-0">
                      <strong className="text-xs text-gray-900 block font-bold">Préstamo B</strong>
                      <p className="text-[10px] text-gray-500 break-words">Cuota: <span className="font-mono">RD$ {result.escB.cuota.toLocaleString('en-US')}</span></p>
                      <p className="text-[10px] text-gray-500 break-words">Total Interés: <span className="font-mono">RD$ {result.escB.totalInteres.toLocaleString('en-US')}</span></p>
                    </div>
                  </div>
                )}

                {calc.id === 'refinanciamiento-analizador' && 'cuotaActual' in result && (
                  <>
                    <div className="flex justify-between"><span>Mensualidad antes (Actual):</span><span className="font-mono">RD$ {result.cuotaActual.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Mensualidad recalculada:</span><span className="font-mono font-semibold text-emerald-600">RD$ {result.nuevaCuota.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Ahorro consolidado mensual:</span><span className="font-bold text-gray-900">RD$ {result.ahorroCuotaMensual.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Comisiones y gastos de cierre:</span><span className="font-mono text-rose-500">RD$ {result.gastosCierreRefinanciados.toLocaleString('en-US')}</span></div>
                  </>
                )}

                {/* Formula details */}
                <div className="mt-4 pt-3 text-[11px] font-normal text-gray-500 flex items-start gap-1">
                  <FileText size={12} className="text-gray-400 mt-0.5" />
                  <p><strong>Ecuación de cálculo:</strong> {result.formula}</p>
                </div>

                {/* Legal Source details */}
                <div className="text-[11px] font-normal text-gray-500 flex items-start gap-1">
                  <ShieldAlert size={12} className="text-gray-400 mt-0.5" />
                  <p><strong>Base Regulatoría:</strong> {(result as any).legalSource || meta.legalSource}</p>
                </div>

                <div className="pt-3 border-t border-gray-150/70 text-[10px] text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 print-avoid-break">
                  <span>Emitido por Tu Negocio RD el {new Date().toLocaleDateString('es-DO')}</span>
                  <span>Referencia: NRD-FIN-{calc.id.toUpperCase()}</span>
                </div>
              </div>
            )}

            {/* Document export triggers with paper select option */}
            <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-gray-100 print:hidden">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-205 rounded-lg px-2.5 py-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Papel:</span>
                <select
                  value={printSize}
                  onChange={(e) => setPrintSize(e.target.value as 'letter' | 'legal')}
                  className="bg-transparent border-none text-xs font-semibold text-[#111827] outline-none cursor-pointer focus:ring-0 p-0"
                  aria-label="Seleccionar tamaño de papel"
                >
                  <option value="letter">Carta (8.5" x 11")</option>
                  <option value="legal">Oficio / Legal (8.5" x 14")</option>
                </select>
              </div>

              <button
                onClick={() => printElementById('finanzas-calculator-print-preview', `Tu Negocio RD - ${calc.name}`)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                aria-label="Imprimir Informe de la corrida"
              >
                <Printer size={12} />
                Imprimir Informe
              </button>
              <button
                onClick={handleExcelExport}
                className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg bg-white hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                aria-label="Descargar tabla de amortización en CSV"
              >
                <Download size={12} />
                Descargar Amortización (CSV)
              </button>
            </div>

          </div>

          {/* Interactive example */}
          <div className="bg-white border rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <TrendingUp size={15} className="text-emerald-600" />
              Caso Práctico Ilustrativo
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed bg-[#FAFAFA] p-4.5 rounded-xl border mt-3">
              {meta.example}
            </p>
          </div>

          {/* Active Amortization Rows Table for complete breakdown */}
          {calc.id === 'amortizacion-completa' && result && 'rows' in result && (
            <div className="bg-white border rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Layers size={15} className="text-emerald-600" />
                Tabla Mensual de Amortización (Método Francés)
              </h4>
              <div className="overflow-x-auto border rounded-xl divide-y">
                <table className="w-full text-left text-xs text-gray-500">
                  <thead className="bg-[#FAFAFA] text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="px-4 py-2 text-center">Mes</th>
                      <th className="px-4 py-2">Cuota Fija</th>
                      <th className="px-4 py-2">Interés</th>
                      <th className="px-4 py-2">Abono Principal</th>
                      <th className="px-4 py-2">Deuda Restante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium text-gray-700">
                    {result.rows.slice(0, 12).map((row: any) => (
                      <tr key={row.period} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-center font-bold text-gray-950 font-mono">{row.period}</td>
                        <td className="px-4 py-2.5 font-mono text-gray-900">RD$ {row.cuota.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2.5 font-mono text-orange-600">RD$ {row.interes.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2.5 font-mono text-emerald-600">RD$ {row.abono.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2.5 font-mono text-gray-950">RD$ {row.restante.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.rows.length > 12 && (
                <p className="text-[10px] text-gray-400 text-center italic">Mostrando los primeros 12 meses. Presione 'Descargar Amortización' para ver los {result.rows.length} periodos completos en Excel.</p>
              )}
            </div>
          )}

          {/* History log list */}
          {history.length > 0 && (
            <div className="bg-white border rounded-2xl p-6 space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <Award size={13} className="text-emerald-500" />
                  Historial de simulaciones en este equipo
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  Limpiar registro
                </button>
              </div>
              <div className="divide-y max-h-40 overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="py-2 flex justify-between text-xs font-medium text-gray-600">
                    <div>
                      <span>{h.detail}</span>
                      <span className="block text-[10px] text-gray-400">{h.date}</span>
                    </div>
                    <strong className="text-emerald-600 font-mono">RD$ {h.result.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Segment */}
          <div className="bg-white border rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-4">
              <HelpCircle size={15} className="text-emerald-600" />
              Respuestas Financieras del Mercado Dominicano
            </h4>
            <div className="space-y-4 divide-y divide-gray-100">
              {meta.faq.map((item, index) => (
                <div key={index} className={`${index > 0 ? "pt-4.5" : ""} space-y-1`}>
                  <strong className="block text-xs font-bold text-gray-900">¿{item.q}</strong>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
