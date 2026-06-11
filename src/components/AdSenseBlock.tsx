import React, { useState } from 'react';
import { BriefcaseBusiness, Code, Eye, Monitor, Settings, Smartphone, Tablet } from 'lucide-react';
import { useAdSenseActivation } from '../lib/useAdSenseActivation';

interface AdSenseBlockProps {
  variant: 'skyscraper-left' | 'skyscraper-right' | 'horizontal-bottom' | 'mobile-infeed' | 'tablet-banner' | 'results-inline' | 'nav-inline';
  className?: string;
  userTier?: 'FREE' | 'PRO';
}

const OFFICIAL_ADSENSE_CLIENT_ID = 'ca-pub-6144599865368963';
const ADSENSE_SLOT_BY_VARIANT: Record<AdSenseBlockProps['variant'], string> = {
  'skyscraper-left': '3312679766',
  'skyscraper-right': '1999598095',
  'horizontal-bottom': '2943190273',
  'mobile-infeed': '3210783582',
  'tablet-banner': '2943190273',
  'results-inline': '5429752815',
  'nav-inline': '5539918084'
};

export default function AdSenseBlock({ variant, className = '' }: AdSenseBlockProps) {
  const [showCode, setShowCode] = useState(false);
  const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV === true;
  const adsenseClientId = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_ADSENSE_CLIENT_ID || OFFICIAL_ADSENSE_CLIENT_ID : OFFICIAL_ADSENSE_CLIENT_ID;
  const adSlot = ADSENSE_SLOT_BY_VARIANT[variant];
  const hasClientId = adsenseClientId && adsenseClientId !== 'ca-pub-XXXXXXXXXXXXXXXX' && adsenseClientId.startsWith('ca-pub-');
  const { adElementRef, containerRef, shouldRenderAd } = useAdSenseActivation(Boolean(hasClientId && !isDev));

  if (variant === 'nav-inline') {
    if (hasClientId && !isDev) {
      return (
        <div ref={containerRef} className={`hidden xl:flex h-10 w-[168px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-250 bg-gray-50/70 px-2 text-center ${className}`}>
          {shouldRenderAd && <ins className="adsbygoogle"
               ref={adElementRef}
               style={{ display: 'block', width: '150px', height: '32px' }}
             data-ad-client={adsenseClientId}
             data-ad-slot={adSlot}
             data-ad-placement={variant}
             data-ad-format="auto"
               data-full-width-responsive="false" />}
        </div>
      );
    }

    return (
      <div className={`hidden xl:flex h-10 w-[168px] items-center justify-center rounded-lg border border-dashed border-gray-250 bg-gray-50/70 px-3 text-center ${className}`}>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <BriefcaseBusiness size={12} className="text-[#0F766E]" />
          <span>Publicidad</span>
        </div>
      </div>
    );
  }

  if ((variant === 'skyscraper-left' || variant === 'skyscraper-right') && hasClientId && !isDev) {
    return (
      <div
        ref={containerRef}
        className={`w-full h-full flex flex-col items-center gap-2.5 ${className}`}
      >
        <div className="w-full flex items-center justify-center px-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
          Publicidad
        </div>
        {shouldRenderAd && <ins className="adsbygoogle"
             ref={adElementRef}
             style={{ display: 'inline-block', width: '160px', height: '600px' }}
             data-ad-client={adsenseClientId}
             data-ad-slot={adSlot}
             data-ad-placement={variant}
             data-ad-format="vertical"
             data-full-width-responsive="false" />}
      </div>
    );
  }

  if (hasClientId && !isDev) {
    const format = variant === 'mobile-infeed' ? 'fluid' : variant.includes('skyscraper') ? 'vertical' : 'auto';
    const minHeightStyle = variant.includes('skyscraper') ? '600px' : variant === 'mobile-infeed' ? '120px' : '90px';
    return (
      <div 
        ref={containerRef}
        className={`w-full max-w-full overflow-hidden text-center my-4 relative rounded-xl border border-dashed border-gray-300 bg-gray-50/20 p-2 flex flex-col justify-center items-center ${className}`} 
        style={{ minHeight: minHeightStyle }}
      >
        <div className="absolute top-1 left-2 text-[8px] font-bold text-gray-400 select-none uppercase tracking-wider z-0">
          Anuncio (AdSense)
        </div>
        <div className="w-full z-10">
          {shouldRenderAd && <ins className="adsbygoogle"
               ref={adElementRef}
               style={{ display: 'block', margin: '0 auto' }}
               data-ad-client={adsenseClientId}
               data-ad-slot={adSlot}
               data-ad-placement={variant}
               data-ad-format={format}
              data-full-width-responsive="false" />}
        </div>
      </div>
    );
  }

  const getAdSenseCode = () => {
    const format = variant === 'mobile-infeed' ? 'fluid' : variant.includes('skyscraper') ? 'vertical' : 'auto';
    const client = adsenseClientId || 'ca-pub-XXXXXXXXXXXXXXXX';
    return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${client}"
     data-ad-slot="${adSlot}"
     data-ad-format="${format}"
     data-full-width-responsive="false"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
  };

  const finalShowCode = isDev && showCode;

  const DevToggle = ({ label = 'Ver codigo' }: { label?: string }) => (
    isDev ? (
      <button
        type="button"
        onClick={() => setShowCode(!showCode)}
        className="text-xs text-gray-400 hover:text-[#0F766E] font-medium inline-flex items-center gap-1 cursor-pointer"
        aria-label={label}
      >
        {finalShowCode ? <Eye size={12} /> : <Code size={12} />}
      </button>
    ) : null
  );

  const CodePreview = () => (
    <pre className="p-3 bg-gray-900 rounded-xl text-[9px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-gray-800">
      {getAdSenseCode()}
    </pre>
  );

  if (variant === 'skyscraper-left' || variant === 'skyscraper-right') {
    return (
      <div className={`w-full flex flex-col gap-2.5 h-full ${className}`}>
        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
          <span className="flex items-center gap-1">
            <Monitor size={10} className="text-teal-600" />
            Publicidad
          </span>
          <DevToggle />
        </div>

        {finalShowCode ? (
          <CodePreview />
        ) : (
          <div className="flex-grow bg-gradient-to-b from-[#FAFAFA] to-gray-50/50 border border-dashed border-gray-250 rounded-xl flex flex-col items-center justify-between p-4 text-center min-h-[520px] transition-all hover:border-[#0F766E]/30 group shadow-xs">
            <span className="text-[9px] font-semibold text-gray-400 bg-white border border-gray-150 px-2 py-0.5 rounded shadow-2xs">Espacio patrocinado</span>
            <div className="my-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-teal-600 group-hover:scale-105 transition-transform">
                <BriefcaseBusiness size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700 block tracking-tight">Contenido patrocinado</span>
                <span className="text-[10px] text-gray-400 block mt-1">Oferta relevante para negocios de RD</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed max-w-[130px] mx-auto">
                Ubicacion reservada para publicidad discreta en pantallas amplias.
              </p>
            </div>
            <div className="w-full bg-white border border-gray-150 rounded-lg p-2 text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <Settings size={10} className="text-teal-600" />
              <span>Publicidad discreta</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'mobile-infeed') {
    return (
      <div className={`w-full max-w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs relative overflow-hidden ${className}`}>
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none min-w-0">
            <Smartphone size={10} className="text-[#0F766E] shrink-0" />
            <span className="truncate">Publicidad</span>
          </div>
          <DevToggle />
        </div>

        {finalShowCode ? (
          <CodePreview />
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 py-2 min-w-0">
            <div className="w-full sm:w-28 h-16 bg-gray-50 border border-dashed border-gray-250 rounded-lg flex flex-col justify-center items-center text-center px-2 select-none shrink-0">
              <BriefcaseBusiness size={18} className="text-[#0F766E]" />
              <span className="text-[8px] text-gray-400 mt-1">Patrocinado</span>
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
              <span className="bg-amber-50 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase inline-block">Publicidad</span>
              <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight break-words">Soluciones para contabilidad y cumplimiento en RD</h4>
              <p className="text-[11px] text-gray-500 leading-normal">Espacio reservado para una oferta relacionada con finanzas, impuestos o pymes.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'horizontal-bottom') {
    return (
      <div className={`w-full max-w-full flex flex-col gap-2 ${className}`}>
        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
          <span className="flex items-center gap-1">
            <Tablet size={10} className="text-teal-600" />
            Publicidad
          </span>
          <DevToggle />
        </div>
        {finalShowCode ? (
          <CodePreview />
        ) : (
          <div className="p-4 bg-[#FAFAFA] border border-dashed border-gray-250 rounded-xl text-center group transition-all hover:border-[#0F766E]/30 shadow-xs overflow-hidden">
            <div className="h-16 bg-white border border-gray-100 flex flex-col justify-center items-center rounded-lg max-w-4xl mx-auto gap-0.5 px-3">
              <span className="text-xs font-bold text-gray-600">Contenido patrocinado</span>
              <span className="text-[10px] text-gray-400">Publicidad adaptable para negocios dominicanos</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between px-1 text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider select-none">
        <span>Publicidad</span>
        <DevToggle />
      </div>
      {finalShowCode ? (
        <CodePreview />
      ) : (
        <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center relative overflow-hidden group transition-all hover:border-[#0F766E]/30">
          <div className="h-14 bg-white border border-gray-100 flex flex-col justify-center items-center rounded-lg text-xs font-medium text-gray-500 gap-0.5 px-3">
            <span className="font-bold text-gray-600">Contenido patrocinado</span>
            <span className="text-[10px] text-gray-400">Oferta relacionada con finanzas, impuestos o pymes</span>
          </div>
        </div>
      )}
    </div>
  );
}
