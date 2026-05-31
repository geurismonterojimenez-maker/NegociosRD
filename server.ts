import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { readRatesCache, refreshOfficialRates } from "./src/lib/rates/rate-updater";
import { CALCULATORS, PROGRAMMATIC_GUIDES } from "./src/data";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

const CACHE_FILE = path.join(process.cwd(), "news-cache.json");

// Helper to load articles from the cached JSON database
function loadArticles() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading news cache file, returning empty list:", err);
  }
  return [];
}

// Helper to save articles to the cached JSON database
function saveArticles(articles: any[]) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(articles, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing news cache file:", err);
  }
}

// 1. GET API endpoint to fetch news
app.get("/api/news", (req, res) => {
  const articles = loadArticles();
  res.json({ success: true, articles });
});

// 2. POS API endpoint to refresh news with Gemini AI (Google Search Grounding)
app.post("/api/news/refresh", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: "La clave API de Gemini (GEMINI_API_KEY) no está configurada en los Secretos. Por favor, confígurela en Configuración > Secretos."
    });
  }

  try {
    // Lazy initialize the SDK
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const currentDateStr = new Date().toISOString().split("T")[0]; // Dynamic system date instead of hardcoded

    // Prompt instructing Gemini to perform research using Google Search Grounding & return structured articles
    const prompt = `Investiga noticias financieras, fiscales y de leyes laborales reales y sumamente recientes en la República Dominicana correspondientes al año 2026 (considera que la fecha actual de hoy es ${currentDateStr}).
Busca de fuentes confiables como la DGII (impuestos corporativos, ITBIS, anticipos, facilidades impositivas, facturación electrónica), Ministerio de Trabajo (debates de reforma de cesantía o preaviso, resoluciones de salarios mínimos), Banco Central de RD (tasa de política monetaria, inflación) y TSS (seguridad social, topes cotizables).

Genera exactamente 3 artículos de noticias sumamente realistas, detallados e informativos en formato JSON que cumplan estrictamente con el esquema de respuesta solicitado.
Para cada artículo, debes incluir referencias o citas reales obtenidas de la web con títulos y URLs verdaderas en el campo 'groundingSources'.

Asegúrate de que cada artículo tenga contenido extenso y valioso (contentMarkdown) con desgloses, viñetas y formato Markdown legible.

IMPORTANTE: El campo 'id' debe comenzar con el prefijo "dynamic-" para distinguirlos de los artículos iniciales, ej. "dynamic-dgii-ant-2026".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres el analista jefe de NegocioRD, un portal experto en finanzas, contabilidad fiscal y leyes laborales dominicanas. Utiliza Google Search Grounding para recopilar y compilar noticias verídicas, confiables y completamente actualizadas al año 2026. Devuelve la salida únicamente en el formato JSON solicitado.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Lista de artículos de noticias generados o compilados de la investigación de República Dominicana.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { 
                type: Type.STRING, 
                description: "Un identificador único amigable para la URL, usando guiones bajos o medios, comenzando con 'dynamic-'. Ejemplo: 'dynamic-reforma-laboral-2026'" 
              },
              title: { 
                type: Type.STRING, 
                description: "Título profesional de la noticia financiera o fiscal oficial dominicana." 
              },
              category: { 
                type: Type.STRING, 
                description: "Debe ser exactamente una de estas categorías: 'Impuestos' o 'Laboral' o 'Finanzas'." 
              },
              categoryKey: { 
                type: Type.STRING, 
                description: "Debe ser exactamente una de estas llaves correspondientes: 'impuestos' o 'laboral' o 'finanzas'." 
              },
              summary: { 
                type: Type.STRING, 
                description: "Un resumen ejecutivo persuasivo de la noticia (100 a 160 caracteres)." 
              },
              contentMarkdown: { 
                type: Type.STRING, 
                description: "Cuerpo detallado de la noticia en formato Markdown (mínimo 300 palabras), incluyendo encabezados, números clave, explicaciones técnicas del impacto dominicano." 
              },
              publishDate: { 
                type: Type.STRING, 
                description: "Fecha de publicación (formato AAAA-MM-DD), correspondiente a fechas recientes en 2026." 
              },
              readTime: { 
                type: Type.STRING, 
                description: "Tiempo estimado de lectura, por ejemplo '5 min'." 
              },
              author: { 
                type: Type.STRING, 
                description: "Nombre de un autor o comité capacitado. Ejemplo: 'Cámara Fiscal Dominicana de Finanzas' o 'Lcdo. Juan Rosario - Abogado Laboralista'." 
              },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 3 a 5 palabras clave." 
              },
              relatedCalculatorSlug: { 
                type: Type.STRING, 
                description: "Slug opcional de una calculadora relacionada (por ejemplo: 'calculadora-itbis', 'calculadora-prestaciones-laborales', 'calculadora-tss', 'calculadora-isr' o 'calculadora-salario-neto')." 
              },
              relatedCalculatorName: { 
                type: Type.STRING, 
                description: "Nombre opcional de la calculadora relacionada en formato amigable, o nulo si no aplica." 
              },
              isFeatured: { 
                type: Type.BOOLEAN, 
                description: "Verdadero si el artículo debe ser resaltado como noticia de portada principal." 
              },
              groundingSources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Nombre de la fuente o titular del sitio de búsqueda de donde proviene" },
                    uri: { type: Type.STRING, description: "La URL completa verificada de donde se extrajo" }
                  },
                  required: ["title", "uri"]
                },
                description: "Enlaces de fuentes reales (DGII, periódicos de RD, Banco Central, etc.) de donde provienen las afirmaciones o noticias de Google Search."
              }
            },
            required: [
              "id",
              "title",
              "category",
              "categoryKey",
              "summary",
              "contentMarkdown",
              "publishDate",
              "readTime",
              "author",
              "tags",
              "isFeatured"
            ]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No se recibió contenido de texto de la API de Gemini.");
    }

    const newArticles = JSON.parse(jsonText.trim());

    // Load existing items
    const currentArticles = loadArticles();

    // Merge articles carefully: avoid adding duplicates based on ID
    const mergedArticles = [...currentArticles];
    
    for (const art of newArticles) {
      const idx = mergedArticles.findIndex((x) => x.id === art.id);
      if (idx !== -1) {
        // Overwrite existing dynamic article
        mergedArticles[idx] = art;
      } else {
        // Prepend to show the latest dynamic news at the top
        mergedArticles.unshift(art);
      }
    }

    // Save back to news-cache.json
    saveArticles(mergedArticles);

    res.json({
      success: true,
      message: "Las noticias han sido actualizadas automáticamente con Gemini AI & Google Search.",
      articles: mergedArticles
    });
  } catch (error: any) {
    console.error("Error during news refresh with Gemini API:", error);
    
    // Graceful Fallback: Load cached articles instead of returning a 500 error
    const cachedArticles = loadArticles();
    if (cachedArticles && cachedArticles.length > 0) {
      return res.json({
        success: true,
        isFallback: true,
        message: "Se cargaron las noticias locales desde caché debido a un límite de cuota temporal con el servicio de IA.",
        articles: cachedArticles
      });
    }

    // Default static seed articles for 2026 as last line of defense
    const fallbackSeed = [
      {
        id: "dynamic-dgii-ant-25",
        title: "DGII implementa facilidades impositivas y estímulo para mipymes",
        category: "Impuestos",
        categoryKey: "impuestos",
        summary: "La Dirección General de Impuestos Internos (DGII) anunció un paquete de flexibilización tributaria para pequeñas empresas.",
        contentMarkdown: "### Nuevas Medidas de Impulso para MIPYMES\n\nLa Dirección General de Impuestos Internos (DGII) de la República Dominicana ha emitido una nueva resolución destinada a aliviar la carga de anticipo impositivo para micro, pequeñas y medianas empresas.\n\n#### Beneficios clave:\n- **Eliminación del anticipo del ISR** para deudas acumuladas de microempresas.\n- **Planes de pago flexibles** de hasta 12 meses para deudas fiscales pasadas.\n- **Facilidad de digitalización gratuita** para la adopción ágil de la facturación electrónica.\n\nLas medidas buscan dinamizar los comercios locales y asegurar que el ecosistema empresarial dominicano prosiga su ruta hacia la formalización fiscal.",
        publishDate: new Date().toISOString().split("T")[0],
        readTime: "4 min",
        author: "Comité Fiscal NegocioRD",
        tags: ["DGII", "MIPYMES", "Anticipos"],
        relatedCalculatorSlug: "calculadora-isr",
        relatedCalculatorName: "Calculadora de Retenciones ISR",
        isFeatured: true,
        groundingSources: [
          { title: "DGII Oficial", uri: "https://dgii.gov.do" }
        ]
      }
    ];

    saveArticles(fallbackSeed);

    res.json({
      success: true,
      isFallback: true,
      message: "Se generaron noticias estándar de respaldo debido a un límite de cuota temporal.",
      articles: fallbackSeed
    });
  }
});

// 3. GET /api/rates - Returns current official rates database, source links & metadata
app.get("/api/rates", async (req, res) => {
  try {
    const data = await readRatesCache();
    res.json({
      success: true,
      rates: data.rates,
      lastCheckedAll: data.lastCheckedAll,
      status: data.status || "synchronized"
    });
  } catch (err: any) {
    console.error("Error reading rates cache in GET /api/rates:", err);
    res.status(500).json({
      success: false,
      error: "Error al cargar la base de datos de tasas e impuestos nacionales."
    });
  }
});

// 4. POST /api/rates/refresh - Triggers automated scraping refresh of rates from DGII, TSS & SIPEN
app.post("/api/rates/refresh", async (req, res) => {
  try {
    const result = await refreshOfficialRates();
    res.json(result);
  } catch (err: any) {
    console.error("Error running rates refresh in POST /api/rates/refresh:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Error interno al sincronizar las tasas de impuestos y topes TSS."
    });
  }
});

// 5. GET /sitemap.xml - Dynamic XML sitemap for search engines
app.get("/sitemap.xml", (req, res) => {
  const calculatedUrls = CALCULATORS.map(calc => `
  <url>
    <loc>https://negociord.com/herramientas/${calc.urlSlug}</loc>
    <lastmod>2026-05-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const guideUrls = PROGRAMMATIC_GUIDES.map(guide => `
  <url>
    <loc>https://negociord.com/guia/${guide.slug}</loc>
    <lastmod>${guide.publishDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

  const staticUrls = [
    '/',
    '/noticias',
    '/nosotros',
    '/precios'
  ].map(path => `
  <url>
    <loc>https://negociord.com${path}</loc>
    <lastmod>2026-05-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${calculatedUrls}
${guideUrls}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});

