export const EDITORIAL_REVIEW_DATE = "11 de agosto de 2026";

export const OFFICIAL_SOURCES = [
  { name: "DGII", url: "https://dgii.gov.do", scope: "ITBIS, ISR, retenciones y recargos tributarios" },
  { name: "TSS", url: "https://tss.gob.do", scope: "aportes y topes del regimen contributivo" },
  { name: "Ministerio de Trabajo", url: "https://mt.gob.do", scope: "Codigo de Trabajo y derechos laborales" },
  { name: "CNSS", url: "https://www.cnss.gob.do", scope: "resoluciones del Sistema Dominicano de Seguridad Social" },
  { name: "SISALRIL", url: "https://www.sisalril.gob.do", scope: "Seguro Familiar de Salud y riesgos laborales" },
  { name: "SIPEN", url: "https://www.sipen.gob.do", scope: "pensiones y aportes previsionales" }
] as const;

export const EDITORIAL_PAGES = {
  "autores/equipo-editorial": {
    title: "Equipo editorial | Tu Negocio RD",
    description: "Perfil del equipo editorial de Tu Negocio RD, metodologia de revision, fuentes oficiales y alcance informativo.",
    heading: "Equipo editorial Tu Negocio RD",
    intro: "El Equipo editorial Tu Negocio RD publica, revisa y mantiene contenidos educativos sobre nomina, impuestos, seguridad social, prestaciones laborales y finanzas practicas para Republica Dominicana.",
    sections: [
      ["Experiencia del proyecto", "El equipo combina desarrollo de herramientas digitales, revision documental y control de calidad de calculos. Las paginas se construyen para explicar conceptos, no para emitir certificaciones oficiales ni sustituir asesoria profesional."],
      ["Temas cubiertos", "Nomina, salario neto, TSS, AFP, SFS, ISR, ITBIS, retenciones, prestaciones laborales, vacaciones, regalia pascual, costos patronales y finanzas practicas para pymes."],
      ["Proceso de revision", "Cada pieza editorial se contrasta con fuentes primarias, se revisa contra calculadoras internas cuando aplica y se actualiza cuando una fuente oficial cambia o un usuario reporta una posible inconsistencia."],
      ["Fuentes preferidas", "Priorizamos DGII, TSS, CNSS, Ministerio de Trabajo, SISALRIL y SIPEN. Las fuentes secundarias se usan solo como contexto y no reemplazan publicaciones institucionales."],
      ["Correcciones", "Los errores reportados se revisan por impacto: si afectan una formula, tambien se revisan ejemplos, metadata, guias relacionadas y pruebas de calculo."],
      ["Alcance profesional", "La informacion tiene fines educativos e informativos. Para decisiones legales, fiscales, laborales o financieras definitivas, recomendamos validar con la institucion correspondiente o con un asesor calificado."]
    ]
  },
  metodologia: {
    title: "Metodologia de calculo | Tu Negocio RD",
    description: "Conoce como Tu Negocio RD documenta formulas, fuentes, fechas de revision y limites de sus calculadoras.",
    heading: "Metodologia de calculo y revision",
    intro: "Cada calculadora parte de una formula documentada, parametros versionados y pruebas con casos de frontera. Los valores fiscales no se cambian automaticamente cuando una fuente externa difiere: primero quedan pendientes de revision.",
    sections: [
      ["Fuentes primarias", "Priorizamos publicaciones de DGII, TSS, CNSS, Ministerio de Trabajo, SISALRIL y SIPEN. Una nota de prensa o sitio secundario no reemplaza la norma o resolucion aplicable."],
      ["Control de cambios", "Las verificaciones automaticas conservan el ultimo valor aprobado. Toda diferencia queda registrada como candidata y requiere validacion humana antes de afectar resultados."],
      ["Pruebas", "Validamos ejemplos conocidos, topes, valores cero, limites de tramo y redondeos. El QA incluye rutas, metadata, accesibilidad basica y comportamiento en movil."],
      ["Alcance", "Los resultados son estimaciones informativas. Casos con comisiones, acuerdos, sentencias, exenciones o tratamientos especiales requieren revision profesional."]
    ]
  },
  "politica-editorial": {
    title: "Politica editorial | Tu Negocio RD",
    description: "Politica de autoría, correcciones, fuentes y revision del contenido fiscal y laboral de Tu Negocio RD.",
    heading: "Politica editorial y de correcciones",
    intro: "El contenido se publica bajo la responsabilidad del Equipo editorial Tu Negocio RD. No atribuimos credenciales personales que no puedan verificarse y distinguimos informacion, estimaciones y opinion.",
    sections: [
      ["Autoría responsable", "Las paginas tecnicas identifican al equipo editorial y la fecha de revision. Cuando participe un especialista externo, su nombre y alcance se mostraran solo con autorizacion y evidencia verificable."],
      ["Correcciones", "Una correccion material se aplica en la formula, el texto relacionado y las pruebas. Los usuarios pueden reportar errores desde la pagina de contacto."],
      ["Noticias", "Una noticia requiere fuentes oficiales verificables y revision editorial. El contenido generado como borrador nunca se publica automaticamente."],
      ["Publicidad", "Los anuncios se identifican como publicidad y no influyen en formulas, resultados ni conclusiones editoriales."]
    ]
  },
  "fuentes-oficiales": {
    title: "Fuentes oficiales | Tu Negocio RD",
    description: "Directorio de instituciones oficiales usadas para revisar calculadoras fiscales, laborales y de seguridad social en RD.",
    heading: "Fuentes oficiales y ambito de uso",
    intro: `Directorio de fuentes primarias consultadas. Ultima revision general: ${EDITORIAL_REVIEW_DATE}.`,
    sections: OFFICIAL_SOURCES.map((source) => [source.name, source.scope])
  },
  "como-calcular-itbis-en-republica-dominicana": {
    title: "Como calcular ITBIS en Republica Dominicana | Tu Negocio RD",
    description: "Guia practica para calcular ITBIS en RD, agregarlo a una base, extraerlo de un total y evitar errores comunes de facturacion.",
    heading: "Como calcular ITBIS en Republica Dominicana",
    intro: "El ITBIS se calcula sobre la base imponible de bienes o servicios gravados. Esta guia explica la diferencia entre agregar ITBIS, separar ITBIS incluido y revisar el total antes de facturar.",
    sections: [
      ["Formula para agregar ITBIS", "Para calcular la tasa general, multiplica la base por 0.18. Una base de RD$10,000 genera RD$1,800 de ITBIS y un total de RD$11,800."],
      ["Formula para extraer ITBIS incluido", "Cuando un precio ya incluye ITBIS, divide el total entre 1.18 para obtener la base. Luego resta la base al total para conocer el impuesto incluido."],
      ["Error frecuente", "Restar 18% directamente al total no separa correctamente el impuesto. Ese metodo reduce de mas la base porque el total ya contiene base e impuesto."],
      ["Cuando revisar la tasa", "La tasa general es 18%, pero algunos bienes pueden tener tratamiento distinto. Antes de declarar o emitir una factura sensible, confirma la tasa aplicable con la DGII o tu asesor."]
    ],
    relatedLinks: [
      ["/calculadora-itbis-rd", "Calculadora de ITBIS"],
      ["/temas/itbis-retenciones", "Centro de ITBIS y retenciones"],
      ["/fuentes-oficiales", "Fuentes oficiales"]
    ]
  },
  "itbis-incluido-vs-itbis-excluido": {
    title: "ITBIS incluido vs excluido: diferencia y ejemplos RD",
    description: "Aprende la diferencia entre precio con ITBIS incluido y precio mas ITBIS en Republica Dominicana, con ejemplos simples para facturas.",
    heading: "ITBIS incluido vs ITBIS excluido",
    intro: "La diferencia importa porque cambia la base imponible, el total de la factura y la forma de explicar el precio al cliente.",
    sections: [
      ["Precio mas ITBIS", "El precio excluido parte de una base sin impuesto. Si la base es RD$5,000 y la tasa es 18%, el impuesto es RD$900 y el total es RD$5,900."],
      ["Precio con ITBIS incluido", "El precio incluido ya contiene el impuesto. Si el total es RD$5,900, la base se obtiene dividiendo entre 1.18; el ITBIS es la diferencia entre total y base."],
      ["Uso comercial", "En cotizaciones B2B suele mostrarse la base y el ITBIS separado. En ventas al consumidor puede mostrarse el total, pero la contabilidad necesita separar los importes."],
      ["Revision antes de publicar precios", "Si vendes servicios o productos gravados, define si tus precios comerciales incluyen ITBIS para evitar diferencias entre ventas, factura y margen real."]
    ],
    relatedLinks: [
      ["/calculadora-itbis-rd", "Calcular ITBIS incluido o excluido"],
      ["/como-calcular-itbis-en-republica-dominicana", "Como calcular ITBIS"],
      ["/guia/itbis-facturas-y-ncf-guia-practica", "Guia de facturas y NCF"]
    ]
  },
  "salario-bruto-vs-salario-neto-rd": {
    title: "Salario bruto vs salario neto en RD | Diferencias 2026",
    description: "Diferencia entre salario bruto y salario neto en Republica Dominicana: AFP, SFS, ISR y descuentos que afectan lo que recibe el empleado.",
    heading: "Salario bruto vs salario neto en Republica Dominicana",
    intro: "El salario bruto es el monto pactado antes de descuentos. El salario neto es lo que recibe el trabajador despues de aplicar los descuentos de nomina y otros conceptos autorizados.",
    sections: [
      ["Que es salario bruto", "Es el sueldo base mensual antes de AFP, SFS, ISR u otros descuentos. Tambien sirve como punto de partida para estimar costos laborales."],
      ["Que es salario neto", "Es el monto que queda despues de descuentos obligatorios y voluntarios. En una nomina ordinaria, los descuentos obligatorios principales son AFP, SFS e ISR cuando aplica."],
      ["Por que no siempre coincide con la quincena", "El neto mensual puede dividirse por quincena, pero comisiones, prestamos, ausencias, horas extras o ajustes internos pueden cambiar el pago de un periodo."],
      ["Como estimarlo correctamente", "Primero calcula TSS del trabajador, luego determina si el ingreso neto gravable genera ISR y finalmente resta todos los descuentos del salario bruto."]
    ],
    relatedLinks: [
      ["/calculadora-nomina-rd", "Calculadora de nomina"],
      ["/temas/nomina-tss", "Centro de nomina y TSS"],
      ["/si-gano-50000-cuanto-me-descuentan", "Ejemplo con RD$50,000"]
    ]
  },
  "descuentos-de-nomina-en-republica-dominicana": {
    title: "Descuentos de nomina en Republica Dominicana | AFP, SFS e ISR",
    description: "Resumen de los descuentos de nomina mas comunes en RD: AFP, SFS, ISR, prestamos y otros conceptos que afectan el salario neto.",
    heading: "Descuentos de nomina en Republica Dominicana",
    intro: "Los descuentos de nomina reducen el salario bruto hasta llegar al monto neto. Algunos son obligatorios por ley y otros dependen de acuerdos, prestamos o beneficios internos.",
    sections: [
      ["AFP", "Es el aporte del trabajador al sistema de pensiones. Se calcula como porcentaje del salario cotizable, respetando el tope vigente."],
      ["SFS", "Es el aporte del trabajador al Seguro Familiar de Salud. Tambien usa un porcentaje y un tope cotizable propio."],
      ["ISR", "Aplica cuando la renta neta gravable supera el tramo exento de la escala anual de la DGII. Se calcula despues de descontar aportes de seguridad social del trabajador."],
      ["Otros descuentos", "Prestamos, anticipos, cooperativas, seguros voluntarios o ausencias deben estar documentados. No deben confundirse con AFP, SFS o ISR."]
    ],
    relatedLinks: [
      ["/calculadora-nomina-rd", "Calcular descuentos"],
      ["/calculadora-tss-rd", "Calculadora TSS"],
      ["/calculadora-isr-rd", "Calculadora ISR"]
    ]
  },
  "retencion-isr-empleados-rd": {
    title: "Retencion ISR empleados RD 2026 | Como se calcula",
    description: "Explicacion de la retencion de ISR a empleados en Republica Dominicana: renta neta, escala DGII y relacion con AFP y SFS.",
    heading: "Retencion de ISR a empleados en RD",
    intro: "La retencion de ISR a asalariados se calcula sobre una renta neta anualizada, no simplemente aplicando un porcentaje fijo al salario mensual.",
    sections: [
      ["Orden del calculo", "Primero se descuentan los aportes del trabajador a AFP y SFS. Luego se anualiza la renta neta y se compara con la escala progresiva vigente."],
      ["Tramo exento", "Si la renta neta anual no supera el tramo exento, el empleado no tendria retencion de ISR en ese escenario ordinario."],
      ["Tasas progresivas", "Cuando la renta supera el tramo exento, la retencion se calcula por tramos. Por eso dos salarios cercanos pueden tener diferencias visibles cuando cruzan un umbral."],
      ["Casos que cambian el resultado", "Bonificaciones, comisiones, ingresos variables, dependientes o tratamientos especiales pueden modificar la base y requieren revisar el caso concreto."]
    ],
    relatedLinks: [
      ["/calculadora-isr-rd", "Calcular ISR"],
      ["/guia/guia-completa-isr-dominicano", "Guia completa de ISR"],
      ["/temas/isr-asalariados", "Centro ISR asalariados"]
    ]
  },
  "descuento-tss-salario-rd": {
    title: "Descuento TSS por salario en RD | AFP, SFS y topes",
    description: "Guia para entender el descuento TSS del empleado en Republica Dominicana, incluyendo AFP, SFS y topes cotizables.",
    heading: "Descuento TSS por salario en Republica Dominicana",
    intro: "La TSS agrupa aportes de seguridad social. En la nomina del empleado se reflejan principalmente AFP y SFS, mientras el empleador asume aportes adicionales.",
    sections: [
      ["Aporte AFP del empleado", "El aporte de pensiones se calcula sobre el salario cotizable hasta el tope de pensiones vigente."],
      ["Aporte SFS del empleado", "El Seguro Familiar de Salud se calcula sobre el salario cotizable hasta su propio tope. No siempre coincide con el tope de AFP."],
      ["Aportes patronales", "El costo de empresa incluye aportes adicionales que no se descuentan del salario neto del trabajador, pero si importan para presupuestar nomina."],
      ["Por que existen topes", "Los topes limitan la base maxima sobre la que se aplican ciertos porcentajes. En salarios altos, una parte del sueldo puede no cotizar para un concepto especifico."]
    ],
    relatedLinks: [
      ["/calculadora-tss-rd", "Calculadora TSS"],
      ["/temas/nomina-tss", "Centro de nomina y TSS"],
      ["/descuentos-de-nomina-en-republica-dominicana", "Descuentos de nomina"]
    ]
  },
  "liquidacion-por-renuncia-rd": {
    title: "Liquidacion por renuncia en RD | Derechos adquiridos",
    description: "Que puede corresponder en una renuncia en Republica Dominicana: vacaciones pendientes, salario de Navidad proporcional y limites sobre cesantia.",
    heading: "Liquidacion por renuncia en Republica Dominicana",
    intro: "En una renuncia ordinaria, el trabajador conserva derechos adquiridos pendientes, pero no necesariamente recibe todos los conceptos que aplican en una terminacion por desahucio.",
    sections: [
      ["Derechos adquiridos", "Pueden incluir vacaciones pendientes, salario de Navidad proporcional y salarios no pagados, segun el tiempo trabajado y los pagos ya recibidos."],
      ["Cesantia y preaviso", "La renuncia ordinaria no genera automaticamente auxilio de cesantia ni preaviso a favor del trabajador. La causa de salida es clave."],
      ["Documentos utiles", "Contrato, historial salarial, fecha de ingreso, fecha de salida, pagos recibidos y comunicaciones formales ayudan a revisar el calculo."],
      ["Cuando pedir revision", "Si hay desacuerdo sobre la causa de terminacion, salario computable o pagos pendientes, conviene validar con el Ministerio de Trabajo o asesoria laboral."]
    ],
    relatedLinks: [
      ["/calculadora-liquidacion-laboral-rd", "Calculadora de liquidacion"],
      ["/temas/liquidacion-laboral", "Centro de liquidacion laboral"],
      ["/guia/desahucio-despido-y-renuncia-diferencias", "Diferencias entre salida laboral"]
    ]
  },
  "liquidacion-por-despido-rd": {
    title: "Liquidacion por despido en RD | Que revisar",
    description: "Guia para entender que revisar en una liquidacion por despido o terminacion laboral en Republica Dominicana.",
    heading: "Liquidacion por despido en Republica Dominicana",
    intro: "La liquidacion depende de la causa real de terminacion, la antiguedad, el salario ordinario y los derechos adquiridos pendientes.",
    sections: [
      ["Identificar la causa", "No es lo mismo despido, desahucio, renuncia o terminacion por mutuo acuerdo. Cada escenario cambia los conceptos que pueden aplicar."],
      ["Conceptos posibles", "Dependiendo del caso, pueden evaluarse preaviso, cesantia, vacaciones pendientes, salario de Navidad proporcional y salarios vencidos."],
      ["Salario de referencia", "El salario ordinario computable y el promedio correcto son determinantes. Comisiones o pagos variables requieren una revision cuidadosa."],
      ["Validacion", "La calculadora ayuda a estimar, pero un conflicto laboral debe revisarse con documentos y, si procede, con el Ministerio de Trabajo."]
    ],
    relatedLinks: [
      ["/calculadora-liquidacion-laboral-rd", "Calcular liquidacion"],
      ["/calculadora-prestaciones-laborales", "Prestaciones laborales"],
      ["/temas/liquidacion-laboral", "Guias laborales"]
    ]
  },
  "nomina-para-pequenas-empresas-rd": {
    title: "Nomina para pequenas empresas RD | Guia practica",
    description: "Guia para preparar una nomina basica en una pequena empresa dominicana: salario bruto, TSS, ISR, costo patronal y soporte documental.",
    heading: "Nomina para pequenas empresas en RD",
    intro: "Una nomina ordenada ayuda a conocer el costo real de contratar, evitar errores de descuentos y conservar soporte ante revisiones internas o institucionales.",
    sections: [
      ["Datos minimos", "Registra salario bruto, periodicidad de pago, fecha de ingreso, tipo de contrato, descuentos autorizados y variaciones del periodo."],
      ["Descuentos del empleado", "AFP, SFS e ISR deben calcularse de forma separada. Mezclarlos dificulta explicar el salario neto y revisar diferencias."],
      ["Costo patronal", "La empresa debe presupuestar aportes patronales y otros costos asociados que no se descuentan directamente al trabajador."],
      ["Control mensual", "Antes de pagar, compara salario bruto, descuentos, neto, novedades y soportes. Un pequeno error repetido puede convertirse en una deuda acumulada."]
    ],
    relatedLinks: [
      ["/calculadora-nomina-rd", "Calculadora de nomina"],
      ["/guia/como-preparar-una-nomina-para-pyme-rd", "Guia de nomina pyme"],
      ["/temas/nomina-tss", "Centro nomina y TSS"]
    ]
  },
  "factura-con-comprobante-fiscal-rd": {
    title: "Factura con comprobante fiscal RD | NCF e ITBIS",
    description: "Que revisar en una factura con comprobante fiscal en Republica Dominicana: NCF, ITBIS, base imponible y retenciones.",
    heading: "Factura con comprobante fiscal en Republica Dominicana",
    intro: "Una factura con comprobante fiscal debe separar datos comerciales, base imponible, impuestos y el tipo de NCF usado segun la operacion.",
    sections: [
      ["Que es el NCF", "El Numero de Comprobante Fiscal identifica la factura para fines tributarios. Su tipo depende del cliente y del uso fiscal de la compra."],
      ["Base e ITBIS", "La factura debe distinguir la base imponible del ITBIS cuando aplica. Si el precio fue comunicado con impuesto incluido, aun asi debe separarse internamente."],
      ["Retenciones", "Algunos servicios pueden estar sujetos a retenciones de ISR o ITBIS segun quien paga, quien factura y la naturaleza de la operacion."],
      ["Revision antes de enviar", "Verifica RNC o cedula, tipo de comprobante, descripcion, monto, ITBIS, retenciones y fecha. Un error puede afectar cobro, credito fiscal o declaracion."]
    ],
    relatedLinks: [
      ["/calculadora-itbis-rd", "Calculadora ITBIS"],
      ["/calculadora-retenciones-dgii", "Calculadora retenciones"],
      ["/guia/itbis-facturas-y-ncf-guia-practica", "Guia ITBIS, facturas y NCF"]
    ]
  }
} as const;
