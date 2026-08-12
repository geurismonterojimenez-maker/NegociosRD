import express from "express";
import path from "path";
import fs from "fs";
import tls from "tls";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { readRatesCache, refreshOfficialRates } from "./src/lib/rates/rate-updater";
import { CALCULATORS, PROGRAMMATIC_GUIDES, HOME_FAQS } from "./src/data";
import {
  getCanonicalCalculatorPath,
  getTopicHubByPath,
  getSalaryPageAmounts,
  parseProgrammaticSeoPage,
  parseSalaryPageAmount,
  PROGRAMMATIC_SEO_PAGES,
  salaryPageSlug,
  SEO_LANDING_BY_SLUG,
  SEO_LANDING_PAGES,
  TOPIC_HUBS
} from "./src/seo-pages";
import { EDITORIAL_PAGES } from "./src/content/editorial";

dotenv.config();

// Global error logging handlers to safeguard server uptime against uncaught exceptions or unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("[FatalError] Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[FatalError] Uncaught Exception:", error);
});

const app = express();
app.use((req, res, next) => {
  if (req.hostname.toLowerCase() === "www.tunegociord.com") {
    return res.redirect(301, `https://tunegociord.com${req.originalUrl}`);
  }
  next();
});
app.use(express.json());
const PORT_VALUE = process.env.PORT || "3000";
const NUMERIC_PORT = Number(PORT_VALUE);
const LISTEN_TARGET = Number.isNaN(NUMERIC_PORT) ? PORT_VALUE : NUMERIC_PORT;

const CACHE_FILE = path.join(process.cwd(), "news-cache.json");
const NEWS_REVIEW_FILE = path.join(process.cwd(), "data", "news-review-queue.json");
const OFFICIAL_NEWS_HOSTS = [
  "dgii.gov.do",
  "tss.gob.do",
  "mt.gob.do",
  "bancentral.gov.do",
  "cnss.gob.do",
  "sisalril.gob.do",
  "sipen.gob.do",
  "presidencia.gob.do"
];
const CHECKOUT_PROVIDER = process.env.CHECKOUT_PROVIDER || "demo";
const ORIGIN_URL = (process.env.PUBLIC_SITE_URL || process.env.APP_URL || "https://tunegociord.com").replace(/\/$/, "");
const DEFAULT_SHARE_IMAGE = "/og-image.png";
const INVOICE_FROM_NAME = process.env.INVOICE_FROM_NAME || "Tu Negocio RD";
const INVOICE_BCC = process.env.INVOICE_BCC || "";
const INVOICE_REPLY_TO = process.env.INVOICE_REPLY_TO || process.env.GMAIL_USER || "";
const GOOGLE_PAY_MERCHANT_ID = process.env.GOOGLE_PAY_MERCHANT_ID || "";
const GOOGLE_PAY_GATEWAY = process.env.GOOGLE_PAY_GATEWAY || "pagosazul";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://www.gstatic.com https://apis.google.com",
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src https://www.googletagmanager.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.firebaseapp.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests"
  ].join("; ")
};

app.use((_, res, next) => {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
});

type BillingCycle = keyof typeof PRO_PLANS;
type CheckoutProvider = "demo" | "azul" | "azul_google_pay";

function isValidCheckoutProvider(provider: string): provider is CheckoutProvider {
  return ["demo", "azul", "azul_google_pay"].includes(provider);
}

function getCheckoutProvider(): CheckoutProvider {
  return isValidCheckoutProvider(CHECKOUT_PROVIDER) ? CHECKOUT_PROVIDER : "demo";
}

function isAzulConfigured(): boolean {
  return Boolean(process.env.AZUL_MERCHANT_ID && process.env.AZUL_AUTH_KEY);
}

function isGooglePayConfigured(): boolean {
  return Boolean(isAzulConfigured() && GOOGLE_PAY_MERCHANT_ID);
}

function isEmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderCrawlerText(value: string): string {
  return escapeHtmlAttribute(value)
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .split(/\n{2,}/)
    .map((block) => block.startsWith('<h') || block.startsWith('<li>') ? block : `<p>${block.replace(/\n/g, ' ')}</p>`)
    .join('');
}

function compactSeoTitle(value: string): string {
  const compact = value
    .replace(/República Dominicana/gi, "RD")
    .replace(/Republica Dominicana/gi, "RD");
  if (compact.length <= 65) return compact;
  const withoutBrand = compact.replace(/\s*\|\s*Tu Negocio RD$/i, "");
  return withoutBrand.length <= 65 ? withoutBrand : `${withoutBrand.slice(0, 62).trimEnd()}…`;
}

function jsonLdScript(schema: Record<string, any>): string {
  return `
  <script type="application/ld+json" class="dynamic-schema">
  ${JSON.stringify(schema)}
  </script>`;
}

const PRO_PLANS = {
  mensual: {
    id: "pro-mensual",
    label: "PRO mensual",
    amount: 49500,
    displayAmount: "RD$ 495",
    currency: "DOP",
    billingCycle: "mensual",
  },
  anual: {
    id: "pro-anual",
    label: "PRO anual",
    amount: 395000,
    displayAmount: "RD$ 3,950",
    currency: "DOP",
    billingCycle: "anual",
  },
} as const;

