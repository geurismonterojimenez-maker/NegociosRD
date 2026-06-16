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

const LAST_UPDATED = "junio 2026";
const YMYL_NOTICE = "La informacion proporcionada tiene fines educativos e informativos y no constituye asesoria legal, fiscal ni financiera profesional.";

function categoryContext(calc: CalculatorInfo) {
  if (calc.category === "laboral") {
    return {
      audience: "trabajadores, empleadores, responsables de nomina y asesores laborales",
      institutions: "Ministerio de Trabajo, TSS, CNSS, SISALRIL y SIPEN",
      example: "Un trabajador dominicano que gana RD$35,000 mensuales necesita revisar el monto bruto, el periodo de pago, los descuentos obligatorios y cualquier derecho adquirido antes de interpretar el resultado."
    };
  }
  if (calc.category === "impuestos") {
    return {
      audience: "personas fisicas, profesionales independientes, contadores, pymes y negocios que facturan en Republica Dominicana",
      institutions: "DGII y, cuando el calculo toca nomina, TSS y CNSS",
      example: "Un profesional que factura RD$25,000 por un servicio debe separar base imponible, ITBIS, retenciones y monto neto cobrado antes de registrar la operacion."
    };
  }
  if (calc.category === "finanzas") {
    return {
      audience: "hogares, emprendedores y analistas que comparan escenarios de credito, ahorro o inversion",
      institutions: "Banco Central, Superintendencia de Bancos y entidades financieras reguladas",
      example: "Una familia que evalua una cuota mensual debe comparar capital, tasa, plazo, seguros y capacidad real de pago antes de comprometer ingresos futuros."
    };
  }
  return {
    audience: "duenos de negocios, administradores, vendedores y equipos contables de pymes dominicanas",
    institutions: "DGII, camaras de comercio, entidades financieras y documentacion interna del negocio",
    example: "Una pyme que vende un producto debe separar costo, margen, impuestos y flujo de caja para evitar confundir ventas con ganancia disponible."
  };
}

function buildLongSections(calc: CalculatorInfo, base: CalculatorEditorialBase): CalculatorEditorialContent {
  const ctx = categoryContext(calc);
  const faqs = [
    ...base.faqs,
    {
      question: `Para que sirve ${calc.name}?`,
      answer: `${calc.name} sirve para convertir datos dispersos en una estimacion organizada y revisable. No se limita a mostrar un numero: ayuda a entender que base se usa, que periodo corresponde y que conceptos pueden alterar el resultado. Es util para ${ctx.audience}, especialmente cuando necesitan comparar escenarios antes de tomar una decision o antes de consultar una fuente oficial.`
    },
    {
      question: "El resultado es oficial o definitivo?",
      answer: "No. El resultado es una estimacion educativa basada en reglas generales, tasas documentadas y datos ingresados por el usuario. Una institucion oficial, un contador, un abogado o un asesor financiero puede revisar documentos adicionales, periodos parciales, acuerdos, exenciones, pagos variables o criterios administrativos que no aparecen en una simulacion automatica."
    },
    {
      question: "Que documentos debo revisar antes de confiar en el calculo?",
      answer: "Conviene revisar recibos de pago, contratos, facturas con NCF, formularios, comunicaciones laborales, constancias de retencion, estados de cuenta o cualquier documento que pruebe la base usada. Si el documento real usa una base distinta a la que escribiste en la calculadora, el resultado puede cambiar aunque la formula general sea correcta."
    },
    {
      question: "Por que puede variar el resultado entre empresas o periodos?",
      answer: "Puede variar por descuentos voluntarios, comisiones, bonificaciones, ingresos acumulados, cambios de tasa, topes cotizables, pagos parciales, errores de captura o reglas internas documentadas. En temas fiscales y laborales tambien importa la fecha: una tasa o tope vigente en un mes puede no ser el mismo usado en un periodo anterior."
    },
    {
      question: "Como usa Tu Negocio RD las fuentes oficiales?",
      answer: `El equipo editorial prioriza fuentes primarias como ${ctx.institutions}. Las fuentes se usan para confirmar conceptos, tasas, topes y criterios generales. Cuando una publicacion oficial cambia, se revisa el texto, los ejemplos y la calculadora relacionada para mantener coherencia entre explicacion y resultado.`
    },
    {
      question: "Que debo hacer si encuentro una diferencia?",
      answer: "Primero verifica que los datos ingresados coincidan con tu documento real. Luego confirma fecha, periodo, base y concepto aplicado. Si la diferencia persiste, conserva la evidencia y consulta con la institucion correspondiente o con un asesor profesional. Tambien puedes reportar el caso desde la pagina de contacto para que revisemos la explicacion editorial."
    }
  ].slice(0, 9);

  return {
    ...base,
    faqs,
    whatIs: `${calc.name} es una herramienta educativa de Tu Negocio RD para ${calc.description.toLowerCase()} Su objetivo es ayudar a ${ctx.audience} a entender un resultado antes de usarlo en una conversacion contable, laboral, fiscal o financiera. La herramienta no presenta el calculo como una verdad aislada: lo coloca dentro de un contexto dominicano, con tasas, topes, periodos y advertencias que explican por que el mismo monto puede producir resultados distintos cuando cambia la base o la fecha. ${base.overview} Esta pagina esta disenada para que el usuario lea primero el alcance del calculo, identifique que datos necesita y luego use la calculadora con una expectativa razonable. En temas de dinero, empleo e impuestos, un resultado rapido sin explicacion puede crear confianza falsa. Por eso se muestran metodologia, ejemplo, errores frecuentes, fuentes oficiales y fecha de actualizacion. Tambien se aclara que el calculo es informativo y que los casos con documentos, acuerdos, sentencias, exenciones, comisiones o tratamientos especiales requieren revision profesional.`,
    howItWorks: `${base.steps} El proceso comienza identificando la base correcta: salario bruto, salario ordinario, monto facturado, capital, tasa, plazo o costo, segun aplique. Despues se confirma el periodo para evitar mezclar cifras mensuales con anuales, quincenales o proporcionales. Cuando hay tasas, topes o tramos, se aplican en el orden correspondiente y se separan conceptos que no deben mezclarse. En el caso dominicano esto es importante porque una nomina puede involucrar TSS, ISR y descuentos voluntarios; una factura puede involucrar ITBIS y retenciones; y una liquidacion puede mezclar prestaciones con derechos adquiridos. La interpretacion del resultado debe hacerse revisando el desglose y no solo el total. Si el resultado se va a usar para una decision importante, conviene guardar los datos ingresados, revisar la fuente oficial y contrastar con documentos reales.`,
    practicalExample: `${ctx.example} ${base.example} El ejemplo debe leerse como una demostracion del metodo, no como una promesa de pago. Primero se toma el dato principal y se confirma si es bruto, neto o base imponible. Luego se aplican los pasos en orden y se revisa el total contra el documento real. Si aparece una diferencia, la causa mas comun es que el caso real incluye otro concepto: comisiones, pagos parciales, descuentos voluntarios, topes, periodos incompletos o retenciones acumuladas. Usar el ejemplo de esta forma ayuda a detectar preguntas concretas antes de hablar con la empresa, el contador, el banco o una institucion oficial.`,
    officialSources: `Las referencias principales para este tipo de calculo son ${ctx.institutions}. Tu Negocio RD utiliza estas fuentes para revisar tasas, topes, conceptos y fechas de vigencia. Cuando una fuente secundaria contradice una fuente oficial, se prioriza la publicacion oficial o se marca el tema para revision editorial antes de cambiar una formula.`,
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
