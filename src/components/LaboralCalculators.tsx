import React, { useState, useEffect } from 'react';
import { CalculatorInfo } from '../types';
import { 
  FileText, Copy, Printer, Check, Star, Download, RefreshCw, Bookmark, Trash2, 
  Sparkles, DollarSign, Clock, HelpCircle, Briefcase, Calendar, ShieldAlert 
} from 'lucide-react';
import { 
  calculateRegaliaPascualDetail, 
  calculateHorasExtras, 
  calculateTrabajoNocturno, 
  calculateSalarioPorHora, 
  calculateSalarioQuincenal, 
  calculateBonificaciones, 
  calculateVacacionesPendientes, 
  calculateRegaliaProporcional, 
  calculateCostoEmpleado 
} from '../lib/calculations/all_new_calculations';
import { logUsage } from '../lib/firebase';

interface LaboralCalculatorsProps {
  calc: CalculatorInfo;
  onBack: () => void;
}

interface ActionFeedback {
  type: 'copy' | 'save' | 'delete' | 'export';
  msg: string;
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

export default function LaboralCalculators({ calc, onBack }: LaboralCalculatorsProps) {
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [printSize, setPrintSize] = useState<'letter' | 'legal'>('letter');

  // Show dynamic toast feedback
  const triggerFeedback = (type: 'copy' | 'save' | 'delete' | 'export', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  // State Management for Inputs
  const [salaryInput, setSalaryInput] = useState<number>(35000);
  const [monthsWorked, setMonthsWorked] = useState<number>(12);
  const [hoursOver35, setHoursOver35] = useState<number>(10); // 44 to 68 weekly
  const [hoursOver68, setHoursOver68] = useState<number>(5);  // > 68 weekly
  const [hoursHoliday, setHoursHoliday] = useState<number>(4);  // Holidays
  const [nightHours, setNightHours] = useState<number>(15);
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [yearsOfService, setYearsOfService] = useState<number>(2);
  const [overdueDays, setOverdueDays] = useState<number>(0);
  const [totalYearlyEarnings, setTotalYearlyEarnings] = useState<number>(420000);
  const [arlRate, setArlRate] = useState<number>(1.2);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`history-${calc.id}`);
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, [calc.id]);

