export type CalculatorCategory = 'impuestos' | 'laboral' | 'finanzas' | 'negocios';

export const FREE_CALCULATORS_IDS = [
  'itbis-calc',
  'itbis-incluido',
  'itbis-excluido',
  'isr-asalariado',
  'salario-neto',
  'cuota-prestamo',
  'precio-venta'
];

export function checkIsProCalculator(id: string): boolean {
  return !FREE_CALCULATORS_IDS.includes(id);
}

export interface CalculatorInfo {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  category: CalculatorCategory;
  tags: string[];
  urlSlug: string;
  seoTitle: string;
  seoMetaDescription: string;
  hasFaq: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SEOContent {
  queEsText: string;
  comoFuncionaText: string;
  ejemploPracticoText: string;
  erroresComunesText: string;
  faqs: FaqItem[];
  relatedCalculatorsSlugs: string[];
}

export interface GuidePage {
  slug: string;
  title: string;
  seoTitle: string;
  seoMetaDescription: string;
  shortIntro: string;
  publishDate: string;
  readTime: string;
  imageAlt: string;
  relatedCalculatorSlug?: string;
  contentMarkdown: string; // Full high-quality article (800-1500 words)
}

// ITBIS Calculation outputs
export interface ItbisResult {
  baseAmount: number;
  itbisRate: number;
  itbisAmount: number;
  totalWithItbis: number;
  isIncluded: boolean;
  explanation: string;
}

// ISR Calculation outputs
export interface IsrResult {
  monthlyGross: number;
  annualGross: number;
  monthlyTssDeduction: {
    afp: number;
    sfs: number;
    total: number;
  };
  monthlyImponibleIsr: number;
  annualImponibleIsr: number;
  annualIsrAmount: number;
  monthlyIsrAmount: number;
  effectiveIsrRate: number;
  calculationSteps: string[];
}

// Salario Neto Calculation outputs
export interface SalarioNetoResult {
  salarioBruto: number;
  afpMonto: number;
  sfsMonto: number;
  isrMonto: number;
  totalDescuentos: number;
  salarioNeto: number;
  porcentajeNeto: number;
  patronalEstimado: {
    afp: number;
    sfs: number;
    srl: number;
    infotep: number;
    total: number;
  };
}

// TSS detailed output
export interface TssResult {
  salarioBase: number;
  empleado: {
    afp: number;
    sfs: number;
    total: number;
  };
  empleador: {
    afp: number;
    sfs: number;
    srl: number;
    infotep: number;
    total: number;
  };
  totalesSectores: number;
}

// Prestaciones Laborales output
export interface PrestacionesResult {
  salarioMensual: number;
  tipoCobro: 'mensual' | 'quincenal' | 'semanal';
  salarioDiario: number;
  fechaIngreso: string;
  fechaSalida: string;
  tiempoServicio: {
    anos: number;
    meses: number;
    dias: number;
    totalDiasTrabajados: number;
  };
  aplicaPreaviso: boolean;
  aplicaCesantia: boolean;
  aplicaVacaciones: boolean;
  aplicaRegalia: boolean;
  
  preavisoMonto: number;
  preavisoDias: number;
  
  cesantiaMonto: number;
  cesantiaDias: number;
  
  vacacionesMonto: number;
  vacacionesDias: number;
  
  regaliaMonto: number;
  regaliaMesesContemplados: number;
  
  liquidacionTotal: number;
  desgloseExplicativo: string[];
}

// Prestamos Amortization Outputs
export interface AmortizationRow {
  period: number;
  cuotaTotal: number;
  interesMonto: number;
  principalMonto: number;
  seguroVida: number;
  seguroPropiedad: number;
  balancePendiente: number;
}

export interface PrestamoResult {
  montoPrincipal: number;
  tasaAnual: number;
  plazoMeses: number;
  cuotaBase: number;
  segurosMensual: {
    vida: number;
    propiedad: number;
    total: number;
  };
  cuotaTotalMensual: number;
  totalInteresPagado: number;
  totalSeguroPagado: number;
  totalPagadoFinal: number;
  tablaAmortizacion: AmortizationRow[];
}

// Negocios Outputs
export interface MargenResult {
  costo: number;
  precioSugerido: number;
  margenDeseado: number;
  gananciaBruta: number;
  markupMonto: number;
  markupPorcentaje: number;
}