function smtpRead(socket: tls.TLSSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const onData = (chunk: Buffer) => {
      chunks.push(chunk);
      const text = Buffer.concat(chunks).toString("utf8");
      const lines = text.trimEnd().split(/\r?\n/);
      const lastLine = lines[lines.length - 1] || "";
      if (/^\d{3} /.test(lastLine)) {
        cleanup();
        resolve(text);
      }
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const onClose = () => {
      cleanup();
      reject(new Error("Conexión SMTP cerrada prematuramente (cierre de socket o timeout)."));
    };
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
      socket.off("end", onClose);
    };
    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);
    socket.on("end", onClose);
  });
}

async function smtpCommand(socket: tls.TLSSocket, command: string, expectedCodes: number[]) {
  socket.write(`${command}\r\n`);
  const response = await smtpRead(socket);
  const code = Number(response.slice(0, 3));
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP command failed (${command.split(" ")[0]}): ${response.trim()}`);
  }
  return response;
}

function encodeMailHeader(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function escapeMailText(value: unknown): string {
  return String(value ?? "").replace(/\r?\n/g, " ").trim();
}

async function sendGmailMessage(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "gmail-not-configured" };
  }

  const fromEmail = process.env.GMAIL_USER as string;
  const appPassword = process.env.GMAIL_APP_PASSWORD as string;
  const recipients = [options.to, ...INVOICE_BCC.split(",").map((email) => email.trim()).filter(Boolean)];
  const socket = tls.connect(465, "smtp.gmail.com", { servername: "smtp.gmail.com" });
  socket.setTimeout(8000); // 8-second timeout limit to avoid blocking the Express main thread

  await new Promise<void>((resolve, reject) => {
    const onConnect = () => {
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
      resolve();
    };
    const onError = (err: Error) => {
      socket.off("secureConnect", onConnect);
      socket.off("timeout", onTimeout);
      reject(err);
    };
    const onTimeout = () => {
      socket.off("secureConnect", onConnect);
      socket.off("error", onError);
      socket.destroy();
      reject(new Error("Timeout de conexión SMTP (8 segundos excedidos)"));
    };
    socket.once("secureConnect", onConnect);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });

  const onSmtpTimeout = () => {
    console.warn("[SMTP] Conexión inactiva superó el límite de tiempo. Destruyendo socket...");
    socket.destroy();
  };
  socket.on("timeout", onSmtpTimeout);

  try {
    const greeting = await smtpRead(socket);
    if (!greeting.startsWith("220")) {
      throw new Error(`SMTP greeting failed: ${greeting.trim()}`);
    }

    await smtpCommand(socket, "EHLO tunegociord.com", [250]);
    await smtpCommand(socket, "AUTH LOGIN", [334]);
    await smtpCommand(socket, Buffer.from(fromEmail).toString("base64"), [334]);
    await smtpCommand(socket, Buffer.from(appPassword).toString("base64"), [235]);
    await smtpCommand(socket, `MAIL FROM:<${fromEmail}>`, [250]);
    for (const recipient of recipients) {
      await smtpCommand(socket, `RCPT TO:<${recipient}>`, [250, 251]);
    }
    await smtpCommand(socket, "DATA", [354]);

    const message = [
      `From: ${encodeMailHeader(INVOICE_FROM_NAME)} <${fromEmail}>`,
      `To: <${options.to}>`,
      INVOICE_REPLY_TO ? `Reply-To: <${INVOICE_REPLY_TO}>` : "",
      `Subject: ${encodeMailHeader(options.subject)}`,
      "MIME-Version: 1.0",
      'Content-Type: multipart/alternative; boundary="tunegociord-invoice"',
      "",
      "--tunegociord-invoice",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      options.text,
      "",
      "--tunegociord-invoice",
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      options.html,
      "",
      "--tunegociord-invoice--",
      ".",
      "",
    ].join("\r\n");

    socket.write(message);
    const dataResponse = await smtpRead(socket);
    if (!dataResponse.startsWith("250")) {
      throw new Error(`SMTP DATA failed: ${dataResponse.trim()}`);
    }

    await smtpCommand(socket, "QUIT", [221]);
    return { sent: true };
  } finally {
    socket.off("timeout", onSmtpTimeout);
    socket.end();
  }
}

async function sendInvoiceEmail(params: {
  to?: string | null;
  checkoutReference: string;
  provider: string;
  paymentMethodId: string;
  plan: (typeof PRO_PLANS)[BillingCycle];
}) {
  if (!params.to) {
    return { sent: false, reason: "missing-customer-email" };
  }

  const invoiceDate = new Date().toLocaleDateString("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const cleanProvider = params.provider === "azul_google_pay" ? "Azul + Google Pay" : params.provider.toUpperCase();
  const subject = `Factura Tu Negocio RD Pro - ${params.checkoutReference}`;
  const text = [
    "Factura de compra",
    `Cliente: ${escapeMailText(params.to)}`,
    `Plan: ${params.plan.label}`,
    `Total: ${params.plan.displayAmount} ${params.plan.currency}`,
    `Fecha: ${invoiceDate}`,
    `Referencia: ${params.checkoutReference}`,
    `Metodo: ${cleanProvider}`,
    "",
    "Gracias por elegir Tu Negocio RD. Esta factura confirma la solicitud de compra de tu licencia PRO.",
    "Si no reconoces esta transaccion, responde este correo para soporte.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
      <h2 style="color:#0F766E;margin-bottom:4px">Factura Tu Negocio RD Pro</h2>
      <p style="margin-top:0;color:#4B5563">Herramientas que impulsan tu negocio.</p>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        <tr><td style="padding:8px;border-bottom:1px solid #E5E7EB">Cliente</td><td style="padding:8px;border-bottom:1px solid #E5E7EB"><strong>${escapeHtmlAttribute(params.to)}</strong></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #E5E7EB">Plan</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${params.plan.label}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #E5E7EB">Total</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${params.plan.displayAmount} ${params.plan.currency}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #E5E7EB">Fecha</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${invoiceDate}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #E5E7EB">Referencia</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${params.checkoutReference}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #E5E7EB">Metodo</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${cleanProvider}</td></tr>
      </table>
      <p style="font-size:12px;color:#6B7280;margin-top:16px">Esta factura confirma la solicitud de compra de tu licencia PRO. Conserva esta referencia para soporte.</p>
    </div>`;

  try {
    return await sendGmailMessage({
      to: params.to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Invoice email failed:", err);
    return { sent: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

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

function loadReviewQueue(): any[] {
  try {
    if (fs.existsSync(NEWS_REVIEW_FILE)) {
      return JSON.parse(fs.readFileSync(NEWS_REVIEW_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading news review queue:", err);
  }
  return [];
}

function saveReviewQueue(articles: any[]) {
  fs.mkdirSync(path.dirname(NEWS_REVIEW_FILE), { recursive: true });
  fs.writeFileSync(NEWS_REVIEW_FILE, JSON.stringify(articles, null, 2), "utf-8");
}

function hasEnoughOfficialSources(article: any): boolean {
  if (!Array.isArray(article?.groundingSources)) return false;
  const officialUrls = article.groundingSources.filter((source: any) => {
    try {
      const host = new URL(String(source?.uri || "")).hostname.toLowerCase();
      return OFFICIAL_NEWS_HOSTS.some((officialHost) => host === officialHost || host.endsWith(`.${officialHost}`));
    } catch {
      return false;
    }
  });
  return new Set(officialUrls.map((source: any) => source.uri)).size >= 2;
}

// 1. GET API endpoint to fetch news
app.get("/api/news", (req, res) => {
  const articles = loadArticles().filter((article: any) => article.reviewStatus === "verified");
  res.json({ success: true, articles });
});

// 2. POS API endpoint to refresh news with Gemini AI (Google Search Grounding)
app.post("/api/news/refresh", async (req, res) => {
  const configuredToken = process.env.NEWS_REFRESH_TOKEN;
  const providedToken = req.header("x-refresh-token");
  if (process.env.NODE_ENV === "production" && (!configuredToken || providedToken !== configuredToken)) {
    return res.status(403).json({
      success: false,
      error: "La investigacion de noticias requiere autorizacion editorial."
    });
  }

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
        systemInstruction: "Eres el analista jefe de Tu Negocio RD, un portal experto en finanzas, contabilidad fiscal y leyes laborales dominicanas. Utiliza Google Search Grounding para recopilar y compilar noticias verídicas, confiables y completamente actualizadas al año 2026. Devuelve la salida únicamente en el formato JSON solicitado.",
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

    const validCandidates = newArticles
      .filter((article: any) => {
        const timestamp = Date.parse(article?.publishDate || "");
        return article?.id?.startsWith("dynamic-") &&
          Number.isFinite(timestamp) &&
          timestamp <= Date.now() + 86_400_000 &&
          hasEnoughOfficialSources(article);
      })
      .map((article: any) => ({
        ...article,
        author: "Equipo editorial Tu Negocio RD",
        reviewStatus: "pending_review",
        generatedAt: new Date().toISOString(),
        reviewedAt: null
      }));

    if (validCandidates.length === 0) {
      return res.status(422).json({
        success: false,
        error: "Ningun borrador cumplio el minimo de dos fuentes oficiales verificables."
      });
    }

    const queue = loadReviewQueue();
    for (const candidate of validCandidates) {
      const existingIndex = queue.findIndex((item: any) => item.id === candidate.id);
      if (existingIndex >= 0) queue[existingIndex] = candidate;
      else queue.unshift(candidate);
    }
    saveReviewQueue(queue);

    return res.status(202).json({
      success: true,
      message: "Los borradores quedaron pendientes de revision editorial y no fueron publicados.",
      queued: validCandidates.length
    });
  } catch (error: any) {
    console.error("Error during news refresh with Gemini API:", error);
    return res.status(502).json({
      success: false,
      error: "No fue posible generar borradores verificables. No se publico contenido de respaldo."
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
  const configuredToken = process.env.RATE_REFRESH_TOKEN;
  const providedToken = req.header("x-refresh-token");
  if (process.env.NODE_ENV === "production" && (!configuredToken || providedToken !== configuredToken)) {
    res.status(403).json({
      success: false,
      error: "La actualizacion de tasas requiere autorizacion administrativa."
    });
    return;
  }

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

// 5. GET /api/checkout/config - Public checkout capabilities for the frontend
app.get("/api/checkout/config", (req, res) => {
  const provider = getCheckoutProvider();
  res.json({
    success: true,
    provider,
    mode: provider === "demo" ? "demo" : "live-ready",
    plans: PRO_PLANS,
    requiresServerConfirmation: true,
    invoiceEmailEnabled: isEmailConfigured(),
    domain: ORIGIN_URL,
    providers: {
      demo: {
        enabled: provider === "demo",
        label: "Modo demo",
      },
      azul: {
        enabled: provider === "azul" || provider === "azul_google_pay",
        configured: isAzulConfigured(),
        label: "Azul",
      },
      googlePay: {
        enabled: provider === "azul_google_pay",
        configured: isGooglePayConfigured(),
        label: "Google Pay via Azul",
        gateway: GOOGLE_PAY_GATEWAY,
        merchantIdConfigured: Boolean(GOOGLE_PAY_MERCHANT_ID),
      },
    },
  });
});

// 6. POST /api/checkout/session - Creates a server-side checkout reference before PRO activation
app.post("/api/checkout/session", async (req, res) => {
  const { billingCycle, userEmail, paymentMethodId } = req.body || {};
  const plan = PRO_PLANS[billingCycle as keyof typeof PRO_PLANS];
  const provider = getCheckoutProvider();

  if (!plan) {
    return res.status(400).json({
      success: false,
      error: "Plan PRO no valido. Usa mensual o anual.",
    });
  }

  if (!paymentMethodId || typeof paymentMethodId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Selecciona un metodo de pago antes de completar la compra.",
    });
  }

  if (provider !== "demo" && !isAzulConfigured()) {
    return res.status(503).json({
      success: false,
      provider,
      error: "Azul no esta configurado. Agrega AZUL_MERCHANT_ID y AZUL_AUTH_KEY en las variables de entorno del hosting.",
    });
  }

  if (provider === "azul_google_pay" && !isGooglePayConfigured()) {
    return res.status(503).json({
      success: false,
      provider,
      error: "Google Pay no esta configurado. Agrega GOOGLE_PAY_MERCHANT_ID y confirma que Azul habilito Google Pay para tu comercio.",
    });
  }

  if (provider !== "demo") {
    return res.status(501).json({
      success: false,
      provider,
      error: "Azul/Google Pay ya esta preparado en configuracion, pero falta conectar la captura real certificada del comercio antes de activar PRO automaticamente.",
    });
  }

  const checkoutPrefix = "tnrd_demo";
  const checkoutReference = `${checkoutPrefix}_${plan.billingCycle}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const invoice = await sendInvoiceEmail({
    to: userEmail,
    checkoutReference,
    provider,
    paymentMethodId,
    plan,
  });

  // Azul/Google Pay credentials are validated here. The live capture call should be
  // connected with the certified Azul payload once the merchant receives production credentials.
  res.json({
    success: true,
    mode: provider === "demo" ? "demo" : "configured",
    provider,
    checkoutReference,
    status: "authorized",
    userEmail: userEmail || null,
    paymentMethodId,
    plan,
    invoice,
    paymentRails: {
      azulConfigured: isAzulConfigured(),
      googlePayConfigured: isGooglePayConfigured(),
      googlePayGateway: GOOGLE_PAY_GATEWAY,
    },
    message: provider === "demo"
      ? "Checkout simulado autorizado por el servidor local."
      : "Checkout preparado para el proveedor configurado.",
  });
});

app.get("/herramientas/:slug", (req, res, next) => {
  const canonicalPath = getCanonicalCalculatorPath(req.params.slug);
  if (!canonicalPath.startsWith("/herramientas/")) {
    res.redirect(301, canonicalPath);
    return;
  }
  next();
});

const TOPIC_ALIAS_REDIRECTS = Object.fromEntries(
  TOPIC_HUBS.flatMap(hub => (hub.aliases || []).map(alias => [`/${alias}`, `/temas/${hub.slug}`]))
);

app.get(Object.keys(TOPIC_ALIAS_REDIRECTS), (req, res) => {
  res.redirect(301, TOPIC_ALIAS_REDIRECTS[req.path]);
});

app.get("/nosotros", (_req, res) => {
  res.redirect(301, "/sobre-nosotros");
});

// 7. GET /sitemap.xml - Dynamic XML sitemap for search engines
app.get("/sitemap.xml", (req, res) => {
  const calculatedUrls = CALCULATORS
    .filter(calc => getCanonicalCalculatorPath(calc.urlSlug).startsWith("/herramientas/"))
    .map(calc => `
  <url>
    <loc>${ORIGIN_URL}/herramientas/${calc.urlSlug}</loc>
    <lastmod>2026-05-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const guideUrls = PROGRAMMATIC_GUIDES.map(guide => `
  <url>
    <loc>${ORIGIN_URL}/guia/${guide.slug}</loc>
    <lastmod>${guide.publishDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

  const landingUrls = SEO_LANDING_PAGES.map(page => `
  <url>
    <loc>${ORIGIN_URL}/${page.slug}</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  // Salary amount pages remain available for users, but are intentionally
  // excluded from the sitemap because their templates are highly similar.

  // Small programmatic examples are available for users but excluded from the
  // sitemap to avoid presenting thin generated pages as primary inventory.

  const topicUrls = TOPIC_HUBS.map(hub => `
  <url>
    <loc>${ORIGIN_URL}/temas/${hub.slug}</loc>
    <lastmod>2026-06-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const trustUrls = [
    '/autores/equipo-editorial',
    '/metodologia',
    '/politica-editorial',
    '/fuentes-oficiales'
  ];

  const editorialUrls = Object.keys(EDITORIAL_PAGES)
    .map(slug => `/${slug}`)
    .filter(path => !trustUrls.includes(path));

  const staticUrls = [
    '/',
    '/calculadoras',
    '/guias',
    '/noticias',
    '/sobre-nosotros',
    '/contacto',
    '/privacidad',
    '/terminos',
    '/reembolsos',
    ...trustUrls,
    ...editorialUrls
  ].map(path => `
  <url>
    <loc>${ORIGIN_URL}${path}</loc>
    <lastmod>2026-05-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${calculatedUrls}
${guideUrls}
${landingUrls}
${topicUrls}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});

// 6. GET /robots.txt - Search engine crawl instructions
app.get("/robots.txt", (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${ORIGIN_URL}/sitemap.xml`;

  res.header("Content-Type", "text/plain");
  res.status(200).send(robots);
});

const LEGACY_GUIDE_REDIRECTS: Record<string, string> = {
  "/guia/como-calcular-itbis": "/guia/itbis-facturas-y-ncf-guia-practica",
  "/guia/como-calcular-prestaciones": "/guia/como-calcular-prestaciones-laborales-rd",
  "/guia/como-calcular-salario-neto": "/guia/como-interpretar-una-nomina-dominicana",
  "/guia/como-calcular-vacaciones": "/guia/vacaciones-no-tomadas-como-se-pagan",
  "/guia/como-calcular-regalia": "/guia/todo-sobre-regalia-pascual"
};

app.get(Object.keys(LEGACY_GUIDE_REDIRECTS), (req, res) => {
  res.redirect(301, LEGACY_GUIDE_REDIRECTS[req.path]);
});

// Helper to pre-render HTML with unique meta tags, OpenGraph, dynamic canonicals & JSON-LD schemas
function getPrerenderedHTML(html: string, originalUrl: string): string {
  let title = "Calculadoras simples de República Dominicana | Tu Negocio RD";
  let description = "Estima prestaciones, salario neto, préstamos e impuestos en RD con fórmulas explicadas, tasas documentadas y enlaces a fuentes de la DGII, TSS y Ministerio de Trabajo.";
  let robots = "index, follow";
  const pathPart = originalUrl.split("?")[0];
  let type: 'article' | 'website' = 'website';
  let appSchema = "";
  let homeSchema = "";
  const landingPage = SEO_LANDING_BY_SLUG.get(pathPart.replace(/^\//, ""));
  const salaryAmount = parseSalaryPageAmount(pathPart);
  const programmaticPage = parseProgrammaticSeoPage(pathPart);
  const topicHub = getTopicHubByPath(pathPart);
  const editorialKey = pathPart.replace(/^\//, "") as keyof typeof EDITORIAL_PAGES;

  if (landingPage) {
    title = landingPage.title;
    description = landingPage.metaDescription;
    const calculator = CALCULATORS.find(calc => calc.urlSlug === landingPage.calculatorSlug || calc.id === landingPage.calculatorSlug);
    if (calculator) {
      appSchema = jsonLdScript({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": landingPage.heading,
        "description": landingPage.metaDescription,
        "url": `${ORIGIN_URL}/${landingPage.slug}`,
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "inLanguage": "es-DO",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "DOP"
        }
      });
    }
  } else if (salaryAmount !== null) {
    const formatted = `RD$ ${salaryAmount.toLocaleString("es-DO")}`;
    title = `Si gano ${formatted}, cuanto me descuentan en RD? | 2026`;
    description = `Calcula AFP, SFS, ISR y salario neto para un sueldo bruto mensual de ${formatted} en Republica Dominicana con tasas y topes 2026.`;
    robots = "noindex, follow";
    type = "article";
  } else if (programmaticPage) {
    title = programmaticPage.title;
    description = programmaticPage.description;
    robots = "noindex, follow";
    type = "article";
  } else if (topicHub) {
    title = `${topicHub.title} | Tu Negocio RD`;
    description = topicHub.description;
    type = "article";
  } else if (editorialKey in EDITORIAL_PAGES) {
    const editorialPage = EDITORIAL_PAGES[editorialKey];
    title = editorialPage.title;
    description = editorialPage.description;
    type = "article";
  } else if (pathPart.startsWith("/herramientas/")) {
    const slug = pathPart.replace("/herramientas/", "");
    const calc = CALCULATORS.find(c => c.urlSlug === slug || c.id === slug);
    if (calc) {
      title = `${calc.seoTitle} | Tu Negocio RD`;
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

    }
  } else if (pathPart === "/calculadoras") {
    title = "Calculadoras para República Dominicana | Tu Negocio RD";
    description = "Directorio de calculadoras laborales, fiscales, financieras y comerciales para RD con resultados desglosados y fuentes documentadas.";
  } else if (pathPart === "/guias" || pathPart === "/aprende") {
    title = "Centro de aprendizaje financiero y laboral RD | Tu Negocio RD";
    description = "Guias extensas sobre nomina, ISR, TSS, prestaciones, regalia, horas extras y finanzas para Republica Dominicana.";
  } else if (pathPart.startsWith("/guia/")) {
    const slug = pathPart.replace("/guia/", "");
    const guide = PROGRAMMATIC_GUIDES.find(g => g.slug === slug);
    if (guide) {
      title = `${guide.seoTitle} | Tu Negocio RD`;
      description = guide.seoMetaDescription;
      type = "article";
    }
  } else if (pathPart === "/nosotros" || pathPart === "/sobre-nosotros") {
    title = "Sobre Nosotros | Tu Negocio RD";
    description = "Conoce la mision, metodologia editorial, fuentes oficiales y compromiso de precision de Tu Negocio RD.";
  } else if (pathPart === "/contacto") {
    title = "Contacto y soporte | Tu Negocio RD";
    description = "Contacta a Tu Negocio RD para soporte, alianzas y dudas sobre herramientas fiscales, laborales y financieras.";
  } else if (pathPart === "/privacidad") {
    title = "Politica de Privacidad | Tu Negocio RD";
    description = "Politica de privacidad de Tu Negocio RD sobre autenticacion, datos de cuenta y uso de herramientas.";
  } else if (pathPart === "/terminos") {
    title = "Términos de Uso | Tu Negocio RD";
    description = "Términos de uso de las calculadoras fiscales, laborales y financieras de Tu Negocio RD.";
  } else if (pathPart === "/reembolsos") {
    title = "Politica de Reembolsos | Tu Negocio RD";
    description = "Politica comercial de cancelaciones y reembolsos para servicios digitales de Tu Negocio RD.";
  } else if (pathPart === "/noticias") {
    title = "Noticias Fiscales y Laborales de R.D. | Tu Negocio RD";
    description = "Boletines revisados sobre DGII, TSS y normas laborales de Republica Dominicana, con fechas y enlaces a fuentes oficiales.";
  } else if (pathPart === "/admin") {
    title = "Administración Privada | Tu Negocio RD";
    description = "Consola interna privada para administración, auditoría y control operativo de Tu Negocio RD.";
    robots = "noindex, nofollow, noarchive";
  }

  // Canonical link setup
  const originUrl = ORIGIN_URL;
  const canonicalPath = topicHub
    ? `/temas/${topicHub.slug}`
    : pathPart === "/nosotros"
      ? "/sobre-nosotros"
      : pathPart;
  const canonicalUrl = `${originUrl}${canonicalPath}`;

  if (pathPart === "/" || pathPart === "") {
    homeSchema = jsonLdScript({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Tu Negocio RD",
      "url": originUrl,
      "inLanguage": "es-DO",
      "description": description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${originUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }) + jsonLdScript({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Tu Negocio RD",
      "url": originUrl,
      "logo": `${originUrl}/og-image.png`
    });
  }

  title = compactSeoTitle(title);
  const safeTitle = escapeHtmlAttribute(title);
  const safeDescription = escapeHtmlAttribute(description);

  // Replace Title Tags
  html = html.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${safeTitle}" />`);
  
  // Replace Meta Descriptions
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${safeDescription}" />`);
  html = html.replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="${robots}" />`);
  
  // Replace Open Graph / Facebook Properties
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${safeDescription}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:type" content=".*?" \/>/, `<meta property="og:type" content="${type}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${DEFAULT_SHARE_IMAGE}" />`);
  
  // Replace Twitter Card Properties
  html = html.replace(/<meta (?:property|name)="twitter:card" content=".*?" \/>/g, `<meta name="twitter:card" content="summary_large_image" />`);
  html = html.replace(/<meta (?:property|name)="twitter:title" content=".*?" \/>/g, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta (?:property|name)="twitter:description" content=".*?" \/>/g, `<meta name="twitter:description" content="${safeDescription}" />`);
  html = html.replace(/<meta (?:property|name)="twitter:image" content=".*?" \/>/g, `<meta name="twitter:image" content="${DEFAULT_SHARE_IMAGE}" />`);

  // Inject Canonical element if missing
  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  const breadcrumbItems: any[] = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": originUrl
    }
  ];
  if (pathPart !== "/") {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 2,
      "name": type === "article" ? "Guías" : "Herramientas",
      "item": `${originUrl}${pathPart.split('/').slice(0, -1).join('/') || '/'}`
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": title,
      "item": canonicalUrl
    });
  }
  const breadcrumbSchema = jsonLdScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  });

  const articleSchema = type === "article" ? jsonLdScript({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "inLanguage": "es-DO",
    "author": {
      "@type": "Organization",
      "name": "Tu Negocio RD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tu Negocio RD"
    },
    "datePublished": "2026-06-10",
    "dateModified": "2026-08-11",
    "image": DEFAULT_SHARE_IMAGE,
    "mainEntityOfPage": canonicalUrl
  }) : "";

  const faqItems = (pathPart === "/" || pathPart === "")
    ? HOME_FAQS
    : landingPage?.faqs || (pathPart.startsWith("/guia/") ? [
    {
      question: "Esta guia sustituye una consulta profesional?",
      answer: "No. La guia organiza reglas generales, ejemplos y fuentes oficiales para mejorar la comprension, pero no reemplaza una revision profesional individual."
    },
    {
      question: "Que fuentes oficiales usa Tu Negocio RD?",
      answer: "Se priorizan DGII, TSS, CNSS, Ministerio de Trabajo y otras instituciones dominicanas relacionadas con salud, pensiones o finanzas cuando el tema lo requiere."
    },
    {
      question: "Cada cuanto se actualiza la informacion?",
      answer: "Las paginas centrales se revisan cuando hay cambios normativos, publicaciones oficiales o reportes de usuarios que puedan afectar formulas, ejemplos o interpretaciones."
    }
  ] : []);
  const faqSchema = faqItems.length > 0 ? jsonLdScript({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }) : "";

  const injectedElements = `\n  ${breadcrumbSchema}${appSchema}${homeSchema}${articleSchema}${faqSchema}\n</head>`;
  html = html.replace('</head>', injectedElements);

  const selectedGuide = pathPart.startsWith("/guia/")
    ? PROGRAMMATIC_GUIDES.find((guide) => guide.slug === pathPart.replace("/guia/", ""))
    : undefined;
  const selectedEditorial = editorialKey in EDITORIAL_PAGES ? EDITORIAL_PAGES[editorialKey] : undefined;
  const selectedCalculator = pathPart.startsWith("/herramientas/")
    ? CALCULATORS.find((calculator) => calculator.urlSlug === pathPart.replace("/herramientas/", "") || calculator.id === pathPart.replace("/herramientas/", ""))
    : undefined;
  const uniqueRouteContent = landingPage
    ? `<p>${escapeHtmlAttribute(landingPage.intro)}</p><h2>Cómo se calcula</h2><p>${escapeHtmlAttribute(landingPage.explanation)}</p><h2>Ejemplo práctico</h2><p>${escapeHtmlAttribute(landingPage.example)}</p><h2>Preguntas frecuentes</h2>${landingPage.faqs.map((faq) => `<h3>${escapeHtmlAttribute(faq.question)}</h3><p>${escapeHtmlAttribute(faq.answer)}</p>`).join('')}`
    : selectedGuide
      ? `<p>${escapeHtmlAttribute(selectedGuide.shortIntro)}</p>${renderCrawlerText(selectedGuide.contentMarkdown)}`
      : selectedEditorial
        ? `<p>${escapeHtmlAttribute(selectedEditorial.intro)}</p>${selectedEditorial.sections.map(([heading, body]) => `<h2>${escapeHtmlAttribute(heading)}</h2><p>${escapeHtmlAttribute(body)}</p>`).join('')}`
        : topicHub
          ? `<p>${escapeHtmlAttribute(topicHub.intro)}</p><h2>Calculadoras relacionadas</h2><ul>${topicHub.calculatorSlugs.map((slug) => `<li><a href="${getCanonicalCalculatorPath(slug)}">${escapeHtmlAttribute(slug.replace(/-/g, ' '))}</a></li>`).join('')}</ul><h2>Guías relacionadas</h2><ul>${topicHub.guideSlugs.map((slug) => `<li><a href="/guia/${slug}">${escapeHtmlAttribute(slug.replace(/-/g, ' '))}</a></li>`).join('')}</ul>`
          : selectedCalculator
            ? `<p>${escapeHtmlAttribute(selectedCalculator.seoMetaDescription)}</p><h2>Qué resuelve esta herramienta</h2><p>Permite organizar los datos del cálculo, revisar el desglose y comparar el resultado con la documentación de la operación. Los valores se procesan en el navegador y deben confirmarse cuando formen parte de una declaración, contrato o reclamación.</p>`
            : '';
  const routeContext = landingPage
    ? `${uniqueRouteContent}<h2>Cómo usar esta calculadora</h2><p>Introduce datos actuales y revisa cada resultado antes de utilizarlo. La herramienta organiza el cálculo, muestra los componentes principales y enlaza información relacionada para que puedas comprobar la fórmula. Los importes son estimaciones educativas y pueden cambiar por topes, tasas, fechas o condiciones particulares.</p><h2>Qué debes verificar</h2><p>Compara el resultado con tu nómina, contrato, factura o declaración. Para decisiones laborales o tributarias consulta también las publicaciones vigentes de la DGII, la TSS, el CNSS y el Ministerio de Trabajo.</p>`
    : type === "article"
      ? `${uniqueRouteContent}<h2>Cómo utilizar esta guía</h2><p>Lee el ejemplo completo, identifica la norma o fórmula aplicable y comprueba la fecha de actualización. Las guías explican conceptos dominicanos en lenguaje sencillo, pero una situación individual puede requerir documentos adicionales o revisión profesional.</p><h2>Fuentes y actualización</h2><p>Priorizamos referencias de la DGII, TSS, CNSS, Banco Central y Ministerio de Trabajo cuando corresponde. Si una tasa cambia, vuelve a calcular con la información oficial más reciente.</p>`
      : `${uniqueRouteContent}<h2>Herramientas para tomar mejores decisiones</h2><p>Tu Negocio RD reúne calculadoras laborales, fiscales, comerciales y financieras para personas y pequeños negocios dominicanos. Cada resultado debe interpretarse junto con sus supuestos, fecha y fuente.</p><h2>Proceso recomendado</h2><ol><li>Selecciona la herramienta adecuada.</li><li>Introduce datos netos y verificables.</li><li>Revisa el desglose y las advertencias.</li><li>Contrasta el resultado con fuentes oficiales.</li></ol>`;
  const trustContext = `<h2>Transparencia y límites</h2><p>El contenido es informativo y no sustituye asesoría contable, fiscal, jurídica o laboral. No prometemos un resultado oficial ni almacenamos deliberadamente los valores de una simulación como expediente personal. Las fórmulas se documentan para que puedas detectar diferencias y solicitar una corrección.</p><h2>Preguntas frecuentes</h2><h3>¿Los resultados son oficiales?</h3><p>No. Son estimaciones basadas en reglas y supuestos publicados.</p><h3>¿Las herramientas son gratuitas?</h3><p>Sí, las calculadoras públicas pueden utilizarse desde el navegador.</p><h3>¿Dónde informo un error?</h3><p>Utiliza la página de contacto e incluye la URL, el dato cuestionado, la fecha y una fuente verificable.</p>`;
  const crawlerFallback = `<main id="seo-fallback">
    <nav aria-label="Navegación principal"><a href="/">Inicio</a> · <a href="/calculadoras">Calculadoras</a> · <a href="/guias">Guías</a> · <a href="/sobre-nosotros">Sobre nosotros</a> · <a href="/metodologia">Metodología</a></nav>
    <article>
      <h1>${safeTitle}</h1>
      <p>${safeDescription}</p>
      ${routeContext}${trustContext}
      <p>Información educativa para República Dominicana, respaldada por fuentes oficiales y ejemplos prácticos. Verifica siempre las reglas vigentes para tu caso particular.</p>
    </article>
  </main>`;
  return html.replace('<div id="root"></div>', `<div id="root">${crawlerFallback}</div>`);
}

// Route validation helper for server-side responses
function isValidRoute(originalUrl: string): boolean {
  const pathPart = originalUrl.split("?")[0];
  if (
    SEO_LANDING_BY_SLUG.has(pathPart.replace(/^\//, "")) ||
    parseSalaryPageAmount(pathPart) !== null ||
    parseProgrammaticSeoPage(pathPart) !== null ||
    !!getTopicHubByPath(pathPart) ||
    pathPart.replace(/^\//, "") in EDITORIAL_PAGES
  ) {
    return true;
  }
  
  const validStaticPaths = [
    "/",
    "/calculadoras",
    "/guias",
    "/aprende",
    "/noticias",
    "/sobre-nosotros",
    "/nosotros",
    "/contacto",
    "/privacidad",
    "/terminos",
    "/reembolsos",
    "/centro-laboral",
    "/centro-financiero",
    "/admin"
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
    app.use(express.static(distPath, {
      index: false,
      etag: true,
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html") || filePath.endsWith("sw.js") || filePath.endsWith("site.webmanifest") || filePath.endsWith("manifest.json")) {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
      }
    }));
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

  const onListening = () => {
    console.log(`[Server] Running on ${PORT_VALUE} under environment: ${process.env.NODE_ENV || "development"}`);
    if (process.env.RATES_AUTO_REFRESH !== "false") {
      const runRateVerification = () => {
        refreshOfficialRates().catch((err) => {
          console.error("[RateUpdater] Scheduled verification failed:", err);
        });
      };
      const initialTimer = setTimeout(runRateVerification, 60_000);
      initialTimer.unref?.();
      const interval = setInterval(runRateVerification, 24 * 60 * 60 * 1000);
      interval.unref?.();
    }
  };

  if (typeof LISTEN_TARGET === "number") {
    app.listen(LISTEN_TARGET, "0.0.0.0", onListening);
  } else {
    app.listen(LISTEN_TARGET, onListening);
  }
}

startServer();
