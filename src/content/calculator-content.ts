import { CalculatorInfo, FaqItem } from "../types";

export interface CalculatorEditorialContent {
  overview: string;
  steps: string;
  example: string;
  commonErrors: string[];
  faqs: FaqItem[];
  whatIs: string;
  howItWorks: string;
  practicalExample: string;
  officialSources: string;
  lastUpdated: string;
  ymylNotice: string;
}

type CalculatorEditorialBase = Omit<CalculatorEditorialContent, "whatIs" | "howItWorks" | "practicalExample" | "officialSources" | "lastUpdated" | "ymylNotice">;

const contentById: Record<string, CalculatorEditorialBase> = {
  "itbis-calc": {
    overview: "Calcula el ITBIS que se agrega a una base imponible. La tasa general es 18% y determinados bienes pueden usar 16%; una operacion exenta no debe forzarse a ninguna de las dos.",
    steps: "Multiplica la base por la tasa seleccionada y suma el impuesto para obtener el total. Si el precio ya incluye ITBIS, debe separarse dividiendo entre uno mas la tasa.",
    example: "Una base de RD$10,000 al 18% genera RD$1,800 de ITBIS y RD$11,800 de total.",
    commonErrors: ["Aplicar 18% a operaciones exentas", "Restar 18% directamente a un total con impuesto incluido", "Confundir ITBIS facturado con ITBIS neto a pagar"],
    faqs: [
      { question: "Cual es la tasa general del ITBIS?", answer: "La tasa general es 18%; existe una tasa de 16% para bienes expresamente indicados por la normativa." },
      { question: "La calculadora prepara el IT-1?", answer: "No. Calcula una operacion; el IT-1 requiere consolidar ventas, adelantos, retenciones y creditos." }
    ]
  },
  "isr-asalariado": {
    overview: "Estima la retencion de ISR de un asalariado despues de AFP y SFS. La renta neta mensual se anualiza y se compara con la escala progresiva vigente.",
    steps: "Calcula TSS, resta esos aportes al salario, anualiza la renta neta y aplica solo el tramo de 0%, 15%, 20% o 25% que corresponda.",
    example: "Otros ingresos gravables o ajustes acumulados de nomina pueden cambiar la retencion aun con el mismo salario bruto.",
    commonErrors: ["Aplicar la tasa mayor a todo el ingreso", "Calcular ISR antes de AFP y SFS", "Ignorar otros ingresos gravables acumulados"],
    faqs: [
      { question: "Todos los empleados pagan ISR?", answer: "No. La renta neta gravable debe superar el tramo exento anual." },
      { question: "Es una certificacion de nomina?", answer: "No. Es una estimacion que puede variar por otros ingresos y ajustes." }
    ]
  },
  "salario-neto": {
    overview: "Convierte el salario bruto mensual en una estimacion de salario neto separando AFP, SFS e ISR. El costo patronal se muestra aparte.",
    steps: "Aplica topes a AFP y SFS, calcula la renta neta gravable y resta los descuentos obligatorios al salario bruto.",
    example: "Con RD$50,000 se presentan TSS, ISR, total de descuentos y neto estimado.",
    commonErrors: ["Confundir aportes patronales con descuentos al empleado", "Aplicar porcentajes TSS sin topes", "Tratar prestamos personales como descuentos legales"],
    faqs: [
      { question: "Incluye otros descuentos de la empresa?", answer: "No. Prestamos, cooperativas, seguros voluntarios y embargos deben agregarse por separado." },
      { question: "Puedo comparar ofertas?", answer: "Si, como referencia, verificando beneficios y descuentos propios de cada empleador." }
    ]
  },
  "tss-completa": {
    overview: "Separa aportes del trabajador y del empleador, con topes diferentes para pensiones, salud y riesgos laborales.",
    steps: "Limita el salario cotizable de cada seguro, aplica su porcentaje y presenta AFP, SFS, SRL e INFOTEP.",
    example: "En salarios altos, AFP y SFS pueden usar bases diferentes porque sus topes no son iguales.",
    commonErrors: ["Usar un solo tope para todos los seguros", "Descontar al empleado aportes patronales", "Tratar la tasa SRL de referencia como universal"],
    faqs: [
      { question: "Cuales son los topes desde febrero de 2026?", answer: "RD$464,460 para pensiones, RD$232,230 para SFS y RD$92,892 para riesgos laborales." },
      { question: "SRL siempre es 1.20%?", answer: "No. Puede variar segun el nivel de riesgo; la herramienta usa una referencia configurable." }
    ]
  },
  "prestaciones-laborales": {
    overview: "Estima preaviso, cesantia, vacaciones y salario de Navidad pendiente segun salario, antiguedad y causa de terminacion.",
    steps: "Obtiene el salario diario, determina dias por antiguedad y separa prestaciones de derechos adquiridos.",
    example: "Un desahucio del empleador puede generar preaviso y cesantia, ademas de vacaciones y regalia pendientes.",
    commonErrors: ["Asumir que toda salida genera cesantia", "Usar fechas incompletas", "Sumar derechos ya pagados"],
    faqs: [
      { question: "Renuncia y dimision son lo mismo?", answer: "No necesariamente. Una dimision justificada es una figura distinta y requiere evaluar sus causas." },
      { question: "Sustituye al Ministerio de Trabajo?", answer: "No. Sirve como orientacion y conviene validar casos controvertidos." }
    ]
  },
  "liquidacion-laboral": {
    overview: "Calcula una liquidacion estimada y distingue la causa de salida, que define si proceden preaviso y cesantia.",
    steps: "Selecciona el motivo, verifica fechas y suma solo conceptos que correspondan y no hayan sido pagados.",
    example: "Una renuncia ordinaria suele conservar vacaciones y regalia pendientes, pero no genera automaticamente preaviso ni cesantia.",
    commonErrors: ["Marcar prestaciones sin revisar la causa", "Omitir pagos ya recibidos", "Confundir salario ordinario con pagos extraordinarios"],
    faqs: [
      { question: "Que documentos debo comparar?", answer: "Contrato, nominas, fechas, comunicaciones de terminacion y constancias de vacaciones." },
      { question: "Incluye indemnizaciones judiciales?", answer: "No. Daños, salarios caidos u otras condenas requieren evaluacion separada." }
    ]
  },
  "retenciones-dgii": {
    overview: "Estima retenciones de ISR e ITBIS en pagos por servicios. La tasa depende del servicio y de la condicion fiscal de las partes.",
    steps: "Identifica la base, calcula el ITBIS facturado y aplica por separado los porcentajes de retencion.",
    example: "Una factura profesional puede tener ISR sobre honorarios y una retencion de ITBIS diferente.",
    commonErrors: ["Aplicar retencion a toda factura", "Usar el total con ITBIS como base de ISR", "Confundir monto retenido con impuesto definitivo"],
    faqs: [
      { question: "Todas las facturas llevan retencion?", answer: "No. Depende del servicio, las partes y la norma aplicable." },
      { question: "Donde se reportan?", answer: "En los formularios y formatos DGII que correspondan." }
    ]
  },
  "regalia-pascual": {
    overview: "Calcula el salario de Navidad como la duodecima parte de los salarios ordinarios devengados durante el año.",
    steps: "Suma salarios ordinarios y divide entre doce, incluso cuando se trabajo menos de un año.",
    example: "RD$30,000 durante seis meses producen una regalia estimada de RD$15,000.",
    commonErrors: ["Dividir entre meses trabajados en vez de doce", "Incluir pagos extraordinarios sin revisar", "Descontar TSS como nomina ordinaria"],
    faqs: [
      { question: "Cuando debe pagarse?", answer: "A mas tardar el 20 de diciembre." },
      { question: "Puede el empleador pagar mas?", answer: "Si, por politica o acuerdo, aunque la obligacion legal tenga sus propias reglas." }
    ]
  }
};

