import { GuidePage } from "../types";

const REVIEW_DATE = "junio 2026";

type GuideSeed = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  calculatorSlug: string;
  topic: string;
  practicalCase: string;
  sourceFocus: string;
};

const sourcesBlock = `## Fuentes oficiales consultadas

Para preparar y revisar esta guia se usan fuentes primarias dominicanas: Direccion General de Impuestos Internos (DGII), Tesoreria de la Seguridad Social (TSS), Consejo Nacional de Seguridad Social (CNSS) y Ministerio de Trabajo. Cuando el tema toca salud, pensiones o riesgos laborales tambien se contrastan publicaciones de SISALRIL y SIPEN. Tu Negocio RD no reemplaza esas instituciones; organiza la informacion para que el lector pueda entenderla antes de confirmar un caso especifico.

## Metodologia editorial

El equipo editorial revisa formulas, tasas, topes, fechas de vigencia y ejemplos antes de publicar. Cada guia se redacta con lenguaje claro y se cruza con calculadoras internas para detectar inconsistencias. Si una fuente oficial cambia, primero se identifica el alcance del cambio, luego se actualiza el texto y finalmente se revisan los ejemplos asociados para evitar que una pagina diga una cosa y la calculadora muestre otra.

## Revision editorial

Ultima actualizacion: ${REVIEW_DATE}. La informacion tiene fines educativos e informativos y no constituye asesoria legal, fiscal ni financiera profesional. En decisiones de pago, reclamacion, declaracion tributaria o terminacion laboral, conviene validar el expediente con la institucion oficial correspondiente o con un asesor calificado.`;

