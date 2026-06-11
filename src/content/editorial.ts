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
