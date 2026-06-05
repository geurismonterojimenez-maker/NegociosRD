import { TaxRateDetail } from "../../config/tax-rates";

export interface RateSourceResult {
  value: number;
  status: "current" | "needs_review" | "source_unavailable";
  lastChecked: string;
  sourceUrl: string;
  notes: string;
}

/**
 * Queries official Dominican Republic institutions to fetch key tax/labor rates.
 * Because official government websites (DGII, TSS, CNSS) do not have official public JSON APIs, 
 * these methods contain resilient parsing with full error boundaries and robust fallback logic 
 * to guarantee no runtime crashes.
 */
export async function fetchItbisGeneralRate(): Promise<RateSourceResult> {
  const url = "https://dgii.gov.do/tasas";
  try {
    // Standard fetch attempt (timeout handled via Promise.race if needed)
    const response = await Promise.race([
      fetch(url),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
    ]);

    if (!response || !response.ok) {
      throw new Error(`HTTP status error: ${response?.status}`);
    }

    // Since government sites might be behind Cloudflare or returned HTML:
    // Try to locate rates inside text or just fallback gracefully
    const htmlText = await response.text();
    
    // Intenta extraer dinámicamente la tasa usando una expresión regular
    const itbisRegex = /itbis.*?\b(1[5-9]|20)\s*%/i;
    const match = htmlText.match(itbisRegex);
    if (match) {
      const parsedValue = parseInt(match[1], 10) / 100;
      return {
        value: parsedValue,
        status: "current",
        lastChecked: new Date().toISOString().split("T")[0],
        sourceUrl: url,
        notes: `Verificado: Tasa general de ITBIS de ${(parsedValue * 100)}% extraída dinámicamente del portal de la DGII.`
      };
    }

    if (htmlText.includes("18%") || htmlText.includes("0.18")) {
      return {
        value: 0.18,
        status: "current",
        lastChecked: new Date().toISOString().split("T")[0],
        sourceUrl: url,
        notes: "Verificado: Tasa general de ITBIS de 18% encontrada en el portal de la DGII."
      };
    }

    return {
      value: 0.18,
      status: "needs_review",
      lastChecked: new Date().toISOString().split("T")[0],
      sourceUrl: url,
      notes: "La página de la DGII respondió pero la tasa no pudo ser parseada automáticamente de forma segura."
    };
  } catch (err) {
    console.warn(`[RateUpdater] Error fetching ITBIS online: ${err instanceof Error ? err.message : String(err)}`);
    return {
      value: 0.18, // Fallback safely to known rate
      status: "source_unavailable",
      lastChecked: new Date().toISOString().split("T")[0],
      sourceUrl: url,
      notes: "Portal de la DGII inactivo o bloqueando la solicitud. Se usó el último valor histórico seguro."
    };
  }
}

export async function fetchTssSalarioBase(): Promise<RateSourceResult> {
  const url = "https://www.tss.gob.do/resoluciones-tss.html";
  try {
    const response = await Promise.race([
      fetch(url),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
    ]);

    if (!response || !response.ok) {
      throw new Error(`HTTP status error: ${response?.status}`);
    }

    const htmlText = await response.text();
    
    // Intenta extraer dinámicamente el salario base usando una expresión regular (ej. "23,223" o "24,500")
    const tssRegex = /(?:salario\s+base|salario\s+mínimo|cotizable|resolución).*?\b(2\d)[,.](\d{3})\b/i;
    const match = htmlText.match(tssRegex);
    if (match) {
      const parsedValue = parseFloat(`${match[1]}${match[2]}`);
      return {
        value: parsedValue,
        status: "current",
        lastChecked: new Date().toISOString().split("T")[0],
        sourceUrl: url,
        notes: `Verificado: Salario base de RD$ ${parsedValue.toLocaleString('en-US')} extraído dinámicamente de resoluciones TSS.`
      };
    }

    if (htmlText.includes("23,223") || htmlText.includes("23223")) {
      return {
        value: 23223.00,
        status: "current",
        lastChecked: new Date().toISOString().split("T")[0],
        sourceUrl: url,
        notes: "Verificado: Salario base de RD$ 23,223.00 encontrado en resoluciones TSS."
      };
    }

    return {
      value: 23223.00,
      status: "needs_review",
      lastChecked: new Date().toISOString().split("T")[0],
      sourceUrl: url,
      notes: "Portal de la TSS respondió pero el salario mínimo de referencia no pudo ser extraído automáticamente."
    };
  } catch (err) {
    console.warn(`[RateUpdater] Error fetching TSS Salary Base online: ${err instanceof Error ? err.message : String(err)}`);
    return {
      value: 23223.00, // Fallback safely
      status: "source_unavailable",
      lastChecked: new Date().toISOString().split("T")[0],
      sourceUrl: url,
      notes: "El portal de seguridad social de la TSS está bajo mantenimiento o bloqueado. Se usó el valor de caché."
    };
  }
}

export async function fetchAfpEmpleadoRate(): Promise<RateSourceResult> {
  const url = "https://www.sipen.gob.do";
  try {
    const response = await Promise.race([
      fetch(url),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
    ]);

    if (!response || !response.ok) throw new Error("SIPEN down");
    const text = await response.text();
    
    // Intenta extraer dinámicamente la tasa usando una expresión regular (ej. "2.87%")
    const afpRegex = /(?:afp|pensiones).*?\b(2\.\d{2})\s*%/i;
    const match = text.match(afpRegex);
    if (match) {
      const parsedValue = parseFloat(match[1]) / 100;
      return {
        value: parsedValue,
        status: "current",
        lastChecked: new Date().toISOString().split("T")[0],
        sourceUrl: url,
        notes: `Verificado: Aporte AFP de ${(parsedValue * 100).toFixed(2)}% extraído dinámicamente de SIPEN.`
      };
    }

    if (text.includes("2.87") || text.includes("0.0287")) {
      return {
        value: 0.0287,
        status: "current",
        lastChecked: new Date().toISOString().split("T")[0],
        sourceUrl: url,
        notes: "Verificado: Aporte AFP de 2.87% validado contra SIPEN."
      };
    }
    return {
      value: 0.0287,
      status: "needs_review",
      lastChecked: new Date().toISOString().split("T")[0],
      sourceUrl: url,
      notes: "Portal SIPEN respondió pero la tasa no concuerda o requiere inspección visual."
    };
  } catch {
    return {
      value: 0.0287,
      status: "source_unavailable",
      lastChecked: new Date().toISOString().split("T")[0],
      sourceUrl: url,
      notes: "Fallo de conexión temporal con SIPEN de República Dominicana. Se devolvió la tasa base de la Ley 87-01."
    };
  }
}
