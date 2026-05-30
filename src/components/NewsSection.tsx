import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  Compass, 
  TrendingUp, 
  User, 
  Newspaper,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Share2,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Impuestos' | 'Laboral' | 'Finanzas';
  categoryKey: 'impuestos' | 'laboral' | 'finanzas';
  summary: string;
  contentMarkdown: string;
  publishDate: string;
  readTime: string;
  author: string;
  tags: string[];
  relatedCalculatorSlug?: string;
  relatedCalculatorName?: string;
  isFeatured?: boolean;
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'dgii-efactura',
    title: 'Implementación Obligatoria de Facturación Electrónica para Grandes Contribuyentes',
    category: 'Impuestos',
    categoryKey: 'impuestos',
    summary: 'La DGII recuerda que los Grandes Contribuyentes Nacionales tienen como fecha límite definitiva para incorporarse al sistema de facturación electrónica en 2026. Conoce los plazos técnicos y fiscales.',
    contentMarkdown: `La Dirección General de Impuestos Internos (DGII) ha reafirmado que los plazos de incorporación al régimen de Facturación Electrónica obligatoria, según lo establecido por el calendario regulador de la Ley No. 512-23, no serán objeto de prórrogas discrecionales.

Este robusto sistema busca modernizar la recaudación fiscal, reducir la evasión y simplificar la contabilidad general de los contribuyentes.

### Requisitos Clave para la Emisión Electrónica:
1. **Certificado Digital para Firma Electrónica**: Emitido por una entidad de certificación acreditada por el Instituto Dominicano de las Telecomunicaciones (INDOTEL).
2. **Registro e Integración Técnica**: Completar las pruebas en el ambiente de desarrollo provisto por la DGII, garantizando el envío exitoso de los documentos estructurados en formato XML.
3. **Software Homologado**: Utilizar herramientas propias certificadas o contratar servicios de proveedores tecnológicos debidamente aprobados en la República Dominicana.

### Plazos de Implementación Obligatoria en 2026:
- **Grandes Contribuyentes Nacionales**: Fase final de obligatoriedad sin prórrogas.
- **Grandes Contribuyentes Locales y Medianos**: Integración paulatina a completarse durante el presente año fiscal.
- **Pequeños, Microempresas y Contribuyentes Ordinarios**: Incorporación progresiva estructurada según calendario.

### Consecuencias de Incumplimiento:
Aquellos contribuyentes obligados que emitan comprobantes tradicionales en papel fuera de contingencias autorizadas formalmente, perderán la deducibilidad del gasto para fines del Impuesto Sobre la Renta (ISR) y el crédito por adelanto del ITBIS frente a auditorías automáticas.

Le recomendamos verificar su estatus fiscal y dar seguimiento al timbrado XML inmediato.`,
    publishDate: '2026-05-28',
    readTime: '4 min',
    author: 'Comité Editorial de Impuestos NegocioRD',
    tags: ['DGII', 'Facturación Electrónica', 'XML', 'Impuestos', 'Ley 512-23'],
    relatedCalculatorSlug: 'calculadora-itbis',
    relatedCalculatorName: 'Calculadora de ITBIS',
    isFeatured: true
  },
  {
    id: 'reforma-cesantia-2026',
    title: 'Análisis de la Propuesta de Reforma Laboral: Modificaciones al Cálculo de Cesantía',
    category: 'Laboral',
    categoryKey: 'laboral',
    summary: 'El debate del proyecto de reforma al Código de Trabajo en el Congreso suscita interrogantes. Explicamos detalladamente cómo se estructurarían los cálculos de preaviso y cesantía bajo esta iniciativa.',
    contentMarkdown: `El diálogo tripartito entre el sector gubernamental, representantes sindicales y el sector empleador (COPARDOM) ha generado múltiples titulares en el país a raíz de la discusión sobre reformar el Código de Trabajo de la República Dominicana (Ley No. 16-92).

El punto neurálgico del proyecto gira en torno a la indemnización por despido injustificado o desahucio patronal, conocida comercialmente como el "auxilio de cesantía".

### ¿Cuáles son las propuestas principales en debate?
- **Blindaje de Derechos Adquiridos**: El proyecto contempla expresamente resguardar el pasivo acumulado por los trabajadores activos. Todo el tiempo laborado antes de la nueva ley se regiría estricta y legalmente bajo la fórmula clásica del Código de Trabajo de 1992.
- **Cuentas de Compensación Individual o Fideicomiso**: Se propone un innovador fondo de cesantía mensual, donde el patrono aporta un porcentaje recurrente a una cuenta de capitalización o fondo fiduciario a nombre del trabajador. Esto evitaría cargas financieras imprevistas para las PYMEs y reduciría litigios laborales.
- **Flexibilización de la Jornada Laboral**: Se discute reconocer explícitamente el teletrabajo estructurado y la modalidad de jornadas de cuatro días de labor ("4x3") con mayor flexibilidad de horario semanal.

### Cómo afectaría una liquidación según tu antigüedad:
Actualmente, las indemnizaciones ordinarias computan salarios promedio diarios multiplicados por factores explícitos:
- De 3 a 6 meses: 6 días de salario.
- De 6 a 12 meses: 13 días de salario.
- De 1 a 5 años: 21 días por cada año.
- Más de 5 años: 23 días por cada año.

Seguiremos auditando muy de cerca la evolución del marco legal en las comisiones senatoriales para actualizar nuestras bases de cálculo de prestaciones de manera inmediata el mismo día de su promulgación.`,
    publishDate: '2026-05-18',
    readTime: '6 min',
    author: 'Lic. Marcos Espinal - Asesor Corporativo Laboral',
    tags: ['Reforma', 'Cesantía', 'Código de Trabajo', 'Prestaciones', 'Ministerio de Trabajo'],
    relatedCalculatorSlug: 'calculadora-prestaciones-laborales',
    relatedCalculatorName: 'Simulador de Prestaciones Laborales',
    isFeatured: false
  },
  {
    id: 'bancentral-tasa-politica',
    title: 'Banco Central Mantiene la Tasa de Política Monetaria en 6.25% Anual',
    category: 'Finanzas',
    categoryKey: 'finanzas',
    summary: 'La medida del BCRD mantiene estables los costos de los préstamos hipotecarios y comerciales en un entorno macroeconómico seguro. Conoce el impacto en tus cuotas bancarias.',
    contentMarkdown: `El Banco Central de la República Dominicana (BCRD) anunció que mantendrá su tasa de política monetaria (TPM) en **6.25 % anual** luego de evaluar exhaustivamente las condiciones nacionales e internacionales de liquidez.

Asimismo, la tasa de la facilidad permanente de expansión de liquidez (repos a 1 día) permanece en **6.75 % anual**, mientras que la tasa de depósitos remunerados (overnight) se fija en **5.25 % anual**.

### Comportamiento de la Inflación y Escenario Nacional:
La inflación interanual se ha mantenido oscilando de forma consistente dentro del rango meta institucional de **4.0 % ± 1.0 %**, lo que obedece al éxito de los programas de canalización regulada de recursos financieros al sector industrial y agropecuario. La moneda nacional (DOP) exhibe estabilidad cambiaria, dinamizada por los ingresos récord de inversión extranjera directa, remesas familiares y actividades del sector turístico.

### Impacto Directo en Amortizaciones de Préstamos:
- **Préstamos Hipotecarios y de Consumo**: Al no registrarse presiones al alza en las tasas interbancarias, las carteras bancarias comerciales tenderán a estabilizar sus tasas de interés preferenciales de mediano plazo.
- **Estabilidad de las Cuotas**: Las personas físicas que contemplan adquirir viviendas mediante crédito hipotecario o préstamos para vehículos se beneficiarán de una menor oscilación y estabilidad en sus tablas de amortización calculadas con el método de cuota francesa constante en RD.

Te invitamos a simular tu financiamiento con nuestra calculadora especializada para prever el presupuesto requerido.`,
    publishDate: '2026-05-10',
    readTime: '3 min',
    author: 'Departamento de Estudios Macroeconómicos NegocioRD',
    tags: ['Banco Central', 'Crédito', 'Tasa de Interés', 'Finanzas', 'Hipotecario'],
    relatedCalculatorSlug: 'calculadora-cuota-prestamo',
    relatedCalculatorName: 'Calculadora de Préstamos',
    isFeatured: false
  },
  {
    id: 'tss-nuevos-topes-2026',
    title: 'Ajuste de Topes Salariales por la TSS: Nuevos Límites de Cotización obligatoria',
    category: 'Laboral',
    categoryKey: 'laboral',
    summary: 'Por disposición legal, la Tesorería de la Seguridad Social eleva los límites cotizables de AFP y SFS tras decretarse nuevos salarios mínimos en República Dominicana.',
    contentMarkdown: `De conformidad con el esquema regulatorio administrado por la Tesorería de la Seguridad Social (TSS) y amparado bajo la Ley 87-01, se ha notificado la reestructuración automática en los límites salariales oficiales para el cálculo de los descuentos reglamentarios de nómina.

Esta medida ocurre por mandamiento de ley cada vez que se efectúa un incremento en los salarios mínimos legales para el sector privado no sectorizado del país.

### ¿Cómo se calculan los topes de retención?
La TSS define límites de base de cotización de la siguiente manera:
1. **Seguro de Vejez, Discapacidad y Sobrevivientes (AFP)**: Sujeto a un tope salarial de **20 salarios mínimos nacionales** vigentes.
2. **Seguro Familiar de Salud (SFS)**: Sujeto a un tope salarial de **10 salarios mínimos nacionales** vigentes.
3. **Seguro de Riesgos Laborales (SRL)**: Sujeto a un tope de **4 salarios mínimos nacionales** vigentes.

### Ejemplo Informativo y Financiero:
Al incrementarse la base imponible ponderada de referencia, aquellos asalariados corporativos que perciban ingresos extraordinarios (por encima de RD$ 150,000 en adelante) percibirán que su descuento por AFP (2.87%) y SFS (3.04%) se computará calculando sobre un techo superior antes de aplicar el freno definitivo del tope de ley.

Igualmente, la prima patronal aportada (SFS, AFP, SRL e INFOTEP) se expandirá para la empresa correspondiente. Para prever el costo total exacto de su nómina, emplee nuestra Calculadora Completa de la TSS con soporte de topes oficiales actualizados en tiempo real.`,
    publishDate: '2026-05-02',
    readTime: '4 min',
    author: 'Comité de Auditoría de Nóminas NegocioRD',
    tags: ['TSS', 'AFP', 'SFS', 'Nómina', 'Seguridad Social', 'Topes de Ley'],
    relatedCalculatorSlug: 'calculadora-retenciones-dgii',
    relatedCalculatorName: 'Calculadora de Retenciones',
    isFeatured: false
  },
  {
    id: 'dgii-exencion-isr-anual',
    title: 'Mínimo Exento del Impuesto Sobre la Renta (ISR) para el Ejercicio Fiscal 2026',
    category: 'Impuestos',
    categoryKey: 'impuestos',
    summary: 'La DGII comparte las escalas oficiales del ISR. Te presentamos de manera detallada los límites de ingresos anuales libres de impuestos y las tasas del excedente correspondientes.',
    contentMarkdown: `La Dirección General de Impuestos Internos (DGII) aplica la escala progresiva vigente para personas físicas, determinando quiénes se encuentran en exención de pagos tributarios y quiénes deben ser retenidos.

El Código Tributario establece que la retención de Impuesto Sobre la Renta ocurre sobre los salarios brutos devengados una vez deducidos los aportes reglamentarios del trabajador para la Seguridad Social (TSS).

### Escala de Tasas Progresivas Vigente en 2026:
- **Rentas hasta RD$ 416,220.00 anuales**: Exentas de tributación (**RD$ 34,685.00 mensuales**).
- **Rentas desde RD$ 416,220.01 hasta RD$ 624,329.00 anuales**: Gravadas con un **15 %** sobre el excedente de RD$ 416,220.00.
- **Rentas desde RD$ 624,329.01 hasta RD$ 867,123.00 anuales**: Pagan una cuota de **RD$ 31,216.00** más el **20 %** sobre el excedente de RD$ 624,329.01.
- **Rentas desde RD$ 867,123.01 anuales en adelante**: Pagan una cuota de **RD$ 79,776.00** más el **25 %** sobre el excedente de RD$ 867,123.01.

### Nota Operativa para Contadores y Asalariados:
Muchos asalariados estiman su ISR multiplicando directamente la tasa. No obstante, el cálculo es estrictamente marginal sobre los excedentes de cada tramo impositivo, lo que reduce sustancialmente el impacto neto final.

Para comprobar de forma fidedigna y desglosada si su descuento nómina mensual se calcula de acuerdo con los reglamentos gubernamentales oficiales de República Dominicana, ingrese su salario bruto nominal en nuestro simulador automatizado.`,
    publishDate: '2026-04-20',
    readTime: '5 min',
    author: 'Cátedra de Finanzas Corporativas NegocioRD',
    tags: ['ISR', 'DGII', 'Renta', 'Impuestos', 'Exenciones'],
    relatedCalculatorSlug: 'calculadora-retenciones-dgii',
    relatedCalculatorName: 'Simulador de Retenciones',
    isFeatured: false
  },
  {
    id: 'simplificado-tributacion-pym',
    title: 'Régimen Simplificado de Tributación (RST) de la DGII: Ventajas para Emprendedores',
    category: 'Finanzas',
    categoryKey: 'finanzas',
    summary: '¿Sabías que puedes declarar impuestos a base de tus ingresos o compras sin necesidad de llevar contabilidad organizada? Descubre las ventajas del RST en República Dominicana.',
    contentMarkdown: `El Régimen Simplificado de Tributación (RST) es una facilidad que ofrece la Dirección General de Impuestos Internos (DGII) para simplificar el cumplimiento tributario de pequeños y medianos contribuyentes en el país, tanto personas físicas como jurídicas.

Este régimen beneficia a miles de emprendedores dominicanos eliminando obligaciones de envío mensual de formatos y autorizando liquidaciones anuales simplificadas.

### Modalidades del Régimen Simplificado (RST):
1. **RST basado en Ingresos**: Diseñado para profesionales independientes, prestadores de servicios y pequeños negocios de manufactura cuyos ingresos anuales consolidados no superen el tope establecido por la DGII (ajustable por inflación, rondando los RD$ 11.2 millones).
2. **RST basado en Compras**: Orientado a comercios y minoristas cuyas importaciones y compras totales de mercancías en el territorio nacional no excedan el límite anual legal establecido por la ley (rondando los RD$ 51 millones).

### Ventajas Estratégicas para tu PYME:
- **Exención del Anticipo**: Las empresas en RST están liberadas de pagar los comunes e incómodos anticipos mensuales del Impuesto Sobre la Renta.
- **No Retención de ITBIS por Servicios**: Eliminación de pesados flujos administrativos de facturas corrientes.
- **Un Solo Pago Anual**: Liquidación unificada para facilidades operativas.

Le animamos a evaluar junto a su consultor tributario la viabilidad de incorporarse al RST de cara a optimizar sus flujos de caja. Para simular de inmediato el impacto del ITBIS en sus transacciones corporativas comunes, pruebe nuestras herramientas de desglose.`,
    publishDate: '2026-04-05',
    readTime: '5 min',
    author: 'Asociación de Emprendedores NegocioRD',
    tags: ['RST', 'DGII', 'Impuestos', 'PYMEs', 'Emprendimiento'],
    relatedCalculatorSlug: 'itbis-incluido',
    relatedCalculatorName: 'ITBIS Incluido',
    isFeatured: false
  }
];

