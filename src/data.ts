import { CalculatorInfo, FaqItem, GuidePage, SEOContent } from './types';

export const CATEGORIES = [
  { id: 'impuestos', name: 'Impuestos', icon: 'account_balance', descdgii: '8 calculadoras DGII', color: 'text-teal-600 bg-teal-50' },
  { id: 'laboral', name: 'Laboral', icon: 'groups', descdgii: '10 cálculos de prestaciones y TSS', color: 'text-amber-600 bg-amber-50' },
  { id: 'finanzas', name: 'Finanzas', icon: 'payments', descdgii: '3 simuladores de préstamos', color: 'text-blue-600 bg-blue-50' },
  { id: 'negocios', name: 'Negocios', icon: 'business_center', descdgii: 'Herramientas de margen y costo', color: 'text-indigo-600 bg-indigo-50' }
];

export const CALCULATORS: CalculatorInfo[] = [
  // IMPUESTOS
  {
    id: 'itbis-calc',
    name: 'Calculadora ITBIS',
    shortDescription: 'Calcula el ITBIS (18% o 16%) rápido.',
    description: 'Calcula el Impuesto sobre Transferencias de Bienes Industrializados y Servicios (ITBIS) del 18% o 16% sobre un monto neto para transacciones en República Dominicana.',
    category: 'impuestos',
    tags: ['ITBIS', 'DGII', 'Factura'],
    urlSlug: 'calculadora-itbis',
    seoTitle: 'Calculadora ITBIS República Dominicana — DGII 18% y 16%',
    seoMetaDescription: 'Calcula el ITBIS (18% y 16%) de tus bienes o servicios de forma precisa en RD. Realiza tus cálculos fiscales de la DGII de manera rápida y gratuita.',
    hasFaq: true
  },
  {
    id: 'itbis-incluido',
    name: 'ITBIS Incluido',
    shortDescription: 'Extrae el valor neto de un total con ITBIS.',
    description: 'Desglosa de manera exacta el valor neto de un precio final que ya incluye el ITBIS (18% o 16%), mostrándote el impuesto retenido o cobrado.',
    category: 'impuestos',
    tags: ['ITBIS', 'Desglose', 'Precio'],
    urlSlug: 'itbis-incluido',
    seoTitle: 'Calculadora de ITBIS Incluido RD — Desglose Neto',
    seoMetaDescription: '¿Tienes un total con ITBIS incluido y quieres saber el valor neto? Utiliza este simulador para desglosar el 18% o 16% de ITBIS de tu factura en RD.',
    hasFaq: true
  },
  {
    id: 'itbis-excluido',
    name: 'ITBIS Excluido',
    shortDescription: 'Suma el ITBIS a un valor neto o base.',
    description: 'Calcula el ITBIS adicional de un precio neto y obtén el total final de cobro. Ideal para preparar cotizaciones y facturas profesionales.',
    category: 'impuestos',
    tags: ['ITBIS', 'Adicional', 'Cotización'],
    urlSlug: 'itbis-excluido',
    seoTitle: 'Calculadora de ITBIS Excluido — Añadir 18% o 16%',
    seoMetaDescription: 'Calcula el total a facturar sumando el 18% o 16% de ITBIS al monto neto. Herramienta para profesionales independientes y empresas de RD.',
    hasFaq: true
  },
  {
    id: 'isr-asalariado',
    name: 'Calculadora ISR',
    shortDescription: 'Estima la retención del Impuesto Sobre la Renta.',
    description: 'Calcula la retención mensual del Impuesto Sobre la Renta (ISR) para empleados o profesionales independientes en República Dominicana bajo las escalas vigentes de la DGII.',
    category: 'impuestos',
    tags: ['ISR', 'DGII', 'Renta', 'Retención'],
    urlSlug: 'calculadora-isr',
    seoTitle: 'Calculadora de ISR para Asalariados RD — Escala DGII',
    seoMetaDescription: 'Simula el cobro del Impuesto Sobre la Renta (ISR) mensual y anualizado utilizando la escala impositiva de la DGII. Totalmente actualizado.',
    hasFaq: true
  },
  {
    id: 'retenciones-dgii',
    name: 'Calculadora de Retenciones',
    shortDescription: 'Retenciones del ITBIS e ISR para servicios.',
    description: 'Aplica las retenciones correspondientes del ITBIS (30%, 100%) y del Impuesto Sobre la Renta (10% por honorarios, 2% por servicios técnicos, etc.) según las normas y el Código Tributario.',
    category: 'impuestos',
    tags: ['Retenciones', 'ITBIS', 'ISR', 'Honorarios'],
    urlSlug: 'calculadora-retenciones',
    seoTitle: 'Calculadora de Retenciones DGII RD — ISR e ITBIS de Servicios',
    seoMetaDescription: 'Realiza el cálculo de retenciones del ITBIS (30%, 100%) e ISR (10% honorarios profesionales, 2% servicios técnicos) de acuerdo con las normativas actuales.',
    hasFaq: true
  },
  {
    id: 'recargos-dgii',
    name: 'Calculadora de Recargos',
    shortDescription: 'Cálculo de mora e interés indemnizatorio.',
    description: 'Calcula la multa de la DGII por pago tardío de impuestos según el artículo 252 (10% de mora el primer mes, 4% subsiguientes, más 1.1% mensual de interés indemnizatorio).',
    category: 'impuestos',
    tags: ['Mora', 'Recargos', 'Interés', 'DGII'],
    urlSlug: 'calculadora-recargos-dgii',
    seoTitle: 'Calculadora de Recargos, Mora e Intereses DGII — RD',
    seoMetaDescription: '¿Pagaste tarde tus impuestos? Calcula de forma exacta las penalidades de la DGII aplicables: 10% de recargo por mora inicial, 4% mensual y 1.1% de interés.',
    hasFaq: true
  },

  // LABORAL
  {
    id: 'salario-neto',
    name: 'Salario Neto',
    shortDescription: 'Deduce TSS e ISR para conocer tu sueldo real.',
    description: 'Calcula tu salario real mensual en pesos después de descontar el Seguro Familiar de Salud (SFS), la Administradora de Fondos de Pensiones (AFP) y el Impuesto Sobre la Renta (ISR).',
    category: 'laboral',
    tags: ['Sueldo', 'Deducciones', 'TSS', 'ISR', 'Neto'],
    urlSlug: 'calculadora-salario-neto',
    seoTitle: 'Calculadora de Salario Neto República Dominicana — TSS e ISR',
    seoMetaDescription: 'Ingresa tu sueldo bruto para obtener tu sueldo neto y ver detalladamente cuántos pesos se descuentan por AFP, SFS e Impuesto Sobre la Renta (ISR).',
    hasFaq: true
  },
  {
    id: 'afp-empleado',
    name: 'Calculadora AFP',
    shortDescription: 'Aporte de AFP de empleados (2.87%).',
    description: 'Calcula el descuento mensual exacto correspondiente a la AFP (2.87%) sobre el salario imponible, aplicando el tope legal de 20 salarios mínimos nacionales.',
    category: 'laboral',
    tags: ['AFP', 'TSS', 'Pensiones', 'Empleado'],
    urlSlug: 'calculadora-afp',
    seoTitle: 'Calculadora AFP Empleado RD — Descuento del 2.87%',
    seoMetaDescription: 'Calcula el aporte mensual para el fondo de pensiones de los trabajadores en República Dominicana. Respeta los topes históricos de la TSS en 2026.',
    hasFaq: true
  },
  {
    id: 'sfs-empleado',
    name: 'Calculadora SFS',
    shortDescription: 'Aporte para Seguro Familiar de Salud (3.04%).',
    description: 'Calcula la deducción del Seguro Familiar de Salud (SFS) del 3.04% a cargo de los empleados en República Dominicana, con tope impositivo de 10 salarios mínimos.',
    category: 'laboral',
    tags: ['SFS', 'TSS', 'Salud', 'Empleado'],
    urlSlug: 'calculadora-sfs',
    seoTitle: 'Calculadora SFS Empleado RD — Seguro Familiar de Salud',
    seoMetaDescription: 'Conoce exactamente el descuento del 3.04% para el seguro de salud familiar en RD. Calcula el monto en base a tu sueldo ordinario y el tope TSS correspondiente.',
    hasFaq: true
  },
  {
    id: 'tss-completa',
    name: 'Calculadora TSS',
    shortDescription: 'Desglose detallado de aportes de empleado y empleador.',
    description: 'Permite simular el costo exacto de la Seguridad Social para ambas partes: empleado (2.87% AFP, 3.04% SFS) y empleador (7.10% AFP, 7.09% SFS, 1.2% SRL, 1.0% INFOTEP).',
    category: 'laboral',
    tags: ['TSS', 'Patronal', 'SRL', 'INFOTEP', 'Costo'],
    urlSlug: 'calculadora-tss',
    seoTitle: 'Calculadora TSS de Empleado y Empleador RD — Costos Laborales',
    seoMetaDescription: 'Realiza el desglose completo de la TSS de la nómina dominicana. Descubre cuánto paga el empleador en AFP, SFS, SRL e INFOTEP, y cuánto descuentan al empleado.',
    hasFaq: true
  },
  {
    id: 'prestaciones-laborales',
    name: 'Prestaciones Laborales',
    shortDescription: 'Completo informe de liquidación de contrato.',
    description: 'Calcula la liquidación de ley completa al finalizar una relación de trabajo, incluyendo los derechos de preaviso, cesantía, vacaciones completas o proporcionales, y salario de navidad.',
    category: 'laboral',
    tags: ['Liquidación', 'Despidos', 'Trabajo', 'Derechos'],
    urlSlug: 'calculadora-prestaciones-laborales',
    seoTitle: 'Calculadora de Prestaciones Laborales República Dominicana',
    seoMetaDescription: 'Calcula de forma oficial las prestaciones de trabajo según el Código de Trabajo del Ministerio de Trabajo. Preaviso, Cesantía, Vacaciones y Regalía.',
    hasFaq: true
  },
  {
    id: 'liquidacion-laboral',
    name: 'Calculadora Liquidación',
    shortDescription: 'Estimación rápida de liquidación laboral.',
    description: 'Simula los escenarios de terminación laboral en RD: Mutuo acuerdo, renuncia del empleado o despido por desahucio patronal para calcular el monto final a entregar.',
    category: 'laboral',
    tags: ['Liquidación', 'Trabajo', 'Renuncia', 'Código Trabajo'],
    urlSlug: 'calculadora-liquidacion',
    seoTitle: 'Calculadora de Liquidación Laboral RD — ¿Cuánto te toca recibir?',
    seoMetaDescription: 'Descubre el monto que te corresponde recibir en caso de desahucio por parte del empleador, o si decides renunciar por tu cuenta bajo las leyes de RD.',
    hasFaq: true
  },
  {
    id: 'vacaciones-calc',
    name: 'Calculadora de Vacaciones',
    shortDescription: 'Determinación de los días de descanso pagable.',
    description: 'Calcula el número de días de vacaciones remuneradas y el monto de compensación económica según los años de servicio continuo en el empleo.',
    category: 'laboral',
    tags: ['Vacaciones', 'Descanso', 'Código Trabajo'],
    urlSlug: 'calculadora-vacaciones',
    seoTitle: 'Calculadora de Vacaciones RD — Días y Pago por Código de Trabajo',
    seoMetaDescription: 'Calcula los días de vacaciones pagados que te corresponden en República Dominicana. De 1 a 5 años (14 días), y más de 5 años de antigüedad (18 días).',
    hasFaq: true
  },
  {
    id: 'regalia-pascual',
    name: 'Regalía Pascual',
    shortDescription: 'Cálculo proporcional de Salario de Navidad.',
    description: 'Obtén el monto correspondiente al Salario de Navidad o Regalía Pascual, equivalente a la duodécima parte (1/12) de todos los salarios devengados en el año calendario.',
    category: 'laboral',
    tags: ['Navidad', 'Doble sueldo', 'Regalía', 'Ministerio'],
    urlSlug: 'calculadora-regalia-pascual',
    seoTitle: 'Calculadora de Regalía Pascual o Salario de Navidad RD',
    seoMetaDescription: 'Calcula tu "Doble Sueldo" o décimo tercer salario correspondiente a fin de año en la República Dominicana. Fórmula legal de duodécima parte.',
    hasFaq: true
  },
  {
    id: 'preaviso-calc',
    name: 'Calculadora de Preaviso',
    shortDescription: 'Suma asignada si no se otorga el plazo.',
    description: 'Estima la compensación económica de preaviso que debe pagar la empresa si termina la relación laboral sin la notificación previa de 7, 14, o 28 días.',
    category: 'laboral',
    tags: ['Preaviso', 'Liquidación', 'Trabajo'],
    urlSlug: 'calculadora-preaviso',
    seoTitle: 'Calculadora de Preaviso RD — Ministerio de Trabajo',
    seoMetaDescription: 'Días y monto del preaviso a pagar según la antigüedad: de 3 a 6 meses (7 días), de 6 a 12 meses (14 días) y más de 12 meses (28 días).',
    hasFaq: true
  },
  {
    id: 'cesantias-calc',
    name: 'Calculadora de Cesantía',
    shortDescription: 'El auxilio de cesantía legal por antigüedad.',
    description: 'Obtén detalladamente el monto acumulado de cesantía por años y fracciones de meses trabajados, el cual corresponde a una indemnización por desahucio.',
    category: 'laboral',
    tags: ['Cesantía', 'Indemnización', 'Trabajo'],
    urlSlug: 'calculadora-cesantia',
    seoTitle: 'Calculadora de Auxilio de Cesantía RD — Código de Trabajo',
    seoMetaDescription: 'Simula el cálculo de cesantía en República Dominicana según el Art. 80 del Código Laboral dominicano. Descubre tus derechos e indemnizaciones.',
    hasFaq: true
  },

  // FINANZAS
  {
    id: 'prestamo-personal',
    name: 'Préstamo Personal',
    shortDescription: 'Tabla de amortización francesa de consumo.',
    description: 'Simula un préstamo de consumo personal completando el monto, la tasa de interés anualizada de Banreservas o APAP y el plazo para generar el cuadro de amortización.',
    category: 'finanzas',
    tags: ['Préstamo', 'Consumo', 'Amortización', 'Interés'],
    urlSlug: 'calculadora-prestamo-personal',
    seoTitle: 'Simulador de Préstamos Personales RD — Tabla de Amortización',
    seoMetaDescription: 'Calcula la cuota mensual fija y genera una tabla de meses con el método francés para préstamos comerciales y de consumo personal en República Dominicana.',
    hasFaq: true
  },
  {
    id: 'cuota-prestamo',
    name: 'Cuota de Préstamo',
    shortDescription: 'Simulador rápido de variaciones de cuota.',
    description: 'Permite testear de forma instantánea de cuánto resultaría tu cuota mensual base variando montos, plazos e intereses bancarios regulares dominicanos.',
    category: 'finanzas',
    tags: ['Cuota', 'Simulador', 'Préstamos', 'APAP', 'Banreservas'],
    urlSlug: 'calculadora-cuota-prestamo',
    seoTitle: 'Calculadora de Cuota de Préstamo en RD — Simulación de Plazos',
    seoMetaDescription: '¿Quieres saber de cuánto es la mensualidad de un crédito? Calcula rápidamente la cuota periódica variando plazos y tasas en pesos dominicanos.',
    hasFaq: true
  },
  {
    id: 'prestamo-hipotecario',
    name: 'Préstamo Hipotecario',
    shortDescription: 'Simulador inmobiliario con seguro de vida y propiedad.',
    description: 'Cuadro de amortización a largo plazo para compra de viviendas en RD, incorporando los cargos de seguros de vida y daños sobre la propiedad típicos del mercado local.',
    category: 'finanzas',
    tags: ['Hipoteca', 'Vivienda', 'Hipotecario', 'Seguros', 'APAP'],
    urlSlug: 'calculadora-prestamo-hipotecario',
    seoTitle: 'Simulador de Préstamos Hipotecarios en RD — APAP y Banreservas',
    seoMetaDescription: 'Simulador completo de amortización de hipotecas en pesos en RD. Añade seguros de vida y del hogar para conocer la cuota bancaria real.',
    hasFaq: true
  },

  // NEGOCIOS
  {
    id: 'precio-venta',
    name: 'Margen de Ganancia',
    shortDescription: 'Calcula el precio de venta final a partir del costo.',
    description: 'Obtén el precio de venta sugerido y el markup porcentual necesario sobre los gastos de compra para alcanzar el margen bruto de utilidad pretendido.',
    category: 'negocios',
    tags: ['Margen', 'Precio', 'Costo', 'Utilidad', 'Markup'],
    urlSlug: 'calculadora-precio-venta-margen',
    seoTitle: 'Calculadora de Precio de Venta y Margen de Utilidad — RD',
    seoMetaDescription: 'Define tus precios de venta de forma técnica y profesional. Calcula el margen de ganancia real de tus productos o servicios con nuestra herramienta gratuita.',
    hasFaq: true
  },

  // --- NUEVAS HERRAMIENTAS LABORALES (10) ---
  {
    id: 'decimo-tercer-salario',
    name: 'Décimo Tercer Salario',
    shortDescription: 'Cálculo completo del doble sueldo anual.',
    description: 'Calculadora especializada para determinar el décimo tercer salario (sueldo de Navidad) acumulado de manera íntegra o proporcional según la base salarial de los meses trabajados en RD.',
    category: 'laboral',
    tags: ['Navidad', 'Doble sueldo', 'Regalía', 'Sueldo 13'],
    urlSlug: 'calculadora-decimo-tercer-salario',
    seoTitle: 'Calculadora de Décimo Tercer Salario RD — Doble Sueldo',
    seoMetaDescription: 'Calcula el décimo tercer salario de fin de año en República Dominicana de acuerdo con el Código Laboral de RD. Simula de forma rápida y gratuita.',
    hasFaq: true
  },
  {
    id: 'horas-extras',
    name: 'Cálculo de Horas Extras',
    shortDescription: 'Determina el pago con recargos de 35% y 100%.',
    description: 'Calcula los montos adicionales por concepto de horas extraordinarias ordinarias (+35%), nocturnas o feriadas (+100%) según el salario ordinario diario del Código Laboral.',
    category: 'laboral',
    tags: ['Horas Extras', 'Recargo', 'Nómina', 'Tarifa por Hora'],
    urlSlug: 'calculadora-horas-extras',
    seoTitle: 'Calculadora de Horas Extras en RD — Tasas de Recargo 35% y 100%',
    seoMetaDescription: 'Calcula tus horas extras trabajadas de forma rápida. Aplica los porcentajes legales de recargo del Código de Trabajo del Ministerio de Trabajo en RD.',
    hasFaq: true
  },
  {
    id: 'trabajo-nocturno',
    name: 'Trabajo Nocturno',
    shortDescription: 'Calcula el recargo de ley del 15% por jornada nocturna.',
    description: 'Determina de forma automática el recargo obligatorio del 15% establecido en el Artículo 204 del Código Laboral dominicano por las horas laboradas de 9:00 PM a 7:00 AM.',
    category: 'laboral',
    tags: ['Trabajo Nocturno', 'Recargo', 'Horas Nocturnas'],
    urlSlug: 'calculadora-trabajo-nocturno',
    seoTitle: 'Calculadora de Trabajo Nocturno en RD — Recargo de Ley del 15%',
    seoMetaDescription: 'Calcula el pago adicional por trabajar en jornada nocturna con el 15% de recargo obligatorio según la legislación laboral dominicana.',
    hasFaq: true
  },
  {
    id: 'salario-por-hora',
    name: 'Salario por Hora',
    shortDescription: 'Desglosa tu tarifa por hora a partir del sueldo.',
    description: 'Calcula el valor exacto de tus horas ordinarias y salario diario basándose en los divisores legales de RD (23.83 para mensuales, 11.91 para quincenales, etc.).',
    category: 'laboral',
    tags: ['Salario Diario', 'Salario por Hora', 'Tarifa'],
    urlSlug: 'calculadora-salario-por-hora',
    seoTitle: 'Calculadora de Salario por Hora en República Dominicana',
    seoMetaDescription: 'Conoce el valor exacto de tus horas de trabajo con los divisores oficiales de la TSS y el Código de Trabajo dominicano.',
    hasFaq: true
  },
  {
    id: 'salario-quincenal',
    name: 'Salario Quincenal',
    shortDescription: 'Simulador de nómina quincenal neta.',
    description: 'Estima de forma precisa el desglose neto de tus pagos quincenales, considerando el prorrateo de las retenciones de la Tesorería de la Seguridad Social (TSS) y el ISR correspondiente.',
    category: 'laboral',
    tags: ['Quincena', 'Nómina', 'Quincenal', 'Retenciones'],
    urlSlug: 'calculadora-salario-quincenal',
    seoTitle: 'Calculadora de Salario Quincenal RD — Desglose de Nómina',
    seoMetaDescription: 'Descubre los deducciones de AFP y SFS quincenales en la nómina dominicana para conocer tu sueldo quincenal neto exacto.',
    hasFaq: true
  },
  {
    id: 'bonificaciones-ley',
    name: 'Bonificaciones de Ley',
    shortDescription: 'Calculadora de participación de beneficios (utilidades).',
    description: 'Calcula la participación obligatoria de los trabajadores en los beneficios de la empresa (bonificación del Código de Trabajo), de 45 a 60 días de salario ordinario según antigüedad.',
    category: 'laboral',
    tags: ['Bonificación', 'Utilidades', 'Beneficios', 'Código Trabajo'],
    urlSlug: 'calculadora-bonificaciones-ley',
    seoTitle: 'Calculadora de Bonificación de Ley en RD — Reparto de Utilidades',
    seoMetaDescription: 'Simula el cálculo de las utilidades o bonificaciones anuales de los trabajadores en República Dominicana según el tiempo de servicio.',
    hasFaq: true
  },
  {
    id: 'indemnizacion-laboral',
    name: 'Indemnización Laboral',
    shortDescription: 'Cálculo de penalizaciones por despidos injustificados.',
    description: 'Determina las indemnizaciones adicionales correspondientes por despido indirecto o improcedente del contrato laboral, incluyendo los salarios devengados en el litigio comercial.',
    category: 'laboral',
    tags: ['Indemnización', 'Despido', 'Litigio', 'Derecho Laboral'],
    urlSlug: 'calculadora-indemnizacion-laboral',
    seoTitle: 'Calculadora de Indemnizaciones Laborales en RD — Despido Directo',
    seoMetaDescription: 'Calcula de forma técnica las multas e indemnizaciones de ley debidas por despido arbitrario u otros agravios contractuales en RD.',
    hasFaq: true
  },
  {
    id: 'vacaciones-pendientes',
    name: 'Vacaciones Pendientes',
    shortDescription: 'Determina el pago de vacaciones no gozadas.',
    description: 'Calcula la compensación económica que te pertenece por concepto de vacaciones acumuladas vencidas no disfrutadas durante el contrato de trabajo actual.',
    category: 'laboral',
    tags: ['Vacaciones', 'Acumulados', 'Monto de Vacaciones'],
    urlSlug: 'calculadora-vacaciones-pendientes',
    seoTitle: 'Calculadora de Vacaciones Pendientes RD — Días no Gozados',
    seoMetaDescription: 'Calcula tu compensación económica por vacaciones no gozadas y días acumulados de periodos pasados según el Código de Trabajo de RD.',
    hasFaq: true
  },
  {
    id: 'regalia-proporcional',
    name: 'Regalía Proporcional',
    shortDescription: 'Estima el doble sueldo acumulado proporcionalmente.',
    description: 'Calcula detalladamente el monto acumulado del sueldo de navidad que habrías acumulado hasta cualquier fecha de corte comercial en el año en curso.',
    category: 'laboral',
    tags: ['Sueldo Navidad', 'Doble sueldo', 'Proporcional', 'Corte'],
    urlSlug: 'calculadora-regalia-proporcional',
    seoTitle: 'Calculadora de Regalía Proporcional RD — Navidad',
    seoMetaDescription: 'Simula el sueldo de Navidad proporcional devengado acumulado a la fecha para tus presupuestos o acuerdos laborales de fin de año.',
    hasFaq: true
  },
  {
    id: 'costo-empleado',
    name: 'Costo de Empleado para Empresa',
    shortDescription: 'Descubre los costos reales ocultos tras contratar personal.',
    description: 'Estima la carga social total y el costo real de un colaborador en nómina física, sumando el salario bruto, los aportes patronales TSS, INFOTEP y las reservas de provisiones de prestaciones.',
    category: 'laboral',
    tags: ['Costo Empresa', 'TSS Patronal', 'INFOTEP', 'Carga Social'],
    urlSlug: 'calculadora-costo-empleado',
    seoTitle: 'Calculadora de Costo de Empleado para Empresa en RD — Carga Patronal',
    seoMetaDescription: 'Descubre cuánto le cuesta en realidad un trabajador al mes y al año a una empresa en RD sumando los impuestos contributivos y provisiones de ley.',
    hasFaq: true
  },

  // --- NUEVAS HERRAMIENTAS FINANCIERAS (10) ---
  {
    id: 'ahorro-plan',
    name: 'Plan de Ahorro Meta',
    shortDescription: 'Descubre cuánto debes ahorrar mensualmente para tus metas.',
    description: 'Simula el plan de aportes periódicos requeridos para alcanzar un fondo meta planeado, para comprar un auto, un inmueble o fondo de emergencia en RD.',
    category: 'finanzas',
    tags: ['Ahorros', 'Planificación', 'Rendimientos', 'Plazo Fijo'],
    urlSlug: 'calculadora-ahorro-plan',
    seoTitle: 'Calculadora de Plan de Ahorro en RD — Lograr Metas Financieras',
    seoMetaDescription: 'Define un monto meta y un plazo de ahorro de manera mensual en pesos para estimar de cuánto deben resultar tus depósitos periódicos en el banco.',
    hasFaq: true
  },
  {
    id: 'interes-simple',
    name: 'Interés Simple',
    shortDescription: 'Cálculo básico de retornos financieros.',
    description: 'Calculadora financiera tradicional para estimar el interés nominal generado por un capital invertido sobre plazos fijos específicos.',
    category: 'finanzas',
    tags: ['Interés Simple', 'Rendimientos', 'Finanzas Básicas'],
    urlSlug: 'calculadora-interes-simple',
    seoTitle: 'Calculadora de Interés Simple en RD — Fórmulas Financieras',
    seoMetaDescription: 'Calcula de forma exacta intereses nominales ganados en tus certificados de depósitos o inversiones simples a tasa fija anual dominicana.',
    hasFaq: true
  },
  {
    id: 'interes-compuesto',
    name: 'Interés Compuesto',
    shortDescription: 'Simulador de crecimiento exponencial con reinversión de intereses.',
    description: 'Estima el poder del retorno compuesto en tus ahorros a mediano o largo plazo, capitalizando intereses ganados periódicamente para lograr tus fondos deseados.',
    category: 'finanzas',
    tags: ['Compounding', 'Interés Compuesto', 'Inversiones', 'Puestos Bolsa'],
    urlSlug: 'calculadora-interes-compuesto',
    seoTitle: 'Calculadora de Interés Compuesto en RD — Compounding Rendimiento',
    seoMetaDescription: 'Aprovecha el interés compuesto para crecer tu dinero periódicamente. Planifica inversiones a largo plazo en el mercado financiero dominicano.',
    hasFaq: true
  },
  {
    id: 'valor-futuro',
    name: 'Valor Futuro (VF)',
    shortDescription: 'Estima el valor acumulado con devaluación e interés.',
    description: 'Calcula el valor acumulativo final que tendrá un capital inicial bajo tasas de retornos económicos e inflación dominicanas.',
    category: 'finanzas',
    tags: ['Valor Futuro', 'Inflación', 'Ingeniería Económica'],
    urlSlug: 'calculadora-valor-futuro',
    seoTitle: 'Calculadora de Valor Futuro en RD — Ingeniería Económica',
    seoMetaDescription: 'Proyecta el valor futuro de tus colocaciones bancarias aplicando la ecuación clásica de capitalización económica nacional.',
    hasFaq: true
  },
  {
    id: 'valor-presente',
    name: 'Valor Presente (VP)',
    shortDescription: 'Descuenta flujos futuros para conocer su poder hoy.',
    description: 'Trae al presente cualquier flujo de efectivo a cobrar en el futuro aplicando tasas de descuento promedio del Banco Central o de inflación comercial en RD.',
    category: 'finanzas',
    tags: ['Valor Presente', 'Descuento', 'Proyecciones'],
    urlSlug: 'calculadora-valor-presente',
    seoTitle: 'Calculadora de Valor Presente RD — Tasa de Descuento',
    seoMetaDescription: 'Trae a valor de hoy los capitales a percibir en el futuro para tus análisis presupuestarios corporativos.',
    hasFaq: true
  },
  {
    id: 'inversion-render',
    name: 'Interés Compuesto Inversión',
    shortDescription: 'Rendimiento anualizado capitalizable.',
    description: 'Visualiza de forma clara el crecimiento de tu dinero al reinvertir tus rendimientos mensuales en un certificado bancario dominicano.',
    category: 'finanzas',
    tags: ['Valores', 'Certificados', 'Inversión'],
    urlSlug: 'calculadora-inversion-render',
    seoTitle: 'Calculadora de Rendimiento de Inversión Fija RD',
    seoMetaDescription: 'Modela el crecimiento patrimonial de tus inversiones de forma clara y profesional.',
    hasFaq: true
  },
  {
    id: 'prestamo-avanzado',
    name: 'Préstamo Avanzado',
    shortDescription: 'Simulador crediticio con cuotas, gracia y seguros.',
    description: 'Calcula la tabla de pagos de tu préstamo considerando periodos especiales de gracia y el costo de seguros bancarios mensuales tradicionales de RD.',
    category: 'finanzas',
    tags: ['Crédito', 'Seguros', 'Periodo Gracia', 'Costo Financiero'],
    urlSlug: 'calculadora-prestamo-avanzado',
    seoTitle: 'Simulador de Préstamos Avanzados en RD — Bancos y Tasas',
    seoMetaDescription: 'Calcula la cuota real de tu próximo préstamo incluyendo de manera transparente primas de vida adicionales y meses de gracia.',
    hasFaq: true
  },
  {
    id: 'comparador-prestamos',
    name: 'Comparador de Préstamos',
    shortDescription: 'Compara dos escenarios para elegir el que pague menos interés.',
    description: 'Compara dos préstamos simultáneamente alternando tasa impositiva y plazos para decidir siempre el crédito idóneo para tus finanzas.',
    category: 'finanzas',
    tags: ['Comparativa', 'Crédito', 'Tasa Interés', 'Bancos RD'],
    urlSlug: 'calculadora-comparador-prestamos',
    seoTitle: 'Comparador de Préstamos Bancarios RD — Banreservas vs Popular',
    seoMetaDescription: 'Compara tasas y cuotas mensuales de diferentes bancos de RD para elegir siempre la opción con mayor rentabilidad y menor sobrecargo de interés.',
    hasFaq: true
  },
  {
    id: 'amortizacion-completa',
    name: 'Tabla de Amortización Completa',
    shortDescription: 'Cronograma completo de capital e interés mes a mes.',
    description: 'Desglosa de manera exhaustiva el abono a capital y el pago de interés en cada mes de tu deuda, exportable a Excel.',
    category: 'finanzas',
    tags: ['Amortización', 'Calendario Pagos', 'Deudas'],
    urlSlug: 'calculadora-amortizacion-completa',
    seoTitle: 'Generador de Tabla de Amortización Mensual en RD — Francés',
    seoMetaDescription: 'Crea un cuadro de pagos completo para tu financiamiento con el divisor nominal de la banca dominicana.',
    hasFaq: true
  },
  {
    id: 'refinanciamiento-analizador',
    name: 'Análisis de Refinanciamiento',
    shortDescription: 'Averigua si te conviene consolidar o refinanciar tu préstamo.',
    description: 'Calcula tu ahorro de cuotas y de intereses de largo plazo al transferir tus deudas restando los gastos requeridos de cierre.',
    category: 'finanzas',
    tags: ['Refinanciar', 'Consolidar', 'Gatos de Cierre', 'Ahorro'],
    urlSlug: 'calculadora-refinanciamiento',
    seoTitle: 'Analizador de Refundición y Refinanciación de Préstamos RD',
    seoMetaDescription: '¿Te conviene refinanciar de forma bancaria? Filtra los gastos de manejo y comisiones para determinar tu ahorro de intereses real.',
    hasFaq: true
  },

  // --- NUEVAS HERRAMIENTAS EMPRESARIALES (10) ---
  {
    id: 'gen-cotizacion',
    name: 'Generador de Cotizaciones',
    shortDescription: 'Prepara ofertas comerciales con cálculo automático de ITBIS.',
    description: 'Crea presupuestos listos para descargar o imprimir para tus transacciones comerciales en República Dominicana.',
    category: 'negocios',
    tags: ['Cotizar', 'Documentos', 'Ventas', 'PDF'],
    urlSlug: 'generador-cotizacion-profesional',
    seoTitle: 'Generador de Cotizaciones Pro en RD — Descargar en PDF',
    seoMetaDescription: 'Prepara plantillas de cotizaciones comerciales para tus prospectos independientes o corporativos en pesos dominicanos con cálculo de ITBIS.',
    hasFaq: true
  },
  {
    id: 'gen-recibo',
    name: 'Generador de Recibos',
    shortDescription: 'Genera duplicados de ingresos para arqueos de caja.',
    description: 'Prepara recibos de ingresos formales listos para reportar movimientos netos en pesos dominicanos DOP.',
    category: 'negocios',
    tags: ['Recibos', 'Facturación', 'Cobros'],
    urlSlug: 'generador-recibo-ingresos',
    seoTitle: 'Generador de Recibos de Ingresos RD — Descargar PDF',
    seoMetaDescription: 'Expide comprobantes de cobro para tus clientes de forma instantánea de acuerdo con la norma tributaria comercial.',
    hasFaq: true
  },
  {
    id: 'gen-proforma',
    name: 'Factura Proforma',
    shortDescription: 'Prepara borradores comerciales antes del cierre.',
    description: 'Crea facturas de prueba y borradores útiles para acuerdos contractuales o comprobación de crédito fiscal dominicano.',
    category: 'negocios',
    tags: ['Proforma', 'Borrador Factura', 'NCF'],
    urlSlug: 'generador-factura-proforma',
    seoTitle: 'Generador de Facturas Proforma en RD — Cotizaciones de Venta',
    seoMetaDescription: 'Elabora y descarga facturas proforma formales para tus operaciones institucionales o de prestación de servicios.',
    hasFaq: true
  },
  {
    id: 'gen-orden',
    name: 'Orden de Compra',
    shortDescription: 'Formaliza pedidos de mercancía frente a proveedores.',
    description: 'Prepara órdenes de adquisición de bienes con cantidades, montos unitarios y condiciones mercantiles dominicanas.',
    category: 'negocios',
    tags: ['Orden Compra', 'Proveedores', 'Logística'],
    urlSlug: 'generador-orden-de-compra',
    seoTitle: 'Generador de Órdenes de Compra Comercial RD — PDF',
    seoMetaDescription: 'Formaliza tus solicitudes de insumos a tus proveedores con un documento profesional estandarizado.',
    hasFaq: true
  },
  {
    id: 'gen-presupuesto',
    name: 'Generador de Presupuestos',
    shortDescription: 'Planificación de fondos para proyectos nuevos.',
    description: 'Suma costos de recursos y prepara un balance formal de fondos listos para presentar propuestas ante la gerencia.',
    category: 'negocios',
    tags: ['Presupuesto', 'Finanzas de Negocio', 'Gastos Proyectados'],
    urlSlug: 'generador-presupuesto-comercial',
    seoTitle: 'Generador de Presupuestos Comerciales en Pesos en RD',
    seoMetaDescription: 'Divide tus fondos y costos proyectados en un documento visual descargable.',
    hasFaq: true
  },
  {
    id: 'margen-bruto',
    name: 'Margen Bruto de Utilidad',
    shortDescription: 'Mide ganancias antes de costos indirectos de oficina.',
    description: 'Calcula tu porcentaje de ganancia descontando directamente el costo de ventas (COGS) de tus ingresos brutos.',
    category: 'negocios',
    tags: ['Margen Bruto', 'Pérdidas y Ganancias', 'Comercial'],
    urlSlug: 'calculadora-margen-bruto',
    seoTitle: 'Calculadora de Margen Bruto de Utilidad en RD',
    seoMetaDescription: 'Calcula el margen de utilidad bruta de tus facturaciones comerciales para fijar metas fiscales sanas en República Dominicana.',
    hasFaq: true
  },
  {
    id: 'margen-neto',
    name: 'Margen Neto Corporativo',
    shortDescription: 'Mide la rentabilidad real final de tu empresa.',
    description: 'Descuenta costos fijos, variables y operativos para conocer el dividendo exacto de ganancia para los socios.',
    category: 'negocios',
    tags: ['Margen Neto', 'Rentabilidad', 'Contabilidad'],
    urlSlug: 'calculadora-margen-neto',
    seoTitle: 'Calculadora de Margen Neto de Empresa RD',
    seoMetaDescription: '¿Qué porcentaje de ganancia te queda tras liquidar renta, luz, nómina y COGS? Calcula tus márgenes reales con precisión.',
    hasFaq: true
  },
  {
    id: 'punto-equilibrio',
    name: 'Punto de Equilibrio Corporativo',
    shortDescription: 'Monto y unidades de ventas para cubrir costos.',
    description: 'Calcula el volumen físico y facturación monetaria indispensables para cubrir el 100% de los costos operativos.',
    category: 'negocios',
    tags: ['Break Even', 'Punto Equilibrio', 'Ventas Críticas'],
    urlSlug: 'calculadora-punto-equilibrio',
    seoTitle: 'Calculadora de Punto de Equilibrio Comercial RD',
    seoMetaDescription: 'Encuentra el nivel de comercialización físico mínimo para sostener tus operaciones comerciales de PYME en pesos dominicanos.',
    hasFaq: true
  },
  {
    id: 'roi-calc',
    name: 'Retorno sobre la Inversión (ROI)',
    shortDescription: 'Mide el multiplicador neto de tus colocaciones.',
    description: 'Evalúa la ganancia neta generada contra el monto destinado a inversiones de publicidad, activos fijos o infraestructura.',
    category: 'negocios',
    tags: ['ROI', 'Inversión', 'Retorno', 'Rendimiento'],
    urlSlug: 'calculadora-roi',
    seoTitle: 'Calculadora de ROI RD — Retorno Rentabilidad de Inversión',
    seoMetaDescription: 'Mide con exactitud el porcentaje de rendimiento neto generado de tus campañas comerciales con nuestra calculadora técnica.',
    hasFaq: true
  },
  {
    id: 'flujo-caja',
    name: 'Flujo de Caja Mensual',
    shortDescription: 'Monitorea ingresos y gastos para asegurar solvencia.',
    description: 'Controla el flujo líquido real en pesos, asegurando la liquidez indispensable para cumplir tus compromisos recurrentes.',
    category: 'negocios',
    tags: ['Cash Flow', 'Flujo Caja', 'Efectivo', 'Liquidez'],
    urlSlug: 'calculadora-flujo-de-caja',
    seoTitle: 'Simulador de Flujo de Caja en RD — Tesorería y Solvencia',
    seoMetaDescription: 'Lleva el control de efectivo y liquidez de tu caja de forma automatizada. Mantén tu negocio solvente ante eventualidades mercantiles locales.',
    hasFaq: true
  }
];

