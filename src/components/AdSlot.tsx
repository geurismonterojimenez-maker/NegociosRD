import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, Code, Eye } from 'lucide-react';

interface AdSlotProps {
  position: 'horizontal' | 'rectangle' | 'in-article' | 'sidebar' | 'mobile';
  className?: string;
  userTier?: 'FREE' | 'PRO';
}

export default function AdSlot({ position, className = '', userTier }: AdSlotProps) {
  const [showCode, setShowCode] = useState(false);
  const [activeTier, setActiveTier] = useState<'FREE' | 'PRO'>('FREE');
  const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV === true;

  useEffect(() => {
    if (userTier) {
      setActiveTier(userTier);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('negociord_user_tier') as 'FREE' | 'PRO';
      if (stored) setActiveTier(stored);
    }
  }, [userTier]);

  if (activeTier === 'PRO') return null;

  const getAdSenseCodeStr = () => {
    const format = position === 'sidebar' ? 'vertical' : position === 'in-article' || position === 'mobile' ? 'fluid' : 'auto';
    return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="${format}"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
  };

  return (
    <div className={`w-full max-w-full flex flex-col gap-2 bg-white rounded-xl p-3.5 border border-gray-150 relative overflow-hidden group shadow-2xs transition-all hover:border-[#0F766E]/30 ${className}`}>
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 select-none">
        <span className="flex items-center gap-1.5 min-w-0">
          <BriefcaseBusiness size={12} className="text-[#0F766E] shrink-0" />
          <span className="truncate">Publicidad</span>
        </span>
        {isDev && (
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="text-gray-400 hover:text-[#0F766E] transition-colors inline-flex items-center gap-1 cursor-pointer outline-none"
            title="Ver codigo de insercion directa"
          >
            {showCode ? <Eye size={12} /> : <Code size={12} />}
          </button>
        )}
      </div>

      {isDev && showCode ? (
        <pre className="p-3 bg-gray-950 font-mono text-[9px] text-emerald-400 rounded-lg overflow-auto leading-normal break-all max-h-[160px] cursor-text">
          {getAdSenseCodeStr()}
        </pre>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3.5 py-1 text-center sm:text-left justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50 text-[#0F766E] shrink-0">
              <BriefcaseBusiness size={16} />
            </div>
            <div className="min-w-0">
              <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-block">Publicidad</span>
              <h4 className="text-xs font-bold text-gray-700 block tracking-tight mt-0.5 break-words">Contenido patrocinado</h4>
              <p className="text-[10px] text-gray-400">Espacio reservado para ofertas relevantes de finanzas, impuestos o pymes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
