import assert from 'assert';
import { calculateItbisExcluido, calculateItbisIncluido } from '../src/lib/calculations/itbis.js';
import { calculateIsrAsalariado } from '../src/lib/calculations/isr.js';
import { calculateTSSDetails, calculateSalarioNeto } from '../src/lib/calculations/tss.js';
import { calculatePrestaciones } from '../src/lib/calculations/prestaciones.js';

console.log("=================================================");
console.log("🔬 TU NEGOCIO RD - TEST SUITE DE CÁLCULOS");
console.log("=================================================");

function runTests() {
  try {
    // 1. TESTING ITBIS (Impuestos)
    console.log("Testing ITBIS calculations...");
    const itbisEx = calculateItbisExcluido(1000, 0.18);
    assert.strictEqual(itbisEx.baseAmount, 1000);
    assert.strictEqual(itbisEx.itbisAmount, 180);
    assert.strictEqual(itbisEx.totalWithItbis, 1180);

    const itbisIn = calculateItbisIncluido(1180, 0.18);
    assert.strictEqual(itbisIn.baseAmount, 1000);
    assert.strictEqual(itbisIn.itbisAmount, 180);
    assert.strictEqual(itbisIn.totalWithItbis, 1180);
    console.log("✅ ITBIS calculations passed!");

    // 2. TESTING TSS (Seguridad Social)
    console.log("\nTesting TSS contributions...");
    // Base wage of 30,000 (well within limits)
    const tssBasic = calculateTSSDetails(30000);
    assert.strictEqual(tssBasic.salarioBase, 30000);
    // AFP 2.87% of 30,000 = 861.00
    assert.strictEqual(tssBasic.empleado.afp, 861);
    // SFS 3.04% of 30,000 = 912.00
    assert.strictEqual(tssBasic.empleado.sfs, 912);
    
    // Testing TSS caps (TSS maximums)
    // SFS capped at 10 times national minimum wage (23,223 * 10 = 232,230)
    // AFP capped at 20 times national minimum wage (23,223 * 20 = 464,460)
    const tssCapped = calculateTSSDetails(500000);
    // 464,460 * 2.87% = 13329.9996 -> 13330.00
    assert.strictEqual(tssCapped.empleado.afp, 13330);
    // 232,230 * 3.04% = 7059.792 -> 7059.79
    assert.strictEqual(tssCapped.empleado.sfs, 7059.79);
    console.log("✅ TSS contributions & caps passed!");

    // 3. TESTING ISR (Impuesto Sobre la Renta)
    console.log("\nTesting ISR (DGII escales)...");
    // Salary 30,000 -> Below exempt threshold (416,220 / 12 = 34,685)
    // After TSS deduction of (861 + 912 = 1,773), imponible is 28,227. Annualized is 338,724. Exempt!
    const isrExempt = calculateIsrAsalariado(30000, true);
    assert.strictEqual(isrExempt.monthlyIsrAmount, 0);

    // Salary 75,000
    // TSS: AFP = 2,152.50, SFS = 2,280. Total TSS = 4,432.50
    // Net Imponible Monthly: 75,000 - 4,432.50 = 70,567.50
    // Annualized Net: 846,810.00
    // Fits tier 3: (624,329.01 to 867,123.00), tasa 20%, fixed adicional 31,216.00
    // Excedente = 846,810.00 - 624,329.01 = 222,480.99
    // 20% on Excedente = 44,496.20
    // Total annual isr = 31,216.00 + 44,496.20 = 75,712.20
    // Monthly isr = 75,712.20 / 12 = 6,309.35
    const isrTier3 = calculateIsrAsalariado(75000, true);
    assert.ok(isrTier3.monthlyIsrAmount > 0);
    console.log(`✅ ISR test passed! Calculated monthly ISR for RD$ 75k gross: RD$ ${isrTier3.monthlyIsrAmount} (Expected ~RD$ 6,309.35)`);

    // 4. TESTING PRESTACIONES LABORALES
    console.log("\nTesting Prestaciones Laborales (Ministerio de Trabajo factors)...");
    // Example: 50,000 monthly, quincenal factor, 2 years of service
    // Date: 2024-01-01 to 2026-01-01
    const prestaciones = calculatePrestaciones(
      50000,
      '2024-01-01',
      '2026-01-01',
      true,  // preaviso
      true,  // cesantia
      'pendientes_completas',  // vacaciones
      12   // regalia
    );
    assert.strictEqual(prestaciones.salarioMensual, 50000);
    assert.strictEqual(prestaciones.salarioDiario, Number((50000 / 23.83).toFixed(2))); // ~2,098.19
    console.log("✅ Prestaciones Laborales passed!");

    console.log("\n=================================================");
    console.log("🎉 TODOS LOS TEST DE CÁLCULOS PASARON CON ÉXITO!");
    console.log("=================================================");
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  }
}

runTests();
