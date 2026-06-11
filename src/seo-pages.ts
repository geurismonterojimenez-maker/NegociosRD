export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoLandingPage {
  slug: string;
  calculatorSlug: string;
  title: string;
  metaDescription: string;
  heading: string;
  intro: string;
  explanation: string;
  example: string;
  keywords: string[];
  relatedSlugs: string[];
  faqs: SeoFaq[];
}

const officialUpdate = "Revisado con fuentes oficiales disponibles al 10 de junio de 2026.";

export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    slug: "calculadora-liquidacion-laboral-rd",
    calculatorSlug: "calculadora-liquidacion",
    title: "Calculadora de Liquidacion Laboral RD 2026 | Tu Negocio RD",
    metaDescription: "Calcula tu liquidacion laboral en Republica Dominicana: preaviso, cesantia, vacaciones y salario de Navidad con formulas del Codigo de Trabajo.",
    heading: "Calculadora de liquidacion laboral en Republica Dominicana",
    intro: `Estima cuanto te corresponde al terminar una relacion laboral en RD. La herramienta separa prestaciones y derechos adquiridos segun el motivo de salida. ${officialUpdate}`,
    explanation: "El resultado depende del salario ordinario, las fechas de ingreso y salida y de si aplican preaviso y cesantia. Una renuncia normalmente conserva derechos adquiridos, pero no genera automaticamente preaviso ni cesantia.",
    example: "Ejemplo: para un salario mensual de RD$30,000, el salario diario ordinario de referencia se obtiene dividiendo entre 23.83 antes de aplicar los dias que correspondan por antiguedad.",
    keywords: ["calcular mi liquidacion", "liquidacion laboral rd", "calcular cesantia", "calcular preaviso"],
    relatedSlugs: ["calculadora-prestaciones-laborales", "calculadora-vacaciones", "calculadora-salario-neto"],
    faqs: [
      { question: "Que incluye una liquidacion laboral?", answer: "Puede incluir preaviso, cesantia y los derechos adquiridos pendientes, como vacaciones y salario de Navidad proporcional, segun la causa de terminacion." },
      { question: "Si renuncio me corresponde cesantia?", answer: "La renuncia ordinaria no genera auxilio de cesantia; se mantienen los derechos adquiridos que correspondan." },
      { question: "El resultado sustituye al Ministerio de Trabajo?", answer: "No. Es una estimacion informativa y debe validarse con documentos laborales y, cuando sea necesario, con el Ministerio de Trabajo." },
    ],
  },
  {
    slug: "calculadora-tss-rd",
    calculatorSlug: "calculadora-tss",
    title: "Calculadora TSS RD 2026: AFP, SFS y Empleador | Tu Negocio RD",
    metaDescription: "Calcula descuentos TSS en RD para empleado y empleador: AFP, SFS, SRL e INFOTEP con topes cotizables vigentes desde febrero de 2026.",
    heading: "Calculadora TSS de empleado y empleador en RD",
    intro: `Desglosa los aportes del Sistema Dominicano de Seguridad Social sobre un salario mensual. ${officialUpdate}`,
    explanation: "La calculadora aplica los porcentajes de AFP y SFS del trabajador, los aportes patronales y los topes de cotizacion publicados por la TSS. INFOTEP se muestra por separado como costo patronal cuando corresponde.",
    example: "Ejemplo: con RD$50,000 mensuales, el empleado aporta 2.87% a AFP y 3.04% a SFS porque el salario esta por debajo de ambos topes.",
    keywords: ["calculadora tss", "como calcular tss", "descuentos tss", "afp y sfs"],
    relatedSlugs: ["calculadora-salario-neto", "calculadora-isr", "calculadora-retenciones"],
    faqs: [
      { question: "Cuanto paga el empleado de TSS?", answer: "Como referencia general, 2.87% para pensiones AFP y 3.04% para SFS, respetando los topes cotizables aplicables." },
      { question: "Cuales son los topes TSS de 2026?", answer: "Desde el 1 de febrero de 2026: RD$464,460 para pensiones, RD$232,230 para SFS y RD$92,892 para riesgos laborales." },
      { question: "La empresa paga lo mismo que el empleado?", answer: "No. El empleador tiene porcentajes y conceptos adicionales, incluidos aportes patronales de AFP, SFS y riesgos laborales." },
    ],
  },
  {
    slug: "calculadora-retenciones-dgii",
    calculatorSlug: "calculadora-retenciones",
    title: "Calculadora de Retenciones DGII 2026: ISR e ITBIS",
    metaDescription: "Calcula retenciones de ISR e ITBIS aplicables a servicios en Republica Dominicana y revisa el importe neto a pagar o cobrar.",
    heading: "Calculadora de retenciones DGII",
    intro: `Estima retenciones de ISR e ITBIS para operaciones de servicios en Republica Dominicana. ${officialUpdate}`,
    explanation: "El porcentaje depende del tipo de servicio, de quien factura y de quien paga. Antes de declarar, confirma la clasificacion tributaria y la norma aplicable a la operacion.",
    example: "Ejemplo: ciertos honorarios profesionales pueden estar sujetos a retencion de ISR y, cuando corresponde, a retencion total o parcial del ITBIS facturado.",
    keywords: ["calculadora de retenciones dgii", "retenciones dgii", "retencion isr", "retencion itbis"],
    relatedSlugs: ["calculadora-itbis", "calculadora-isr", "calculadora-salario-neto"],
    faqs: [
      { question: "Todas las facturas llevan retencion?", answer: "No. La obligacion depende del tipo de ingreso, del servicio y de la condicion fiscal de las partes." },
      { question: "Se retiene sobre el total con ITBIS?", answer: "ISR e ITBIS tienen bases y reglas distintas; la calculadora presenta cada concepto por separado." },
      { question: "Donde se declaran las retenciones?", answer: "Se reportan en los formularios y formatos correspondientes de la DGII segun el impuesto y el periodo." },
    ],
  },
  {
    slug: "calculadora-itbis-rd",
    calculatorSlug: "calculadora-itbis",
    title: "Calculadora ITBIS RD 2026: 18% y 16% | Tu Negocio RD",
    metaDescription: "Calcula ITBIS incluido o excluido en Republica Dominicana con tasas de 18% y 16%. Obtiene base, impuesto y total de forma gratuita.",
    heading: "Calculadora de ITBIS en Republica Dominicana",
    intro: `Calcula el ITBIS a partir de una base o separalo de un precio que ya incluye el impuesto. ${officialUpdate}`,
    explanation: "Para agregar ITBIS se multiplica la base por la tasa. Para extraerlo de un total se divide el total entre 1 mas la tasa; restar simplemente 18% del total produce un resultado incorrecto.",
    example: "Ejemplo: RD$10,000 mas 18% genera RD$1,800 de ITBIS y un total de RD$11,800.",
    keywords: ["calculadora itbis", "como calcular itbis", "impuesto itbis rd", "itbis incluido"],
    relatedSlugs: ["itbis-incluido", "itbis-excluido", "calculadora-retenciones"],
    faqs: [
      { question: "Cual es la tasa general del ITBIS?", answer: "La tasa general es 18%; existe una tasa reducida de 16% para determinados bienes." },
      { question: "Cuando se declara el ITBIS?", answer: "La DGII indica que se declara y paga dentro de los primeros 20 dias del mes siguiente al periodo declarado." },
      { question: "Como saco el ITBIS incluido?", answer: "Divide el total entre 1.18 para tasa de 18% y resta la base resultante al total." },
    ],
  },
  {
    slug: "calculadora-isr-rd",
    calculatorSlug: "calculadora-isr",
    title: "Calculadora ISR RD 2026 para Asalariados | Tu Negocio RD",
    metaDescription: "Calcula la retencion mensual de ISR para asalariados en Republica Dominicana con la escala DGII 2026 y deducciones AFP y SFS.",
    heading: "Calculadora de ISR para asalariados en RD",
    intro: `Estima el Impuesto Sobre la Renta mensual despues de las deducciones de seguridad social. ${officialUpdate}`,
    explanation: "La renta neta anualizada se compara con la escala progresiva de la DGII. La calculadora aplica el tramo exento y luego las tasas de 15%, 20% o 25% sobre el excedente correspondiente.",
    example: "Ejemplo: primero se restan AFP y SFS del salario bruto; el resultado mensual se anualiza y se ubica en la escala de retencion 2026.",
    keywords: ["calculadora isr rd", "impuesto sobre la renta rd", "isr rd", "retencion asalariados"],
    relatedSlugs: ["calculadora-salario-neto", "calculadora-tss", "calculadora-retenciones"],
    faqs: [
      { question: "Cual es el monto anual exento en 2026?", answer: "La escala DGII 2026 mantiene exentas las rentas netas gravables de hasta RD$416,220 anuales." },
      { question: "Se calcula ISR antes o despues de TSS?", answer: "Para asalariados, la estimacion descuenta primero los aportes del trabajador a AFP y SFS." },
      { question: "Todos los empleados pagan ISR?", answer: "No. Solo cuando la renta neta gravable supera el umbral exento y de acuerdo con la escala progresiva." },
    ],
  },
  {
    slug: "calculadora-nomina-rd",
    calculatorSlug: "calculadora-salario-neto",
    title: "Calculadora de Nomina RD 2026: Sueldo Neto, TSS e ISR",
    metaDescription: "Calcula salario neto y descuentos de nomina en Republica Dominicana: AFP, SFS e ISR, con topes TSS y escala DGII 2026.",
    heading: "Calculadora de nomina y salario neto en RD",
    intro: `Convierte un salario bruto mensual en salario neto y consulta cada descuento obligatorio estimado. ${officialUpdate}`,
    explanation: "La nomina parte del salario bruto, aplica AFP y SFS con sus topes y calcula el ISR sobre la renta neta gravable anualizada.",
    example: "Ejemplo: para RD$50,000 mensuales se muestran por separado AFP, SFS, ISR, descuentos totales y sueldo neto.",
    keywords: ["calculadora de nomina rd", "salario neto rd", "descuentos de nomina", "calcular sueldo neto"],
    relatedSlugs: ["calculadora-tss", "calculadora-isr", "calculadora-prestaciones-laborales"],
    faqs: [
      { question: "Que se descuenta de la nomina?", answer: "Normalmente AFP, SFS y, cuando supera el umbral gravable, ISR." },
      { question: "El salario neto es igual al salario quincenal?", answer: "No necesariamente. El neto mensual puede distribuirse por quincena y variar por otros ingresos o descuentos autorizados." },
      { question: "La calculadora incluye aportes patronales?", answer: "La vista de resultados incluye una estimacion separada del costo patronal." },
    ],
  },
  {
    slug: "calculadora-prestaciones-laborales",
    calculatorSlug: "calculadora-prestaciones-laborales",
    title: "Calculadora de Prestaciones Laborales RD 2026",
    metaDescription: "Calcula prestaciones laborales en Republica Dominicana: preaviso, cesantia, vacaciones y regalia proporcional segun antiguedad.",
    heading: "Calculadora de prestaciones laborales en RD",
    intro: `Obtiene un desglose estimado de prestaciones y derechos adquiridos por terminacion del contrato. ${officialUpdate}`,
    explanation: "La causa de salida determina si proceden preaviso y cesantia. Vacaciones y salario de Navidad son derechos adquiridos sujetos al tiempo trabajado y a los pagos ya realizados.",
    example: "Ejemplo: una terminacion por desahucio del empleador puede incluir preaviso y cesantia, ademas de vacaciones y regalia pendientes.",
    keywords: ["prestaciones laborales rd", "calculadora prestaciones laborales", "liquidacion empleado dominicano"],
    relatedSlugs: ["calculadora-liquidacion", "calculadora-cesantia", "calculadora-preaviso"],
    faqs: [
      { question: "Prestaciones y derechos adquiridos son lo mismo?", answer: "No. Preaviso y cesantia son prestaciones; vacaciones, salario de Navidad y otros pagos pendientes son derechos adquiridos." },
      { question: "Que salario se usa?", answer: "Se usa el salario ordinario computable y el promedio que corresponda conforme al caso y la documentacion laboral." },
      { question: "Puedo usar el resultado en una reclamacion?", answer: "Sirve como orientacion. Para una reclamacion formal conviene obtener el calculo del Ministerio de Trabajo y asesoria profesional." },
    ],
  },
  {
    slug: "calculadora-vacaciones-rd",
    calculatorSlug: "calculadora-vacaciones",
    title: "Calculadora de Vacaciones RD 2026: Dias y Pago",
    metaDescription: "Calcula dias y pago de vacaciones laborales en Republica Dominicana segun salario y antiguedad, incluyendo vacaciones proporcionales.",
    heading: "Calculadora de vacaciones laborales en RD",
    intro: `Estima los dias remunerados y el valor economico de las vacaciones segun el tiempo de servicio. ${officialUpdate}`,
    explanation: "El Codigo de Trabajo reconoce 14 dias de salario ordinario despues de un ano y 18 dias despues de cinco anos, ademas de una escala proporcional en ciertos casos.",
    example: "Ejemplo: con salario de RD$30,000, el salario diario de referencia es aproximadamente RD$1,258.92 antes de multiplicarlo por los dias aplicables.",
    keywords: ["calculadora vacaciones rd", "pago vacaciones rd", "vacaciones proporcionales"],
    relatedSlugs: ["calculadora-prestaciones-laborales", "calculadora-liquidacion", "calculadora-regalia-pascual"],
    faqs: [
      { question: "Cuantos dias de vacaciones corresponden?", answer: "Como regla general, 14 dias de salario ordinario de uno a cinco anos y 18 dias despues de cinco anos." },
      { question: "Se pueden pagar sin tomar vacaciones?", answer: "Las vacaciones son un descanso obligatorio; la compensacion economica aplica en los supuestos previstos al terminar la relacion laboral." },
      { question: "Como se calcula el salario diario?", answer: "Para jornada ordinaria mensual se usa habitualmente el promedio mensual dividido entre 23.83." },
    ],
  },
  {
    slug: "calculadora-regalia-pascual",
    calculatorSlug: "calculadora-regalia-pascual",
    title: "Calculadora de Regalia Pascual RD 2026 | Doble Sueldo",
    metaDescription: "Calcula la regalia pascual o salario de Navidad en Republica Dominicana con la formula de salarios ordinarios devengados entre doce.",
    heading: "Calculadora de regalia pascual o doble sueldo",
    intro: `Calcula el salario de Navidad completo o proporcional con los salarios ordinarios devengados durante el ano. ${officialUpdate}`,
    explanation: "La regalia equivale a la duodecima parte de los salarios ordinarios percibidos en el ano calendario y debe pagarse dentro del plazo legal.",
    example: "Ejemplo: RD$30,000 mensuales durante 12 meses producen una regalia de RD$30,000; durante seis meses, RD$15,000.",
    keywords: ["calculadora regalia pascual", "doble sueldo rd", "salario de navidad"],
    relatedSlugs: ["calculadora-prestaciones-laborales", "calculadora-vacaciones", "calculadora-salario-neto"],
    faqs: [
      { question: "Cuando se paga la regalia pascual?", answer: "El salario de Navidad debe pagarse a mas tardar el 20 de diciembre." },
      { question: "La regalia paga TSS o ISR?", answer: "El salario de Navidad tiene el tratamiento especial previsto por el Codigo de Trabajo y no se calcula como una nomina mensual ordinaria." },
      { question: "Que ingresos se incluyen?", answer: "Se consideran salarios ordinarios devengados; pagos extraordinarios requieren revisar su naturaleza." },
    ],
  },
];