  // Save computation to local history
  const handleSaveToHistory = (resultValue: number, detailText: string) => {
    const item = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-DO', { hour: '2-digit', minute: '2-digit' }),
      result: resultValue,
      detail: detailText,
      inputs: {
        salaryInput, monthsWorked, hoursOver35, hoursOver68, hoursHoliday,
        nightHours, dailyHours, yearsOfService, overdueDays, totalYearlyEarnings, arlRate
      }
    };
    const updated = [item, ...history.slice(0, 9)];
    setHistory(updated);
    localStorage.setItem(`history-${calc.id}`, JSON.stringify(updated));
    triggerFeedback('save', 'Cálculo guardado en tu historial local.');
    logUsage(calc.id, `Guardó cálculo en historial local. Salario base: RD$ ${salaryInput.toLocaleString()}`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`history-${calc.id}`);
    triggerFeedback('delete', 'Historial borrado con éxito.');
  };

  // Perform calculations based on Calculator ID
  const compute = () => {
    switch (calc.id) {
      case 'decimo-tercer-salario':
        return calculateRegaliaPascualDetail(salaryInput, monthsWorked);
      case 'horas-extras':
        return calculateHorasExtras(salaryInput, hoursOver35, hoursOver68, hoursHoliday);
      case 'trabajo-nocturno':
        return calculateTrabajoNocturno(salaryInput, nightHours);
      case 'salario-por-hora':
        return calculateSalarioPorHora(salaryInput, dailyHours);
      case 'salario-quincenal':
        return calculateSalarioQuincenal(salaryInput);
      case 'bonificaciones-ley':
        return calculateBonificaciones(salaryInput, yearsOfService);
      case 'indemnizacion-laboral': {
        // Simple fast proxy for compensation based on years
        const daily = salaryInput / 23.83;
        const compensationDays = yearsOfService >= 1 ? (yearsOfService * 21) : 0;
        const totalComp = Number((compensationDays * daily).toFixed(2));
        return {
          monthlySalary: salaryInput,
          yearsOfService,
          compensationDays,
          dailySalary: daily,
          bonusAmount: totalComp,
          formula: "Indemnización = Días de Cesantía Acumulados * Salario Ordinario Diario",
          legalSource: "Artículos 80 y 86 del Código Laboral Dominicano"
        };
      }
      case 'vacaciones-pendientes':
        return calculateVacacionesPendientes(salaryInput, monthsWorked, overdueDays);
      case 'regalia-proporcional':
        return calculateRegaliaProporcional(totalYearlyEarnings);
      case 'costo-empleado':
        return calculateCostoEmpleado(salaryInput, arlRate);
      default:
        return null;
    }
  };

  const result = compute();

  // Handling visual actions
  const handleCopyText = () => {
    let copyText = `--- NegocioRD: ${calc.name} Generado ---\n`;
    if (result) {
      if ('regaliaAmount' in result) {
        copyText += `Regalía Pascual Estimada: RD$ ${result.regaliaAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
      } else if ('totalOvertimeEarned' in result) {
        copyText += `Total Extra Devinido: RD$ ${result.totalOvertimeEarned.toLocaleString('en-US')}\nSalario Final: RD$ ${result.finalSalaryWithOT.toLocaleString('en-US')}\n`;
      } else if ('totalNightIncome' in result) {
        copyText += `Monto Recargo Nocturno: RD$ ${result.nightPremiumAmount.toLocaleString('en-US')}\n`;
      } else if ('hourlySalary' in result) {
        copyText += `Salario por hora obtenido: RD$ ${result.hourlySalary.toLocaleString('en-US')}\n`;
      } else if ('bonusAmount' in result) {
        copyText += `Incentivos de Bonificaciones: RD$ ${result.bonusAmount.toLocaleString('en-US')}\n`;
      } else if ('totalEmployerMonthlyCost' in result) {
        copyText += `Costo total mensual para empresa: RD$ ${result.totalEmployerMonthlyCost.toLocaleString('en-US')}\nIncremento de nómina: ${result.increasePercentage}%\n`;
      }
      copyText += `Fórmula: ${result.formula || ''}\n`;
      copyText += `Base Legal: ${result.legalSource || ''}\n`;
    }
    copyText += `Calcule sus impuestos de forma segura en: ${window.location.origin}`;
    navigator.clipboard.writeText(copyText);
    triggerFeedback('copy', 'Resultados copiados en el portapapeles.');
    logUsage(calc.id, `Copió los resultados al portapapeles. Salario base: RD$ ${salaryInput.toLocaleString()}`);
  };

  const handlePrint = () => {
    window.print();
    logUsage(calc.id, `Imprimió reporte de cálculo laboral. Salario base: RD$ ${salaryInput.toLocaleString()}`);
  };

  const handleExportCSV = () => {
    if (!result) return;
    let csvContent = "Concepto,Valor\n";
    csvContent += `"Herramienta","${calc.name.replace(/"/g, '""')}"\n`;
    csvContent += `"Fecha de emision","${new Date().toLocaleDateString('es-DO')}"\n`;
    Object.entries(result).forEach(([key, val]) => {
      if (typeof val === 'number' || typeof val === 'string') {
        csvContent += `"${key}","${val.toString().replace(/"/g, '""')}"\n`;
      }
    });
    downloadCsvFile(`Calculo_Laboral_${calc.id}_2026.csv`, csvContent);
    triggerFeedback('export', 'Archivo CSV descargado correctamente.');
    logUsage(calc.id, `Exportó resultados a CSV corporativo. Salario base: RD$ ${salaryInput.toLocaleString()}`);
  };

  // Specific informational templates per calculator
  const getToolMetadata = () => {
    switch (calc.id) {
      case 'decimo-tercer-salario':
        return {
          legalSource: "Artículo 219 al 222 del Código de Trabajo de la República Dominicana.",
          formula: "Regalía Pascual = (Suma total de salarios ordinarios mensuales devengados durante el año) ÷ 12.",
          example: "Si usted laboró de enero a diciembre devengando un sueldo ordinario mensual fijo de RD$ 30,000.00, le corresponde un décimo tercer salario íntegro de RD$ 30,000.00. Si laboró solo 6 meses, le pertenece una regalía proporcional de: (RD$ 30,000 * 6) ÷ 12 = RD$ 15,000.00.",
          faq: [
            { q: "¿Está la regalía pascual sujeta a retenciones de TSS o ISR?", a: "No. El salario de Navidad está por completo libre de descuentos para el fondo de pensiones (AFP), el seguro familiar de salud (SFS) o el Impuesto sobre la Renta (ISR) de la DGII." },
            { q: "¿Cuál es la fecha límite de pago para los empleadores?", a: "Los empleadores tienen la obligación indelegable del Código de Trabajo de pagar el salario de Navidad a más tardar el día 20 del mes de diciembre." }
          ]
        };
      case 'horas-extras':
        return {
          legalSource: "Artículos 203 del Código de Trabajo de la República Dominicana.",
          formula: "Horas hasta 68 semanales = horas * tarifa por hora * 1.35. Horas por encima de 68 o feriados = horas * tarifa por hora * 2.00.",
          example: "Un empleado con sueldo de RD$ 23,830.00 al mes posee una tarifa normal diaria de RD$ 1,000.00 y una tarifa por hora de RD$ 125.00. Si realiza 10 horas extras ordinarias en una semana, estas se calculan con recargo del 35%: 10 * RD$ 125 * 1.35 = RD$ 1,687.50 adicionales.",
          faq: [
            { q: "¿Cómo se calculan las horas en días feriados?", a: "Cualquier hora trabajada durante un día feriado o no laborable estipulado por el Código de Trabajo de RD se considerará con recargo del 100% (al doble del sueldo por hora regular)." },
            { q: "¿Hay un límite de horas extras semanales permitidas?", a: "La jornada ordinaria ordinaria de RD es de 44 horas semanales. Trabajar horas extras requiere ser una circunstancia imprevista o urgente y el exceso no debe alargarse excesivamente." }
          ]
        };
      case 'trabajo-nocturno':
        return {
          legalSource: "Artículo 204 del Código de Trabajo RD.",
          formula: "Monto Hora Nocturna = Tarifa Hora Diurna * 1.15. Recargo neto = Tarifa Hora Diurna * 15%.",
          example: "Si gana RD$ 150 por hora durante el día, cualquier jornada entre 9:00 PM y 7:00 AM se cobra obligatoriamente a RD$ 172.50 por hora (RD$ 22.50 de recargo autónomo nocturno).",
          faq: [
            { q: "¿Qué define la jornada de trabajo nocturno?", a: "Es aquella que comprende en su totalidad o parcialmente el intervalo de horario entre las 9:00 p.m. y las 7:00 a.m. del día siguiente." },
            { q: "¿Puede combinarse recargo nocturno con horas extras?", a: "Sí, si las horas extraordinarias son cursadas en horario de descanso nocturno, se acumularán de forma acumulativa ambos beneficios y recargos legales correspondientes." }
          ]
        };
      case 'salario-por-hora':
        return {
          legalSource: "Resoluciones del Comité Nacional de Salarios (República Dominicana).",
          formula: "Salario Diario = Salario Mensual / 23.83; Salario Hora = Salario Diario / Horas Laborales Diarias.",
          example: "Para un empleado asalariado con sueldo base mensual de RD$ 25,000.00 en una jornada estipulada de 8 horas: Salario diario = RD$ 25,000 / 23.83 = RD$ 1,049.09. Salario por hora = RD$ 1,049.09 / 8 = RD$ 131.14.",
          faq: [
            { q: "¿Por qué se utiliza el divisor de 23.83?", a: "23.83 es el divisor oficial fijado de forma legal por el Código Laboral de la República Dominicana para calcular el valor diario a partir del sueldo estipulado mensual de nómina ordinaria en el pago comercial." }
          ]
        };
      case 'salario-quincenal':
        return {
          legalSource: "Código Comercial Laboral de la RD.",
          formula: "Salario Quincenal = Salario Mensual / 2; Coeficiente de desglose diario quincenal = Sueldo Mensual / 23.83.",
          example: "Sueldo de RD$ 40,000.00 mensual equivale de forma matemática a RD$ 20,000.00 por quincena bruta, aplicando el cálculo de AFP y SFS sobre la base completa del mes calendario.",
          faq: [
            { q: "¿Cuándo se retienen los aportes de la TSS en nómina quincenal?", a: "Los descuentos de AFP (2.87%) y SFS (3.04%) legalmente se pueden retener al 100% en la segunda quincena del mes o prorrrateados al 50% en ambas quincenas según la configuración del sistema de nómina corporativa." }
          ]
        };
      case 'bonificaciones-ley':
        return {
          legalSource: "Artículos 223 al 227 del Código de Trabajo dominicano.",
          formula: "Menos de 3 años de antigüedad = 45 días de salario ordinario. Mayor o igual a 3 años = 60 días de sueldo diario ordinario.",
          example: "Un empleado con 4 años de servicio en la empresa y salario de RD$ 30,000 mensual (Salario diario = RD$ 1,258.91) le correspondería de bonificación hasta 60 días: 60 * RD$ 1,258.91 = RD$ 75,534.60 en la medida en que la empresa declare beneficios fiscales netos ante la DGII.",
          faq: [
            { q: "¿Las empresas que no generan beneficios pagan bonificación de ley?", a: "No. El pago de bonificaciones está sujeto estrictamente a la existencia de utilidades netas registradas en la declaración anual jurada (IR-2) de la empresa ante la DGII." },
            { q: "¿Cuál es el plazo máximo para la entrega de la bonificación corporativa?", a: "La empresa debe pagar la bonificación entre los 90 y los 120 días posteriores al cierre del año fiscal correspondiente de su ejercicio económico." }
          ]
        };
      case 'indemnizacion-laboral':
        return {
          legalSource: "Artículos 80, 86 y concordancia del Código de Trabajo en RD.",
          formula: "Total = Suma de Auxilio de Cesantía calculado, indemnizaciones de ser aplicables por despido.",
          example: "Para 2 años laborados con despido improcedente, se compensan 42 días de cesantía total devengando salario ordinario diario.",
          faq: [
            { q: "¿Qué diferencia la cesantía de la indemnización por despido injustificado?", a: "La cesantía es el auxilio legal ordinario que se paga por desvinculación sin causa. Si hay un pleito legal laboral y se califica como despido injustificado, se añaden indemnizaciones adicionales equivalentes al preaviso e intereses moratorios." }
          ]
        };
      case 'vacaciones-pendientes':
        return {
          legalSource: "Artículos 177 y 180 del Código Laboral.",
          formula: "Suma de vacaciones acumuladas pendientes del año anterior más escala proporcional del año actual multiplicada por la tasa diaria.",
          example: "Si laboró 8 meses y tiene 10 días acumulados pendientes del año anterior con un sueldo diario de RD$ 1,000: (9 días proporcionales de escala + 10 arrastrados) * RD$ 1,000 = RD$ 19,000.00.",
          faq: [
            { q: "¿Se pueden intercambiar las vacaciones por remuneración económica sin tomarlas?", a: "El Código de Trabajo prohíbe el pago de vacaciones en sustitución del descanso, excepto si el contrato finaliza antes de ser disfrutadas, en cuyo caso se liquidan de forma económica." }
          ]
        };
      case 'regalia-proporcional':
        return {
          legalSource: "Artículo 219 del Código de Trabajo dominicano.",
          formula: "Monto = Ganado acumulativo ordinario del año actual ÷ 12.",
          example: "Si sumó RD$ 120,000 devengados totales en 4 meses trabajados este año fiscal, su regalía pascual proporcional es de RD$ 10,000.00.",
          faq: [
            { q: "¿Se computan las comisiones comerciales para la regalía?", a: "Sí, todas las comisiones recurrentes y sueldos ordinarios percibidos por el empleado forman parte de la base sujeta al decimotercer sueldo de conformidad con la correspondencia de la Suprema Corte." }
          ]
        };
      case 'costo-empleado':
        return {
          legalSource: "Ley 87-01 de Seguridad Social y Código de Trabajo de República Dominicana.",
          formula: "Costo Empresa = Salario base + 7.10% (AFP Patr) + 7.09% (SFS Patr) + SRL (promedio 1.20%) + INFOTEP (1.00%) + Reserva acumulativa mensual de Regalía (8.33%), Vacaciones (aprox 4.8%) y Provisiones de Cesantía.",
          example: "Un empleado con salario bruto de RD$ 20,000.00 mensuales le cuesta en total a la empresa aproximadamente RD$ 26,000.00 al mes (un aproximado de 31% adicional) debido a los aportes obligatorios TSS, INFOTEP y las reservas mandatorias de prestaciones.",
          faq: [
            { q: "¿Las PYMES están obligadas a pagar el aporte de INFOTEP?", a: "Sí, todas las personas jurídicas o físicas empleadoras que posean personal en nómina fija de carácter industrial o de servicios están sujetas al aporte contributivo mensual patronal del 1.00% al INFOTEP." }
          ]
        };
      default:
        return { legalSource: "", formula: "", example: "", faq: [] };
    }
  };

  const meta = getToolMetadata();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs animate-in fade-in duration-200 print:shadow-none print:border-none">
      
      {/* Toast Feedback */}
      {feedback && (
        <div id="toast-feedback-panel" className="fixed bottom-5 right-5 z-50 bg-[#111827] text-white py-3 px-5 rounded-xl shadow-lg border border-gray-700 max-w-sm text-xs flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles size={14} className="text-teal-400 animate-pulse" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main Dynamic Interactive Grid split: Form vs Live Result Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs Block */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <span className="p-2 rounded-lg bg-teal-50 text-[#0F766E]">
              <Briefcase size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Parámetros de Simulación</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Regulados bajó leyes fiscales de RD</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Show Salary input block for almost all except proportional cumulative */}
            {calc.id !== 'regalia-proporcional' && (
              <div>
                <label htmlFor="lab-salary-input" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Salario Ordinario Mensual (RD$)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-405">
                    <span className="text-xs font-semibold">$</span>
                  </div>
                  <input
                    id="lab-salary-input"
                    type="number"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="block w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                    placeholder="Monto ordinario bruto..."
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Salario básico de nómina fija antes de deducciones.</p>
              </div>
            )}

            {/* Décimo tercer salario / Vacaciones Pendientes Months picker */}
            {(calc.id === 'decimo-tercer-salario' || calc.id === 'vacaciones-pendientes') && (
              <div>
                <label htmlFor="lab-months-worked" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Meses Trabajados en el Año
                </label>
                <input
                  id="lab-months-worked"
                  type="range"
                  min="1"
                  max="12"
                  value={monthsWorked}
                  onChange={(e) => setMonthsWorked(parseInt(e.target.value))}
                  className="w-full accent-[#0F766E] cursor-pointer"
                />
                <div className="flex justify-between text-xs font-semibold text-gray-500 mt-1">
                  <span>1 mes</span>
                  <span className="text-[#0F766E] font-bold">{monthsWorked} Meses</span>
                  <span>12 meses (Completo)</span>
                </div>
              </div>
            )}

            {/* Horas Extras numeric inputs */}
            {calc.id === 'horas-extras' && (
              <div className="space-y-3.5 pt-2">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">Desglose de horas extraordinarias</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="lab-hours-35" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Horas 44 a 68 (+35%)</label>
                    <input
                      id="lab-hours-35"
                      type="number"
                      value={hoursOver35}
                      onChange={(e) => setHoursOver35(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-center focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="lab-hours-68" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">H. Extras &gt;68 (+100%)</label>
                    <input
                      id="lab-hours-68"
                      type="number"
                      value={hoursOver68}
                      onChange={(e) => setHoursOver68(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-center focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="lab-hours-holiday" className="block text-[10px] font-bold text-gray-500 uppercase mb-1">H. Festivos (+100%)</label>
                    <input
                      id="lab-hours-holiday"
                      type="number"
                      value={hoursHoliday}
                      onChange={(e) => setHoursHoliday(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-center focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Trabajo nocturno numeric inputs */}
            {calc.id === 'trabajo-nocturno' && (
              <div>
                <label htmlFor="lab-night-hours" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Total Horas Nocturnas Trabajadas
                </label>
                <input
                  id="lab-night-hours"
                  type="number"
                  value={nightHours}
                  onChange={(e) => setNightHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                />
                <p className="text-[10px] text-gray-400 mt-1">Horas desempeñadas de 9:00 PM a 7:00 AM.</p>
              </div>
            )}

            {/* Salario por hora shift size */}
            {calc.id === 'salario-por-hora' && (
              <div>
                <label htmlFor="lab-daily-hours" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Horas de la Jornada Diaria
                </label>
                <select
                  id="lab-daily-hours"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value))}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                >
                  <option value={8}>8 Horas (Jornada Estándar Completa)</option>
                  <option value={6}>6 Horas (Media Jornada / Técnica)</option>
                  <option value={4}>4 Horas (Medio Tiempo / Contrato Especial)</option>
                </select>
              </div>
            )}

            {/* Bonificaciones / Indemnizaciones Years picker */}
            {(calc.id === 'bonificaciones-ley' || calc.id === 'indemnizacion-laboral') && (
              <div>
                <label htmlFor="lab-years-service" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Años Completos de Servicio Continuo
                </label>
                <input
                  id="lab-years-service"
                  type="number"
                  min="0"
                  max="45"
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                />
                <p className="text-[10px] text-gray-400 mt-1">Antigüedad real para cálculo de escala de días correspondientes.</p>
              </div>
            )}

            {/* Vacaciones Pendientes overdue days picker */}
            {calc.id === 'vacaciones-pendientes' && (
              <div>
                <label htmlFor="lab-overdue-days" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Días de Vacaciones Vencidas (Años Anteriores)
                </label>
                <input
                  id="lab-overdue-days"
                  type="number"
                  value={overdueDays}
                  onChange={(e) => setOverdueDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                />
                <p className="text-[10px] text-gray-400 mt-1">Días de descanso acumulados por mora patronal.</p>
              </div>
            )}

            {/* Regalía Proporcional accum input */}
            {calc.id === 'regalia-proporcional' && (
              <div>
                <label htmlFor="lab-total-yearly" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Suma de Todos los Salarios Ganados Este Año (RD$)
                </label>
                <input
                  id="lab-total-yearly"
                  type="number"
                  value={totalYearlyEarnings}
                  onChange={(e) => setTotalYearlyEarnings(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                />
                <p className="text-[10px] text-gray-400 mt-1">Suma consolidada de nóminas e incentivos devengados.</p>
              </div>
            )}

            {/* Costo Empleado arl rate selection */}
            {calc.id === 'costo-empleado' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Tasa de Riesgo ARL de la Empresa (%)
                </label>
                <select
                  value={arlRate}
                  onChange={(e) => setArlRate(parseFloat(e.target.value))}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                >
                  <option value={1.0}>1.00% (Clase I - Riesgo Mínimo, Oficinas)</option>
                  <option value={1.1}>1.10% (Clase II - Riesgo Bajo)</option>
                  <option value={1.2}>1.20% (Clase III - Promedio del Mercado Comercial)</option>
                  <option value={1.3}>1.30% (Clase IV - Riesgo Alto)</option>
                  <option value={1.4}>1.40% (Clase V - Riesgo Máximo, Construcción o Químico)</option>
                </select>
              </div>
            )}

          </div>

          {/* Core action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (result) {
                  let val = 0;
                  let txt = "";
                  if ('regaliaAmount' in result) {
                    val = result.regaliaAmount;
                    txt = `Regalía de ${result.monthsWorked} meses`;
                  } else if ('totalOvertimeEarned' in result) {
                    val = result.totalOvertimeEarned;
                    txt = `Horas extras para sueldo RD$ ${salaryInput}`;
                  } else if ('totalNightIncome' in result) {
                    val = result.nightPremiumAmount;
                    txt = `Recargo nocturno (${result.nightHours} horas)`;
                  } else if ('hourlySalary' in result) {
                    val = result.hourlySalary;
                    txt = `Salario por hora jornada ${result.dailyHours}h`;
                  } else if ('bonusAmount' in result) {
                    val = result.bonusAmount;
                    txt = `Bonificación (${result.yearsOfService} años)`;
                  } else if ('totalEmployerMonthlyCost' in result) {
                    val = result.totalEmployerMonthlyCost;
                    txt = `Costo total para empresa`;
                  }
                  handleSaveToHistory(val, txt);
                }
              }}
              className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-all font-sans cursor-pointer active:scale-95 flex items-center justify-center gap-1"
            >
              <Bookmark size={12} />
              Guardar en My Historico
            </button>
            <button
              onClick={handleCopyText}
              className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-all font-sans cursor-pointer active:scale-95 flex items-center justify-center gap-1"
            >
              <Copy size={12} />
              Copiar Datos
            </button>
          </div>
        </div>

        {/* Right Main Results Pane */}
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
          <div id="laboral-calculator-print-preview" className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block flex items-center gap-1.5 border-b pb-2 mb-2 border-gray-200">
              <Sparkles size={13} className="text-teal-600 animate-pulse" />
              Resultado Oficial Estimado
            </span>

            {/* Huge Output Value Highlight */}
            {result && (
              <div className="text-center md:text-left py-4">
                <span className="text-xs text-gray-500 block font-semibold">Monto Acumulado Final</span>
                <div className="text-3xl md:text-4xl font-extrabold text-[#0F766E] font-sans tracking-tight mt-1">
                  RD${' '}
                  {(() => {
                    if ('regaliaAmount' in result) return result.regaliaAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('totalOvertimeEarned' in result) return result.totalOvertimeEarned.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('totalNightIncome' in result) return result.totalNightIncome.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('hourlySalary' in result) return result.hourlySalary.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('quincenalSalary' in result) return result.quincenalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('bonusAmount' in result) return result.bonusAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('totalVacationPay' in result) return result.totalVacationPay.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('regaliaProporcional' in result) return result.regaliaProporcional.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    if ('totalEmployerMonthlyCost' in result) return result.totalEmployerMonthlyCost.toLocaleString('en-US', { minimumFractionDigits: 2 });
                    return "0.00";
                  })()}
                </div>
                
                {/* Secondary data taglines for complex results */}
                {calc.id === 'horas-extras' && result && 'finalSalaryWithOT' in result && (
                  <p className="text-xs font-semibold text-gray-600 mt-2">
                    Salario ordinario mensual + horas extras: <strong className="text-gray-900 font-bold">RD$ {result.finalSalaryWithOT.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  </p>
                )}

                {calc.id === 'costo-empleado' && result && 'increasePercentage' in result && (
                  <div className="mt-2.5 p-3 bg-teal-50 border border-teal-100 rounded-xl inline-block text-left">
                    <p className="text-xs font-bold text-[#0F766E]">
                      Este empleado representa un incrememento del {result.increasePercentage}% sobre su salario nominal para la empresa.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Result Detailed Breakdown Rows */}
            {result && (
              <div className="border border-gray-150 rounded-xl bg-white p-4.5 space-y-3 font-medium text-xs text-gray-650">
                <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block border-b pb-1.5 mb-2.5 border-dashed">
                  Desglose Descriptivo del Cálculo:
                </span>
                
                {/* Specific field maps based on tool */}
                {calc.id === 'decimo-tercer-salario' && 'totalEarned' in result && (
                  <>
                    <div className="flex justify-between"><span>Salario mensual base:</span><span className="font-mono text-gray-900 font-semibold">RD$ {result.monthlySalary.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Meses acumulados laborados:</span><span className="text-[#0F766E] font-bold">{result.monthsWorked} meses</span></div>
                    <div className="flex justify-between"><span>Ingresos consolidados del año:</span><span className="font-mono text-gray-900 font-semibold">RD$ {result.totalEarned.toLocaleString('en-US')}</span></div>
                  </>
                )}

                {calc.id === 'horas-extras' && 'amount44To68' in result && (
                  <>
                    <div className="flex justify-between"><span>Valor diario ordinario:</span><span className="font-mono">RD$ {result.dailySalary}</span></div>
                    <div className="flex justify-between"><span>Valor por hora estándar:</span><span className="font-mono">RD$ {result.hourlySalary}</span></div>
                    <div className="flex justify-between"><span>Monto por 44-68 Horas (+35%):</span><span className="font-mono text-gray-900">RD$ {result.amount44To68.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Monto por horas &gt;68 (+100%):</span><span className="font-mono text-gray-900">RD$ {result.amountAbove68.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Monto por horas domingos/feriados:</span><span className="font-mono text-gray-900">RD$ {result.amountHoliday.toLocaleString('en-US')}</span></div>
                  </>
                )}

                {calc.id === 'trabajo-nocturno' && 'nightPremiumAmount' in result && (
                  <>
                    <div className="flex justify-between"><span>Sueldo diario:</span><span className="font-mono">RD$ {(result.monthlySalary / 23.83).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Valor hora diurno:</span><span className="font-mono">RD$ {result.hourlySalary}</span></div>
                    <div className="flex justify-between"><span>Monto recargo nocturno (15%):</span><span className="font-mono text-teal-700 font-bold">RD$ {result.nightPremiumAmount}</span></div>
                    <div className="flex justify-between"><span>Ingresos brutos por horas de noche:</span><span className="font-mono text-gray-900">RD$ {result.totalNightIncome}</span></div>
                  </>
                )}

                {calc.id === 'costo-empleado' && 'totalTssCost' in result && (
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Aporte AFP Patronal (7.10%):</span><span className="font-mono font-semibold">RD$ {result.afpEmployerCost.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Aporte SFS Patronal (7.09%):</span><span className="font-mono font-semibold">RD$ {result.sfsEmployerCost.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Aporte SRL Patronal ({arlRate}%):</span><span className="font-mono font-semibold">RD$ {result.arlEmployerCost.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Contribución INFOTEP (1.00%):</span><span className="font-mono font-semibold">RD$ {result.infotepEmployerCost.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between font-semibold border-b pb-1.5 border-gray-100"><span>Subtotal TSS Patronal:</span><span className="font-mono text-gray-900">RD$ {result.totalTssCost.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Reserva Doble Sueldo mensual (8.33%):</span><span className="font-mono">RD$ {result.regaliaProvision.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Reserva Vacaciones mensual:</span><span className="font-mono">RD$ {result.vacacionesProvision.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Provisión prestaciones mensual estimada:</span><span className="font-mono">RD$ {(result.cesantiaProvision + result.preavisoProvision).toLocaleString('en-US')}</span></div>
                  </div>
                )}

                {calc.id === 'bonificaciones-ley' && 'daysEligible' in result && (
                  <>
                    <div className="flex justify-between"><span>Días de bonificación según ley:</span><span className="text-[#0F766E] font-bold">{result.daysEligible} Días</span></div>
                    <div className="flex justify-between"><span>Salario ordinario diario:</span><span className="font-mono">RD$ {result.dailySalary.toLocaleString('en-US')}</span></div>
                  </>
                )}

                {calc.id === 'vacaciones-pendientes' && 'vacationDays' in result && (
                  <>
                    <div className="flex justify-between"><span>Días proporcionales de descanso:</span><span className="font-bold text-gray-900">{result.vacationDays} días</span></div>
                    <div className="flex justify-between"><span>Pago proporcional calculado:</span><span className="font-mono">RD$ {result.proportionalVacationPay.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between"><span>Días vencidos adicionales:</span><span className="font-bold text-gray-900">{result.overdueDays} días</span></div>
                    <div className="flex justify-between"><span>Pago días vencidos:</span><span className="font-mono">RD$ {result.overdueVacationPay.toLocaleString('en-US')}</span></div>
                  </>
                )}

                {/* Formula details */}
                <div className="mt-4 pt-3.5 border-t border-gray-150/70 text-[11px] font-normal leading-relaxed text-gray-500">
                  <div className="flex items-start gap-1">
                    <FileText size={12} className="text-gray-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Fórmula Aplicada:</strong> {result.formula}
                    </p>
                  </div>
                </div>

                {/* Legal Source details */}
                <div className="pt-1.5 text-[11px] font-normal leading-relaxed text-gray-500">
                  <div className="flex items-start gap-1">
                    <ShieldAlert size={12} className="text-gray-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Amparo Legal:</strong> {result.legalSource}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-150/70 text-[10px] text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 print-avoid-break">
                  <span>Emitido por NegocioRD el {new Date().toLocaleDateString('es-DO')}</span>
                  <span>Referencia: NRD-LAB-{calc.id.toUpperCase()}</span>
                </div>

              </div>
            )}

            {/* Document exporters buttons with Paper Size option */}
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
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 text-xs text-[#111827] font-semibold transition-all cursor-pointer active:scale-95"
                aria-label="Imprimir Reporte en PDF"
              >
                <Printer size={13} />
                Imprimir Reporte (PDF)
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-250 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 text-xs text-[#111827] font-semibold transition-all cursor-pointer active:scale-95"
                aria-label="Exportar a formato CSV"
              >
                <Download size={13} />
                Exportar CSV compatible con Excel
              </button>
            </div>
          </div>

          {/* Interactive example and case studies */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 print:hidden">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Clock size={16} className="text-[#0F766E]" />
              Ejemplo Práctico de Aplicación
            </h4>
            <div className="text-xs text-gray-600 leading-relaxed space-y-2 bg-[#FAFAFA] p-4.5 rounded-xl border">
              <p>{meta.example}</p>
            </div>
          </div>

          {/* Local Session History Logs */}
          {history.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3.5 print:hidden">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <BookMarkItem size={13} className="text-teal-600" />
                  Tu Historial de Cálculos Recientes en este Navegador
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} />
                  Limpiar historial
                </button>
              </div>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-800 block">{h.detail}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{h.date}</span>
                    </div>
                    <span className="font-mono font-bold text-[#0F766E]">RD$ {h.result.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs list accordion inside the calculator */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 print:hidden">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <HelpCircle size={16} className="text-[#0F766E]" />
              Preguntas Frecuentes Relacionadas (DGII & TSS)
            </h4>
            <div className="space-y-4 divide-y divide-gray-100">
              {meta.faq.map((item, id) => (
                <div key={id} className={`${id > 0 ? "pt-4.5" : ""} space-y-1`}>
                  <strong className="block text-xs font-bold text-gray-900">¿{item.q}</strong>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Icon fallbacks inside code
function BookMarkItem({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
  );
}