export const HOME_FAQS: FaqItem[] = [
  {
    question: '¿Qué es el RNC y quién está obligado a tenerlo?',
    answer: 'El Registro Nacional de Contribuyentes (RNC) es el número único de identificación tributaria para personas físicas y jurídicas dominicanas que posean obligaciones fiscales ante la DGII. Es necesario para operar un negocio de forma legal, emitir facturas con comprobante fiscal (NCF) y declarar utilidades.'
  },
  {
    question: '¿A cuánto ascienden los porcentajes de retención de la nómina dominicana?',
    answer: 'Al empleado asalariado en nómina se le retienen de forma obligatoria el 2.87% de AFP (pensiones) y el 3.04% de SFS (salud). Al empleador le corresponden aportes del 7.10% de AFP, 7.09% de SFS, una tasa promedio del 1.20% de SRL y, si aplica, el 1.00% de INFOTEP.'
  },
  {
    question: '¿Cómo se calcula el salario neto en República Dominicana?',
    answer: 'Se parte del salario mensual bruto. De este monto se restan los aportes de AFP (2.87%) y SFS (3.04%). El valor remanente o de "renta neta imponible" se evalúa bajo las escalas vigentes del Impuesto Sobre la Renta (ISR) de la DGII. Si este excede el mínimo exento (aprox. RD$ 34,685.00 mensuales), se descuenta el ISR correspondiente para determinar finalmente el salario neto.'
  },
  {
    question: '¿Cuándo se deben pagar las prestaciones laborales?',
    answer: 'Según el Código de Trabajo de la República Dominicana, el empleador está obligado a pagar las prestaciones laborales (preaviso, cesantía) si da término al contrato sin causa justificada (desahucio). Las vacaciones y el salario de navidad proporcional son derechos adquiridos por el tiempo laborado y deben pagarse siempre, sin importar la causa de la desvinculación o renuncia contractual.'
  },
  {
    question: '¿Cuál es el plazo del deudor para pagar el impuesto de ITBIS en RD?',
    answer: 'El ITBIS recolectado en las facturas durante el mes calendario debe declararse y pagarse ante la DGII a más tardar el día 20 del mes siguiente (ej. el ITBIS consolidado de enero se paga hasta el 20 de febrero). De lo contrario, se aplican recargos del 10% por mora para el primer mes, 4% por mes adicional e intereses del 1.1% mensual.'
  }
];