export const SEO_LANDING_BY_SLUG = new Map(SEO_LANDING_PAGES.map((page) => [page.slug, page]));

export const SALARY_PAGE_MIN = 20000;
export const SALARY_PAGE_MAX = 500000;
export const SALARY_PAGE_STEP = 5000;

export function getSalaryPageAmounts(): number[] {
  const amounts: number[] = [];
  for (let amount = SALARY_PAGE_MIN; amount <= SALARY_PAGE_MAX; amount += SALARY_PAGE_STEP) {
    amounts.push(amount);
  }
  return amounts;
}

export function salaryPageSlug(amount: number): string {
  return `si-gano-${amount}-cuanto-me-descuentan`;
}

export function parseSalaryPageAmount(pathname: string): number | null {
  const match = pathname.match(/^\/si-gano-(\d+)-cuanto-me-descuentan$/);
  if (!match) return null;
  const amount = Number(match[1]);
  if (
    !Number.isInteger(amount) ||
    amount < SALARY_PAGE_MIN ||
    amount > SALARY_PAGE_MAX ||
    amount % SALARY_PAGE_STEP !== 0
  ) {
    return null;
  }
  return amount;
}

export const CANONICAL_CALCULATOR_PATHS: Record<string, string> = Object.fromEntries(
  SEO_LANDING_PAGES.map((page) => [page.calculatorSlug, `/${page.slug}`])
);