const LAST_UPDATED = "junio de 2026";
const YMYL_NOTICE = "La información proporcionada tiene fines educativos e informativos y no constituye asesoría legal, fiscal ni financiera profesional.";

function categoryContext(calc: CalculatorInfo) {
  if (calc.category === "laboral") {
    return {
      audience: "trabajadores, empleadores, responsables de nómina y asesores laborales",
      institutions: "Ministerio de Trabajo, TSS, CNSS, SISALRIL y SIPEN",
      example: "Un trabajador dominicano que gana RD$35,000 mensuales necesita revisar el monto bruto, el periodo de pago, los descuentos obligatorios y cualquier derecho adquirido antes de interpretar el resultado."
    };
  }
  if (calc.category === "impuestos") {
    return {
      audience: "personas físicas, profesionales independientes, contadores, pymes y negocios que facturan en República Dominicana",
      institutions: "DGII y, cuando el cálculo incluye nómina, TSS y CNSS",
      example: "Un profesional que factura RD$25,000 por un servicio debe separar la base imponible, el ITBIS, las retenciones y el monto neto cobrado antes de registrar la operación."
    };
  }
  if (calc.category === "finanzas") {
    return {
      audience: "hogares, emprendedores y analistas que comparan escenarios de crédito, ahorro o inversión",
      institutions: "Banco Central, Superintendencia de Bancos y entidades financieras reguladas",
      example: "Una familia que evalua una cuota mensual debe comparar capital, tasa, plazo, seguros y capacidad real de pago antes de comprometer ingresos futuros."
    };
  }
  return {
      audience: "dueños de negocios, administradores, vendedores y equipos contables de pymes dominicanas",
      institutions: "DGII, cámaras de comercio, entidades financieras y documentación interna del negocio",
    example: "Una pyme que vende un producto debe separar costo, margen, impuestos y flujo de caja para evitar confundir ventas con ganancia disponible."
  };
}

