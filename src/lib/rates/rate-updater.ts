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
  afp_empleador: {
    value: 0.0710,
    label: "AFP Empleador",
    sourceName: "Tesorería de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2003-06-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Contribución patronal al plan de pensiones ordinario (7.10%)."
  },
  sfs_empleador: {
    value: 0.0709,
    label: "SFS Empleador",
    sourceName: "Tesorería de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2007-09-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Contribución patronal al seguro de salud familiar (7.09%)."
  },
  srl_base: {
    value: 0.0120,
    label: "SRL Seguro Riesgos Laborales Base",
    sourceName: "Tesorería de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2003-06-01",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Aporte patronal de riesgos de accidentes laborales de promedio sectorial de 1.20%."
  },
  infotep: {
    value: 0.0100,
    label: "Aporte INFOTEP Patronal",
    sourceName: "Instituto de Formación Técnica (INFOTEP)",
    sourceUrl: "https://www.infotep.gob.do",
    effectiveDate: "1980-01-16",
    lastChecked: "2026-05-30",
    status: "current",
    notes: "Ley 116-80 sobre capacitación laboral de un 1.00% corporativo."
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

  // 4. Update the disk cache structure safely, preserving everything else!
  const fileRates = JSON.parse(JSON.stringify(currentRates));

  if (fileRates.itbis_general) {
    fileRates.itbis_general.value = itbisRes.value;
    fileRates.itbis_general.status = itbisRes.status;
    fileRates.itbis_general.lastChecked = itbisRes.lastChecked;
    fileRates.itbis_general.sourceUrl = itbisRes.sourceUrl;
    if (itbisRes.notes) fileRates.itbis_general.notes = itbisRes.notes;
  }
  
  if (fileRates.salario_minimo_tss) {
    fileRates.salario_minimo_tss.value = tssRes.value;
    fileRates.salario_minimo_tss.status = tssRes.status;
    fileRates.salario_minimo_tss.lastChecked = tssRes.lastChecked;
    fileRates.salario_minimo_tss.sourceUrl = tssRes.sourceUrl;
    if (tssRes.notes) fileRates.salario_minimo_tss.notes = tssRes.notes;
  }

  if (fileRates.afp_empleado) {
    fileRates.afp_empleado.value = afpRes.value;
    fileRates.afp_empleado.status = afpRes.status;
    fileRates.afp_empleado.lastChecked = afpRes.lastChecked;
    fileRates.afp_empleado.sourceUrl = afpRes.sourceUrl;
    if (afpRes.notes) fileRates.afp_empleado.notes = afpRes.notes;
  }

  // Also verify other standard keys exist from fallbacks if we lost them earlier
  const fallbackKeys = Object.keys(defaultRatesCache);
  for (const fk of fallbackKeys) {
    if (!fileRates[fk]) {
      fileRates[fk] = JSON.parse(JSON.stringify((defaultRatesCache as any)[fk]));
    }
  }

  // Compile final store state for disk writing
  const updatedStore = {
    lastCheckedAll: new Date().toISOString(),
    status: warnings.length === 0 ? "synchronized" : "partial_success",
    rates: fileRates
  };

  // Persist back to the cache file (Saves standard structure with "value" intact!)
  await writeRatesCache(updatedStore);

  // Now build compliant RateStatusUpdate structures for the API return value
  const updatedRatesResult: Record<string, RateStatusUpdate> = {};
  for (const k of Object.keys(fileRates)) {
    const originalRateVal = currentRates[k]?.value ?? fileRates[k].value;
    updatedRatesResult[k] = {
      key: k,
      previousValue: originalRateVal,
      newValue: fileRates[k].value,
      status: fileRates[k].status,
      sourceName: fileRates[k].sourceName,
      sourceUrl: fileRates[k].sourceUrl,
      lastChecked: fileRates[k].lastChecked,
      notes: fileRates[k].notes
    };
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    rates: updatedRatesResult,
    warnings,
    changesDetected
  };
}
