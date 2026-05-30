import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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

    const currentDateStr = "2026-05-30"; // Set as fixed current context

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
    res.status(500).json({
      success: false,
      error: error.message || "Error interno al procesar e investigar las noticias con la IA."
    });
  }
});

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
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT} under environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