function buildLongSections(calc: CalculatorInfo, base: CalculatorEditorialBase): CalculatorEditorialContent {
  const ctx = categoryContext(calc);
  const faqs = [
    ...base.faqs,
    {
      question: `¿Para qué sirve ${calc.name}?`,
      answer: `${calc.name} convierte datos dispersos en una estimación organizada y revisable. Además del total, permite entender qué base se usa, qué periodo corresponde y cuáles conceptos pueden alterar el resultado. Es útil para ${ctx.audience} cuando necesitan comparar escenarios antes de tomar una decisión o consultar una fuente oficial.`
    },
    {
      question: "¿El resultado es oficial o definitivo?",
      answer: "No. Es una estimación educativa basada en reglas generales, tasas documentadas y los datos ingresados. Una institución oficial o un profesional calificado puede considerar documentos, periodos parciales, acuerdos, exenciones y criterios que no aparecen en una simulación automática."
    },
    {
      question: "¿Qué documentos debo revisar antes de confiar en el cálculo?",
      answer: "Conviene revisar recibos de pago, contratos, facturas con NCF, formularios, constancias de retención, estados de cuenta o cualquier documento que demuestre la base utilizada. Si el documento real usa una base distinta, el resultado puede cambiar aunque la fórmula general sea correcta."
    },
    {
      question: "¿Por qué puede variar el resultado entre empresas o periodos?",
      answer: "Puede variar por descuentos voluntarios, comisiones, bonificaciones, ingresos acumulados, cambios de tasa, topes cotizables, pagos parciales o errores de captura. En temas fiscales y laborales también importa la fecha de vigencia."
    },
    {
      question: "¿Cómo usa Tu Negocio RD las fuentes oficiales?",
      answer: `El equipo editorial prioriza fuentes primarias como ${ctx.institutions}. Estas referencias permiten confirmar conceptos, tasas, topes y fechas de vigencia. Cuando una publicación oficial cambia, revisamos el texto, los ejemplos y la calculadora relacionada.`
    },
    {
      question: "¿Qué debo hacer si encuentro una diferencia?",
      answer: "Primero verifica que los datos ingresados coincidan con tus documentos. Luego confirma la fecha, el periodo, la base y el concepto aplicado. Si la diferencia persiste, conserva la evidencia y consulta con la institución correspondiente o con un profesional."
    }
  ].slice(0, 9);

  return {
    ...base,
    faqs,
    whatIs: `${calc.name} es una herramienta educativa de Tu Negocio RD. ${calc.description} Ayuda a ${ctx.audience} a interpretar un resultado dentro del contexto dominicano, donde las tasas, los topes, el periodo y la fecha pueden modificar el cálculo. ${base.overview} Presentamos el alcance, la metodología, un ejemplo, errores frecuentes y fuentes para que el usuario pueda revisar el resultado en lugar de aceptar una cifra aislada.`,
    howItWorks: `${base.steps} Primero se identifica la base correcta: salario bruto, monto facturado, capital, tasa, plazo o costo, según corresponda. Después se confirma el periodo y se aplican tasas, topes o tramos en el orden adecuado. La interpretación debe basarse en el desglose completo. Para una decisión importante, guarda los datos utilizados y compáralos con tus documentos y la fuente oficial vigente.`,
    practicalExample: `${ctx.example} ${base.example} Este ejemplo demuestra el método y no constituye una promesa de pago. Confirma si el dato principal es bruto, neto o imponible; aplica los pasos en orden y compara el resultado con el documento real. Diferencias por comisiones, pagos parciales, topes o retenciones acumuladas requieren una revisión individual.`,
    officialSources: `Las referencias principales son ${ctx.institutions}. Tu Negocio RD las utiliza para verificar conceptos, tasas, topes y fechas de vigencia. Si una fuente secundaria contradice una publicación oficial, se prioriza la fuente primaria antes de modificar una fórmula.`,
    lastUpdated: LAST_UPDATED,
    ymylNotice: YMYL_NOTICE,
  };
}

export function getCalculatorEditorialContent(calc: CalculatorInfo): CalculatorEditorialContent {
  const base = contentById[calc.id] || {
    overview: `${calc.description} La herramienta organiza los datos y muestra un resultado reproducible.`,
    steps: `Completa los campos de ${calc.name.toLowerCase()}, revisa unidades, periodo y tasa, y compara el desglose.`,
    example: `Prueba un escenario conservador y otro alternativo para entender como cambia ${calc.name.toLowerCase()}.`,
    commonErrors: ["Introducir porcentajes en una escala distinta", "Mezclar periodos mensuales y anuales", "Tomar una simulacion como certificacion oficial"],
    faqs: [
      { question: `Que datos usa ${calc.name}?`, answer: calc.shortDescription },
      { question: "El resultado es definitivo?", answer: "No. Es una estimacion que debe contrastarse con documentos y normas aplicables." }
    ]
  };
  return buildLongSections(calc, base);
}