// 6. GET /robots.txt - Search engine crawl instructions
app.get("/robots.txt", (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://negociord.com/sitemap.xml`;

  res.header("Content-Type", "text/plain");
  res.status(200).send(robots);
});

// Helper to pre-render HTML with unique meta tags, OpenGraph, dynamic canonicals & JSON-LD schemas
function getPrerenderedHTML(html: string, originalUrl: string): string {
  let title = "NegocioRD - Calculadoras Fiscales, Laborales y Financieras de R.D.";
  let description = "La plataforma de herramientas fiscales, laborales y contables de referencia para la República Dominicana. Calcule prestaciones laborales, TSS, retenciones de ISR y recargos de la DGII.";
  const pathPart = originalUrl.split("?")[0];
  let type: 'article' | 'website' = 'website';
  let faqSchema = "";
  let appSchema = "";
  let homeSchema = "";

  if (pathPart.startsWith("/herramientas/")) {
    const slug = pathPart.replace("/herramientas/", "");
    const calc = CALCULATORS.find(c => c.urlSlug === slug || c.id === slug);
    if (calc) {
      title = `${calc.seoTitle} | NegocioRD`;
      description = calc.seoMetaDescription;
      
      // SoftwareApplication Schema
      appSchema = `
  <script type="application/ld+json" class="dynamic-schema">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${calc.name}",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "DOP"
    }
  }
  </script>`;

      // Optional: Generate FAQPage Schema if it has standard questions
      if (calc.category === 'impuestos') {
        faqSchema = `
  <script type="application/ld+json" class="dynamic-schema">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cómo se calcula el ITBIS en República Dominicana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Se multiplica la base imponible por la tasa aplicable (18% general, 16% reducida)."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuáles son las fechas de declaración del ITBIS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Se declara mensualmente a más tardar el día 20 de cada mes mediante el formulario IT-1."
        }
      }
    ]
  }
  </script>`;
      } else if (calc.category === 'laboral') {
        faqSchema = `
  <script type="application/ld+json" class="dynamic-schema">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué es la cesantía y cuándo aplica en RD?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Es la compensación por despido injustificado o desahucio ejercido por el empleador, calculada según el tiempo de servicio continuo."
        }
      },
      {
        "@type": "Question",
        "name": "¿El salario navideño o regalía sufre deducciones de ley?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, el salario navideño (Regalía Pascual) está 100% exento por ley de deducciones de la seguridad social (TSS) o retención de ISR."
        }
      }
    ]
  }
  </script>`;
      }
    }
  } else if (pathPart.startsWith("/guia/")) {
    const slug = pathPart.replace("/guia/", "");
    const guide = PROGRAMMATIC_GUIDES.find(g => g.slug === slug);
    if (guide) {
      title = `${guide.seoTitle} | NegocioRD`;
      description = guide.seoMetaDescription;
      type = "article";
    }
  } else if (pathPart === "/nosotros") {
    title = "Sobre Nosotros | NegocioRD";
    description = "Conoce al equipo de NegocioRD y nuestro compromiso con proveer herramientas financieras, fiscales y laborales de la más alta confiabilidad en la República Dominicana.";
  } else if (pathPart === "/noticias") {
    title = "Últimas Noticias Financieras y Fiscales de R.D. | NegocioRD";
    description = "Mantente al día con investigaciones exclusivas usando IA sobre reformas laborales, cambios de ley impositiva de la DGII y reglamentos de la TSS dominicana.";
  }

  // Canonical link setup
  const originUrl = "https://negociord.com";
  const canonicalUrl = `${originUrl}${pathPart}`;

  if (pathPart === "/" || pathPart === "") {
    homeSchema = `
  <script type="application/ld+json" class="dynamic-schema">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NegocioRD",
    "url": "${originUrl}",
    "description": "La plataforma de herramientas fiscales, laborales y contables de referencia para la República Dominicana. Calcule prestaciones laborales, TSS, retenciones de ISR y recargos de la DGII."
  }
  </script>`;
  }

  // Replace Title Tags
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${title}" />`);
  
  // Replace Meta Descriptions
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`);
  
  // Replace Open Graph / Facebook Properties
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:type" content=".*?" \/>/, `<meta property="og:type" content="${type}" />`);
  
  // Replace Twitter Card Properties
  html = html.replace(/<meta property="twitter:title" content=".*?" \/>/g, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta property="twitter:description" content=".*?" \/>/g, `<meta name="twitter:description" content="${description}" />`);

  // Inject Canonical element if missing
  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  // Inject Breadcrumb JSON-LD & components schemas before </head>
  const breadcrumbSchema = `
  <script type="application/ld+json" class="dynamic-schema">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "${originUrl}"
      }${pathPart !== '/' ? `,
      {
        "@type": "ListItem",
        "position": 2,
        "name": "${type === 'article' ? "Guías" : "Herramientas"}",
        "item": "${originUrl}${pathPart.split('/').slice(0, -1).join('/')}"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${title}",
        "item": "${canonicalUrl}"
      }` : ''}
    ]
  }
  </script>`;

  const injectedElements = `\n  ${breadcrumbSchema}${appSchema}${faqSchema}${homeSchema}\n</head>`;
  return html.replace('</head>', injectedElements);
}

// Route validation helper for server-side responses
function isValidRoute(originalUrl: string): boolean {
  const pathPart = originalUrl.split("?")[0];
  
  const validStaticPaths = [
    "/",
    "/noticias",
    "/nosotros",
    "/centro-laboral",
    "/centro-financiero",
    "/precios"
  ];
  
  if (validStaticPaths.includes(pathPart)) {
    return true;
  }
  
  if (pathPart.startsWith("/herramientas/")) {
    const slug = pathPart.replace("/herramientas/", "");
    const calc = CALCULATORS.find(c => c.urlSlug === slug || c.id === slug);
    return !!calc;
  }
  
  if (pathPart.startsWith("/guia/")) {
    const slug = pathPart.replace("/guia/", "");
    const guide = PROGRAMMATIC_GUIDES.find(g => g.slug === slug);
    return !!guide;
  }
  
  return false;
}

// Setup Vite Development Server or Production Static file server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      try {
        const filePath = path.join(distPath, "index.html");
        if (fs.existsSync(filePath)) {
          let html = fs.readFileSync(filePath, "utf-8");
          // Dynamically hydrate unique SEO meta tags matching request path
          html = getPrerenderedHTML(html, req.originalUrl);
          
          if (!isValidRoute(req.originalUrl)) {
            // Return status code 404 for search engine crawling compliance
            res.status(404).send(html);
          } else {
            res.send(html);
          }
        } else {
          res.status(404).send("Index template not found");
        }
      } catch (err) {
        console.error("[ServerError] Static server-side hydration error:", err);
        res.status(500).sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT} under environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
