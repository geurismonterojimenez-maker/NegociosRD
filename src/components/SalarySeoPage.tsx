import { ArrowRight, CheckCircle, ExternalLink, HelpCircle } from "lucide-react";
import { calculateSalarioNeto } from "../lib/calculations/tss";
import { salaryPageSlug } from "../seo-pages";

interface SalarySeoPageProps {
  amount: number;
  onNavigate: (path: string) => void;
}

const money = (value: number) => `RD$ ${value.toLocaleString("es-DO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export default function SalarySeoPage({ amount, onNavigate }: SalarySeoPageProps) {
  const result = calculateSalarioNeto(amount);
  const nearbyAmounts = [amount - 5000, amount + 5000, amount + 10000]
    .filter((value) => value >= 20000 && value <= 500000);

  return (
    <article className="max-w-5xl mx-auto space-y-6 pb-12">
      <nav className="text-[11px] font-semibold text-gray-500" aria-label="Migas de pan">
        <a href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }} className="hover:text-[#0F766E]">Inicio</a>
        <span className="mx-2">/</span>
        <span>Salario neto</span>
        <span className="mx-2">/</span>
        <span className="text-[#0F766E]">{money(amount)}</span>
      </nav>

      <header className="bg-white border border-gray-200 rounded-2xl p-6 md:p-9 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E] mb-3">Nomina dominicana 2026</p>
        <h1 className="text-2xl md:text-4xl font-black text-gray-950 tracking-tight">
          Si gano {money(amount)}, cuanto me descuentan en RD?
        </h1>
        <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl">
          Este ejemplo calcula AFP, SFS e ISR estimados para un salario bruto mensual de {money(amount)}.
          Usa la escala DGII 2026 y los topes TSS efectivos desde el 1 de febrero de 2026.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
          <CheckCircle size={14} />
          Ultima revision fiscal: 10 de junio de 2026
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Resumen de descuentos">
        {[
          ["AFP", result.afpMonto],
          ["SFS", result.sfsMonto],
          ["ISR", result.isrMonto],
          ["Total descuentos", result.totalDescuentos],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400">{label}</div>
            <div className="mt-2 font-mono font-black text-lg text-gray-900">{money(Number(value))}</div>
          </div>
        ))}
      </section>

      <section className="bg-[#0F766E] text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="text-sm text-teal-100">Salario neto mensual estimado</div>
        <div className="text-3xl md:text-5xl font-black font-mono mt-2">{money(result.salarioNeto)}</div>
        <p className="text-xs md:text-sm text-teal-50 mt-3">
          Recibirias aproximadamente {result.porcentajeNeto}% del salario bruto, antes de otros descuentos voluntarios,
          prestamos, dependientes adicionales o ingresos variables.
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
        <h2 className="text-xl font-bold text-gray-950">Desglose paso a paso</h2>
        <ol className="space-y-3 text-sm text-gray-600">
          <li><strong>1. AFP:</strong> se aplica 2.87% sobre el salario cotizable, hasta el tope de pensiones.</li>
          <li><strong>2. SFS:</strong> se aplica 3.04% sobre el salario cotizable, hasta el tope del Seguro Familiar de Salud.</li>
          <li><strong>3. ISR:</strong> se resta la TSS, se anualiza la renta neta y se aplica la escala progresiva DGII 2026.</li>
          <li><strong>4. Neto:</strong> {money(amount)} menos {money(result.totalDescuentos)} produce {money(result.salarioNeto)}.</li>
        </ol>
        <button
          onClick={() => onNavigate("/calculadora-nomina-rd")}
          className="inline-flex items-center gap-2 bg-[#0F766E] text-white rounded-lg px-5 py-3 text-xs font-bold hover:opacity-95 cursor-pointer"
        >
          Probar otro salario <ArrowRight size={15} />
        </button>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2"><HelpCircle size={19} className="text-[#0F766E]" /> Preguntas frecuentes</h2>
        <div className="mt-5 space-y-4 text-sm text-gray-600">
          <div><h3 className="font-bold text-gray-900">Cuanto se descuenta de TSS con {money(amount)}?</h3><p className="mt-1">La aportacion estimada del empleado es {money(result.afpMonto + result.sfsMonto)}, dividida en AFP y SFS.</p></div>
          <div><h3 className="font-bold text-gray-900">Pago ISR con este salario?</h3><p className="mt-1">{result.isrMonto > 0 ? `Si. La retencion mensual estimada es ${money(result.isrMonto)}.` : "Con este escenario, la renta neta anualizada no supera el tramo exento de la escala aplicada."}</p></div>
          <div><h3 className="font-bold text-gray-900">Es exactamente lo que recibire?</h3><p className="mt-1">Es una estimacion. Bonificaciones, comisiones, dependientes adicionales, prestamos y ajustes de nomina pueden cambiar el resultado.</p></div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-950">Comparar otros salarios</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearbyAmounts.map((value) => (
              <a
                key={value}
                href={`/${salaryPageSlug(value)}`}
                onClick={(event) => { event.preventDefault(); onNavigate(`/${salaryPageSlug(value)}`); }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold hover:border-[#0F766E] hover:text-[#0F766E]"
              >
                {money(value)}
              </a>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-950">Fuentes oficiales</h2>
          <div className="mt-4 space-y-2 text-xs">
            <a className="flex items-center gap-2 text-[#0F766E] hover:underline" href="https://dgii.gov.do/cicloContribuyente/obligacionesTributarias/principalesImpuestos/Paginas/impuestoSobreRenta.aspx" target="_blank" rel="noreferrer">Escala ISR 2026 de la DGII <ExternalLink size={13} /></a>
            <a className="flex items-center gap-2 text-[#0F766E] hover:underline" href="https://tss.gob.do/tss-informa-nuevos-topes-de-cotizacion-del-regimen-contributivo-del-sdss/" target="_blank" rel="noreferrer">Topes cotizables 2026 de la TSS <ExternalLink size={13} /></a>
          </div>
        </div>
      </section>
    </article>
  );
}
