import { ArrowRight, ExternalLink } from "lucide-react";
import { ProgrammaticSeoPageData } from "../seo-pages";

interface Props {
  page: ProgrammaticSeoPageData;
  onNavigate: (path: string) => void;
}

const money = (value: number) => `RD$ ${value.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProgrammaticSeoPage({ page, onNavigate }: Props) {
  const isItbis = page.kind === "itbis";
  const primary = isItbis ? page.amount * 0.18 : page.amount;
  const secondary = isItbis ? page.amount + primary : page.amount / 2;
  return (
    <article className="max-w-4xl mx-auto space-y-6 pb-12">
      <header className="bg-white border border-gray-200 rounded-2xl p-7 md:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Ejemplo calculado y revisado</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-black text-gray-950">{page.title}</h1>
        <p className="mt-4 text-gray-600 leading-relaxed">{page.description}</p>
      </header>
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="bg-[#0F766E] text-white rounded-2xl p-6">
          <p className="text-sm text-teal-100">{isItbis ? "ITBIS al 18%" : "Regalia por 12 meses"}</p>
          <p className="mt-2 text-3xl font-black font-mono">{money(primary)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-500">{isItbis ? "Total con ITBIS" : "Regalia por 6 meses"}</p>
          <p className="mt-2 text-3xl font-black font-mono text-gray-950">{money(secondary)}</p>
        </div>
      </section>
      <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-gray-950">Como se obtiene</h2>
        {isItbis ? (
          <p className="text-sm text-gray-600">Se multiplica {money(page.amount)} por 0.18. El impuesto es {money(primary)} y se suma a la base para obtener {money(secondary)}.</p>
        ) : (
          <p className="text-sm text-gray-600">La regalia completa equivale a los salarios ordinarios del año divididos entre doce. Con salario estable, doce meses producen {money(primary)} y seis meses {money(secondary)}.</p>
        )}
        <button onClick={() => onNavigate(isItbis ? "/calculadora-itbis-rd" : "/calculadora-regalia-pascual")} className="inline-flex items-center gap-2 bg-[#0F766E] text-white rounded-lg px-5 py-3 text-xs font-bold">
          Cambiar el monto <ArrowRight size={15} />
        </button>
      </section>
      <section className="bg-teal-50/40 border border-teal-100 rounded-xl p-5 text-sm text-gray-600">
        <strong className="text-[#0F766E]">Fuente y alcance.</strong> Ejemplo informativo revisado el 10 de junio de 2026.
        <a href={isItbis ? "https://dgii.gov.do" : "https://mt.gob.do"} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-[#0F766E] font-semibold hover:underline">Fuente oficial <ExternalLink size={13} /></a>
      </section>
    </article>
  );
}
