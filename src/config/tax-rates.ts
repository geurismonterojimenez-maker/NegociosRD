/**
 * Tasas de impuestos y deducciones oficiales vigentes en la República Dominicana (2024-2026).
 * Fuente: Dirección General de Impuestos Internos (DGII), Tesorería de la Seguridad Social (TSS) y Ministerio de Trabajo.
 */

export const TAX_RATES = {
  // ITBIS (Impuesto sobre Transferencias de Bienes Industrializados y Servicios)
  itbis: {
    general: 0.18,      // 18% Tasa general
    reducida: 0.16,     // 16% Tasa reducida
    exento: 0.00       // Exento
  },

  // TSS - Aportes del Trabajador (Empleado)
  tssEmpleado: {
    afp: 0.0287,       // 2.87% Administradora de Fondos de Pensiones
    sfs: 0.0304,       // 3.04% Seguro Familiar de Salud
  },

  // TSS - Aportes del Empleador (Patronal)
  tssEmpleador: {
    afp: 0.0710,       // 7.10% Aporte patronal jubilaciones
    sfs: 0.0709,       // 7.09% Aporte patronal salud
    srlBase: 0.012,    // 1.20% Seguro de Riesgos Laborales promedio (puede variar entre 1.0% y 1.4%)
    infotep: 0.01      // 1.00% Instituto de Formación Técnica (A cargo del empleador)
  },

  // Topes Salariales Cotizables de la TSS (Salarios Mínimos Nacionales vigentes)
  // El salario nacional base promedio para topes de la TSS se calcula en RD$ 19,300.00 contratado.
  topesCotizables: {
    salarioMinimoTSS: 19300.00,
    afpMultiplicador: 20, // 20 Salarios Mínimos de tope para AFP (máximo cotizable RD$ 386,000.00)
    sfsMultiplicador: 10, // 10 Salarios Mínimos de tope para SFS (máximo cotizable RD$ 193,000.00)
    srlMultiplicador: 4,  // 4 Salarios Mínimos de tope para SRL (máximo cotizable RD$ 77,200.00)
  },

  // Escala Impositiva del Impuesto Sobre la Renta (ISR) para personas físicas / asalariados (Vigente DGII)
  isrEscalasAnuales: [
    {
      limiteMinimo: 0,
      limiteMaximo: 416220.00,
      tasa: 0.0,
      excedenteRestar: 0,
      tasaFijaAdicional: 0
    },
    {
      limiteMinimo: 416220.01,
      limiteMaximo: 624329.00,
      tasa: 0.15,
      excedenteRestar: 416220.01,
      tasaFijaAdicional: 0
    },
    {
      limiteMinimo: 624329.01,
      limiteMaximo: 867123.00,
      tasa: 0.20,
      excedenteRestar: 624329.01,
      tasaFijaAdicional: 31216.00 // Equivalente al 15% del tramo anterior completo
    },
    {
      limiteMinimo: 867123.01,
      limiteMaximo: Infinity,
      tasa: 0.25,
      excedenteRestar: 867123.01,
      tasaFijaAdicional: 79776.00 // Equivalente a las tasas fijas acumuladas
    }
  ],

  // Recargos de la DGII por declaración o pago fuera de fecha (Art. 252 Código Tributario)
  recargosDGII: {
    primerMes: 0.10,            // 10% de recargo por el primer mes o fracción de mes
    mesesSiguientes: 0.04,      // 4% para los meses subsiguientes
    interesIndemnizatorio: 0.011 // 1.1% por mes o fracción de mes de interés indemnizatorio acumulativo
  },

  // Factores Oficiales del Ministerio de Trabajo (Monthly Division Factors)
  laboralFactoresDivision: {
    mensual: 23.83,
    quincenal: 11.91,
    semanal: 5.5,
    diario: 1.0
  }
};
