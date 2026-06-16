import React, { useEffect, useState } from 'react';
import { CALCULATORS, PROGRAMMATIC_GUIDES } from '../data';
import { GuidePage } from '../types';
import { BookOpen, Calendar, Clock, ArrowLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import AdSlot from './AdSlot';

interface GuidesViewProps {
  onBackToHome: () => void;
  onNavigateToCalcBySlug: (slug: string) => void;
  initialSelectedGuideSlug?: string | null;
}

export default function GuidesView({ onBackToHome, onNavigateToCalcBySlug, initialSelectedGuideSlug }: GuidesViewProps) {
  const [selectedGuide, setSelectedGuide] = useState<GuidePage | null>(() => {
    if (initialSelectedGuideSlug) {
      return PROGRAMMATIC_GUIDES.find(g => g.slug === initialSelectedGuideSlug) || null;
    }
    return null;
  });

  useEffect(() => {
    if (!initialSelectedGuideSlug) {
      setSelectedGuide(null);
      return;
    }
    setSelectedGuide(PROGRAMMATIC_GUIDES.find(g => g.slug === initialSelectedGuideSlug) || null);
  }, [initialSelectedGuideSlug]);

  // Action helper to load a related calculator
  const handleCalcClick = (urlSlug: string) => {
    onNavigateToCalcBySlug(urlSlug);
  };

  const currentGuideIndex = selectedGuide ? PROGRAMMATIC_GUIDES.indexOf(selectedGuide) : -1;
  const relatedCalculator = selectedGuide?.relatedCalculatorSlug
    ? CALCULATORS.find((calc) => calc.urlSlug === selectedGuide.relatedCalculatorSlug || calc.id === selectedGuide.relatedCalculatorSlug)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* If a specific guide is opened */}
      {selectedGuide ? (
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => {
              window.history.pushState(null, '', '/guias');
              setSelectedGuide(null);
            }}
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0F766E] font-medium transition-colors mb-6 cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Volver a Guías Tributarias
          </button>

          {/* Guide Header */}
          <div className="border-b border-gray-150 pb-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111827] mb-4">
              {selectedGuide.title}
            </h1>
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed mb-4">
              La informacion proporcionada tiene fines educativos e informativos y no constituye asesoria legal, fiscal ni financiera profesional.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Actualizado: {selectedGuide.publishDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {selectedGuide.readTime}
              </span>
              <span>•</span>
              <span className="font-bold text-[#0F766E]">Redactado por: Comité Fiscal Tu Negocio RD</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Main content body */}
            <div className="lg:col-span-8 bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm">
              <div className="prose prose-teal max-w-none text-[#111827] font-sans text-sm md:text-base leading-relaxed space-y-6">
                {/* Simplified markdown parser for bold, section header rendering */}
                {selectedGuide.contentMarkdown.split('\n\n').map((paragraph, pIdx) => {
                  const shouldRenderInArticleAd = pIdx === 7;
                  const withInArticleAd = (node: React.ReactNode) => (
                    <React.Fragment key={pIdx}>
                      {node}
                      {shouldRenderInArticleAd && (
                        <AdSlot position="in-article" className="my-8" />
                      )}
                    </React.Fragment>
                  );

                  if (paragraph.startsWith('## ')) {
                    return withInArticleAd(
                      <h2 className="text-xl md:text-2xl font-bold text-[#111827] pt-4 border-b pb-2">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return withInArticleAd(
                      <h3 className="text-lg font-bold text-gray-900 pt-2">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('#### ')) {
                    return withInArticleAd(
                      <h4 className="text-base font-bold text-[#0F766E] pt-1">
                        {paragraph.replace('#### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return withInArticleAd(
                      <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base text-gray-700">
                        {paragraph.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^[\s-*]+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  // Render bold blocks
                  return withInArticleAd(
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {paragraph.split('**').map((text, tIdx) => {
                        return tIdx % 2 === 1 ? <strong key={tIdx} className="text-gray-950 font-bold">{text}</strong> : text;
                      })}
                    </p>
                  );
                })}
              </div>
              <section className="mt-8 rounded-xl border border-teal-100 bg-teal-50/40 p-5">
                <h2 className="text-base font-bold text-gray-950">Recursos relacionados para seguir aprendiendo</h2>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {relatedCalculator && (
                    <button
                      onClick={() => handleCalcClick(relatedCalculator.urlSlug)}
                      className="rounded-lg border border-teal-200 bg-white px-3 py-2 font-semibold text-[#0F766E] hover:border-[#0F766E] cursor-pointer"
                    >
                      Abrir {relatedCalculator.name}
                    </button>
                  )}
                  <a href="/guias" onClick={(event) => { event.preventDefault(); setSelectedGuide(null); window.history.pushState(null, '', '/guias'); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:text-[#0F766E]">
                    Ver centro de aprendizaje
                  </a>
                  <a href="/nomina" className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:text-[#0F766E]">Nomina y TSS</a>
                  <a href="/prestaciones-laborales" className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:text-[#0F766E]">Prestaciones laborales</a>
                  <a href="/itbis" className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 hover:text-[#0F766E]">ITBIS y retenciones</a>
                </div>
              </section>
            </div>

            {/* Sidebar with related action or static AdSense */}
            <div className="lg:col-span-4 space-y-6">
              {/* Linked Calculator */}
              <div className="bg-[#0F766E] text-white rounded-xl p-6 shadow-sm">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-900/40 text-emerald-200 px-2.5 py-1 rounded-full mb-3 inline-block">Herramienta Interactiva</span>
                <h3 className="text-base font-bold mb-2">¿Quieres hacer este cálculo automáticamente?</h3>
                <p className="text-xs text-emerald-100 leading-relaxed mb-6">
                  Tenemos la calculadora oficial de República Dominicana configurada para responder en tiempo real con este tema impositivo.
                </p>
                <button
                  onClick={() => {
                    if (selectedGuide.relatedCalculatorSlug) {
                      handleCalcClick(selectedGuide.relatedCalculatorSlug);
                    } else {
                      onBackToHome();
                    }
                  }}
                  className="w-full py-2.5 bg-white text-[#0F766E] hover:bg-gray-50 text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow active:scale-95"
                >
                  Abrir calculadora relacionada
                  <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Sidebar AdSense reusable slot */}
              <AdSlot position="rectangle" />
            </div>
          </div>
        </div>
      ) : (
        /* If looking at all guides */
        <div>
          <div className="border-b pb-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2 flex items-center gap-2">
              <BookOpen size={24} className="text-[#0F766E]" />
              Centro de aprendizaje financiero y laboral
            </h1>
            <p className="text-[#6B7280]">
              Guias educativas extensas sobre nomina, impuestos, TSS, prestaciones y finanzas para Republica Dominicana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMMATIC_GUIDES.map((guide) => (
              <a
                key={guide.slug}
                href={`/guia/${guide.slug}`}
                onClick={(event) => {
                  event.preventDefault();
                  window.history.pushState(null, '', `/guia/${guide.slug}`);
                  setSelectedGuide(guide);
                }}
                className="bg-white border hover:border-[#0F766E] rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group h-72"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280] mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {guide.publishDate}
                    </span>
                    <span>•</span>
                    <span>{guide.readTime}</span>
                  </div>
                  <h3 className="font-bold text-base text-[#111827] group-hover:text-[#0F766E] transition-colors mb-2 line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] line-clamp-4 leading-relaxed">
                    {guide.shortIntro}
                  </p>
                </div>

                <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-[#0F766E] font-bold text-xs">
                  <span>Leer artículo experto completo →</span>
                  <BookOpen size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export function getGuideReadTime(slug: string): string {
  return "6 min";
}