export function getCanonicalCalculatorPath(slug: string): string {
  return CANONICAL_CALCULATOR_PATHS[slug] || `/herramientas/${slug}`;
}

export type ProgrammaticSeoKind = "itbis" | "regalia";

export interface ProgrammaticSeoPageData {
  kind: ProgrammaticSeoKind;
  amount: number;
  slug: string;
  title: string;
  description: string;
}

const ITBIS_EXAMPLE_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];
const REGALIA_EXAMPLE_SALARIES = [20000, 25000, 30000, 50000, 75000, 100000];

export const PROGRAMMATIC_SEO_PAGES: ProgrammaticSeoPageData[] = [
  ...ITBIS_EXAMPLE_AMOUNTS.map((amount) => ({
    kind: "itbis" as const,
    amount,
    slug: `cuanto-es-el-itbis-de-${amount}`,
    title: `Cuanto es el ITBIS de RD$${amount.toLocaleString("es-DO")}?`,
    description: `Calcula el ITBIS de 18% para una base de RD$${amount.toLocaleString("es-DO")}, con impuesto y total facturado.`
  })),
  ...REGALIA_EXAMPLE_SALARIES.map((amount) => ({
    kind: "regalia" as const,
    amount,
    slug: `regalia-pascual-si-gano-${amount}`,
    title: `Regalia pascual si gano RD$${amount.toLocaleString("es-DO")}`,
    description: `Calcula el salario de Navidad completo y proporcional para un sueldo mensual de RD$${amount.toLocaleString("es-DO")}.`
  }))
];

