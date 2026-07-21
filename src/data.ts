import { CalculatorInfo, FaqItem, GuidePage, SEOContent } from './types';
import { LEARNING_GUIDES } from './content/learning-guides';

export const CATEGORIES = [
  { id: 'impuestos', name: 'Impuestos', icon: 'account_balance', descdgii: '4 herramientas fiscales', color: 'text-teal-600 bg-teal-50' },
  { id: 'laboral', name: 'Laboral', icon: 'groups', descdgii: '3 herramientas de nómina y liquidación', color: 'text-amber-600 bg-amber-50' },
  { id: 'finanzas', name: 'Préstamos', icon: 'payments', descdgii: 'Simulador de cuota mensual', color: 'text-blue-600 bg-blue-50' }
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
    seoMetaDescription: '¿Pagaste tarde tus impuestos? Calcula con base documentada las penalidades de la DGII aplicables: 10% de recargo por mora inicial, 4% mensual y 1.1% de interés.',
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
    id: 'prestaciones-laborales',
    name: 'Prestaciones Laborales',
    shortDescription: 'Completo informe de liquidación de contrato.',
    description: 'Calcula la liquidación de ley completa al finalizar una relación de trabajo, incluyendo los derechos de preaviso, cesantía, vacaciones completas o proporcionales, y salario de navidad.',
    category: 'laboral',
    tags: ['Liquidación', 'Despidos', 'Trabajo', 'Derechos'],
    urlSlug: 'calculadora-prestaciones-laborales',
    seoTitle: 'Calculadora de Prestaciones Laborales República Dominicana',
    seoMetaDescription: 'Estima prestaciones laborales según reglas generales del Código de Trabajo: preaviso, cesantía, vacaciones y regalía. Verifica el caso con el Ministerio de Trabajo.',
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
  // FINANZAS
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
  }
];

export const HOME_FAQS: FaqItem[] = [
  {
    question: '¿Qué es el RNC y para qué sirve?',
    answer: 'El RNC es tu número de identificación de impuestos en la DGII. Lo necesitas para hacer facturas oficiales, declarar impuestos y formalizar tu negocio en República Dominicana.'
  },
  {
    question: '¿Cuáles son las deducciones básicas de mi salario en RD?',
    answer: 'De tu salario bruto mensual se descuentan obligatoriamente el 2.87% para tu fondo de pensiones (AFP) y el 3.04% para tu seguro de salud (SFS). Además, si ganas más de RD$ 34,685.00 al mes, se te descuenta el Impuesto Sobre la Renta (ISR) según tu nivel de ingresos.'
  },
  {
    question: '¿Cómo calculo mi sueldo neto real?',
    answer: 'Toma tu salario bruto, réstale el 2.87% de AFP y el 3.04% de SFS. Al monto sobrante le aplicas la retención del Impuesto Sobre la Renta (ISR) si aplica. Lo que queda es tu sueldo neto final, que es lo que depositan en tu cuenta.'
  },
  {
    question: '¿Cuándo tengo derecho a recibir prestaciones laborales?',
    answer: 'Tienes derecho a recibir prestaciones completas (preaviso y cesantía) si tu empleador decide terminar el contrato sin justificación. Las vacaciones no disfrutadas y el salario de navidad acumulado son derechos adquiridos y te corresponden siempre, incluso si renuncias o te despiden con causa.'
  },
  {
    question: '¿Cuándo se declara y paga el ITBIS en la República Dominicana?',
    answer: 'Tienes plazo para pagar el ITBIS hasta el día 20 del mes siguiente. Si te pasas de esa fecha, la DGII te aplicará recargos por mora del 10% el primer mes, 4% por cada mes extra, más un 1.1% de interés mensual.'
  }
];