export const PROGRAMMATIC_GUIDES: GuidePage[] = [
  {
    slug: 'como-calcular-itbis',
    title: '¿Cómo calcular el ITBIS en la República Dominicana?',
    seoTitle: 'Guía Completa para Calcular el ITBIS en RD — Paso a Paso',
    seoMetaDescription: 'Aprende a calcular el ITBIS del 18% y 16% en República Dominicana. Ejemplos prácticos de ITBIS incluido, excluido, deducciones y normas vigentes de la DGII.',
    shortIntro: 'Aprende los fundamentos del Impuesto sobre Transferencias de Bienes Industrializados y Servicios (ITBIS). Conoce cómo desglosarlo, aplicarlo en tus facturas y evitar multas.',
    publishDate: '2026-05-15',
    readTime: '8 min de lectura',
    imageAlt: 'Contabilidad e impuestos DGII ITBIS',
    contentMarkdown: `## Guía Definitiva del ITBIS en República Dominicana

El **Impuesto sobre Transferencias de Bienes Industrializados y Servicios (ITBIS)** es el impuesto indirecto más relevante de la República Dominicana, equivalente al impuesto al valor agregado (IVA) de otros países. Este grava la transferencia, importación y prestación de servicios de bienes industrializados bajo la fiscalización de la **Dirección General de Impuestos Internos (DGII)**.

---

### ¿Cuáles son las tasas vigentes de ITBIS?

Actualmente, el sistema fiscal dominicano contempla dos tasas activas de ITBIS:
1. **Tasa General (18%):** Se aplica a la gran mayoría de bienes industrializados y servicios comerciales vendidos en el territorio nacional.
2. **Tasa Reducida (16%):** Aplicada a productos alimenticios seleccionados, yogures, mantequillas, aceites comestibles, etc.
3. **Exento (0%):** Algunos productos de la canasta básica (leche, arroz, pan, medicinas) y servicios educativos de salud están legalmente exentos de ITBIS.

---

### ¿Cómo se calcula? Fórmulas Matemáticas

#### Escenario 1: ITBIS Excluido (Saber el total a partir del neto)
Si vendes un servicio o producto en un valor neto y necesitas añadir el ITBIS correspondiente, utiliza la siguiente fórmula:

$$\\text{Monto ITBIS} = \\text{Valor Neto} \\times \\text{Tasa ITBIS}$$
$$\\text{Monto Total} = \\text{Valor Neto} + \\text{Monto ITBIS}$$

**Ejemplo:**
- Valor Neto del servicio de consultoría: **RD$ 10,000.00**
- Tasa General de ITBIS: **18% (0.18)**
- ITBIS a cobrar: $10,000 \\times 0.18 =$ **RD$ 1,800.00**
- Total a facturar: $10,000 + 1,800 =$ **RD$ 11,800.00**

#### Escenario 2: ITBIS Incluido (Saber el neto a partir del total)
Si has vendido un artículo por un precio final global con ITBIS y necesitas reportar cuánto fue el valor neto y cuánto el impuesto recaudado:

$$\\text{Valor Neto Base} = \\frac{\\text{Total Facturado}}{1 + \\text{Tasa ITBIS}}$$
$$\\text{Monto ITBIS} = \\text{Total Facturado} - \\text{Valor Neto Base}$$

**Ejemplo:**
- Total de compra en tienda: **RD$ 5,900.00** (con ITBIS de 18% incluido)
- Valor Neto Base: $5,900 / 1.18 =$ **RD$ 5,000.00**
- ITBIS que se pagó: $5,900 - 5,000 =$ **RD$ 900.00**

---

### Errores Comunes al Declarar ITBIS ante la DGII

* **No registrar los Comprobantes Fiscales (NCF):** Para deducir el ITBIS pagado en tus compras (crédito fiscal), debes exigir siempre comprobantes de crédito fiscal válidos.
* **Calcular el 18% restando directamente del total:** Restar el 18% directamente de un monto total (ej. $5,900 - 18% = 4,838$) es un error matemático frecuente. Se debe seguir la fórmula de división $5,900 / 1.18$.
* **Declarar fuera de fecha:** Declarar después del día 20 conlleva recargos por mora automáticos del 10% el primer mes.

---

### Preguntas Frecuentes de ITBIS

**¿Cuándo se debe presentar la declaración del ITBIS?**
Se presenta mensualmente a través del formulario IT-1 a más tardar el día 20 de cada mes.

**¿Existe retención del ITBIS entre empresas?**
Sí, cuando las personas físicas prestan servicios a personas jurídicas, estas últimas deben retener el 100% del ITBIS. Del mismo modo, las sociedades retienen el 30% del ITBIS facturado por otras sociedades en servicios de consultoría u honorarios profesionales.`
  },
  {
    slug: 'como-calcular-prestaciones',
    title: '¿Cómo calcular las prestaciones laborales dominicanas?',
    seoTitle: 'Guía Oficial para Calcular Liquidaciones y Prestaciones — RD',
    seoMetaDescription: 'Aprende a calcular tus prestaciones en RD paso a paso. Cálculo oficial de preaviso, cesantía, vacaciones y regalía pascual en República Dominicana.',
    shortIntro: 'Conoce tus derechos en el Código de Trabajo. Aprende cómo calcular el sueldo de navidad, preaviso y cesantías en pesos dominicanos.',
    publishDate: '2026-05-20',
    readTime: '12 min de lectura',
    imageAlt: 'Contrato de trabajo y cálculo de prestaciones laborales en RD',
    contentMarkdown: `## Guía de Prestaciones Laborales y Desahucios en la República Dominicana

El término de la relación laboral genera obligaciones y derechos económicos establecidos en el **Código de Trabajo dominicano**. Esta liquidación varía según las condiciones de la salida: renuncia, despido justificado, o desahucio (despido injustificado).

---

### Conceptos Clave de la Liquidación dominicana

#### 1. El Salario Diario Promedio
Todos los cálculos del Ministerio de Trabajo se basan en el salario diario del trabajador. Si cobras mensual, el código de trabajo define que el mes comercial tiene exactamente **23.83 días laborables**.

$$\\text{Salario Diario} = \\frac{\\text{Salario Mensual Bruto}}{23.83}$$

#### 2. Preaviso (Compensación por Omisión de Aviso)
Es la notificación obligatoria previa a la desvinculación. Si el empleador despide sin avisar con tiempo, debe indemnizar económicamente según la antigüedad:
- **7 días** de salario de 3 a 6 meses de trabajo continuo.
- **14 días** de salario de 6 a 12 meses.
- **28 días** de salario a partir del año de servicio continuo.

#### 3. Auxilio de Cesantía
Indemnización por la pérdida del empleo, calculada de la siguiente manera:
- **6 días** de salario diario de 3 a 6 meses de trabajo.
- **13 días** de salario de 6 a 12 meses.
- **21 días** anuales por cada año laborado para empleos de 1 a 5 años.
- **23 días** anuales si la antigüedad del empleado supera los 5 años.

---

### Ejemplo Práctico de Liquidación Completa

Consideremos un empleado con un salario bruto mensual de **RD$ 30,000.00** que ingresó el **15 de marzo de 2024** y fue desahuciado por su jefe el **15 de marzo de 2026** sin aviso previo y sin haber tomado sus vacaciones correspondientes al último año.

1. **Salario Diario:** $30,000 / 23.83 =$ **RD$ 1,258.91**
2. **Tiempo de Servicio:** 2 años exactos.
3. **Preaviso:** Omitido por el empleador (28 días de salario)
   - $1,258.91 \\times 28 =$ **RD$ 35,249.48**
4. **Cesantía:** 2 años de servicio imponible (21 días por cada año = 42 días en total)
   - $1,258.91 \\times 42 =$ **RD$ 52,874.22**
5. **Vacaciones Pendientes:** Sí, tiene derecho a 14 días.
   - $1,258.91 \\times 14 =$ **RD$ 17,624.74**
6. **Regalía Pascual (Salario de Navidad Proporcional):** Digamos que trabajó 3 meses del año actual.
   - $30,000 \\times 3 / 12 =$ **RD$ 7,500.00**

- **Total a Recibir (Liquidación Final):**
  - $35,249.48 + 52,874.22 + 17,624.74 + 7,500.00 =$ **RD$ 113,248.44**

---

### Errores Comunes de Liquidación

* **No incluir horas extras o comisiones:** La cesantía y el preaviso se computan sobre el salario ordinario, el cual incluye todas las sumas fijas y comisiones devengadas de forma regular.
* **Calcular la liquidación utilizando 30 días:** Recuerde dividir siempre entre **23.83**, ya que calcularlo sobre un factor de 30 reduce dramáticamente el pago diario diario que le corresponde por ley al trabajador dominicano.`
  },
  {
    slug: 'como-calcular-salario-neto',
    title: '¿Cómo calcular el salario neto en República Dominicana?',
    seoTitle: 'Guía de Cálculo de Salario Neto RD — TSS, AFP, SFS e ISR',
    seoMetaDescription: 'Aprende a calcular tu salario neto a partir del bruto en RD. Descuentos detallados en nómina de AFP (2.87%), SFS (3.04%) e ISR de la DGII paso a paso.',
    shortIntro: 'Desmitifica tu recibo de pago mensual. Aprende qué porcentajes se destinan a la TSS e Impuestos DGII para calcular de cuánto será tu depósito quincenal.',
    publishDate: '2026-05-22',
    readTime: '6 min de lectura',
    imageAlt: 'Nómina dominicana y deducciones de sueldo TSS',
    contentMarkdown: `## Guía Paso a Paso: Del Salario Bruto al Salario Neto

¿Quieres saber exactamente cómo se desvanece de tu salario bruto la porción destinada a la seguridad social y al gobierno de la República Dominicana? En esta guía te explicamos, con el máximo rigor, cómo realizar este cálculo manualmente paso a paso.

---

### Paso 1: Deducciones de la TSS (Seguridad Social)
Antes de cobrar impuestos sobre tu sueldo, la ley dominicana establece que se debe descontar tu contribución al sistema de seguridad social administrado por la TSS. Estos porcentajes son:

1. **AFP (Aporte para Pensiones):** **2.87%** de tu salario bruto ordinario imponible (hasta un tope impositivo de 20 salarios mínimos nacionales).
2. **SFS (Seguro de Salud):** **3.04%** de tu salario bruto ordinario imponible (hasta un tope impositivo de 10 salarios mínimos nacionales).

**Ejemplo de TSS para un sueldo bruto de RD$ 50,000.00:**
- AFP: $50,000 \\times 2.87% =$ **RD$ 1,435.00**
- SFS: $50,000 \\times 3.04% =$ **RD$ 1,520.00**
- Total aportado TSS mensual: **RD$ 2,955.00**

---

### Paso 2: Obtener el Sueldo Neto Sujeto al ISR de la DGII
El impuesto sobre la renta solar se calcula **después** de restar la porción cotizada del AFP y SFS.

$$\\text{Salario Base ISR} = \\text{Salario Bruto} - \\text{Deducciones TSS}$$
- Utilizando nuestro ejemplo: $50,000 - 2,955 =$ **RD$ 47,045.00**

---

### Paso 3: Aplicar la Escala Impositiva de la DGII para ISR
Anualizamos el salario neto obtenido para evaluar el tramo en la tabla anual imponible de la DGII:
- Salario anual base: $RD\\$ 47,045.00 \\times 12 = $ **RD$ 564,540.00**

Al contrastar la tasación, este cae en el **Rango Segundo (15%):**
- Tramo imponible: Desde RD$ 416,220.01 hasta RD$ 624,329.00 anuales.
- Excedente sobre límite inferior: $564,540.00 - 416,220.01 = $ **RD$ 148,319.99**
- Impuesto anualizado: $148,319.99 \\times 15% = $ **RD$ 22,248.00**
- Retención ISR mensual: $22,248.00 / 12 = $ **RD$ 1,854.00**

---

### Paso 4: Obtener el Salario Neto Final
Finalmente restamos todos los aportes combinados de tu salario bruto ordinario:

$$\\text{Salario Neto} = \\text{Salario Bruto} - \\text{TSS} - \\text{ISR}$$
- Resultado final: $50,000 - 2,955 (TSS) - 1,854 (ISR) = $ **RD$ 45,191.00**

La tasa efectiva de retención global de este empleado es de **9.62%** del salario bruto original.`
  },
  {
    slug: 'como-calcular-vacaciones',
    title: '¿Cómo se calculan y disfrutan las vacaciones laborales en RD?',
    seoTitle: 'Cálculo de Vacaciones Pagadas República Dominicana — Escala',
    seoMetaDescription: 'Aprende cuántos días de vacaciones te corresponden por ley en la República Dominicana y la fórmula monetaria para su pago completo según tu antigüedad.',
    shortIntro: 'El descanso anual proporcional de los empleados es un derecho de nómina. Conoce cómo te corresponden los días de compensación según tu antigüedad.',
    publishDate: '2026-05-25',
    readTime: '5 min de lectura',
    imageAlt: 'Días de descanso y vacaciones laborales República Dominicana',
    contentMarkdown: `## Todo sobre el Pago de Vacaciones en República Dominicana

El Código de Trabajo de la República Dominicana estipula que las **vacaciones** son un descanso anual ininterrumpido con goce de sueldo, con el propósito de garantizar que el trabajador reponga fuerzas físicas y mentales tras meses de servicio regular.

---

### ¿Cuántos días de vacaciones corresponden y cómo se pagan?

El número de días remunerados depende estrictamente de tu tiempo de servicio continuo para el mismo empleador:
- De **1 a 5 años de servicio continuo:** Le corresponden **14 días de salario ordinario**.
- Con **más de 5 años de servicio continuo:** Le corresponden **18 días de salario ordinario**.

---

### Escala de Compensación Proporcional (Menos de un año de antigüedad)

Si el contrato termina antes de cumplir el año de servicio continuo y el trabajador aún no ha disfrutado del descanso legal, tiene derecho a una compensación proporcional en efectivo según los meses trabajados:
- **5 meses de labor:** 6 días de salario.
- **6 meses de labor:** 7 días de salario.
- **7 meses de labor:** 8 días de salario.
- **8 meses de labor:** 9 días de salario.
- **9 meses de labor:** 10 días de salario.
- **10 meses de labor:** 11 días de salario.
- **11 meses de labor:** 12 días de salario.

**Importante:** Si el tiempo de servicio es menor a 5 meses, por ley no se reconoce derecho de compensación de vacaciones monetarias en la liquidación.`
  },
  {
    slug: 'como-calcular-regalia',
    title: '¿Cómo calcular el salario de Navidad o regalía pascual?',
    seoTitle: 'Cálculo de Regalía Pascual y Doble Sueldo en RD — Ley',
    seoMetaDescription: 'Aprende la fórmula del Salario de Navidad en República Dominicana. Todo sobre cuándo es la fecha límite de pago y cómo se calcula el doble sueldo de ley.',
    shortIntro: 'El décimo tercer salario es un derecho amparado por ley que el empleador debe pagar a fin de año de forma exenta de impuestos o deducciones generales.',
    publishDate: '2026-05-28',
    readTime: '6 min de lectura',
    imageAlt: 'Doble sueldo y regalia pascual dominicana',
    contentMarkdown: `## La Fórmula del Salario de Navidad (Regalía Pascual) de RD

El **Salario de Navidad**, popularmente denominado "Doble Sueldo", es una remuneración obligatoria que el empleador debe pagar a sus trabajadores a más tardar el **20 de diciembre** de cada año calendario.

---

### La Fórmula Oficial de Cálculo

Este impuesto correspondiente equivale a la **duodécima parte (1/12)** de la suma total de los salarios ordinarios mensuales devengados por el trabajador durante todo el año calendario en curso (de enero a diciembre).

$$\\text{Salario de Navidad} = \\frac{\\text{Suma de los salarios ordinarios percibidos en el año}}{12}$$

---

### Ejemplo Práctico de Regalía Pascual Proporcional

Si un empleado trabajó cobrando **RD$ 40,000.00** al mes desde el **1 de junio** hasta el **31 de diciembre** (un total de 7 meses):
- Total de sueldos ganados en el año: $RD\\$ 40,000 \\times 7 = RD\\$ 280,000.00$
- Salario de Navidad / Regalía: $RD\\$ 280,000.00 / 12 = $ **RD$ 23,333.33**

---

### Exención de Descuentos

Una de las características más importantes de la Regalía Pascual en la República Dominicana es su inmunidad:
- **No se le retiene TSS** (Ni el 2.87% de AFP ni el 3.04% de SFS).
- **No sufre retención de ISR** de la DGII.
- **No se puede embargar judicialmente** (con la única excepción de pensiones alimentarias por orden judicial formal de menores de edad).`
  }
];
export const SEO_PROGRAMMATIC_CONTENT: Record<string, SEOContent> = {} 
