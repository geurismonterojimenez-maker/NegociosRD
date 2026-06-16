export const EDITORIAL_REVIEW_DATE = "10 de junio de 2026";

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
  }
} as const;
