import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Code, Eye, Settings, HelpCircle, Sparkles } from 'lucide-react';

interface AdSlotProps {
  position: 'horizontal' | 'rectangle' | 'in-article' | 'sidebar' | 'mobile';
  className?: string;
  userTier?: 'FREE' | 'PRO';
}

export default function AdSlot({ position, className = '', userTier }: AdSlotProps) {
  const [showCode, setShowCode] = useState(false);
  const [activeTier, setActiveTier] = useState<'FREE' | 'PRO'>('FREE');

  useEffect(() => {
    // Sincronizar el nivel actual en base a local storage
    if (userTier) {
      setActiveTier(userTier);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('negociord_user_tier') as 'FREE' | 'PRO';
      if (stored) {
        setActiveTier(stored);
      }
    }
  }, [userTier]);

  // Si el usuario es PRO, no cargamos comerciales de AdSense de forma alguna
  if (activeTier === 'PRO') {
    return null;
  }

  // Generación del código real de integración HTML/JS asíncrono para AdSense
  const getAdSenseCodeStr = () => {
    switch (position) {
      case 'horizontal':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- AdSense Horizontal Adaptable (Header/Footer Banner) -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="horizontal"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
      case 'rectangle':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- AdSense Rectángulo Mediano para Resultados -->
<ins class="adsbygoogle"
     style="display:inline-block;width:336px;height:280px"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="0987654321"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
      case 'in-article':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- AdSense Nativo entre Contenidos o Párrafos -->
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="5678901234"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
      case 'sidebar':
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- AdSense Skyscraper Lateral Adaptable -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="4321098765"
     data-ad-format="vertical"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
      case 'mobile':
      default:
        return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<!-- AdSense Móvil Adaptable In-Feed (Celulares) -->
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-format="fluid"
     data-ad-layout-key="-gw-3+1f-3d+2z"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="3456789012"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
    }
  };

  const getSlotDetails = () => {
    switch (position) {
      case 'horizontal':
        return {
          icon: <Tablet size={12} className="text-teal-600" />,
          title: 'AdSense Banner Horizontal (728x90 / 970x90)',
          dimensions: 'Adaptable • Superior/Inferior',
          bg: 'fórmula pasiva'
        };
      case 'rectangle':
        return {
          icon: <Monitor size={12} className="text-blue-600" />,
          title: 'AdSense Rectángulo Adaptable (336x280 / 300x250)',
          dimensions: 'Para Bloques de Resultados',
          bg: 'fórmula pasiva'
        };
      case 'in-article':
        return {
          icon: <HelpCircle size={12} className="text-amber-500" />,
          title: 'AdSense Nativo en Artículo (In-Article Fluid)',
          dimensions: 'Optimizado lectura móvil',
          bg: 'infeed fluido'
        };
      case 'sidebar':
        return {
          icon: <Monitor size={12} className="text-purple-600" />,
          title: 'AdSense Columna Skyscraper (160x600 o Lateral Completo)',
          dimensions: 'Para Barra Navegación Desktop',
          bg: 'columna alta'
        };
      case 'mobile':
      default:
        return {
          icon: <Smartphone size={12} className="text-rose-500" />,
          title: 'AdSense Anuncio In-Feed Celulares (320x100 / Adaptable)',
          dimensions: 'Ancho Completo de Smartphone',
          bg: 'teléfono nativo'
        };
    }
  };

  const details = getSlotDetails();

  return (
    <div className={`w-full flex flex-col gap-2 bg-white rounded-xl p-3.5 border border-gray-150 relative overflow-hidden group shadow-2xs transition-all hover:border-[#0F766E]/30 ${className}`}>
      
      {/* Cabecera del Slot */}
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 select-none">
        <span className="flex items-center gap-1.5">
          {details.icon}
          <span>{details.title}</span>
        </span>
        <button
          type="button"
          onClick={() => setShowCode(!showCode)}
          className="text-gray-400 hover:text-[#0F766E] transition-colors inline-flex items-center gap-1 cursor-pointer outline-none"
          title="Ver código de inserción directa"
        >
          <Code size={12} />
          <span className="text-[9px] font-mono font-medium">{showCode ? 'Ocultar Código' : 'Copiar Código'}</span>
        </button>
      </div>

      {/* Cuerpo del Slot */}
      {showCode ? (
        <pre className="p-3 bg-gray-950 font-mono text-[9px] text-emerald-400 rounded-lg overflow-auto leading-normal break-all max-h-[160px] cursor-text">
          {getAdSenseCodeStr()}
        </pre>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3.5 py-1 text-center sm:text-left justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${
              position === 'horizontal' ? 'bg-teal-50' :
              position === 'rectangle' ? 'bg-blue-50' :
              position === 'in-article' ? 'bg-amber-50' :
              position === 'sidebar' ? 'bg-purple-50' : 'bg-rose-50'
            }`}>
              📊
            </div>
            <div>
              <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-block">AdSense Disponible</span>
              <h4 className="text-xs font-bold text-gray-700 block tracking-tight mt-0.5">{details.title}</h4>
              <p className="text-[10px] text-gray-400">{details.dimensions} • Asíncrono de alto rendimiento</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Settings size={12} className="animate-spin text-gray-300 duration-5000" />
            <span className="text-[9px] text-gray-400 font-mono font-bold">ca-pub-xxxx</span>
          </div>
        </div>
      )}
    </div>
  );
}
