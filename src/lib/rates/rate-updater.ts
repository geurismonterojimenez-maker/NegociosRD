import { 
  fetchItbisGeneralRate, 
  fetchTssSalarioBase, 
  fetchAfpEmpleadoRate,
  RateSourceResult 
} from "./rate-sources";

export interface RateStatusUpdate {
  key: string;
  previousValue: number;
  newValue: number;
  status: "current" | "needs_review" | "source_unavailable";
  sourceName: string;
  sourceUrl: string;
  lastChecked: string;
  notes: string;
}

export interface RefreshResult {
  success: boolean;
  timestamp: string;
  rates: Record<string, RateStatusUpdate>;
  warnings: string[];
  changesDetected: boolean;
}

// Default in-memory rates fallback database
const defaultRatesCache = {
  itbis_general: {
    value: 0.18,
    label: "ITBIS General",
    sourceName: "Dirección General de Impuestos Internos (DGII)",
    sourceUrl: "https://dgii.gov.do",
    effectiveDate: "2013-01-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Tasa base estándar de 18%."
  },
  itbis_reducida: {
    value: 0.16,
    label: "ITBIS Reducido",
    sourceName: "Dirección General de Impuestos Internos (DGII)",
    sourceUrl: "https://dgii.gov.do",
    effectiveDate: "2016-01-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Tasa del 16% para determinados productos de la canasta comercial procesados."
  },
  afp_empleado: {
    value: 0.0287,
    label: "AFP Empleado",
    sourceName: "Tesorería de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2003-06-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Aporte laboral del 2.87%."
  },
  sfs_empleado: {
    value: 0.0304,
    label: "SFS Empleado",
    sourceName: "Tesorería de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2007-09-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Seguro Familiar de Salud laboral de 3.04%."
  },
  salario_minimo_tss: {
    value: 23223.00,
    label: "Salario Mínimo Nacional TSS",
    sourceName: "Consejo Nacional de la Seguridad Social (CNSS)",
    sourceUrl: "https://www.cnss.gob.do",
    effectiveDate: "2024-02-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Sueldo de referencia nacional de RD$ 23,223.00 para límites TSS."
  }
};

/**
 * Resiliently reads the official rates cache from JSON file on Node server, or falls back to in-memory store.
 */
