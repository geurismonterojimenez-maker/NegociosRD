import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { EDITORIAL_PAGES, EDITORIAL_REVIEW_DATE, OFFICIAL_SOURCES } from "../content/editorial";

interface EditorialPageProps {
  pageKey: keyof typeof EDITORIAL_PAGES;
}

type EditorialPageData = (typeof EDITORIAL_PAGES)[keyof typeof EDITORIAL_PAGES] & {
  relatedLinks?: readonly (readonly [string, string])[];
};

export default function EditorialPage({ pageKey }: EditorialPageProps) {
  const page = EDITORIAL_PAGES[pageKey] as EditorialPageData;
  return (
    <article className="max-w-4xl mx-auto space-y-6 pb-12">
      <header className="bg-white border border-gray-200 rounded-2xl p-7 md:p-10 shadow-sm">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider">
          <ShieldCheck size={16} /> Transparencia editorial
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-black text-gray-950">{page.heading}</h1>
        <p className="mt-4 text-gray-600 leading-relaxed">{page.intro}</p>
        <p className="mt-4 text-xs text-gray-500">Responsable: Equipo editorial Tu Negocio RD. Revisado: {EDITORIAL_REVIEW_DATE}.</p>
      </header>

      <div className="grid gap-4">
        {page.sections.map(([heading, body]) => (
          <section key={heading} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">{heading}</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>

      {page.relatedLinks && page.relatedLinks.length > 0 && (
        <section className="bg-teal-50/40 border border-teal-100 rounded-xl p-6">
          <h2 className="font-bold text-[#0F766E]">Siguiente paso recomendado</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.relatedLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="inline-flex items-center gap-2 bg-white border border-teal-100 rounded-lg px-3 py-2 text-sm font-semibold text-[#0F766E] hover:border-teal-400"
              >
                {label}<ArrowRight size={14} />
              </a>
            ))}
          </div>
        </section>
      )}

      {pageKey === "fuentes-oficiales" && (
        <section className="bg-teal-50/40 border border-teal-100 rounded-xl p-6">
          <h2 className="font-bold text-[#0F766E]">Enlaces institucionales</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {OFFICIAL_SOURCES.map((source) => (
              <a key={source.name} href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white border border-teal-100 rounded-lg p-3 text-sm font-semibold text-[#0F766E] hover:border-teal-400">
                {source.name}<ExternalLink size={14} />
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