export const PROGRAMMATIC_SEO_BY_SLUG = new Map(PROGRAMMATIC_SEO_PAGES.map((page) => [page.slug, page]));

export function parseProgrammaticSeoPage(pathname: string): ProgrammaticSeoPageData | null {
  return PROGRAMMATIC_SEO_BY_SLUG.get(pathname.replace(/^\//, "")) || null;
}

export interface TopicHub {
  slug: string;
  title: string;
  description: string;
  intro: string;
  calculatorSlugs: string[];
  guideSlugs: string[];
}

export const TOPIC_HUBS: TopicHub[] = [
  {
    slug: "nomina-tss",
    title: "Nomina, TSS y salario neto en RD",
    description: "Guia central para calcular salario neto, AFP, SFS, ISR y costo patronal en Republica Dominicana.",
    intro: "Reune las herramientas necesarias para pasar de salario bruto a neto, revisar topes cotizables y separar aportes del empleado y del empleador.",
    calculatorSlugs: ["calculadora-salario-neto", "calculadora-tss", "calculadora-isr"],
    guideSlugs: ["como-calcular-salario-neto"]
  },
  {
    slug: "liquidacion-laboral",
    title: "Liquidacion y prestaciones laborales en RD",
    description: "Calculadoras y guias sobre liquidacion, preaviso, cesantia, vacaciones y regalia pascual.",
    intro: "Ayuda a distinguir prestaciones laborales de derechos adquiridos y a revisar como cambia el resultado segun la causa de terminacion.",
    calculatorSlugs: ["calculadora-liquidacion", "calculadora-prestaciones-laborales", "calculadora-vacaciones", "calculadora-regalia-pascual"],
    guideSlugs: ["como-calcular-prestaciones", "como-calcular-vacaciones", "como-calcular-regalia"]
  },
  {
    slug: "isr-asalariados",
    title: "ISR para asalariados en Republica Dominicana",
    description: "Escala, renta neta gravable y calculadoras de ISR y salario neto para empleados.",
    intro: "Explica el orden correcto: aportes TSS del trabajador, anualizacion de la renta neta y aplicacion progresiva de la escala DGII.",
    calculatorSlugs: ["calculadora-isr", "calculadora-salario-neto", "calculadora-tss"],
    guideSlugs: ["como-calcular-salario-neto"]
  },
  {
    slug: "itbis-retenciones",
    title: "ITBIS y retenciones DGII",
    description: "Herramientas para agregar o extraer ITBIS y estimar retenciones de ISR e ITBIS.",
    intro: "Centraliza calculadoras para facturacion, retenciones y revision de bases imponibles sin mezclar impuestos con reglas distintas.",
    calculatorSlugs: ["calculadora-itbis", "calculadora-retenciones", "itbis-incluido", "itbis-excluido"],
    guideSlugs: ["como-calcular-itbis"]
  },
  {
    slug: "formalizacion-negocios",
    title: "Formalizacion y finanzas para negocios en RD",
    description: "Recursos para precios, margenes, prestamos, impuestos y cumplimiento de pequeñas empresas dominicanas.",
    intro: "Conecta decisiones de precio y financiamiento con obligaciones fiscales basicas para evaluar escenarios antes de comprometer efectivo.",
    calculatorSlugs: ["calculadora-precio-venta-margen", "calculadora-cuota-prestamo", "calculadora-itbis"],
    guideSlugs: ["como-calcular-itbis"]
  }
];

export const TOPIC_HUB_BY_SLUG = new Map(TOPIC_HUBS.map((hub) => [hub.slug, hub]));
