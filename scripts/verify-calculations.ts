import { calculateItbisExcluido, calculateItbisIncluido } from '../src/lib/calculations/itbis';
import { calculateTSSDetails } from '../src/lib/calculations/tss';
import { calculateIsrAsalariado } from '../src/lib/calculations/isr';
import { TAX_RATES } from '../src/config/tax-rates';

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertApprox(actual: number, expected: number, label: string, tolerance = 0.01) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const itbis = calculateItbisExcluido(1000);
assertEqual(itbis.itbisAmount, 180, 'ITBIS excluido sobre RD$ 1,000');
assertEqual(itbis.totalWithItbis, 1180, 'Total con ITBIS sobre RD$ 1,000');

const included = calculateItbisIncluido(1180);
assertEqual(included.baseAmount, 1000, 'Base extraida desde total con ITBIS');
assertEqual(included.itbisAmount, 180, 'ITBIS extraido desde total con ITBIS');

const tss = calculateTSSDetails(50000);
assertApprox(tss.empleado.afp, 1435, 'AFP empleado sobre RD$ 50,000');
assertApprox(tss.empleado.sfs, 1520, 'SFS empleado sobre RD$ 50,000');

const highSalaryTss = calculateTSSDetails(600000);
assertApprox(
  highSalaryTss.empleado.afp,
  TAX_RATES.topesCotizables.salarioMinimoTSS * TAX_RATES.topesCotizables.afpMultiplicador * TAX_RATES.tssEmpleado.afp,
  'AFP empleado respeta tope cotizable'
);

const isr = calculateIsrAsalariado(50000, true);
if (isr.monthlyIsrAmount <= 0) {
  throw new Error('ISR asalariado esperado mayor que cero para RD$ 50,000');
}

console.log('Calculation checks passed');
