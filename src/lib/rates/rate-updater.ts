import {
  fetchAfpEmpleadoRate,
  fetchItbisGeneralRate,
  fetchTssSalarioBase,
  RateSourceResult
} from "./rate-sources";

type RateStatus = "current" | "needs_review" | "source_unavailable";

interface StoredRate {
  value: number;
  label: string;
  sourceName: string;
  sourceUrl: string;
  effectiveDate: string;
  lastChecked: string;
  status: RateStatus;
  notes: string;
  verificationStatus?: string;
  lastAttempt?: string;
  candidateValue?: number;
  candidateDetectedAt?: string;
}

export interface RateStatusUpdate {
  key: string;
  previousValue: number;
  newValue: number;
  status: RateStatus;
  sourceName: string;
  sourceUrl: string;
  lastChecked: string;
  notes: string;
  candidateValue?: number;
}

export interface RefreshResult {
  success: boolean;
  timestamp: string;
  rates: Record<string, RateStatusUpdate>;
  warnings: string[];
  changesDetected: boolean;
  pendingReview: Record<string, {
    currentValue: number;
    candidateValue: number;
    sourceUrl: string;
    detectedAt: string;
  }>;
}

const checkedDate = "2026-06-10";
const defaultRatesCache: Record<string, StoredRate> = {
  itbis_general: {
    value: 0.18,
    label: "ITBIS general",
    sourceName: "Direccion General de Impuestos Internos (DGII)",
    sourceUrl: "https://dgii.gov.do",
    effectiveDate: "2013-01-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Tasa general verificada de 18%."
  },
  itbis_reducida: {
    value: 0.16,
    label: "ITBIS reducido",
    sourceName: "Direccion General de Impuestos Internos (DGII)",
    sourceUrl: "https://dgii.gov.do",
    effectiveDate: "2016-01-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Tasa de 16% para bienes expresamente alcanzados."
  },
  afp_empleado: {
    value: 0.0287,
    label: "AFP empleado",
    sourceName: "Tesoreria de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2003-06-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Aporte laboral de 2.87%."
  },
  sfs_empleado: {
    value: 0.0304,
    label: "SFS empleado",
    sourceName: "Tesoreria de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2007-09-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Aporte laboral de 3.04%."
  },
  afp_empleador: {
    value: 0.071,
    label: "AFP empleador",
    sourceName: "Tesoreria de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2003-06-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Aporte patronal de 7.10%."
  },
  sfs_empleador: {
    value: 0.0709,
    label: "SFS empleador",
    sourceName: "Tesoreria de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2007-09-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Aporte patronal de 7.09%."
  },
  srl_base: {
    value: 0.012,
    label: "SRL base",
    sourceName: "Tesoreria de la Seguridad Social (TSS)",
    sourceUrl: "https://tss.gob.do",
    effectiveDate: "2003-06-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Referencia de 1.20%; puede variar por riesgo."
  },
  infotep: {
    value: 0.01,
    label: "INFOTEP empleador",
    sourceName: "INFOTEP",
    sourceUrl: "https://www.infotep.gob.do",
    effectiveDate: "1980-01-16",
    lastChecked: checkedDate,
    status: "current",
    notes: "Aporte patronal de 1.00%."
  },
  salario_minimo_tss: {
    value: 23223,
    label: "Salario base para topes TSS",
    sourceName: "Consejo Nacional de la Seguridad Social (CNSS)",
    sourceUrl: "https://www.cnss.gob.do",
    effectiveDate: "2026-02-01",
    lastChecked: checkedDate,
    status: "current",
    notes: "Base de RD$23,223; topes: SRL 92,892, SFS 232,230 y pensiones 464,460."
  }
};

function getPaths() {
  return {
    runtime: ["data", "official-rates-cache.runtime.json"],
    source: ["src", "lib", "rates", "official-rates-cache.json"],
    audit: ["data", "rate-audit-log.jsonl"]
  };
}

export async function readRatesCache(): Promise<any> {
  if (typeof window !== "undefined") {
    return { rates: defaultRatesCache, status: "synchronized", lastCheckedAll: `${checkedDate}T00:00:00Z` };
  }

  try {
    const fsModule = await import("fs");
    const pathModule = await import("path");
    const fs = fsModule.default || fsModule;
    const path = pathModule.default || pathModule;
    const paths = getPaths();
    for (const segments of [paths.runtime, paths.source]) {
      const filePath = path.join(process.cwd(), ...segments);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    }
  } catch (err) {
    console.error("[RateUpdater] Failed to read rates cache:", err);
  }

  return { rates: defaultRatesCache, status: "synchronized", lastCheckedAll: `${checkedDate}T00:00:00Z` };
}

