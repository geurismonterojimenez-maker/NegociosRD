import React, { useState, useMemo } from 'react';
import { CalculatorInfo, FaqItem } from '../types';
import { TAX_RATES } from '../config/tax-rates';
import { calculateItbisExcluido, calculateItbisIncluido } from '../lib/calculations/itbis';
import { calculateIsrAsalariado } from '../lib/calculations/isr';
import { calculateTSSDetails, calculateSalarioNeto } from '../lib/calculations/tss';
import { calculatePrestaciones } from '../lib/calculations/prestaciones';
import { calculateAmortization } from '../lib/calculations/prestamos';
import { calculateBusinessMargin, calculateDGIILateFees } from '../lib/calculations/negocios';
import { ArrowLeft, Share2, Info, Check, Sparkles, TrendingUp, DollarSign, Calculator, HelpCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import AdSenseBlock from './AdSenseBlock';
import LaboralCalculators from './LaboralCalculators';
import FinanzasCalculators from './FinanzasCalculators';
import EmpresarialesCalculators from './EmpresarialesCalculators';

interface CalculatorFormProps {
  calc: CalculatorInfo;
  onBack: () => void;
  onNavigateToCalc: (slug: string) => void;
}

export default function CalculatorForm({ calc, onBack, onNavigateToCalc }: CalculatorFormProps) {
  const isLaboralNew = [
    'decimo-tercer-salario', 'horas-extras', 'trabajo-nocturno', 
    'salario-por-hora', 'salario-quincenal', 'bonificaciones-ley', 
    'indemnizacion-laboral', 'vacaciones-pendientes', 'regalia-proporcional', 
    'costo-empleado'
  ].includes(calc.id);

  const isFinanzaNew = [
    'ahorro-plan', 'interes-simple', 'interes-compuesto', 
    'valor-futuro', 'valor-presente', 'inversion-render', 
    'prestamo-avanzado', 'comparador-prestamos', 'amortizacion-completa', 
    'refinanciamiento-analizador'
  ].includes(calc.id);

  const isEmpresarialNew = [
    'gen-cotizacion', 'gen-recibo', 'gen-proforma', 
    'gen-orden', 'gen-presupuesto', 'margen-bruto', 
    'margen-neto', 'punto-equilibrio', 'roi-calc', 
    'flujo-caja'
  ].includes(calc.id);

  if (isLaboralNew) {
    return <LaboralCalculators calc={calc} onBack={onBack} />;
  }
  if (isFinanzaNew) {
    return <FinanzasCalculators calc={calc} onBack={onBack} />;
  }
  if (isEmpresarialNew) {
    return <EmpresarialesCalculators calc={calc} onBack={onBack} />;
  }

  const [copied, setCopied] = useState(false);

  // Common sharing logic
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- STATE DEFINITIONS FOR THE VARIOUS CALCULATORS ---
  
  // ITBIS calculators states
  const [itbisAmountInput, setItbisAmountInput] = useState<number>(10000);
  const [itbisRateInput, setItbisRateInput] = useState<number>(0.18); // 18% or 16%

  // ISR state
  const [isrSalaryInput, setIsrSalaryInput] = useState<number>(45000);
  const [isrDeductTss, setIsrDeductTss] = useState<boolean>(true);

  // Retenciones state
  const [retencionInvoiceAmount, setRetencionInvoiceAmount] = useState<number>(15000);
  const [retencionServiceType, setRetencionServiceType] = useState<string>('honorarios'); // honorarios (10%), tecnicos (2%), alquiler (10%), seguridad (2%)
  const [retencionItbisOption, setRetencionItbisOption] = useState<string>('100'); // 100%, 30%, 0%

  // Recargos DGII state
  const [recargosTaxBase, setRecargosTaxBase] = useState<number>(5000);
  const [recargosMonthsLate, setRecargosMonthsLate] = useState<number>(3);

  // Salario Neto state
  const [netSalaryInput, setNetSalaryInput] = useState<number>(35000);

  // AFP / SFS / TSS general states
  const [tssSalaryInput, setTssSalaryInput] = useState<number>(25000);

  // Prestaciones / Liquidación states
  const [prestacionesSalary, setPrestacionesSalary] = useState<number>(25000);
  const [prestacionesTypeCobro, setPrestacionesTypeCobro] = useState<'mensual' | 'quincenal' | 'semanal'>('mensual');
  const [prestacionesIngreso, setPrestacionesIngreso] = useState<string>('2024-01-01');
  const [prestacionesSalida, setPrestacionesSalida] = useState<string>('2026-05-15');
  const [prestacionesPreaviso, setPrestacionesPreaviso] = useState<boolean>(true);
  const [prestacionesCesantia, setPrestacionesCesantia] = useState<boolean>(true);
  const [prestacionesVacaciones, setPrestacionesVacaciones] = useState<'pendientes_completas' | 'proporcional' | 'ninguna'>('pendientes_completas');
  const [prestacionesRegaliaMeses, setPrestacionesRegaliaMeses] = useState<number>(5);
  const [liquidacionMotivo, setLiquidacionMotivo] = useState<string>('desahucio_patronal'); // desahucio_patronal, renuncia, despido_justificado

  // Préstamos / Hipotecas states
  const [loanPrincipal, setLoanPrincipal] = useState<number>(500000);
  const [loanInterest, setLoanInterest] = useState<number>(12.5); // %
  const [loanPlazo, setLoanPlazo] = useState<number>(36); // meses o años
  const [loanInterestCompare, setLoanInterestCompare] = useState<number>(14.5); // %
  const [showAmortizationTable, setShowAmortizationTable] = useState<boolean>(false);

  // Negocios state
  const [bizCost, setBizCost] = useState<number>(150);
  const [bizMarginDesired, setBizMarginDesired] = useState<number>(30); // 30%

  // --- CALCULATION RESULTS EVALUATION ---

  const calculatedResults = useMemo(() => {
    switch (calc.id) {
      case 'itbis-calc':
      case 'itbis-excluido':
        return calculateItbisExcluido(itbisAmountInput, itbisRateInput);
      case 'itbis-incluido':
        return calculateItbisIncluido(itbisAmountInput, itbisRateInput);
      case 'isr-asalariado':
        return calculateIsrAsalariado(isrSalaryInput, isrDeductTss);
      case 'retenciones-dgii': {
        const amt = retencionInvoiceAmount;
        let isrRate = 0.10; // default honorarios
        if (retencionServiceType === 'tecnicos') isrRate = 0.02;
        if (retencionServiceType === 'alquiler') isrRate = 0.10;
        if (retencionServiceType === 'seguridad') isrRate = 0.02;

        const itbisMonto = amt * 0.18;
        let itbisRetencionRate = 1.00; // 100%
        if (retencionItbisOption === '30') itbisRetencionRate = 0.30;
        if (retencionItbisOption === '0') itbisRetencionRate = 0;

        const itbisRetenido = itbisMonto * itbisRetencionRate;
        const isrRetenido = amt * isrRate;
        const totalNetoA_Cobrar = amt + itbisMonto - itbisRetenido - isrRetenido;

        return {
          originalSubtotal: amt,
          itbisFacturado: itbisMonto,
          itbisRetenido,
          itbisClientePaga: itbisMonto - itbisRetenido,
          isrRetenido,
          totalPagarCliente: amt + itbisMonto,
          totalNetoA_Cobrar,
          isrRateText: `${isrRate * 100}%`,
          itbisRetRateText: `${retencionItbisOption}%`
        };
      }
      case 'recargos-dgii':
        return calculateDGIILateFees(recargosTaxBase, recargosMonthsLate);
      case 'salario-neto':
        return calculateSalarioNeto(netSalaryInput);
      case 'afp-empleado': {
        const topes = TAX_RATES.topesCotizables;
        const maxAFP = topes.salarioMinimoTSS * topes.afpMultiplicador;
        const cotizable = Math.min(tssSalaryInput, maxAFP);
        const afpMonto = cotizable * TAX_RATES.tssEmpleado.afp;
        return {
          salario: tssSalaryInput,
          cotizable,
          monto: afpMonto,
          tope: maxAFP
        };
      }
      case 'sfs-empleado': {
        const topes = TAX_RATES.topesCotizables;
        const maxSFS = topes.salarioMinimoTSS * topes.sfsMultiplicador;
        const cotizable = Math.min(tssSalaryInput, maxSFS);
        const sfsMonto = cotizable * TAX_RATES.tssEmpleado.sfs;
        return {
          salario: tssSalaryInput,
          cotizable,
          monto: sfsMonto,
          tope: maxSFS
        };
      }
      case 'tss-completa':
        return calculateTSSDetails(tssSalaryInput);
      case 'prestaciones-laborales':
        return calculatePrestaciones(
          prestacionesSalary,
          prestacionesIngreso,
          prestacionesSalida,
          prestacionesPreaviso,
          prestacionesCesantia,
          prestacionesVacaciones,
          prestacionesRegaliaMeses
        );
      case 'liquidacion-laboral': {
        // En función del motivo, aplicar preaviso o cesantía
        const aplicaPreaviso = liquidacionMotivo === 'desahucio_patronal';
        const aplicaCesantia = liquidacionMotivo === 'desahucio_patronal';
        return calculatePrestaciones(
          prestacionesSalary,
          prestacionesIngreso,
          prestacionesSalida,
          aplicaPreaviso,
          aplicaCesantia,
          prestacionesVacaciones,
          prestacionesRegaliaMeses
        );
      }
      case 'vacaciones-calc': {
        // Simular vacaciones
        const res = calculatePrestaciones(
          prestacionesSalary,
          '2024-01-01',
          '2026-01-01', // 2 años
          false,
          false,
          'pendientes_completas',
          12
        );
        return {
          salario: prestacionesSalary,
          dias: res.vacacionesDias,
          monto: res.vacacionesMonto,
          salarioDiario: res.salarioDiario
        };
      }
      case 'regalia-pascual': {
        const totalGanado = prestacionesSalary * prestacionesRegaliaMeses;
        const montoNavidad = totalGanado / 12;
        return {
          salario: prestacionesSalary,
          meses: prestacionesRegaliaMeses,
          totalGanado,
          monto: montoNavidad
        };
      }
      case 'preaviso-calc': {
        const res = calculatePrestaciones(
          prestacionesSalary,
          prestacionesIngreso,
          prestacionesSalida,
          true,
          false,
          'ninguna',
          1
        );
        return {
          salario: prestacionesSalary,
          dias: res.preavisoDias,
          monto: res.preavisoMonto,
          salarioDiario: res.salarioDiario,
          tiempos: res.tiempoServicio
        };
      }
      case 'cesantia-calc': {
        const res = calculatePrestaciones(
          prestacionesSalary,
          prestacionesIngreso,
          prestacionesSalida,
          false,
          true,
          'ninguna',
          1
        );
        return {
          salario: prestacionesSalary,
          dias: res.cesantiaDias,
          monto: res.cesantiaMonto,
          salarioDiario: res.salarioDiario,
          tiempos: res.tiempoServicio
        };
      }
      case 'prestamo-personal':
        return calculateAmortization(loanPrincipal, loanInterest, loanPlazo, false);
      case 'cuota-prestamo': {
        const plan1 = calculateAmortization(loanPrincipal, loanInterest, loanPlazo, false);
        const plan2 = calculateAmortization(loanPrincipal, loanInterestCompare, loanPlazo, false);
        return {
          plan1,
          plan2,
          diferenciaCuota: Math.abs(plan1.cuotaTotalMensual - plan2.cuotaTotalMensual),
          diferenciaInteres: Math.abs(plan1.totalInteresPagado - plan2.totalInteresPagado)
        };
      }
      case 'prestamo-hipotecario':
        return calculateAmortization(loanPrincipal, loanInterest, loanPlazo, true);
      case 'precio-venta':
        return calculateBusinessMargin(bizCost, bizMarginDesired);
      default:
        return null;
    }
  }, [
    calc.id,
    itbisAmountInput,
    itbisRateInput,
    isrSalaryInput,
    isrDeductTss,
    retencionInvoiceAmount,
    retencionServiceType,
    retencionItbisOption,
    recargosTaxBase,
    recargosMonthsLate,
    netSalaryInput,
    tssSalaryInput,
    prestacionesSalary,
    prestacionesTypeCobro,
    prestacionesIngreso,
    prestacionesSalida,
    prestacionesPreaviso,
    prestacionesCesantia,
    prestacionesVacaciones,
    prestacionesRegaliaMeses,
    liquidacionMotivo,
    loanPrincipal,
    loanInterest,
    loanPlazo,
    loanInterestCompare,
    bizCost,
    bizMarginDesired
  ]);

  // Specific FAQs for tools context
  const miniFAQs = useMemo<FaqItem[]>(() => {
    if (calc.category === 'impuestos') {
      return [
        { question: '¿Qué transacciones físicas están gravadas con el ITBIS?', answer: 'Cualquier transferencia de bienes industrializados dentro de la frontera nacional de RD de mano de comercios comerciales, así como importaciones aduaneras de materias o equipos, y la prestación de servicios generales profesionales.' },
        { question: '¿Cómo evita una PYME las multas con la DGII?', answer: 'Presentando obligatoriamente los formularios de IT-1 e IR-17 a tiempo, exigiendo facturas válidas con NCF de crédito fiscal, y declarando verídicamente los ingresos ordinarios antes de las fechas límite.' }
      ];
    } else if (calc.category === 'laboral') {
      return [
        { question: '¿La cesantía se pierde si el empleado renuncia voluntariamente?', answer: 'Sí, bajo las normas vigentes del Ministerio de Trabajo, si el empleado renuncia voluntariamente (dimisión por voluntad propia del empleado) se pierden el derecho a preaviso y cesantías, conservando únicamente las vacaciones acumuladas no gozadas y el sueldo navideño proporcional.' },
        { question: '¿Qué es el sueldo 13 o doble sueldo y cuándo vence su pago?', answer: 'El sueldo de Navidad amparado por el Código Laboral es el total devengado en el año calendario dividido entre 12. Los empleadores corporativos dominicanos tienen como límite obligatorio el 20 de diciembre de cada año sin deducciones de TSS o ISR.' }
      ];
    } else {
      return [
        { question: '¿Cuáles bancos ofrecen las menores tasas de préstamos en RD?', answer: 'Los bancos múltiples comerciales tales como Banreservas, Banco Popular, BHD y asociaciones mutualistas como APAP ofrecen tasas competitivas que varían entre 9.5% y 15.5% fijo periódico dependiendo de la temporada y ferias inmobiliarias.' },
        { question: '¿Qué beneficio ofrece el amortizado francés?', answer: 'Garantiza una cuota constante y unificada durante todo el período estipulado del contrato, de modo que en los primeros años el deudor destina más asignación a intereses y en los últimos años amortiza directamente el capital principal.' }
      ];
    }
  }, [calc.category]);

  const relatedTools = useMemo(() => {
    if (calc.category === 'impuestos') {
      return [
        { name: 'Calculadora ITBIS', slug: 'calculadora-itbis' },
        { name: 'Sueldo Neto', slug: 'calculadora-salario-neto' },
        { name: 'Impuesto de Recargos', slug: 'calculadora-recargos-dgii' }
      ];
    } else if (calc.category === 'laboral') {
      return [
        { name: 'Prestaciones Laborales', slug: 'calculadora-prestaciones-laborales' },
        { name: 'Sueldo Neto', slug: 'calculadora-salario-neto' },
        { name: 'Seguro TSS Completo', slug: 'calculadora-tss' }
      ];
    } else {
      return [
        { name: 'Préstamo Hipotecario', slug: 'calculadora-prestamo-hipotecario' },
        { name: 'Cuota de Préstamo', slug: 'calculadora-cuota-prestamo' },
        { name: 'Margen de Ganancias', slug: 'calculadora-precio-venta-margen' }
      ];
    }
  }, [calc.category]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumb & Goback navigation */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0F766E] font-medium transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a Herramientas
      </button>

      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">{calc.name}</h1>
          <p className="text-lg text-[#6B7280] max-w-3xl">{calc.description}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button 
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#bdc9c6] rounded-md bg-white hover:bg-[#FAFAFA] text-sm font-medium text-[#111827] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Share2 size={16} />
            {copied ? 'Copiado!' : 'Compartir enlace'}
          </button>
        </div>
      </div>

      {/* Grid of Form and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Form Module - occupies 5 cols on lg */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm self-start">
          <h2 className="text-lg font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3 mb-5 flex items-center gap-2">
            <Calculator size={18} className="text-[#0F766E]" />
            Parámetros de entrada
          </h2>

          <div className="space-y-5">
            {/* ITBIS Renders */}
            {(calc.id === 'itbis-calc' || calc.id === 'itbis-excluido' || calc.id === 'itbis-incluido') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    {calc.id === 'itbis-incluido' ? 'Monto Total Facturado (RD$)' : 'Monto Neto Base (RD$)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                    <input 
                      type="number" 
                      value={itbisAmountInput}
                      onChange={(e) => setItbisAmountInput(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Tasa impositiva de ITBIS</label>
                  <select 
                    value={itbisRateInput}
                    onChange={(e) => setItbisRateInput(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                  >
                    <option value={0.18}>18% (Tasa general)</option>
                    <option value={0.16}>16% (Tasa reducida / Alimentos selectos)</option>
                  </select>
                </div>
              </>
            )}

            {/* ISR Rent Screen */}
            {calc.id === 'isr-asalariado' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Salario Mensual Bruto (RD$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                    <input 
                      type="number" 
                      value={isrSalaryInput}
                      onChange={(e) => setIsrSalaryInput(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="deductTss"
                    checked={isrDeductTss}
                    onChange={(e) => setIsrDeductTss(e.target.checked)}
                    className="h-4 w-4 text-[#0F766E] focus:ring-[#0F766E] border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="deductTss" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Deducir aportes TSS antes del ISR (AFP y SFS)
                  </label>
                </div>
              </>
            )}

            {/* Retenciones Screen */}
            {calc.id === 'retenciones-dgii' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Monto del servicio bruto (RD$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                    <input 
                      type="number" 
                      value={retencionInvoiceAmount}
                      onChange={(e) => setRetencionInvoiceAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Tipo de Servicio Prestado (Tasa de ISR)</label>
                  <select 
                    value={retencionServiceType}
                    onChange={(e) => setRetencionServiceType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                  >
                    <option value="honorarios">Honorarios Profesionales (10% ISR)</option>
                    <option value="tecnicos">Servicios Técnicos / Plomería / Albañil (2% ISR)</option>
                    <option value="alquiler">Alquiler de Bienes Muebles o Inmuebles (10% ISR)</option>
                    <option value="seguridad">Servicios de Seguridad y Vigilancia (2% ISR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Porcentaje de ITBIS a retener por el cliente corporativo</label>
                  <select 
                    value={retencionItbisOption}
                    onChange={(e) => setRetencionItbisOption(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                  >
                    <option value="100">100% de ITBIS (Normal para servicios profesionales)</option>
                    <option value="30">30% de ITBIS (Norma 02-05 entre sociedades jurídicas)</option>
                    <option value="0">0% (Ninguna retención de ITBIS)</option>
                  </select>
                </div>
              </>
            )}

            {/* Recargos Screen */}
            {calc.id === 'recargos-dgii' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Monto de impuesto no pagado (RD$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                    <input 
                      type="number" 
                      value={recargosTaxBase}
                      onChange={(e) => setRecargosTaxBase(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Meses de atraso (desde el vencimiento)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="120"
                    value={recargosMonthsLate}
                    onChange={(e) => setRecargosMonthsLate(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                  />
                </div>
              </>
            )}

            {/* Salario Neto Screen */}
            {calc.id === 'salario-neto' && (
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">Salario bruto mensual en pesos (RD$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                  <input 
                    type="number" 
                    value={netSalaryInput}
                    onChange={(e) => setNetSalaryInput(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                  />
                </div>
              </div>
            )}

            {/* AFP, SFS, TSS unified state */}
            {(calc.id === 'afp-empleado' || calc.id === 'sfs-empleado' || calc.id === 'tss-completa') && (
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">Salario mensual ordinario (RD$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                  <input 
                    type="number" 
                    value={tssSalaryInput}
                    onChange={(e) => setTssSalaryInput(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Prestaciones y Liquidación screen */}
            {(calc.id === 'prestaciones-laborales' || calc.id === 'liquidacion-laboral' || calc.id === 'vacaciones-calc' || calc.id === 'regalia-pascual' || calc.id === 'preaviso-calc' || calc.id === 'cesantia-calc') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Salario bruto ordinario de contrato (RD$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                    <input 
                      type="number" 
                      value={prestacionesSalary}
                      onChange={(e) => setPrestacionesSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                {calc.id === 'liquidacion-laboral' && (
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Motivo del fin de contrato</label>
                    <select 
                      value={liquidacionMotivo}
                      onChange={(e) => setLiquidacionMotivo(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    >
                      <option value="desahucio_patronal">Desahucio del Empleador (Le tocan prestaciones completas)</option>
                      <option value="renuncia">Renuncia Voluntaria (Solo adquiere Vacaciones y Regalía)</option>
                      <option value="despido_justificado">Despido Justificado con causa (Solo adquiere Vacaciones y Regalía)</option>
                    </select>
                  </div>
                )}

                {/* Date range inputs for preaviso, cesantia, liquidacion */}
                {(calc.id === 'prestaciones-laborales' || calc.id === 'liquidacion-laboral' || calc.id === 'preaviso-calc' || calc.id === 'cesantia-calc') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Fecha de Ingreso</label>
                      <input 
                        type="date"
                        value={prestacionesIngreso}
                        onChange={(e) => setPrestacionesIngreso(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#111827]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Fecha de Salida</label>
                      <input 
                        type="date"
                        value={prestacionesSalida}
                        onChange={(e) => setPrestacionesSalida(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#111827]"
                      />
                    </div>
                  </div>
                )}

                {(calc.id === 'prestaciones-laborales') && (
                  <div className="space-y-3 py-2">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="preavisoOmitido"
                        checked={prestacionesPreaviso}
                        onChange={(e) => setPrestacionesPreaviso(e.target.checked)}
                        className="h-4 w-4 text-[#0F766E] focus:ring-[#0F766E] border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="preavisoOmitido" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Omitió el preaviso (Pagar preaviso)
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="pagaCesantia"
                        checked={prestacionesCesantia}
                        onChange={(e) => setPrestacionesCesantia(e.target.checked)}
                        className="h-4 w-4 text-[#0F766E] focus:ring-[#0F766E] border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="pagaCesantia" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Aplica auxilio de cesantía
                      </label>
                    </div>
                  </div>
                )}

                {(calc.id === 'prestaciones-laborales' || calc.id === 'liquidacion-laboral') && (
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Vacaciones del último año laborado</label>
                    <select 
                      value={prestacionesVacaciones}
                      onChange={(e) => setPrestacionesVacaciones(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    >
                      <option value="pendientes_completas">No tomadas (Pagar completas/proporcional)</option>
                      <option value="ninguna">Ya fueron tomadas o disfrutadas por completo</option>
                    </select>
                  </div>
                )}

                {(calc.id === 'prestaciones-laborales' || calc.id === 'liquidacion-laboral' || calc.id === 'regalia-pascual') && (
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Meses trabajados en el año actual (para Navidad / Regalía)</label>
                    <input 
                      type="range"
                      min="1"
                      max="12"
                      value={prestacionesRegaliaMeses}
                      onChange={(e) => setPrestacionesRegaliaMeses(parseInt(e.target.value))}
                      className="w-full accent-[#0F766E]"
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-medium mt-1">
                      <span>1 mes</span>
                      <span className="font-bold text-[#0F766E]">{prestacionesRegaliaMeses} mes(es)</span>
                      <span>12 meses</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Préstamos & Hipotecario Screen */}
            {(calc.id === 'prestamo-personal' || calc.id === 'cuota-prestamo' || calc.id === 'prestamo-hipotecario') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Monto total solicitado (Principal en RD$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                    <input 
                      type="number" 
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(Math.max(1000, parseFloat(e.target.value) || 0))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Tasa de interés (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={loanInterest}
                      onChange={(e) => setLoanInterest(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Plazo (meses)</label>
                    <input 
                      type="number" 
                      value={loanPlazo}
                      onChange={(e) => setLoanPlazo(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#111827]"
                    />
                  </div>
                </div>

                {calc.id === 'cuota-prestamo' && (
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Tasa a comparar (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={loanInterestCompare}
                      onChange={(e) => setLoanInterestCompare(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-[#111827]"
                    />
                  </div>
                )}
              </>
            )}

            {/* Negocios - Margen de ganancia */}
            {calc.id === 'precio-venta' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Costo por unidad del producto/servicio (RD$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 font-medium">RD$</div>
                    <input 
                      type="number" 
                      value={bizCost}
                      onChange={(e) => setBizCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">Margen de ganancia bruto pretendido (%)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="99"
                    value={bizMarginDesired}
                    onChange={(e) => setBizMarginDesired(Math.max(1, Math.min(99.9, parseFloat(e.target.value) || 1)))}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-[#111827] focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">Margen comercial de utilidad sobre precio de venta, no simple margen markup sobre costo.</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Screen - occupies 7 cols on lg */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Results Graphic Widget in deep primary teal */}
          <div className="bg-[#0F766E] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-teal-700">
            <span className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-5 block flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-300" />
              Resultado Calculado — República Dominicana
            </span>

            {/* RENDER THE CORRESPONDING VALUE ACCORDING TO THE SELECTED CALCULATOR */}

            {/* 1 & 2 & 3. ITBIS results */}
            {(calc.id === 'itbis-calc' || calc.id === 'itbis-excluido' || calc.id === 'itbis-incluido') && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Total ITBIS ({itbisRateInput * 100}%)</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.itbisAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">
                      {calc.id === 'itbis-incluido' ? 'Monto Neto Base' : 'Monto total final'}
                    </p>
                    <p className="text-3xl font-bold font-mono text-white mt-1">
                      RD$ { (calc.id === 'itbis-incluido' ? calculatedResults.baseAmount : calculatedResults.totalWithItbis).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Monto base neto:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">ITBIS recaudado ({itbisRateInput * 100}%):</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.itbisAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-base text-white">
                    <span>Total consolidado:</span>
                    <span className="font-mono text-teal-200">RD$ {calculatedResults.totalWithItbis.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ISR Asalariados results */}
            {calc.id === 'isr-asalariado' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Retención ISR Mensual</p>
                    <p className="text-3xl font-extrabold font-mono text-rose-200 mt-1">
                      RD$ {calculatedResults.monthlyIsrAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Tasa Efectiva de Impuesto</p>
                    <p className="text-3xl font-bold font-mono text-teal-200 mt-1">
                      {calculatedResults.effectiveIsrRate}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Salario bruto mensual:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.monthlyGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {isrDeductTss && (
                    <div className="flex justify-between border-b border-teal-600/30 pb-2 text-amber-200">
                      <span>Deducción TSS total obligatoria:</span>
                      <span className="font-semibold font-mono">- RD$ {calculatedResults.monthlyTssDeduction.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Base imponible mensual:</span>
                    <span className="font-mono font-semibold text-white">RD$ {calculatedResults.monthlyImponibleIsr.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Base imponible anualizada:</span>
                    <span className="font-mono font-semibold text-white">RD$ {calculatedResults.annualImponibleIsr.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-base text-white">
                    <span>Impuesto ISR Retenido Anual:</span>
                    <span className="font-mono text-rose-200">RD$ {calculatedResults.annualIsrAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Retenciones Screen results */}
            {calc.id === 'retenciones-dgii' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Neto a Cobrar (Pesos)</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.totalNetoA_Cobrar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Total de Retenciones</p>
                    <p className="text-3xl font-bold font-mono text-rose-200 mt-1">
                      RD$ {(calculatedResults.itbisRetenido + calculatedResults.isrRetenido).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Monto bruto facturado:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.originalSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">ITBIS facturado (18%):</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.itbisFacturado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-rose-200 border-b border-teal-600/30 pb-2">
                    <span>Retención de ITBIS ({calculatedResults.itbisRetRateText}%):</span>
                    <span className="font-mono font-bold">- RD$ {calculatedResults.itbisRetenido.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-rose-200 border-b border-teal-600/30 pb-2">
                    <span>Retención de ISR ({calculatedResults.isrRateText}):</span>
                    <span className="font-mono font-bold">- RD$ {calculatedResults.isrRetenido.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-base text-white">
                    <span>Neto real a transferir por cliente:</span>
                    <span className="font-mono text-teal-200">RD$ {calculatedResults.totalNetoA_Cobrar.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Recargos DGII results */}
            {calc.id === 'recargos-dgii' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Total a Liquidar ante la DGII</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Total de Multa Adicional</p>
                    <p className="text-3xl font-bold font-mono text-rose-200 mt-1">
                      RD$ {(calculatedResults.recargoMoraMonto + calculatedResults.interesIndemnizatorioMonto).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Impuesto base omitido:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.impuestoBase.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2 text-rose-200">
                    <span>Recargo por mora calculado:</span>
                    <span className="font-semibold font-mono">RD$ {calculatedResults.recargoMoraMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2 text-rose-200">
                    <span>Interés indemnizatorio (1.1% mensual):</span>
                    <span className="font-semibold font-mono">RD$ {calculatedResults.interesIndemnizatorioMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-base text-white">
                    <span>Total a pagar consolidado:</span>
                    <span className="font-mono text-teal-200">RD$ {calculatedResults.totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Salario neto complete results */}
            {calc.id === 'salario-neto' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Salario Neto Mensual</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.salarioNeto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Retención de Descuentos</p>
                    <p className="text-3xl font-bold font-mono text-rose-200 mt-1">
                      RD$ {calculatedResults.totalDescuentos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Sueldo Bruto:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.salarioBruto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2 text-teal-200">
                    <span>AFP Empleado (2.87%):</span>
                    <span className="font-mono font-semibold">- RD$ {calculatedResults.afpMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2 text-teal-200">
                    <span>SFS Empleado (3.04%):</span>
                    <span className="font-mono font-semibold">- RD$ {calculatedResults.sfsMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2 text-rose-200">
                    <span>ISR Retenido (DGII):</span>
                    <span className="font-mono font-semibold">- RD$ {calculatedResults.isrMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-base text-white">
                    <span>Efectivo real en bolsillo:</span>
                    <span className="font-mono text-teal-200">{calculatedResults.porcentajeNeto}% del bruto</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-teal-950/40 border border-teal-500/20 rounded-lg text-xs leading-relaxed space-y-2.5">
                  <span className="font-bold text-teal-200 uppercase block">Costos Patronales del Empleador (Adicionales)</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-teal-100">
                    <div>AFP Patronal (7.10%): <span className="font-mono text-white">RD$ {calculatedResults.patronalEstimado.afp.toLocaleString('en-US')}</span></div>
                    <div>SFS Patronal (7.09%): <span className="font-mono text-white">RD$ {calculatedResults.patronalEstimado.sfs.toLocaleString('en-US')}</span></div>
                    <div>SRL Laboral (~1.2%): <span className="font-mono text-white">RD$ {calculatedResults.patronalEstimado.srl.toLocaleString('en-US')}</span></div>
                    <div>INFOTEP (1%): <span className="font-mono text-white">RD$ {calculatedResults.patronalEstimado.infotep.toLocaleString('en-US')}</span></div>
                  </div>
                  <div className="mt-2 border-t border-teal-500/10 pt-2 font-bold text-teal-200 flex justify-between">
                    <span>Cargos corporativos totales de empleador:</span>
                    <span className="font-mono">RD$ {calculatedResults.patronalEstimado.total.toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 8 & 9. AFP or SFS single results */}
            {(calc.id === 'afp-empleado' || calc.id === 'sfs-empleado') && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Descuento Mensual</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Salario Máximo Cotizable</p>
                    <p className="text-3xl font-bold font-mono text-white mt-1">
                      RD$ {calculatedResults.tope.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Sueldo base de cálculo:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.salario.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Monto cotizable imponible final:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.cotizable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-sm text-teal-200">
                    <span>Tasa de descuento de ley:</span>
                    <span>{calc.id === 'afp-empleado' ? '2.87% AFP' : '3.04% SFS'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 10. TSS complete corporate results */}
            {calc.id === 'tss-completa' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">TSS Empleado (Descuento)</p>
                    <p className="text-2xl font-extrabold font-mono text-rose-200 mt-1">
                      RD$ {calculatedResults.empleado.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">TSS Empleador (Costo)</p>
                    <p className="text-2xl font-bold font-mono text-teal-200 mt-1">
                      RD$ {calculatedResults.empleador.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="bg-teal-900/40 border border-teal-500/20 rounded-lg p-4 mb-4 text-xs space-y-2 leading-relaxed">
                  <span className="font-bold text-white uppercase tracking-wider block mb-1">DESGLOSE TRABAJADOR (5.91% TOTAL)</span>
                  <div className="flex justify-between text-teal-100"><span>AFP (2.87%):</span><span className="font-mono text-white">RD$ {calculatedResults.empleado.afp.toLocaleString('en-US')}</span></div>
                  <div className="flex justify-between text-teal-100"><span>SFS (3.04%):</span><span className="font-mono text-white">RD$ {calculatedResults.empleado.sfs.toLocaleString('en-US')}</span></div>
                </div>

                <div className="bg-teal-900/40 border border-teal-500/20 rounded-lg p-4 text-xs space-y-2 leading-relaxed">
                  <span className="font-bold text-teal-200 uppercase tracking-wider block mb-1">DESGLOSE PATRONAL EMPLEADOR (16.39% TOTAL)</span>
                  <div className="flex justify-between text-teal-100"><span>AFP Patronal (7.10%):</span><span className="font-mono text-white">RD$ {calculatedResults.empleador.afp.toLocaleString('en-US')}</span></div>
                  <div className="flex justify-between text-teal-100"><span>SFS Patronal (7.09%):</span><span className="font-mono text-white">RD$ {calculatedResults.empleador.sfs.toLocaleString('en-US')}</span></div>
                  <div className="flex justify-between text-teal-100"><span>SRL Riesgos (1.20%):</span><span className="font-mono text-white">RD$ {calculatedResults.empleador.srl.toLocaleString('en-US')}</span></div>
                  <div className="flex justify-between text-teal-100"><span>INFOTEP (1.00%):</span><span className="font-mono text-white">RD$ {calculatedResults.empleador.infotep.toLocaleString('en-US')}</span></div>
                </div>
              </div>
            )}

            {/* 11 & 12. Liquidacion and Prestaciones complete legal output */}
            {(calc.id === 'prestaciones-laborales' || calc.id === 'liquidacion-laboral') && calculatedResults && (
              <div>
                <div className="border-b border-teal-600/40 pb-5 mb-5 text-center">
                  <p className="text-xs text-teal-200 font-semibold uppercase tracking-wider">Monto total estimado de liquidación</p>
                  <p className="text-4xl md:text-5xl font-extrabold font-mono text-white mt-2 tracking-tight">
                    RD$ {calculatedResults.liquidacionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-teal-600/30">
                    <span className="text-teal-100">Preaviso de Ley ({calculatedResults.preavisoDias} días):</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.preavisoMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-teal-600/30">
                    <span className="text-teal-100">Cesantía de Ley ({calculatedResults.cesantiaDias} días):</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.cesantiaMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-teal-600/30">
                    <span className="text-teal-100">Vacaciones ({calculatedResults.vacacionesDias} días):</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.vacacionesMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-teal-600/30">
                    <span className="text-teal-100">Sueldo 13 / Regalía Pascual:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.regaliaMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="mt-5 p-4 bg-teal-900/40 border border-teal-500/20 rounded-lg text-xs leading-relaxed text-teal-100 font-medium space-y-1">
                    <span className="font-bold text-teal-200 text-xs block">Nota de Transparencia de Ley</span>
                    <p>El aguinaldo de navidad (Sueldo 13) y las vacaciones acumuladas constituyen derechos adquiridos irrenunciables que le corresponden independientemente del motivo de desvinculación.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 13. Vacaciones single output */}
            {calc.id === 'vacaciones-calc' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Monto por Vacaciones</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Días de Descanso</p>
                    <p className="text-3xl font-bold font-mono text-white mt-1">
                      {calculatedResults.dias} días
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Su salario base mensual:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.salario.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Salario ordinario promedio diario:</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.salarioDiario.toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 14. Regalia single output */}
            {calc.id === 'regalia-pascual' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Doble Sueldo Estimado</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1 flex items-baseline">
                      RD$ {calculatedResults.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Salarios Acumulados</p>
                    <p className="text-3xl font-bold font-mono text-white mt-1">
                      RD$ {calculatedResults.totalGanado.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Fórmula legal:</span>
                    <span className="font-semibold text-teal-200">Suma total devengada / 12 meses</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Meses laborados computados:</span>
                    <span className="font-semibold font-mono text-white">{calculatedResults.meses} mes(es)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 15 & 16. Preaviso or Cesantia single details */}
            {(calc.id === 'preaviso-calc' || calc.id === 'cesantia-calc') && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Indemnización estimada</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Días correspondientes</p>
                    <p className="text-3xl font-bold font-mono text-white mt-1">
                      {calculatedResults.dias} días
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Salario diario de cálculo (Sueldo / 23.83):</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.salarioDiario.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Antigüedad de servicio determinada:</span>
                    <span className="font-semibold text-white">
                      {calculatedResults.tiempos.anos} año(s) y {calculatedResults.tiempos.meses} mes(es)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 17 & 19. Préstamos personales o hipotecarios results */}
            {(calc.id === 'prestamo-personal' || calc.id === 'prestamo-hipotecario') && calculatedResults && (
              <div>
                <div className="grid grid-cols-3 gap-2 border-b border-teal-600/40 pb-5 mb-5">
                  <div className="col-span-1 border-r border-teal-600/30 pr-1">
                    <p className="text-[10px] text-teal-200 font-semibold uppercase">Mensualidad Total</p>
                    <p className="text-lg font-extrabold font-mono text-white mt-1 truncate">
                      RD$ {calculatedResults.cuotaTotalMensual.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="col-span-1 border-r border-teal-600/30 px-2">
                    <p className="text-[10px] text-teal-200 font-semibold uppercase">Cuota Base</p>
                    <p className="text-lg font-bold font-mono text-white mt-1 truncate">
                      RD$ {calculatedResults.cuotaBase.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="col-span-1 pl-2">
                    <p className="text-[10px] text-teal-200 font-semibold uppercase">Total Interés</p>
                    <p className="text-lg font-bold font-mono text-rose-200 mt-1 truncate">
                      RD$ {calculatedResults.totalInteresPagado.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Monto solicitado (Principal):</span>
                    <span className="font-semibold font-mono text-white">RD$ {calculatedResults.montoPrincipal.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Tasa de interés anual fija:</span>
                    <span className="font-semibold font-mono text-white">{calculatedResults.tasaAnual}%</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Plazo de pago convenido:</span>
                    <span className="font-semibold text-white">{calculatedResults.plazoMeses} meses</span>
                  </div>
                  
                  {calc.id === 'prestamo-hipotecario' && (
                    <div className="p-3 bg-teal-900/40 border border-teal-500/20 rounded-lg text-xs space-y-1.5 mt-2 leading-relaxed">
                      <span className="font-bold text-teal-200 block mb-1">Desglose de Seguros Incluidos (Mercado RD)</span>
                      <div className="flex justify-between text-teal-100"><span>Seguro de Vida mensual (0.04%):</span><span className="font-mono text-white">RD$ {calculatedResults.segurosMensual.vida}</span></div>
                      <div className="flex justify-between text-teal-100"><span>Seguro de Propiedad mensual (0.06%):</span><span className="font-mono text-white">RD$ {calculatedResults.segurosMensual.propiedad}</span></div>
                    </div>
                  )}

                  <div className="flex justify-between pt-1.5 font-bold text-white">
                    <span>Monto total devuelto al finalizar:</span>
                    <span className="font-mono text-teal-200">RD$ {calculatedResults.totalPagadoFinal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Toggle Amortization Table */}
                <button 
                  onClick={() => setShowAmortizationTable(!showAmortizationTable)}
                  className="mt-6 w-full py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold rounded-lg text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <FileText size={13} className="text-white" />
                  {showAmortizationTable ? 'Ocultar tabla de amortización' : 'Visualizar tabla de amortización detallada'}
                </button>
              </div>
            )}

            {/* 18. Comparación de cuotas express results */}
            {calc.id === 'cuota-prestamo' && calculatedResults && (
              <div>
                <span className="text-xs font-semibold text-teal-200 uppercase block mb-4">Comparación de Rango de Interés</span>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-4 mb-4">
                  <div className="p-3 bg-teal-900/40 border border-teal-500/10 rounded-lg">
                    <span className="text-[10px] text-teal-100 block uppercase font-medium">Cuota con {loanInterest}% interés</span>
                    <span className="text-lg font-bold font-mono text-white">RD$ {calculatedResults.plan1.cuotaTotalMensual.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                  </div>
                  <div className="p-3 bg-teal-900/40 border border-teal-500/10 rounded-lg">
                    <span className="text-[10px] text-teal-100 block uppercase font-medium">Cuota con {loanInterestCompare}% interés</span>
                    <span className="text-lg font-bold font-mono text-white">RD$ {calculatedResults.plan2.cuotaTotalMensual.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2 text-rose-200">
                    <span>Ajuste mensual en la mensualidad:</span>
                    <span className="font-bold text-rose-300 font-mono">RD$ {calculatedResults.diferenciaCuota.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2 text-rose-200">
                    <span>Ahorro total final de intereses:</span>
                    <span className="font-bold text-rose-300 font-mono">RD$ {calculatedResults.diferenciaInteres.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 20. Margen de negocios results */}
            {calc.id === 'precio-venta' && calculatedResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 border-b border-teal-600/40 pb-5 mb-5">
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Precio de Venta Sugerido</p>
                    <p className="text-3xl font-extrabold font-mono text-white mt-1">
                      RD$ {calculatedResults.precioSugerido.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-semibold uppercase">Ganancia Bruta por Unidad</p>
                    <p className="text-3xl font-bold font-mono text-teal-200 mt-1">
                      RD$ {calculatedResults.gananciaBruta.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Costo unitario original del artículo:</span>
                    <span className="font-semibold text-white font-mono">RD$ {calculatedResults.costo.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between border-b border-teal-600/30 pb-2">
                    <span className="text-teal-100">Ganancia real limpia estimada:</span>
                    <span className="font-semibold text-white font-mono">RD$ {calculatedResults.gananciaBruta.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-sm text-teal-200">
                    <span>Markup sobre el costo:</span>
                    <span className="font-mono">{calculatedResults.markupPorcentaje}% (Aumento técnico de coste)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consejo de Experto tributario/laboral para aumentar la confianza y cumplir el reglamento de 4 anuncios */}
          <div className="my-4 p-4 bg-teal-50/40 border border-teal-100 rounded-xl flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <h5 className="text-xs font-bold text-teal-950 uppercase tracking-wider">Aviso de Validación NegocioRD 2026</h5>
              <p className="text-[11px] text-teal-800 leading-normal mt-0.5">
                Estimación basada en tasas oficiales y topes vigentes documentados de la DGII Dominicana y la TSS (salario base RD$ 23,223.00). Por favor, consulta las fuentes oficiales antes de tomar decisiones legales, fiscales o laborales definitivas. Puedes exportar estos resultados en CSV o imprimir en PDF usando los botones dedicados superiores.
              </p>
            </div>
          </div>

          {/* Explanation step-by-step ("Explicación Humana") */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase text-[#111827] tracking-wider mb-3 flex items-center gap-1.5">
              <Info size={16} className="text-[#0F766E]" />
              Explicación técnica paso a paso
            </h3>
            
            {/* Conditional explanations */}
            <div className="text-sm text-gray-600 space-y-2 leading-relaxed font-sans">
              {/* ITBIS explanation */}
              {calculatedResults && ('explanation' in calculatedResults) && (
                <p>{(calculatedResults as any).explanation}</p>
              )}

              {/* ISR steps list */}
              {calc.id === 'isr-asalariado' && calculatedResults && ('calculationSteps' in calculatedResults) && (
                <ul className="space-y-1.5 list-disc pl-4 text-xs font-mono">
                  {(calculatedResults as any).calculationSteps.map((step: string, sIdx: number) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ul>
              )}

              {/* Salario Neto steps list */}
              {calc.id === 'salario-neto' && (
                <p>
                  Para calcular su sueldo neto, restamos del sueldo bruto (RD$ {netSalaryInput.toLocaleString()}) su aporte de 2.87% para pensión de retiro (AFP) y el 3.04% para seguro de salud obligatorio (SFS). El salario imponible resultante está protegido de impuestos hasta los RD$ 34,685.00 mensuales; a partir de allí, se aplica la escala impositiva de ISR anual (15%, 20% o 25%) regulada por la DGII.
                </p>
              )}

              {/* Prestaciones / Liquidación steps list */}
              {(calc.id === 'prestaciones-laborales' || calc.id === 'liquidacion-laboral' || calc.id === 'preaviso-calc' || calc.id === 'cesantia-calc') && calculatedResults && ('desgloseExplicativo' in calculatedResults) && (
                <ul className="space-y-2 text-xs font-sans list-none border-l-2 border-teal-50 pl-3">
                  {(calculatedResults as any).desgloseExplicativo.map((step: string, sIdx: number) => (
                    <li key={sIdx} className="relative before:absolute before:left-[-17px] before:top-[6px] before:w-1.5 before:h-1.5 before:bg-teal-600 before:rounded-full">
                      {step}
                    </li>
                  ))}
                </ul>
              )}

              {/* Préstamo steps list */}
              {(calc.id === 'prestamo-personal' || calc.id === 'prestamo-hipotecario') && (
                <p>
                  Este plan de pago se calcula bajo el modelo de amortización francés. Mantiene una cuota fija uniforme a lo largo del tiempo, donde cada abono mensual cubre primero los intereses calculados sobre el saldo que aún debe, y el remanente amortiza directamente la deuda principal.
                </p>
              )}

              {/* Default fallback */}
              {(!('explanation' in (calculatedResults || {})) && !('calculationSteps' in (calculatedResults || {})) && !('desgloseExplicativo' in (calculatedResults || {}))) && (
                <p>
                  Cálculo realizado de conformidad con los coeficientes exactos declarados periódicamente por las entidades oficiales supervisoras dominicanas (DGII, TSS y Ministerio de Trabajo).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Table collapse container */}
      {showAmortizationTable && (calculatedResults && 'tablaAmortizacion' in calculatedResults) && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm mb-12 overflow-hidden">
          <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <FileText size={18} className="text-[#0F766E]" />
            Cuadro de Amortización Mensual (Método Francés)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 font-sans border-collapse">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center">Mes</th>
                  <th className="px-4 py-3 text-right">Cuota Total</th>
                  <th className="px-4 py-3 text-right">Principal</th>
                  <th className="px-4 py-3 text-right">Intereses</th>
                  {calc.id === 'prestamo-hipotecario' && (
                    <>
                      <th className="px-4 py-3 text-right">Seg. Vida</th>
                      <th className="px-4 py-3 text-right">Seg. Propiedad</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right">Balance Restante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {(calculatedResults.tablaAmortizacion as any[]).map((row) => (
                  <tr key={row.period} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-2.5 text-center font-bold text-gray-700">{row.period}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">RD$ {row.cuotaTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-800">RD$ {row.principalMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right text-rose-700">RD$ {row.interesMonto.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    {calc.id === 'prestamo-hipotecario' && (
                      <>
                        <td className="px-4 py-2.5 text-right text-blue-700">RD$ {row.seguroVida.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2.5 text-right text-blue-700">RD$ {row.seguroPropiedad.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </>
                    )}
                    <td className="px-4 py-2.5 text-right text-gray-900 font-bold">RD$ {row.balancePendiente.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEO & Educational Context Section (800 - 1500 words Equivalent Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Main educational info */}
        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-[#111827] border-b border-gray-100 pb-3">
            Información Educativa y Marco Normativo
          </h2>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-sans">
            <h3 className="text-base font-bold text-gray-900">¿Qué es y cómo funciona el cálculo de {calc.name}?</h3>
            <p>
              En la República Dominicana, los procesos {calc.category === 'impuestos' ? 'fiscales de la DGII' : calc.category === 'laboral' ? 'normados por el Ministerio de Trabajo y la TSS' : 'bancarios regulados por la Superintendencia de Bancos'} están estrictamente codificados por leyes nacionales. Comprender su funcionamiento garantiza a los empleados recibir su compensación justa y a los empresarios cumplir con sus obligaciones tributarias de manera transparente.
            </p>

            <h3 className="text-base font-bold text-gray-900">¿Cómo se calcula paso a paso?</h3>
            <p>
              El cálculo técnico combina tanto factores lineales como cotas impositivas. Para dar fe de ello, nuestro simulador aplica las fórmulas oficiales que son utilizadas por las tesorerías de las principales corporaciones y los sistemas contables bancarios del país. Por ejemplo, al calcular el ingreso neto, primero se resguardan las pensiones individuales (AFP) antes de deducir el ISR, evitando así la doble tributación de salarios bajo el régimen fiscal dominicano.
            </p>

            <h3 className="text-base font-bold text-gray-900">Errores comunes a evitar</h3>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Ignorar topes de cotización:</strong> Muchos contribuyentes omiten que la Tesorería de la Seguridad Social (TSS) tiene límites máximos cotizables para salud y pensiones, por lo que a salarios elevados no se les debe deducir porcentajes planos ilimitados.</li>
              <li><strong>No actualizar las escalas móviles:</strong> Si bien las escalas del ISR para asalariados de la DGII permanecieron congeladas desde 2017 por disposición legal, es indispensable aplicarlas con exactitud sobre los ingresos anuales acumulados totales.</li>
              <li><strong>Tratamiento erróneo de comisiones:</strong> En el marco laboral dominicano, las comisiones y horas ordinarias fijas forman parte integrada del salario computable para fines de prestaciones del desahucio.</li>
            </ul>

            <h3 className="text-base font-bold text-gray-900">Preguntas Frecuentes ({calc.name})</h3>
            <div className="space-y-4 mt-3">
              {miniFAQs.map((faq, fIdx) => (
                <div key={fIdx} className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  <span className="font-bold text-sm text-[#111827] block mb-1">
                    ¿{faq.question}
                  </span>
                  <p className="text-xs text-[#6B7280]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar widgets for relates / AdSense */}
        <div className="lg:col-span-4 space-y-6">
          {/* Related Tools */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-[#0F766E]" />
              Herramientas sugeridas
            </h3>
            <div className="space-y-2.5">
              {relatedTools.map((rel, rIdx) => (
                <button 
                  key={rIdx}
                  onClick={() => onNavigateToCalc(rel.slug)}
                  className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-[#0F766E] hover:bg-[#FAFAFA] font-medium text-xs text-[#111827] flex items-center justify-between transition-all cursor-pointer group"
                >
                  {rel.name}
                  <span className="text-[#0F766E] opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Monetización: AdSense safe box placeholder */}
          <div className="p-4 bg-gray-50/70 border border-dashed border-[#bdc9c6] rounded-xl text-center flex flex-col justify-center items-center py-8">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Anuncio Patrocinado</span>
            <div className="h-60 w-full max-w-[300px] bg-white border border-gray-100 flex flex-col justify-center items-center rounded-lg shadow-inner">
              <DollarSign size={24} className="text-gray-300 mb-1" />
              <span className="text-xs text-gray-400 font-medium">Espacio Segurizado AdSense</span>
              <span className="text-[10px] text-gray-300 mt-1">Bloque Adaptable (300 x 250)</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-2 block leading-normal">Los anuncios se adaptan de forma sutil sin interrumpir su navegación o alterar los resultados del cálculo.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
