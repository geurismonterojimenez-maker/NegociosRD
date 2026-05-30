import React, { useState } from 'react';
import { Sparkles, HelpCircle, Eye, Code, Smartphone, Tablet, Monitor, Settings } from 'lucide-react';

interface AdSenseBlockProps {
  variant: 'skyscraper-left' | 'skyscraper-right' | 'horizontal-bottom' | 'mobile-infeed' | 'tablet-banner' | 'results-inline';
  className?: string;
  userTier?: 'FREE' | 'PRO';
}

export default function AdSenseBlock({ variant, className = '', userTier }: AdSenseBlockProps) {
  const [showCode, setShowCode] = useState(false);

  // Check if PRO is active based on props or localStorage
  const isPro = userTier === 'PRO' || (typeof window !== 'undefined' && localStorage.getItem('negociord_user_tier') === 'PRO');

  if (isPro) {
    if (variant === 'skyscraper-left' || variant === 'skyscraper-right') {
      return (
        <div className={`w-full h-full min-h-[350px] border border-teal-500/20 bg-teal-50/5 rounded-xl flex flex-col items-center justify-center p-4 text-center ${className}`}>
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mb-3">
            <span className="text-[16px]">💎</span>
          </div>
          <span className="text-xs font-bold text-[#0F766E]">Usuario PRO</span>
          <span className="text-[9px] text-gray-400 mt-1 max-w-[120px] leading-normal">Espacio publicitario depurado en tu cuenta profesional.</span>
        </div>
      );
    }
    return (
      <div className={`w-full py-2.5 px-4 rounded-xl bg-teal-50/25 border border-teal-100 flex items-center justify-center gap-2 text-xs font-semibold text-[#0F766E] my-1 tracking-tight ${className}`}>
        <span>💎</span>
        <span>Perfil PRO Activo — Navegación libre de interrupciones</span>
      </div>
    );
  }

  // Generate real, copyable AdSense responsive code templates based on the variant selected
  const getAdSenseCode = () => {
    switch (variant) {
      case 'skyscraper-left':
      case 'skyscraper-right':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- Skyscraper Lateral Adaptable -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1111111111"
     data-ad-format="vertical"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
      case 'horizontal-bottom':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- Banner Horizontal Adaptable Inferior -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="2222222222"
     data-ad-format="horizontal"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
      case 'mobile-infeed':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- Anuncio InFeed Optimizado para Celulares -->
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="3333333333"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
      case 'tablet-banner':
      case 'results-inline':
      default:
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- Banner Adaptable de Resultados -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="4444444444"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
    }
  };

  // Render Left Skyscraper (Tower, 160x600 or responsive vertical tower)
  if (variant === 'skyscraper-left') {
    return (
      <div className={`w-full flex flex-col gap-2.5 h-full ${className}`} id="adsense-skyscraper-left">
        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
          <span className="flex items-center gap-1">
            <Monitor size={10} className="text-teal-600" />
            AdSense Lateral Izquierdo
          </span>
          <button 
            type="button"
            onClick={() => setShowCode(!showCode)} 
            className="hover:text-[#0F766E] transition-colors cursor-pointer"
            title="Ver código oficial de AdSense"
            aria-label="Ver código oficial de AdSense Izquierdo"
          >
            {showCode ? <Eye size={12} /> : <Code size={12} />}
          </button>
        </div>

        {showCode ? (
          <div className="flex-grow p-3 bg-gray-900 rounded-xl text-[9px] font-mono text-emerald-400 overflow-auto break-all border border-gray-800 leading-normal max-h-[600px]">
            <div className="border-b border-gray-800 pb-1.5 mb-2 text-gray-500 font-sans font-bold flex justify-between">
              <span>CÓDIGO DE INTEGRACIÓN</span>
              <span className="text-[8px] px-1 bg-gray-800 rounded">HTML/JS</span>
            </div>
            {getAdSenseCode()}
          </div>
        ) : (
          <div className="flex-grow bg-gradient-to-b from-[#FAFAFA] to-gray-50/50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-between p-4 text-center min-h-[550px] transition-all hover:border-[#0F766E]/40 group shadow-xs">
            <span className="text-[9px] font-mono text-gray-400 bg-white border px-1.5 py-0.5 rounded shadow-2xs">ca-pub-xxxx • 160x600</span>
            
            <div className="my-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-teal-600 group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700 block tracking-tight">Espacio disponible para Google AdSense</span>
                <span className="text-[10px] text-gray-400 font-mono block mt-1">Anuncio Vertical Adaptable</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed max-w-[130px] mx-auto">
                Optimizado para mantener altas tasas de click-through rate (CTR) en resoluciones superiores a 1280px.
              </p>
            </div>

            <div className="w-full bg-white border border-gray-150 rounded-lg p-2 text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <Settings size={10} className="animate-spin duration-3000 text-teal-600" />
              <span>Optimización Activa</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Right Skyscraper (Tower, 160x600 or responsive vertical tower)
  if (variant === 'skyscraper-right') {
    return (
      <div className={`w-full flex flex-col gap-2.5 h-full ${className}`} id="adsense-skyscraper-right">
        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
          <span className="flex items-center gap-1">
            <Monitor size={10} className="text-teal-600" />
            AdSense Lateral Derecho
          </span>
          <button 
            type="button"
            onClick={() => setShowCode(!showCode)} 
            className="hover:text-[#0F766E] transition-colors cursor-pointer"
            title="Ver código oficial de AdSense"
            aria-label="Ver código oficial de AdSense Derecho"
          >
            {showCode ? <Eye size={12} /> : <Code size={12} />}
          </button>
        </div>

        {showCode ? (
          <div className="flex-grow p-3 bg-gray-900 rounded-xl text-[9px] font-mono text-emerald-400 overflow-auto break-all border border-gray-800 leading-normal max-h-[600px]">
            <div className="border-b border-gray-800 pb-1.5 mb-2 text-gray-500 font-sans font-bold flex justify-between">
              <span>CÓDIGO DE INTEGRACIÓN</span>
              <span className="text-[8px] px-1 bg-gray-800 rounded">HTML/JS</span>
            </div>
            {getAdSenseCode()}
          </div>
        ) : (
          <div className="flex-grow bg-gradient-to-b from-[#FAFAFA] to-gray-50/50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-between p-4 text-center min-h-[550px] transition-all hover:border-[#0F766E]/40 group shadow-xs">
            <span className="text-[9px] font-mono text-gray-400 bg-white border px-1.5 py-0.5 rounded shadow-2xs">ca-pub-xxxx • 160x600</span>
            
            <div className="my-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-600 group-hover:scale-110 transition-transform">
                💼
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700 block tracking-tight">Espacio disponible para Google AdSense</span>
                <span className="text-[10px] text-gray-400 font-mono block mt-1">Anuncio Vertical Adaptable</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed max-w-[130px] mx-auto">
                No invasivo. El visitante visualiza ofertas relevantes a finanzas, contabilidad y pymes de RD.
              </p>
            </div>

            <div className="w-full bg-white border border-gray-150 rounded-lg p-2 text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <Settings size={10} className="animate-spin duration-3000 text-amber-600" />
              <span>Carga Asíncrona Seguro</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Mobile InFeed (Special phone landscape and portrait block)
  if (variant === 'mobile-infeed') {
    return (
      <div className={`w-full bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-xs relative overflow-hidden ${className}`} id="adsense-mobile-infeed">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
            <Smartphone size={10} className="text-[#0F766E]" />
            <span>AdSense Optimizado para Celulares / Tablets</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)} 
            className="text-xs text-gray-400 hover:text-[#0F766E] font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            {showCode ? <Eye size={12} /> : <Code size={12} />}
            <span className="text-[10px] font-mono">{showCode ? 'Ver preview' : 'Ver código'}</span>
          </button>
        </div>

        {showCode ? (
          <pre className="p-3 bg-gray-900 rounded-xl text-[9px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-gray-800">
            {getAdSenseCode()}
          </pre>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-4 py-2">
            {/* Simulation of a premium native article card ad block */}
            <div className="w-full md:w-28 h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center text-center px-2 select-none">
              <span className="text-xl">🏬</span>
              <span className="text-[8px] font-mono text-gray-400 mt-1">Anuncio Adaptable</span>
            </div>
            <div className="flex-1 space-y-1 text-center md:text-left">
              <span className="bg-amber-50 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase inline-block">Anuncio por AdSense</span>
              <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight">Software de Facturación Autorizado con Formatos DGII 606 y 607</h4>
              <p className="text-[11px] text-gray-500 leading-normal">Lleve su contabilidad libre de estrés de forma automatizada y sincronizada con el portal oficial dominicano.</p>
            </div>
            <div className="w-full md:w-auto text-right">
              <button className="w-full md:w-auto px-3.5 py-1.5 bg-[#0F766E]/10 text-[#0F766E] text-[10px] font-bold rounded-lg cursor-not-allowed uppercase tracking-wider">
                Saber más
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Horizontal Bottom full-width banner
  if (variant === 'horizontal-bottom') {
    return (
      <div className={`w-full flex flex-col gap-2 ${className}`} id="adsense-horizontal-bottom">
        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
          <span className="flex items-center gap-1">
            <Tablet size={10} className="text-teal-600" />
            AdSense Horizontal Inferior (Responsive)
          </span>
          <button 
            type="button"
            onClick={() => setShowCode(!showCode)} 
            className="hover:text-[#0F766E] transition-colors cursor-pointer text-xs flex items-center gap-1 font-mono hover:underline"
          >
            {showCode ? <Eye size={12} /> : <Code size={12} />}
            <span>{showCode ? 'Ver diseño' : 'Código'}</span>
          </button>
        </div>

        {showCode ? (
          <pre className="p-3 bg-gray-900 rounded-xl text-[9px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-gray-800">
            {getAdSenseCode()}
          </pre>
        ) : (
          <div className="p-4 bg-[#FAFAFA] border border-dashed border-gray-300 rounded-xl text-center group transition-all hover:border-[#0F766E]/40 shadow-xs">
            <div className="flex justify-between items-center text-[8px] font-mono text-gray-400 mb-2">
              <span>ca-pub-xxxx • 728x90 / 970x90</span>
              <span className="bg-white border rounded px-1.5 py-0.5">Banner Horizontal Adaptable</span>
            </div>
            <div className="h-16 bg-white border border-gray-100 flex flex-col justify-center items-center rounded-lg max-w-4xl mx-auto gap-0.5">
              <span className="text-xs font-bold text-gray-600">Espacio para anuncio Google AdSense</span>
              <span className="text-[10px] text-gray-400">Totalmente adaptable para Móviles, Tablets e iPads sin desbordar los contenedores</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render inline results banner wrapper
  return (
    <div className={`w-full flex flex-col gap-2 ${className}`} id="adsense-results-inline">
      <div className="flex items-center justify-between px-1 text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider select-none">
        <span>Publicidad Relacionada</span>
        <button 
          type="button"
          onClick={() => setShowCode(!showCode)} 
          className="hover:text-[#0F766E] transition-colors cursor-pointer"
          aria-label="Ver código fiscal del anuncio"
        >
          {showCode ? <Eye size={12} /> : <Code size={12} />}
        </button>
      </div>

      {showCode ? (
        <pre className="p-3 bg-gray-900 rounded-xl text-[9px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-normal border border-gray-800">
          {getAdSenseCode()}
        </pre>
      ) : (
        <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center relative overflow-hidden group transition-all hover:border-[#0F766E]/30">
          <div className="h-16 bg-white border border-gray-100 flex flex-col justify-center items-center rounded-lg text-xs font-medium text-gray-500 gap-0.5">
            <span className="font-bold text-gray-600">AdSense Adaptable en Resultados</span>
            <span className="text-[10px] text-gray-400">Anuncio inteligente basado en sus consultas fiscales dominicanas</span>
          </div>
        </div>
      )}
    </div>
  );
}
