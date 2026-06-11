import { CalculatorInfo, FaqItem } from "../types";

export interface CalculatorEditorialContent {
  overview: string;
  steps: string;
  example: string;
  commonErrors: string[];
  faqs: FaqItem[];
}

const contentById: Record<string, CalculatorEditorialContent> = {
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

export function getCalculatorEditorialContent(calc: CalculatorInfo): CalculatorEditorialContent {
  return contentById[calc.id] || {
    overview: `${calc.description} La herramienta organiza los datos y muestra un resultado reproducible.`,
    steps: `Completa los campos de ${calc.name.toLowerCase()}, revisa unidades, periodo y tasa, y compara el desglose.`,
    example: `Prueba un escenario conservador y otro alternativo para entender como cambia ${calc.name.toLowerCase()}.`,
    commonErrors: ["Introducir porcentajes en una escala distinta", "Mezclar periodos mensuales y anuales", "Tomar una simulacion como certificacion oficial"],
    faqs: [
      { question: `Que datos usa ${calc.name}?`, answer: calc.shortDescription },
      { question: "El resultado es definitivo?", answer: "No. Es una estimacion que debe contrastarse con documentos y normas aplicables." }
    ]
  };
}