function buildGuide(seed: GuideSeed): GuidePage {
  const contentMarkdown = `## Tabla de contenido

- Que problema resuelve esta guia.
- Conceptos basicos que debes conocer.
- Metodologia de calculo paso a paso.
- Ejemplo dominicano explicado.
- Errores frecuentes.
- Como documentar tu caso.
- Preguntas frecuentes.
- Conclusion y fuentes oficiales.

## Que problema resuelve esta guia

${seed.intro} En Republica Dominicana muchas decisiones de nomina, impuestos y prestaciones se toman con datos parciales: un recibo de pago, una captura de una calculadora o una regla repetida de memoria. El problema es que los calculos laborales y fiscales suelen depender del periodo, la base correcta, la causa juridica del pago y los topes vigentes. Por eso esta guia no se limita a dar una formula corta. Explica que significa cada concepto, cual es el orden de revision y que documentos conviene tener a mano antes de considerar un resultado como razonable.

El enfoque de Tu Negocio RD es educativo. Una persona empleada puede usar esta guia para entender su recibo, una pyme puede usarla para ordenar preguntas antes de hablar con contabilidad, y un asesor puede compartirla como material de orientacion general. La meta no es sustituir una opinion profesional, sino reducir errores comunes: comparar montos brutos con netos, usar una tasa fuera de contexto, ignorar topes, mezclar derechos adquiridos con indemnizaciones o asumir que una simulacion automatica equivale a una certificacion oficial.

## Conceptos basicos que debes conocer

${seed.topic} debe analizarse con tres capas. La primera es la capa economica: monto bruto, periodo, frecuencia de pago y descuentos aplicables. La segunda es la capa normativa: que institucion regula el concepto, que fuente se consulta y desde cuando aplica. La tercera es la capa documental: contrato, recibos, facturas, formularios, constancias o comunicaciones que prueban el caso real. Si una de estas capas falta, el resultado puede seguir siendo util como estimacion, pero no debe presentarse como conclusion definitiva.

Tambien es importante diferenciar una calculadora de una decision administrativa. Una calculadora aplica reglas generales con datos ingresados por el usuario. Una institucion oficial, un tribunal, un contador publico o un abogado puede revisar hechos adicionales: pagos variables, acuerdos escritos, exenciones, moras, retenciones acumuladas, topes historicos, periodos parciales y documentos que no aparecen en una simulacion simple.

## Metodologia de calculo paso a paso

Primero se identifica la base. En nomina suele ser el salario ordinario mensual o el promedio computable; en impuestos puede ser la base imponible sin impuesto; en prestaciones puede ser el salario diario de referencia. Segundo se verifica el periodo: mensual, quincenal, anual, proporcional o acumulado. Tercero se aplican tasas, topes o escalas en el orden correcto. Cuarto se separan conceptos que parecen similares pero no lo son: descuento del empleado frente a costo patronal, ITBIS facturado frente a ITBIS retenido, salario bruto frente a salario neto, o prestaciones frente a derechos adquiridos.

En cada revision se recomienda anotar el dato de entrada, la fuente usada y la fecha. Esta practica evita discusiones innecesarias cuando un valor cambia en el futuro. Por ejemplo, si un tope cotizable fue consultado en junio de 2026, esa fecha debe quedar visible en el resultado. Si una escala de ISR se mantiene igual por disposicion oficial, tambien debe explicarse para que el usuario no confunda permanencia con descuido.

## Ejemplo dominicano explicado

${seed.practicalCase} El primer paso es tomar el monto principal y confirmar si corresponde a una base bruta, neta o facturada. Luego se revisa si el calculo requiere restar aportes antes de aplicar otro impuesto, si hay que anualizar una base o si el resultado se obtiene dividiendo entre un factor legal. En la practica dominicana, muchos errores nacen de saltarse ese orden. Una diferencia pequena en la base puede producir una diferencia grande cuando se proyecta a doce meses o cuando se multiplica por dias de salario.

Supongamos que una persona quiere validar un resultado antes de presentarlo a su empleador o contador. Lo recomendable es guardar el calculo, tomar nota de los datos ingresados, copiar las fuentes oficiales consultadas y comparar con el documento real. Si el recibo, la factura o la comunicacion laboral usa una base distinta, no necesariamente significa que la calculadora este equivocada: puede significar que el caso real incluye un ajuste, un ingreso adicional o un tratamiento especial.

## Errores frecuentes

- Usar salario neto cuando la formula requiere salario bruto.
- Aplicar una tasa fija a todo el monto sin respetar tramos, topes o bases.
- Confundir aportes del empleador con descuentos del trabajador.
- Copiar un resultado de un mes y usarlo en otro periodo sin revisar cambios.
- Omitir comisiones, pagos variables o conceptos que forman parte del promedio.
- No conservar recibos, facturas, formularios o comunicaciones que prueben el caso.
- Tratar una guia educativa como asesoria profesional individual.

## Como documentar tu caso

Para que una revision sea util, conviene preparar una carpeta sencilla con documentos y notas. Incluye fecha de ingreso, fecha de salida si aplica, salario pactado, recibos de pago, evidencia de vacaciones, comunicaciones de terminacion, facturas con NCF, formularios presentados y cualquier retencion practicada. Si se trata de una consulta tributaria, separa el periodo fiscal y el tipo de contribuyente. Si se trata de una consulta laboral, identifica la causa del pago y si existe una comunicacion formal.

La documentacion no solo ayuda a obtener un resultado mas preciso. Tambien protege al usuario contra decisiones apresuradas. En temas YMYL, como dinero, impuestos, empleo o derechos laborales, Google y los usuarios esperan transparencia, fuentes claras y limites bien explicados. Por eso cada guia de Tu Negocio RD muestra fecha de actualizacion, fuentes oficiales y un aviso de que la informacion es educativa.

## Preguntas frecuentes

### Esta guia sustituye una consulta profesional?

No. Esta guia organiza reglas generales, ejemplos y fuentes para mejorar la comprension del usuario, pero no reemplaza la revision de un contador, abogado, asesor laboral o institucion oficial. Un caso real puede depender de documentos, fechas, acuerdos, pagos variables, retenciones acumuladas o criterios administrativos que no aparecen en una lectura general. Usala como punto de partida para formular mejores preguntas y detectar inconsistencias.

### Por que el resultado puede diferir de mi recibo o factura?

La diferencia puede venir de bases distintas, periodos parciales, ingresos variables, descuentos voluntarios, dependientes, ajustes acumulados, errores de captura o reglas internas de una empresa. Antes de concluir que hay un error, compara el dato exacto usado por el documento real con el dato ingresado en la calculadora. Si la base no coincide, el resultado tampoco coincidira.

### Que fuentes oficiales debo revisar primero?

Depende del tema. Para impuestos como ISR, ITBIS, retenciones o recargos, la referencia principal es la DGII. Para seguridad social, aportes y topes, consulta TSS y CNSS. Para prestaciones, vacaciones, terminacion y salario de Navidad, revisa el Ministerio de Trabajo y el Codigo de Trabajo. Cuando el tema involucra salud o pensiones, SISALRIL y SIPEN pueden aportar contexto adicional.

### Cada cuanto se actualiza esta informacion?

Tu Negocio RD revisa las paginas centrales cuando hay cambios normativos, publicaciones oficiales o reportes de usuarios. Algunas reglas permanecen estables durante anos; otras cambian por resoluciones, salarios minimos, avisos administrativos o reformas. Por eso mostramos fecha de actualizacion y recomendamos validar con la fuente oficial si el caso implica dinero, declaraciones o reclamaciones.

### Como se relaciona esta guia con la calculadora?

La guia explica el criterio y la calculadora ejecuta la operacion. El mejor uso es combinarlas: leer el concepto, ejecutar un ejemplo, revisar el desglose y luego comparar con tus documentos. Si el resultado es importante para una decision financiera, fiscal o laboral, guarda los datos ingresados y valida con una fuente oficial o asesor profesional.

## Conclusion

${seed.sourceFocus} La aprobacion de un calculo no depende de que una pagina se vea profesional, sino de que el metodo sea claro, las fuentes esten visibles y los limites se expliquen sin exagerar. Para usuarios dominicanos, el valor esta en entender el por que del resultado y no solo en obtener un numero rapido.

${sourcesBlock}`;

  return {
    slug: seed.slug,
    title: seed.title,
    seoTitle: seed.seoTitle,
    seoMetaDescription: seed.description,
    shortIntro: seed.intro,
    publishDate: "2026-06-16",
    readTime: "12 min de lectura",
    imageAlt: `${seed.title} para Republica Dominicana`,
    relatedCalculatorSlug: seed.calculatorSlug,
    contentMarkdown,
  };
}

