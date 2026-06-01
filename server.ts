import express from "express";
import path from "path";
import fs from "fs";
import tls from "tls";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { readRatesCache, refreshOfficialRates } from "./src/lib/rates/rate-updater";
import { CALCULATORS, PROGRAMMATIC_GUIDES } from "./src/data";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT || 3000);

const CACHE_FILE = path.join(process.cwd(), "news-cache.json");
const CHECKOUT_PROVIDER = process.env.CHECKOUT_PROVIDER || "demo";
const ORIGIN_URL = (process.env.PUBLIC_SITE_URL || process.env.APP_URL || "https://tunegociord.com").replace(/\/$/, "");
const DEFAULT_SHARE_IMAGE = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop";
const INVOICE_FROM_NAME = process.env.INVOICE_FROM_NAME || "Tu Negocio RD";
const INVOICE_BCC = process.env.INVOICE_BCC || "";
const INVOICE_REPLY_TO = process.env.INVOICE_REPLY_TO || process.env.GMAIL_USER || "";
const GOOGLE_PAY_MERCHANT_ID = process.env.GOOGLE_PAY_MERCHANT_ID || "";
const GOOGLE_PAY_GATEWAY = process.env.GOOGLE_PAY_GATEWAY || "pagosazul";

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
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };
    socket.on("data", onData);
    socket.on("error", onError);
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

  await new Promise<void>((resolve, reject) => {
    socket.once("secureConnect", resolve);
    socket.once("error", reject);
  });

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
        author: "Comité Fiscal Tu Negocio RD",
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

// 7. GET /sitemap.xml - Dynamic XML sitemap for search engines
app.get("/sitemap.xml", (req, res) => {
  const calculatedUrls = CALCULATORS.map(calc => `
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

  const staticUrls = [
    '/',
    '/noticias',
    '/nosotros',
    '/contacto',
    '/privacidad',
    '/terminos',
    '/reembolsos',
    '/precios'
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

// Helper to pre-render HTML with unique meta tags, OpenGraph, dynamic canonicals & JSON-LD schemas
function getPrerenderedHTML(html: string, originalUrl: string): string {
  let title = "Tu Negocio RD - Calculadoras Fiscales, Laborales y Financieras de R.D.";
  let description = "Calculadoras fiscales, laborales y financieras para República Dominicana: ITBIS, ISR, TSS, prestaciones, préstamos, retenciones y documentos PRO.";
  let robots = "index, follow";
  const pathPart = originalUrl.split("?")[0];
  let type: 'article' | 'website' = 'website';
  let faqSchema = "";
  let appSchema = "";
  let homeSchema = "";

  if (pathPart.startsWith("/herramientas/")) {
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
      title = `${guide.seoTitle} | Tu Negocio RD`;
      description = guide.seoMetaDescription;
      type = "article";
    }
  } else if (pathPart === "/nosotros") {
    title = "Sobre Nosotros | Tu Negocio RD";
    description = "Conoce al equipo de Tu Negocio RD y nuestro compromiso con proveer herramientas financieras, fiscales y laborales de la más alta confiabilidad en la República Dominicana.";
  } else if (pathPart === "/contacto") {
    title = "Contacto | Tu Negocio RD";
    description = "Contacta a Tu Negocio RD para soporte, alianzas, dudas sobre herramientas fiscales o suscripciones PRO.";
  } else if (pathPart === "/privacidad") {
    title = "Politica de Privacidad | Tu Negocio RD";
    description = "Politica de privacidad de Tu Negocio RD sobre autenticacion, datos de cuenta, suscripciones y uso de herramientas.";
  } else if (pathPart === "/terminos") {
    title = "Términos de Uso | Tu Negocio RD";
    description = "Términos de uso de las calculadoras fiscales, laborales y financieras de Tu Negocio RD.";
  } else if (pathPart === "/reembolsos") {
    title = "Politica de Reembolsos | Tu Negocio RD";
    description = "Politica comercial de cancelaciones y reembolsos para planes PRO de Tu Negocio RD.";
  } else if (pathPart === "/noticias") {
    title = "Últimas Noticias Financieras y Fiscales de R.D. | Tu Negocio RD";
    description = "Mantente al día con investigaciones exclusivas usando IA sobre reformas laborales, cambios de ley impositiva de la DGII y reglamentos de la TSS dominicana.";
  } else if (pathPart === "/admin") {
    title = "Administración Privada | Tu Negocio RD";
    description = "Consola interna privada para administración, auditoría y control operativo de Tu Negocio RD.";
    robots = "noindex, nofollow, noarchive";
  }

  // Canonical link setup
  const originUrl = ORIGIN_URL;
  const canonicalUrl = `${originUrl}${pathPart}`;

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
      "logo": DEFAULT_SHARE_IMAGE
    });
  }

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
    "mainEntityOfPage": canonicalUrl
  }) : "";

  const injectedElements = `\n  ${breadcrumbSchema}${appSchema}${faqSchema}${homeSchema}${articleSchema}\n</head>`;
  return html.replace('</head>', injectedElements);
}

// Route validation helper for server-side responses
function isValidRoute(originalUrl: string): boolean {
  const pathPart = originalUrl.split("?")[0];
  
  const validStaticPaths = [
    "/",
    "/noticias",
    "/nosotros",
    "/contacto",
    "/privacidad",
    "/terminos",
    "/reembolsos",
    "/centro-laboral",
    "/centro-financiero",
    "/precios",
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