const LEGACY_PROGRAMMATIC_GUIDES: GuidePage[] = [
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

> **Fórmula de Cálculo:**
> - **Monto ITBIS** = Valor Neto × Tasa ITBIS (0.18 o 0.16)
> - **Monto Total** = Valor Neto + Monto ITBIS

**Ejemplo:**
- Valor Neto del servicio de consultoría: **RD$ 10,000.00**
- Tasa General de ITBIS: **18% (0.18)**
- ITBIS a cobrar: $10,000 \times 0.18 =$ **RD$ 1,800.00**
- Total a facturar: $10,000 + 1,800 =$ **RD$ 11,800.00**

#### Escenario 2: ITBIS Incluido (Saber el neto a partir del total)
Si has vendido un artículo por un precio final global con ITBIS y necesitas reportar cuánto fue el valor neto y cuánto el impuesto recaudado:

> **Fórmula de Cálculo:**
> - **Valor Neto Base** = Total Facturado ÷ (1 + Tasa ITBIS)
> - **Monto ITBIS** = Total Facturado - Valor Neto Base

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
    seoTitle: 'Guía para calcular liquidación y prestaciones laborales en RD',
    seoMetaDescription: 'Aprende a estimar prestaciones en RD paso a paso: preaviso, cesantía, vacaciones y regalía pascual, con ejemplos y fuentes para verificar.',
    shortIntro: 'Conoce tus derechos en el Código de Trabajo. Aprende cómo calcular el sueldo de navidad, preaviso y cesantías en pesos dominicanos.',
    publishDate: '2026-05-20',
    readTime: '12 min de lectura',
    imageAlt: 'Contrato de trabajo y cálculo de prestaciones laborales en RD',
    contentMarkdown: `## Guía de Prestaciones Laborales y Desahucios en la República Dominicana

El término de la relación laboral genera obligaciones y derechos económicos establecidos en el **Código de Trabajo dominicano**. Esta liquidación varía según las condiciones de la salida: renuncia, despido justificado, o desahucio (despido injustificado).

---

### Conceptos Clave de la Liquidación dominicana

#### 1. El Salario Diario Promedio
Todos los cálculos del Ministerio de Trabajo se basan en el salario diario del trabajador. Si cobras mensual, el Código de Trabajo usa **23.83 días laborables** como divisor de referencia.

> **Fórmula Oficial del Ministerio de Trabajo:**
> - **Salario Diario** = Salario Mensual Bruto ÷ 23.83

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
2. **Tiempo de Servicio:** 2 años completos.
3. **Preaviso:** Omitido por el empleador (28 días de salario)
   - $1,258.91 \times 28 =$ **RD$ 35,249.48**
4. **Cesantía:** 2 años de servicio imponible (21 días por cada año = 42 días en total)
   - $1,258.91 \times 42 =$ **RD$ 52,874.22**
5. **Vacaciones Pendientes:** Sí, tiene derecho a 14 días.
   - $1,258.91 \times 14 =$ **RD$ 17,624.74**
6. **Regalía Pascual (Salario de Navidad Proporcional):** Digamos que trabajó 3 meses del año actual.
   - $30,000 \times 3 / 12 =$ **RD$ 7,500.00**

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

¿Quieres entender con claridad cómo se desvanece de tu salario bruto la porción destinada a la seguridad social y al gobierno de la República Dominicana? En esta guía te explicamos, con el máximo rigor, cómo realizar este cálculo manualmente paso a paso.

---

### Paso 1: Deducciones de la TSS (Seguridad Social)
Antes de cobrar impuestos sobre tu sueldo, la ley dominicana establece que se debe descontar tu contribución al sistema de seguridad social administrado por la TSS. Estos porcentajes son:

1. **AFP (Aporte para Pensiones):** **2.87%** de tu salario bruto ordinario imponible (hasta un tope impositivo de 20 salarios mínimos nacionales).
2. **SFS (Seguro de Salud):** **3.04%** de tu salario bruto ordinario imponible (hasta un tope impositivo de 10 salarios mínimos nacionales).

**Ejemplo de TSS para un sueldo bruto de RD$ 50,000.00:**
- AFP: $50,000 \times 2.87% =$ **RD$ 1,435.00**
- SFS: $50,000 \times 3.04% =$ **RD$ 1,520.00**
- Total aportado TSS mensual: **RD$ 2,955.00**

---

### Paso 2: Obtener el Sueldo Neto Sujeto al ISR de la DGII
El impuesto sobre la renta solar se calcula **después** de restar la porción cotizada del AFP y SFS.

> **Fórmula:**
> - **Salario Base ISR** = Salario Bruto - Deducciones TSS (AFP + SFS)

- Utilizando nuestro ejemplo: $50,000 - 2,955 =$ **RD$ 47,045.00**

---

### Paso 3: Aplicar la Escala Impositiva de la DGII para ISR
Anualizamos el salario neto obtenido para evaluar el tramo en la tabla anual imponible de la DGII:
- Salario anual base: $RD$ 47,045.00 \times 12 = $ **RD$ 564,540.00**

Al contrastar la tasación, este cae en el **Rango Segundo (15%):**
- Tramo imponible: Desde RD$ 416,220.01 hasta RD$ 624,329.00 anuales.
- Excedente sobre límite inferior: $564,540.00 - 416,220.01 = $ **RD$ 148,319.99**
- Impuesto anualizado: $148,319.99 \times 15% = $ **RD$ 22,248.00**
- Retención ISR mensual: $22,248.00 / 12 = $ **RD$ 1,854.00**

---

### Paso 4: Obtener el Salario Neto Final
Finalmente restamos todos los aportes combinados de tu salario bruto ordinario:

> **Fórmula:**
> - **Salario Neto Final** = Salario Bruto - TSS (AFP + SFS) - Retención ISR

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

> **Fórmula:**
> - **Salario de Navidad** = Suma de todos los salarios ordinarios percibidos ÷ 12

---

### Ejemplo Práctico de Regalía Pascual Proporcional

Si un empleado trabajó cobrando **RD$ 40,000.00** al mes desde el **1 de junio** hasta el **31 de diciembre** (un total de 7 meses):
- Total de sueldos ganados en el año: $RD$ 40,000 \times 7 = RD$ 280,000.00$
- Salario de Navidad / Regalía: $RD$ 280,000.00 / 12 = $ **RD$ 23,333.33**

---

### Exención de Descuentos

Una de las características más importantes de la Regalía Pascual en la República Dominicana es su inmunidad:
- **No se le retiene TSS** (Ni el 2.87% de AFP ni el 3.04% de SFS).
- **No sufre retención de ISR** de la DGII.
- **No se puede embargar judicialmente** (con la única excepción de pensiones alimentarias por orden judicial formal de menores de edad).`
  }
];

export const PROGRAMMATIC_GUIDES: GuidePage[] = LEARNING_GUIDES;
export const SEO_PROGRAMMATIC_CONTENT: Record<string, SEOContent> = {};