export const LEARNING_GUIDES: GuidePage[] = [
  buildGuide({
    slug: "como-calcular-prestaciones-laborales-rd",
    title: "Como calcular prestaciones laborales en Republica Dominicana",
    seoTitle: "Como calcular prestaciones laborales en Republica Dominicana",
    description: "Guia completa para entender preaviso, cesantia, vacaciones y salario de Navidad en RD, con metodologia, ejemplo y fuentes oficiales.",
    intro: "Las prestaciones laborales dominicanas combinan antiguedad, salario ordinario, causa de terminacion y derechos adquiridos.",
    calculatorSlug: "calculadora-prestaciones-laborales",
    topic: "El calculo de prestaciones laborales",
    practicalCase: "Un trabajador que gana RD$35,000 mensuales y es desahuciado tras dos anos de servicio debe revisar salario diario, preaviso, cesantia, vacaciones pendientes y regalía proporcional.",
    sourceFocus: "Para prestaciones laborales, las fuentes principales son el Codigo de Trabajo y el Ministerio de Trabajo.",
  }),
  buildGuide({
    slug: "guia-completa-isr-dominicano",
    title: "Guia completa del ISR dominicano",
    seoTitle: "Guia completa del ISR dominicano para asalariados y negocios",
    description: "Aprende como funciona el ISR en Republica Dominicana, que bases se usan, como se aplica la escala y que errores evitar.",
    intro: "El Impuesto Sobre la Renta requiere identificar la renta gravable, las deducciones admitidas y la escala aplicable al periodo.",
    calculatorSlug: "calculadora-isr",
    topic: "El ISR dominicano",
    practicalCase: "Un empleado con RD$50,000 mensuales primero descuenta AFP y SFS, luego anualiza la renta neta gravable y finalmente aplica el tramo de la escala DGII.",
    sourceFocus: "Para ISR, la fuente central es la DGII y sus publicaciones sobre escalas, formularios y obligaciones tributarias.",
  }),
  buildGuide({
    slug: "que-es-la-tss-y-como-funciona",
    title: "Que es la TSS y como funciona",
    seoTitle: "Que es la TSS en Republica Dominicana y como funcionan sus aportes",
    description: "Explicacion completa de TSS, AFP, SFS, SRL, INFOTEP, topes cotizables y diferencias entre empleado y empleador.",
    intro: "La TSS administra aportes de seguridad social que afectan tanto el salario neto del trabajador como el costo real del empleador.",
    calculatorSlug: "calculadora-tss",
    topic: "La Tesoreria de la Seguridad Social",
    practicalCase: "Una empresa que contrata a una persona por RD$60,000 debe separar descuentos del empleado y aportes patronales para no confundir neto con costo laboral.",
    sourceFocus: "Para TSS se consultan TSS y CNSS, especialmente cuando cambian topes cotizables o resoluciones del sistema.",
  }),
  buildGuide({
    slug: "diferencias-entre-afp-y-ars",
    title: "Diferencias entre AFP y ARS",
    seoTitle: "Diferencias entre AFP y ARS en Republica Dominicana",
    description: "Conoce la diferencia entre pensiones AFP, seguro de salud ARS/SFS y como se reflejan en la nomina dominicana.",
    intro: "AFP y ARS suelen aparecer juntas en conversaciones de nomina, pero pertenecen a riesgos y objetivos distintos.",
    calculatorSlug: "calculadora-afp",
    topic: "AFP, ARS y SFS",
    practicalCase: "Un trabajador que revisa su recibo puede ver aportes de AFP para pensiones y SFS para salud, aunque ambos se descuenten en la misma nomina.",
    sourceFocus: "Para AFP y ARS se revisan TSS, CNSS, SISALRIL y SIPEN, segun el aspecto de salud o pensiones.",
  }),
  buildGuide({
    slug: "como-interpretar-una-nomina-dominicana",
    title: "Como interpretar una nomina dominicana",
    seoTitle: "Como interpretar una nomina dominicana paso a paso",
    description: "Guia practica para leer salario bruto, descuentos TSS, ISR, salario neto, aportes patronales y ajustes de nomina en RD.",
    intro: "Una nomina dominicana bien leida separa ingresos, descuentos obligatorios, descuentos voluntarios y aportes patronales.",
    calculatorSlug: "calculadora-salario-neto",
    topic: "La nomina dominicana",
    practicalCase: "Una persona con RD$42,000 mensuales debe identificar salario bruto, descuentos AFP/SFS, posible ISR, prestamos internos y pago neto.",
    sourceFocus: "Para nomina se cruzan DGII, TSS y Ministerio de Trabajo, porque intervienen impuestos, seguridad social y reglas laborales.",
  }),
  buildGuide({
    slug: "como-calcular-horas-extras-rd",
    title: "Como calcular horas extras",
    seoTitle: "Como calcular horas extras en Republica Dominicana",
    description: "Aprende a estimar horas extras, recargos nocturnos, feriados y errores comunes al calcular pagos laborales en RD.",
    intro: "Las horas extras dependen del tipo de jornada, el salario ordinario y el recargo aplicable al tiempo trabajado.",
    calculatorSlug: "calculadora-horas-extras",
    topic: "Las horas extras",
    practicalCase: "Un trabajador con salario mensual fijo que labora horas adicionales debe convertir su salario a base diaria u horaria antes de aplicar recargos.",
    sourceFocus: "Para horas extras la referencia principal es el Ministerio de Trabajo y el Codigo de Trabajo dominicano.",
  }),
  buildGuide({
    slug: "todo-sobre-regalia-pascual",
    title: "Todo sobre la regalia pascual",
    seoTitle: "Todo sobre la regalia pascual o salario de Navidad en RD",
    description: "Guia sobre salario de Navidad, formula de la duodecima parte, fecha limite, proporcionalidad y errores comunes.",
    intro: "La regalia pascual es un derecho laboral anual que debe calcularse con salarios ordinarios devengados en el ano calendario.",
    calculatorSlug: "calculadora-regalia-pascual",
    topic: "La regalia pascual",
    practicalCase: "Una persona que gana RD$30,000 durante siete meses del ano acumula RD$210,000 en salarios ordinarios y divide entre doce.",
    sourceFocus: "Para regalía pascual se consulta el Codigo de Trabajo y publicaciones del Ministerio de Trabajo.",
  }),
  buildGuide({
    slug: "errores-comunes-al-calcular-prestaciones",
    title: "Errores comunes al calcular prestaciones",
    seoTitle: "Errores comunes al calcular prestaciones laborales en RD",
    description: "Lista explicada de errores frecuentes en liquidacion, cesantia, preaviso, vacaciones y salario de Navidad.",
    intro: "Muchos errores de prestaciones no nacen de la formula, sino de usar una causa de terminacion o una base salarial incorrecta.",
    calculatorSlug: "calculadora-liquidacion",
    topic: "Los errores de liquidacion laboral",
    practicalCase: "Un empleado que renuncia y otro desahuciado pueden tener salarios iguales, pero prestaciones diferentes por la causa de salida.",
    sourceFocus: "Para revisar errores en prestaciones conviene contrastar el caso con el Ministerio de Trabajo y documentos laborales.",
  }),
  buildGuide({
    slug: "derechos-laborales-basicos-rd",
    title: "Derechos laborales basicos en Republica Dominicana",
    seoTitle: "Derechos laborales basicos en Republica Dominicana",
    description: "Resumen educativo de derechos laborales basicos: salario, vacaciones, jornada, prestaciones, regalia y documentacion.",
    intro: "Los derechos laborales basicos ayudan a trabajadores y empleadores a identificar obligaciones antes de que aparezca un conflicto.",
    calculatorSlug: "calculadora-prestaciones-laborales",
    topic: "Los derechos laborales basicos",
    practicalCase: "Una pyme que contrata personal debe prever vacaciones, regalia, seguridad social y documentacion de jornada desde el inicio.",
    sourceFocus: "Para derechos laborales se usa principalmente el Codigo de Trabajo y orientaciones del Ministerio de Trabajo.",
  }),
  buildGuide({
    slug: "cambios-fiscales-laborales-vigentes-rd",
    title: "Cambios fiscales y laborales vigentes",
    seoTitle: "Cambios fiscales y laborales vigentes en Republica Dominicana",
    description: "Guia para monitorear cambios fiscales y laborales en RD, revisar fuentes oficiales y actualizar calculos con criterio.",
    intro: "Los cambios fiscales y laborales deben confirmarse en fuentes oficiales antes de alterar calculadoras, pagos o declaraciones.",
    calculatorSlug: "calculadora-tss",
    topic: "Los cambios fiscales y laborales vigentes",
    practicalCase: "Cuando cambia un salario minimo de referencia, una empresa debe revisar topes TSS, costo patronal, recibos y comunicacion interna.",
    sourceFocus: "Para cambios vigentes se monitorean DGII, TSS, CNSS, Ministerio de Trabajo, SISALRIL y SIPEN.",
  }),
  buildGuide({
    slug: "salario-minimo-por-sector-rd",
    title: "Salario minimo por sector en Republica Dominicana",
    seoTitle: "Salario minimo por sector en Republica Dominicana: como revisarlo",
    description: "Guia para entender salarios minimos sectoriales, fuentes oficiales, efectos en nomina y relacion con topes de seguridad social.",
    intro: "El salario minimo dominicano puede variar por sector, tipo de empresa y resoluciones vigentes, por lo que debe revisarse con fuente oficial.",
    calculatorSlug: "calculadora-salario-neto",
    topic: "El salario minimo sectorial",
    practicalCase: "Una empresa pequena que contrata personal operativo debe confirmar la resolucion aplicable antes de calcular salario neto, costo patronal o provisiones laborales.",
    sourceFocus: "Para salario minimo se consulta principalmente el Ministerio de Trabajo y las resoluciones salariales vigentes.",
  }),
  buildGuide({
    slug: "como-reclamar-prestaciones-laborales-rd",
    title: "Como reclamar prestaciones laborales en RD",
    seoTitle: "Como reclamar prestaciones laborales en Republica Dominicana",
    description: "Pasos educativos para documentar una reclamacion de prestaciones laborales, revisar calculos y preparar evidencias.",
    intro: "Reclamar prestaciones requiere ordenar fechas, salario, causa de salida, pagos recibidos y comunicaciones laborales.",
    calculatorSlug: "calculadora-prestaciones-laborales",
    topic: "La reclamacion de prestaciones",
    practicalCase: "Un trabajador que recibe una liquidacion menor a la esperada debe comparar el desglose con contrato, recibos, vacaciones y fecha de terminacion.",
    sourceFocus: "Para reclamaciones laborales la referencia institucional es el Ministerio de Trabajo y la documentacion del expediente.",
  }),
  buildGuide({
    slug: "que-hacer-si-mi-empleador-no-paga-tss",
    title: "Que hacer si mi empleador no paga TSS",
    seoTitle: "Que hacer si mi empleador no paga TSS en Republica Dominicana",
    description: "Guia educativa para entender aportes TSS, evidencias, riesgos y pasos de revision cuando hay sospecha de no pago.",
    intro: "La falta de pago o reporte de TSS puede afectar cobertura de salud, pensiones y cumplimiento laboral.",
    calculatorSlug: "calculadora-tss",
    topic: "El pago de TSS por el empleador",
    practicalCase: "Una persona que ve descuentos de AFP y SFS en su nomina, pero no encuentra aportes registrados, debe reunir recibos y consultar canales oficiales.",
    sourceFocus: "Para pagos TSS se consultan TSS, CNSS y documentacion de nomina del empleador.",
  }),
  buildGuide({
    slug: "desahucio-despido-y-renuncia-diferencias",
    title: "Diferencias entre desahucio, despido y renuncia",
    seoTitle: "Desahucio, despido y renuncia en RD: diferencias laborales",
    description: "Explicacion clara de las diferencias entre desahucio, despido y renuncia y su efecto en prestaciones laborales.",
    intro: "La causa de terminacion cambia radicalmente los conceptos que pueden corresponder en una liquidacion laboral.",
    calculatorSlug: "calculadora-liquidacion",
    topic: "Las formas de terminacion laboral",
    practicalCase: "Dos empleados con el mismo salario pueden recibir montos distintos si uno renuncia y otro es desahuciado por el empleador.",
    sourceFocus: "Para terminacion laboral se revisa el Codigo de Trabajo y orientaciones del Ministerio de Trabajo.",
  }),
  buildGuide({
    slug: "vacaciones-no-tomadas-como-se-pagan",
    title: "Vacaciones no tomadas: como se pagan",
    seoTitle: "Vacaciones no tomadas en Republica Dominicana: como se pagan",
    description: "Guia para entender vacaciones pendientes, proporcionales, disfrute obligatorio y pago al terminar la relacion laboral.",
    intro: "Las vacaciones son descanso remunerado, pero pueden convertirse en monto pendiente cuando termina la relacion laboral.",
    calculatorSlug: "calculadora-vacaciones",
    topic: "Las vacaciones no tomadas",
    practicalCase: "Una persona con mas de un ano de servicio que no disfruto vacaciones debe revisar antiguedad, salario diario y si ya hubo pagos parciales.",
    sourceFocus: "Para vacaciones laborales se consulta el Codigo de Trabajo y el Ministerio de Trabajo.",
  }),
  buildGuide({
    slug: "retenciones-a-servicios-profesionales-rd",
    title: "Retenciones a servicios profesionales en RD",
    seoTitle: "Retenciones a servicios profesionales en Republica Dominicana",
    description: "Guia sobre retenciones de ISR e ITBIS en servicios profesionales, bases, errores frecuentes y documentacion.",
    intro: "Las retenciones a servicios profesionales deben separar base, ITBIS, tipo de servicio y condicion fiscal de las partes.",
    calculatorSlug: "calculadora-retenciones",
    topic: "Las retenciones de servicios",
    practicalCase: "Un consultor que factura RD$25,000 mas ITBIS debe distinguir ITBIS facturado, ISR retenido y monto neto a cobrar.",
    sourceFocus: "Para retenciones la fuente principal es la DGII y sus normas sobre comprobantes, formularios y agentes de retencion.",
  }),
  buildGuide({
    slug: "itbis-facturas-y-ncf-guia-practica",
    title: "ITBIS, facturas y NCF: guia practica",
    seoTitle: "ITBIS, facturas y NCF en Republica Dominicana",
    description: "Guia educativa sobre ITBIS, NCF, base imponible, credito fiscal y errores comunes en facturacion dominicana.",
    intro: "El ITBIS no se entiende bien sin revisar factura, NCF, base imponible y tratamiento fiscal de la operacion.",
    calculatorSlug: "calculadora-itbis",
    topic: "El ITBIS y los comprobantes fiscales",
    practicalCase: "Una pyme que vende un servicio por RD$10,000 debe saber si el ITBIS se suma, se extrae de un total o se reporta con retencion.",
    sourceFocus: "Para ITBIS y NCF se revisan publicaciones de la DGII sobre facturacion y obligaciones tributarias.",
  }),
  buildGuide({
    slug: "costo-real-de-un-empleado-rd",
    title: "Costo real de un empleado en RD",
    seoTitle: "Costo real de un empleado en Republica Dominicana",
    description: "Guia para estimar costo patronal, salario bruto, TSS empleador, provisiones y diferencias con salario neto.",
    intro: "El costo real de un empleado supera el salario bruto porque incluye aportes patronales y provisiones laborales.",
    calculatorSlug: "calculadora-costo-empleado",
    topic: "El costo laboral patronal",
    practicalCase: "Una empresa que ofrece RD$40,000 de salario debe presupuestar TSS patronal, INFOTEP y reservas de prestaciones para medir costo mensual.",
    sourceFocus: "Para costo laboral se cruzan TSS, CNSS, Ministerio de Trabajo y politicas internas de nomina.",
  }),
  buildGuide({
    slug: "capacidad-de-ahorro-segun-salario-rd",
    title: "Capacidad de ahorro segun salario en RD",
    seoTitle: "Capacidad de ahorro segun salario en Republica Dominicana",
    description: "Guia para interpretar salario neto, presupuesto mensual, ahorro posible y errores de planificacion financiera.",
    intro: "La capacidad de ahorro debe calcularse con salario neto disponible, gastos fijos y compromisos financieros reales.",
    calculatorSlug: "calculadora-salario-neto",
    topic: "La capacidad de ahorro personal",
    practicalCase: "Una persona que gana RD$50,000 brutos debe estimar neto, alquiler, transporte, comida y deudas antes de fijar una meta de ahorro.",
    sourceFocus: "Para planificacion financiera se usan calculos propios, referencias bancarias y educacion financiera general, sin sustituir asesoría profesional.",
  }),
  buildGuide({
    slug: "como-preparar-una-nomina-para-pyme-rd",
    title: "Como preparar una nomina para una pyme en RD",
    seoTitle: "Como preparar una nomina para una pyme en Republica Dominicana",
    description: "Guia para organizar nomina de una pyme: salarios, TSS, ISR, pagos, documentos y controles mensuales.",
    intro: "Preparar una nomina de pyme requiere separar datos del trabajador, salario bruto, descuentos, aportes y comprobantes internos.",
    calculatorSlug: "calculadora-tss",
    topic: "La nomina de una pyme",
    practicalCase: "Una pyme con cinco empleados debe validar salarios, descuentos TSS, posible ISR y reportes antes de pagar cada quincena.",
    sourceFocus: "Para nomina de pyme se revisan TSS, DGII, Ministerio de Trabajo y documentos internos de contratacion.",
  }),
  buildGuide({
    slug: "errores-al-calcular-isr-asalariados",
    title: "Errores al calcular ISR de asalariados",
    seoTitle: "Errores comunes al calcular ISR de asalariados en RD",
    description: "Errores frecuentes al calcular ISR: anualizacion, TSS previa, tramo exento, pagos variables y diferencias de recibo.",
    intro: "El ISR de asalariados suele fallar cuando se aplica una tasa plana o se ignora que la renta se anualiza despues de TSS.",
    calculatorSlug: "calculadora-isr",
    topic: "Los errores de ISR en nomina",
    practicalCase: "Un empleado con ingresos variables puede pagar ISR distinto a otro con salario fijo aunque ambos tengan un sueldo base similar.",
    sourceFocus: "Para ISR de asalariados se consulta la DGII y el orden de calculo usado en nomina.",
  }),
  buildGuide({
    slug: "flujo-de-caja-para-negocios-pequenos-rd",
    title: "Flujo de caja para negocios pequenos en RD",
    seoTitle: "Flujo de caja para negocios pequenos en Republica Dominicana",
    description: "Guia para entender ingresos, gastos, impuestos, inventario, pagos pendientes y liquidez en pequenos negocios.",
    intro: "El flujo de caja muestra si un negocio tiene efectivo suficiente, aunque la venta o la utilidad contable parezcan positivas.",
    calculatorSlug: "calculadora-flujo-de-caja",
    topic: "El flujo de caja de negocios pequenos",
    practicalCase: "Un colmado o servicio profesional puede vender RD$150,000 en un mes y aun asi quedarse corto si cobra tarde y paga impuestos, nomina o inventario antes.",
    sourceFocus: "Para flujo de caja se usan registros internos, facturacion, obligaciones DGII y planificacion financiera basica.",
  }),
];
