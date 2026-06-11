import { ArrowRight } from "lucide-react";
import { CALCULATORS, PROGRAMMATIC_GUIDES } from "../data";
import { getCanonicalCalculatorPath, TopicHub } from "../seo-pages";

interface Props {
  hub: TopicHub;
  onNavigate: (path: string) => void;
}

export default function TopicHubPage({ hub, onNavigate }: Props) {
  return (
    <article className="max-w-5xl mx-auto space-y-6 pb-12">
      <header className="bg-white border border-gray-200 rounded-2xl p-7 md:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Centro tematico</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-black text-gray-950">{hub.title}</h1>
        <p className="mt-4 text-gray-600 leading-relaxed">{hub.intro}</p>
      </header>
      <section>
        <h2 className="text-xl font-bold text-gray-950">Calculadoras del tema</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {hub.calculatorSlugs.map((slug) => {
            const calc = CALCULATORS.find((item) => item.urlSlug === slug || item.id === slug);
            if (!calc) return null;
            const path = getCanonicalCalculatorPath(calc.urlSlug);
            return (
              <a key={slug} href={path} onClick={(event) => { event.preventDefault(); onNavigate(path); }} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-teal-500 shadow-sm">
                <h3 className="font-bold text-gray-950">{calc.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{calc.shortDescription}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0F766E]">Abrir <ArrowRight size={14} /></span>
              </a>
            );
          })}
        </div>
      </section>
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-950">Guias relacionadas</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {hub.guideSlugs.map((slug) => {
            const guide = PROGRAMMATIC_GUIDES.find((item) => item.slug === slug);
            return guide ? <a key={slug} href={`/guia/${slug}`} onClick={(event) => { event.preventDefault(); onNavigate(`/guia/${slug}`); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:text-[#0F766E]">{guide.title}</a> : null;
          })}
        </div>
      </section>
    </article>
  );
}