export async function readRatesCache(): Promise<any> {
  if (typeof window === "undefined") {
    try {
      const fsModule = await import("fs");
      const pathModule = await import("path");
      const fs = fsModule.default || fsModule;
      const path = pathModule.default || pathModule;
      
      const filePath = path.join(process.cwd(), "src", "lib", "rates", "official-rates-cache.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error("[RateUpdater] Failed to read rates cache file, using schema memory fallback:", err);
    }
  }
  return { rates: defaultRatesCache, status: "synchronized", lastCheckedAll: "2026-05-30T15:00:00Z" };
}

/**
 * Writes the refreshed rates cache back to JSON.
 */
export async function writeRatesCache(data: any): Promise<boolean> {
  if (typeof window === "undefined") {
    try {
      const fsModule = await import("fs");
      const pathModule = await import("path");
      const fs = fsModule.default || fsModule;
      const path = pathModule.default || pathModule;
      
      const filePath = path.join(process.cwd(), "src", "lib", "rates", "official-rates-cache.json");
      
      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error("[RateUpdater] Failed to write refreshed rates to JSON cache:", err);
    }
  }
  return false;
}

/**
 * Orchestrates a complete rate scraping refresh, tracks any modifications, 
 * issues clear warnings/alerts and saves the synchronized state locally.
 */
export async function refreshOfficialRates(): Promise<RefreshResult> {
  const currentStore = await readRatesCache();
  const currentRates = currentStore.rates || defaultRatesCache;
  
  const warnings: string[] = [];
  let changesDetected = false;
  
  // 1. Fetch ITBIS
  const itbisRes = await fetchItbisGeneralRate();
  if (itbisRes.status === "source_unavailable") {
    warnings.push("No se pudo contactar el portal de la DGII. Fallback activo.");
  }
  
  const originalItbis = currentRates.itbis_general?.value ?? 0.18;
  if (itbisRes.value !== originalItbis && itbisRes.status === "current") {
    changesDetected = true;
  }
  
  // 2. Fetch TSS Salario Mínimo Base
  const tssRes = await fetchTssSalarioBase();
  if (tssRes.status === "source_unavailable") {
    warnings.push("La conexión con la Tesorería de la Seguridad Social (TSS) falló. Se usó el último tope registrado.");
  }
  
  const originalTss = currentRates.salario_minimo_tss?.value ?? 23223.00;
  if (tssRes.value !== originalTss && tssRes.status === "current") {
    changesDetected = true;
  }

  // 3. Fetch AFP Empleado
  const afpRes = await fetchAfpEmpleadoRate();
  if (afpRes.status === "source_unavailable") {
    warnings.push("No se pudo contactar el SIPEN. Carga de parámetros pasiva.");
  }

  const originalAfp = currentRates.afp_empleado?.value ?? 0.0287;
  if (afpRes.value !== originalAfp && afpRes.status === "current") {
    changesDetected = true;
  }

  // Map results to standard structure
  const updatedRates: Record<string, RateStatusUpdate> = {
    itbis_general: {
      key: "itbis_general",
      previousValue: originalItbis,
      newValue: itbisRes.value,
      status: itbisRes.status,
      sourceName: "Dirección General de Impuestos Internos (DGII)",
      sourceUrl: itbisRes.sourceUrl,
      lastChecked: itbisRes.lastChecked,
      notes: itbisRes.notes
    },
    itbis_reducida: {
      key: "itbis_reducida",
      previousValue: currentRates.itbis_reducida?.value ?? 0.16,
      newValue: currentRates.itbis_reducida?.value ?? 0.16,
      status: currentRates.itbis_reducida?.status ?? "current",
      sourceName: "Dirección General de Impuestos Internos (DGII)",
      sourceUrl: "https://dgii.gov.do",
      lastChecked: new Date().toISOString().split("T")[0],
      notes: currentRates.itbis_reducida?.notes ?? "Tasa reducida aplicable."
    },
    afp_empleado: {
      key: "afp_empleado",
      previousValue: originalAfp,
      newValue: afpRes.value,
      status: afpRes.status,
      sourceName: "Tesorería de la Seguridad Social (TSS)",
      sourceUrl: afpRes.sourceUrl,
      lastChecked: afpRes.lastChecked,
      notes: afpRes.notes
    },
    sfs_empleado: {
      key: "sfs_empleado",
      previousValue: currentRates.sfs_empleado?.value ?? 0.0304,
      newValue: currentRates.sfs_empleado?.value ?? 0.0304,
      status: currentRates.sfs_empleado?.status ?? "current",
      sourceName: "Tesorería de la Seguridad Social (TSS)",
      sourceUrl: "https://tss.gob.do",
      lastChecked: new Date().toISOString().split("T")[0],
      notes: currentRates.sfs_empleado?.notes ?? "Seguro Familiar de Salud laboral."
    },
    salario_minimo_tss: {
      key: "salario_minimo_tss",
      previousValue: originalTss,
      newValue: tssRes.value,
      status: tssRes.status,
      sourceName: "Consejo Nacional de la Seguridad Social (CNSS)",
      sourceUrl: tssRes.sourceUrl,
      lastChecked: tssRes.lastChecked,
      notes: tssRes.notes
    }
  };

  // Compile final store state
  const updatedStore = {
    lastCheckedAll: new Date().toISOString(),
    status: warnings.length === 0 ? "synchronized" : "partial_success",
    rates: updatedRates
  };

  // Persist back to the cache file
  await writeRatesCache(updatedStore);

  return {
    success: true,
    timestamp: new Date().toISOString(),
    rates: updatedRates,
    warnings,
    changesDetected
  };
}