interface NewsSectionProps {
  onBackToHome: () => void;
  onNavigateToCalcBySlug: (slug: string) => void;
}

export default function NewsSection({ onBackToHome, onNavigateToCalcBySlug }: NewsSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category state
  const [activeCategory, setActiveCategory] = useState<'All' | 'Impuestos' | 'Laboral' | 'Finanzas'>('All');

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Article engagement states (local only)
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5050);
    }
  };

  const toggleLike = (articleId: string) => {
    if (likedArticles.includes(articleId)) {
      setLikedArticles(likedArticles.filter(id => id !== articleId));
    } else {
      setLikedArticles([...likedArticles, articleId]);
    }
  };

  const toggleBookmark = (articleId: string) => {
    if (bookmarkedArticles.includes(articleId)) {
      setBookmarkedArticles(bookmarkedArticles.filter(id => id !== articleId));
    } else {
      setBookmarkedArticles([...bookmarkedArticles, articleId]);
    }
  };

  // Filtered and searched articles
  const filteredArticles = useMemo(() => {
    return NEWS_ARTICLES.filter(article => {
      const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
      
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' || 
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.contentMarkdown.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query)) ||
        article.author.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Featured article (first featured article found or default to first from data matching selection if not searching)
  const featuredArticle = useMemo(() => {
    if (searchQuery !== '') return null; // No featured spotlight during search
    
    // Find featured article in active category
    const list = NEWS_ARTICLES.filter(article => activeCategory === 'All' || article.category === activeCategory);
    return list.find(a => a.isFeatured) || list[0] || null;
  }, [activeCategory, searchQuery]);

  // Regular articles minus the featured spotlight
  const regularArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter(a => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Detail view of a clicked article */}
      {selectedArticle ? (
        <div className="max-w-4xl mx-auto">
          {/* Back breadcrumb */}
          <button
            onClick={() => {
              setSelectedArticle(null);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#0F766E] transition-colors mb-6 cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Volver a Actualidad & Normativas
          </button>

          <article className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-xs">
            {/* Meta tags header */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                selectedArticle.category === 'Impuestos' ? 'bg-teal-50 text-teal-700' :
                selectedArticle.category === 'Laboral' ? 'bg-amber-50 text-amber-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {selectedArticle.category}
              </span>
              <span className="text-gray-300 text-xs">•</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{selectedArticle.publishDate}</span>
              </div>
              <span className="text-gray-300 text-xs">•</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>{selectedArticle.readTime} de lectura</span>
              </div>
            </div>

            {/* Main title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] leading-tight mb-4">
              {selectedArticle.title}
            </h1>

            {/* Author info */}
            <div className="flex items-center gap-3 border-y border-gray-100 py-3.5 my-6">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">{selectedArticle.author}</span>
                <span className="text-[10px] text-gray-500">Redactor Oficial y Especialista Legal</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button 
                  onClick={() => toggleLike(selectedArticle.id)}
                  className={`p-1.5 rounded-md border flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors ${
                    likedArticles.includes(selectedArticle.id) 
                      ? 'bg-rose-50 border-rose-200 text-rose-600' 
                      : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>{likedArticles.includes(selectedArticle.id) ? 'Recomendado' : 'Recomendar'}</span>
                </button>
                <button 
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className={`p-1.5 rounded-md border cursor-pointer transition-colors ${
                    bookmarkedArticles.includes(selectedArticle.id) 
                      ? 'bg-teal-50 border-teal-200 text-teal-700' 
                      : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                  title="Guardar artículo"
                >
                  <Bookmark size={14} className={bookmarkedArticles.includes(selectedArticle.id) ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* Main summary callout */}
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-gray-150 text-gray-600 text-xs leading-relaxed mb-6 italic">
              <strong>Resumen Ejecutivo:</strong> {selectedArticle.summary}
            </div>

            {/* Detailed styled markup content parser */}
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed font-normal">
              {selectedArticle.contentMarkdown.split('\n\n').map((paragraph, idx) => {
                // Formatting heading
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base font-bold text-[#111827] pt-4 flex items-center gap-2">
                      <Newspaper size={16} className="text-[#0F766E]" />
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                
                // Formatting bullet points
                if (paragraph.includes('\n- ') || paragraph.includes('\n1. ') || paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={idx} className="space-y-2 pl-4 list-none my-3 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                      {items.map((it, i) => {
                        const cleanT = it.replace(/^(-|\d+\.)\s+\*\*/, '').replace(/\*\*$/, '').replace(/^\s*(-|\d+\.)\s+/, '');
                        
                        // Handle potential simple bold titles, like "**Title**: desc"
                        const parts = cleanT.split('**: ');
                        if (parts.length > 1) {
                          const boldHeader = parts[0].replace(/\*\*/g, '').replace(/^\*/, '');
                          return (
                            <li key={i} className="flex gap-2 text-xs text-gray-650">
                              <span className="text-[#0F766E] font-bold">✓</span>
                              <span><strong className="text-gray-950 font-bold">{boldHeader}:</strong> {parts[1]}</span>
                            </li>
                          );
                        }

                        return (
                          <li key={i} className="flex gap-2 text-xs text-gray-650">
                            <span className="text-[#0F766E] font-bold">✓</span>
                            <span>{cleanT.replace(/\*\*/g, '')}</span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                // Regular formatting with simple bold replacements
                const parsedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return (
                  <p 
                    key={idx} 
                    dangerouslySetInnerHTML={{ __html: parsedParagraph }}
                    className="text-gray-650"
                  />
                );
              })}
            </div>

            {/* Tags footer */}
            <div className="flex flex-wrap gap-1.5 mt-8 pt-6 border-t border-gray-100">
              {selectedArticle.tags.map((tag) => (
                <div key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-md text-[11px] text-[#6B7280] font-medium border border-gray-150">
                  <Tag size={10} className="text-gray-400" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>

            {/* AdSense In-Article Ad Representative Block */}
            <div className="mt-8 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Anuncio de AdSense en el Artículo</span>
              <div className="h-16 bg-white border border-gray-100 flex justify-center items-center rounded-lg text-[11px] text-gray-450 font-mono">
                Publicidad Adaptable de Enlaces o Recomendada — Basada en Contexto Fiscal/Laboral
              </div>
            </div>

            {/* CTA to actual application calculator tool */}
            {selectedArticle.relatedCalculatorSlug && (
              <div className="mt-8 p-5 bg-teal-50 border border-teal-150 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block mb-1">Simulador Integrado</span>
                  <h4 className="text-sm font-bold text-teal-950">Confirmar cálculos en tiempo real</h4>
                  <p className="text-xs text-teal-800 mt-0.5">Utilice nuestro simulador parametrizado según lo expuesto.</p>
                </div>
                <button
                  onClick={() => {
                    if (selectedArticle.relatedCalculatorSlug) {
                      onNavigateToCalcBySlug(selectedArticle.relatedCalculatorSlug);
                    }
                  }}
                  className="px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-lg hover:opacity-95 cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95 transition-all"
                >
                  Prueba {selectedArticle.relatedCalculatorName || 'Calculadora'}
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </article>

          {/* Engagement bar disclaimer */}
          <div className="mt-6 p-4 bg-gray-50 border rounded-xl flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-[11px]">
              <AlertCircle size={14} className="text-gray-400" />
              La información contenida se redacta meramente bajo carácter consultivo y de difusión general.
            </span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Enlace del artículo copiado al portapapeles.');
              }}
              className="text-[#0F766E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Share2 size={12} />
              Compartir
            </button>
          </div>
        </div>
      ) : (
        // Standard listings view
        <div className="space-y-8">
          
          {/* Header titles */}
          <div className="flex flex-col border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] mb-1.5 capitalize tracking-widest">
              <span>Noticias & Normativas</span>
              <span>/</span>
              <span className="text-gray-400">Actualidad Fiscal y Laboral Dominica 2026</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
              Actualidad Legal & Alertas
            </h1>
            <p className="text-[#6B7280] text-sm mt-1.5 leading-relaxed max-w-4xl">
              Monitoreo y reseñas exhaustivas sobre las modificaciones legales decretadas por la DGII, el Ministerio de Trabajo y la Tesorería de la Seguridad Social para mantener a su negocio en estricto cumplimiento normativo.
            </p>
          </div>

          {/* Search bar & categories filter inline */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-2">
            
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {(['All', 'Impuestos', 'Laboral', 'Finanzas'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-teal-50 border-teal-200 text-[#0F766E] ring-1 ring-[#0F766E]/20'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat === 'All' ? 'Todas las áreas' : cat}
                </button>
              ))}
            </div>

            {/* Simple search bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artículos o legislación específica..."
                className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all text-[#111827]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC WORKSPACE GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Articles core column (9 cols on large screen) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SPOTLIGHT FEATURED FRAME : Only visible when not searching */}
              {featuredArticle && (
                <div 
                  onClick={() => {
                    setSelectedArticle(featuredArticle);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="bg-white rounded-2xl border-2 border-teal-600/20 p-6 md:p-8 shadow-xs hover:border-[#0F766E] transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 py-1.5 px-4 bg-[#0F766E] text-white text-[9px] font-bold uppercase tracking-widest rounded-bl-xl flex items-center gap-1 shadow-sm">
                    <Sparkles size={10} />
                    Destacado
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-3.5 inline-block ${
                    featuredArticle.category === 'Impuestos' ? 'bg-teal-50 text-teal-700' :
                    featuredArticle.category === 'Laboral' ? 'bg-amber-50 text-amber-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {featuredArticle.category}
                  </span>

                  <h2 className="text-xl md:text-2xl font-black text-[#111827] group-hover:text-[#0F766E] transition-colors leading-tight mb-3">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-5">
                    {featuredArticle.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {featuredArticle.publishDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {featuredArticle.readTime}
                      </span>
                    </div>
                    <span className="text-[#0F766E] font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Leer análisis completo
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              )}

              {/* LIST OF OTHER RELEVANT PUBLICATIONS */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1 rounded-sm">
                  <Newspaper size={14} className="text-gray-400" />
                  {searchQuery ? `Resultados de Búsqueda (${filteredArticles.length})` : 'Boletines de Normativa Vigente'}
                </h3>

                {filteredArticles.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-dashed">
                      <Search size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-[#111827]">Sin boletines encontrados</h4>
                    <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                      No encontramos ningún artículo que coincida con "{searchQuery}". Revise el término o seleccione un filtro alternativo de la barra superior.
                    </p>
                    <button 
                      onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                      className="px-4 py-1.5 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:opacity-95"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {regularArticles.map((article) => (
                      <div 
                        key={article.id}
                        onClick={() => {
                          setSelectedArticle(article);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#0F766E] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between h-56 group"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              article.category === 'Impuestos' ? 'bg-teal-50 text-teal-700' :
                              article.category === 'Laboral' ? 'bg-amber-50 text-amber-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {article.category}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                              <Calendar size={10} />
                              {article.publishDate}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-[#111827] mb-2 group-hover:text-[#0F766E] transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h4>
                          
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
                            {article.summary}
                          </p>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                          <span>{article.readTime} de análisis</span>
                          <span className="text-[#0F766E] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Ver más
                            <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column (4 cols on large screen) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* ALERT NOTIFICATION CARDS */}
              <div className="bg-[#0F766E] text-white p-5 rounded-2xl shadow-md border border-teal-700 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Compass size={18} className="text-teal-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100">Portal Alertas NegocioRD</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-snug text-white">Últimas Decisiones de la Suprema Corte</h4>
                  <p className="text-[11px] text-teal-100/90 leading-relaxed mt-1">
                    La tercera sala emite precedente declarando exentos de cotización los subsidios por maternidad o enfermedad comunes otorgados directamente por el empleador como incentivo extraordinario.
                  </p>
                </div>
                <div className="pt-2 border-t border-teal-500/30 text-[10px] text-teal-200 font-bold flex justify-between items-center">
                  <span>Vigencia: Inmediata</span>
                  <span>Año 2026</span>
                </div>
              </div>

              {/* NEWSLETTER SUBSCRIBE CONTAINER */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#0F766E] tracking-wider block mb-1">Boletines Directos</span>
                <h4 className="font-bold text-sm text-[#111827] leading-snug">
                  Suscripción a Alertas de Cambio de Leyes
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed mt-1 mb-4">
                  Reciba de primera mano en su bandeja las notificaciones del ITBIS, modificaciones fiscales de escala o normativas de pensiones.
                </p>

                {newsletterSuccess ? (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2 text-[11px] text-teal-800">
                    <CheckCircle2 size={14} className="text-[#0F766E] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">¡Suscripción confirmada!</strong>
                      Usted ya es parte del boletín corporativo de NegocioRD.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#0F766E] text-[#111827]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:opacity-95 transition-all text-center"
                    >
                      Suscribirme Ahora
                    </button>
                  </form>
                )}
              </div>

              {/* Sidebar AdSense banner space */}
              <div className="bg-white border border-gray-205 rounded-2xl p-4 shadow-xs text-center border-dashed">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1.5">Bloque Lateral AdSense (300 x 250)</span>
                <div className="h-52 bg-gray-50 border border-gray-100 flex flex-col justify-center items-center rounded-lg text-xs text-gray-400 font-mono p-4">
                  <span>Anuncio Patrocinado</span>
                  <span className="text-[10px] text-gray-400 font-normal text-center mt-1">Anuncio tipo Rectángulo Mediano para rentabilizar visitas corporativas</span>
                </div>
              </div>

              {/* RECOMMENDED READINGS */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Consejos Rápidos para PYMEs
                </h4>
                <div className="space-y-3.5 text-xs">
                  <div className="flex gap-2">
                    <span className="text-[#0F766E] font-bold">●</span>
                    <p className="text-gray-650 leading-relaxed">
                      Guarde copias XML de todos sus comprobantes antes de autorizar firmas de facturas electrónicas.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#0F766E] font-bold">●</span>
                    <p className="text-gray-650 leading-relaxed">
                      El aguinaldo navideño es intocable: no está sujeto a retenciones impositivas ni embargos ordinarios.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#0F766E] font-bold">●</span>
                    <p className="text-gray-650 leading-relaxed">
                      Los pagos correspondientes a dietas reportadas de forma justificada no integran la nómina imponible TCS.
                    </p>
                  </div>
                </div>
              </div>

            </aside>

          </div>

        </div>
      )}

    </div>
  );
}