export async function writeRatesCache(data: any): Promise<boolean> {
  if (typeof window !== "undefined") return false;
  try {
    const fsModule = await import("fs");
    const pathModule = await import("path");
    const fs = fsModule.default || fsModule;
    const path = pathModule.default || pathModule;
    const filePath = path.join(process.cwd(), ...getPaths().runtime);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[RateUpdater] Failed to write rates cache:", err);
    return false;
  }
}

async function appendAuditEntry(entry: Record<string, unknown>): Promise<void> {
  if (typeof window !== "undefined") return;
  try {
    const fsModule = await import("fs");
    const pathModule = await import("path");
    const fs = fsModule.default || fsModule;
    const path = pathModule.default || pathModule;
    const auditPath = path.join(process.cwd(), ...getPaths().audit);
    fs.mkdirSync(path.dirname(auditPath), { recursive: true });
    fs.appendFileSync(auditPath, `${JSON.stringify(entry)}\n`, "utf-8");
  } catch (err) {
    console.error("[RateUpdater] Failed to append audit entry:", err);
  }
}

export async function refreshOfficialRates(): Promise<RefreshResult> {
  const currentStore = await readRatesCache();
  const currentRates: Record<string, StoredRate> = currentStore.rates || defaultRatesCache;
  const warnings: string[] = [];
  const pendingReview: RefreshResult["pendingReview"] = {};
  const checkedAt = new Date().toISOString();
  const sourceResults = await Promise.all([
    fetchItbisGeneralRate(),
    fetchTssSalarioBase(),
    fetchAfpEmpleadoRate()
  ]);
  const checks: Array<{
    key: string;
    result: RateSourceResult;
    unavailable: string;
  }> = [
    { key: "itbis_general", result: sourceResults[0], unavailable: "No se pudo contactar el portal de la DGII." },
    { key: "salario_minimo_tss", result: sourceResults[1], unavailable: "No se pudo contactar el portal de la TSS." },
    { key: "afp_empleado", result: sourceResults[2], unavailable: "No se pudo contactar el portal de SIPEN." }
  ];
  const fileRates: Record<string, StoredRate> = JSON.parse(JSON.stringify(currentRates));

  for (const [key, fallback] of Object.entries(defaultRatesCache)) {
    if (!fileRates[key]) fileRates[key] = JSON.parse(JSON.stringify(fallback));
  }

  for (const check of checks) {
    const stored = fileRates[check.key];
    if (!stored) continue;
    const currentValue = Number(stored.value);
    stored.lastAttempt = checkedAt;
    stored.sourceUrl = check.result.sourceUrl;

    if (check.result.status === "source_unavailable") {
      warnings.push(`${check.unavailable} Se conserva el ultimo valor verificado.`);
      stored.verificationStatus = "source_unavailable";
      continue;
    }
    if (check.result.status !== "current") {
      warnings.push(`${stored.label}: la fuente respondio, pero requiere revision manual.`);
      stored.verificationStatus = "needs_review";
      continue;
    }
    if (Number(check.result.value) !== currentValue) {
      pendingReview[check.key] = {
        currentValue,
        candidateValue: Number(check.result.value),
        sourceUrl: check.result.sourceUrl,
        detectedAt: checkedAt
      };
      stored.status = "needs_review";
      stored.verificationStatus = "candidate_detected";
      stored.candidateValue = Number(check.result.value);
      stored.candidateDetectedAt = checkedAt;
      warnings.push(`${stored.label}: se detecto un valor distinto y quedo pendiente de aprobacion.`);
      continue;
    }

    stored.status = "current";
    stored.verificationStatus = "verified";
    stored.lastChecked = check.result.lastChecked;
    stored.notes = check.result.notes;
    delete stored.candidateValue;
    delete stored.candidateDetectedAt;
  }

  const changesDetected = Object.keys(pendingReview).length > 0;
  const updatedStore = {
    lastAttemptAll: checkedAt,
    lastCheckedAll: changesDetected || warnings.length > 0 ? currentStore.lastCheckedAll : checkedAt,
    status: changesDetected ? "pending_review" : warnings.length === 0 ? "synchronized" : "partial_success",
    pendingReview,
    rates: fileRates
  };
  await writeRatesCache(updatedStore);
  await appendAuditEntry({
    timestamp: checkedAt,
    status: updatedStore.status,
    changesDetected,
    warnings,
    pendingReview
  });

  const rates: Record<string, RateStatusUpdate> = {};
  for (const [key, rate] of Object.entries(fileRates)) {
    rates[key] = {
      key,
      previousValue: currentRates[key]?.value ?? rate.value,
      newValue: rate.value,
      status: rate.status,
      sourceName: rate.sourceName,
      sourceUrl: rate.sourceUrl,
      lastChecked: rate.lastChecked,
      notes: rate.notes,
      candidateValue: rate.candidateValue
    };
  }

  return {
    success: true,
    timestamp: checkedAt,
    rates,
    warnings,
    changesDetected,
    pendingReview
  };
}
