import React, { useState, useMemo, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { CALCULATORS, CATEGORIES, HOME_FAQS, PROGRAMMATIC_GUIDES } from './data';
import { CalculatorInfo } from './types';
import CalculatorsList from './components/CalculatorsList';
import CalculatorForm from './components/CalculatorForm';
import GuidesView from './components/GuidesView';
import NewsSection from './components/NewsSection';
import AdSenseBlock from './components/AdSenseBlock';
import ProfessionalPortal from './components/ProfessionalPortal';
import UserAccountModal from './components/UserAccountModal';
import CentroLaboral from './components/CentroLaboral';
import CentroFinanciero from './components/CentroFinanciero';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  HelpCircle, 
  Layers, 
  Compass, 
  BookOpen, 
  FileText, 
  Info,
  DollarSign,
  TrendingUp,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react';

interface FaqSchemaItem {
  question: string;
  answer: string;
}

const injectSchema = (schemaObj: any) => {
  if (typeof document === "undefined") return;
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.classList.add('dynamic-schema');
  script.textContent = JSON.stringify(schemaObj);
  document.head.appendChild(script);
};

export const PUBLIC_SITE_URL = "https://negociord.com";

const updateMetaTags = (title: string, description: string, path: string, type: 'article' | 'website' = 'website', faqItems?: FaqSchemaItem[]) => {
  if (typeof document === "undefined") return;
  
  // 1. Update Title
  document.title = title;

  // 2. Update Meta Description
  const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
  metaDesc.setAttribute('name', 'description');
  metaDesc.setAttribute('content', description);
  if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

  // 3. Update Canonical
  const canonicalUrl = `${PUBLIC_SITE_URL}${path}`;
  const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  canonical.setAttribute('href', canonicalUrl);
  if (!canonical.parentNode) document.head.appendChild(canonical);

  // 4. Update Open Graph Meta
  const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
  ogTitle.setAttribute('property', 'og:title');
  ogTitle.setAttribute('content', title);
  if (!ogTitle.parentNode) document.head.appendChild(ogTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
  ogDesc.setAttribute('property', 'og:description');
  ogDesc.setAttribute('content', description);
  if (!ogDesc.parentNode) document.head.appendChild(ogDesc);

  const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
  ogUrl.setAttribute('property', 'og:url');
  ogUrl.setAttribute('content', canonicalUrl);
  if (!ogUrl.parentNode) document.head.appendChild(ogUrl);

  const ogType = document.querySelector('meta[property="og:type"]') || document.createElement('meta');
  ogType.setAttribute('property', 'og:type');
  ogType.setAttribute('content', type);
  if (!ogType.parentNode) document.head.appendChild(ogType);

  // 5. Update Twitter Card Meta
  const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta');
  twitterCard.setAttribute('name', 'twitter:card');
  twitterCard.setAttribute('content', 'summary_large_image');
  if (!twitterCard.parentNode) document.head.appendChild(twitterCard);

  const twitterTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta');
  twitterTitle.setAttribute('name', 'twitter:title');
  twitterTitle.setAttribute('content', title);
  if (!twitterTitle.parentNode) document.head.appendChild(twitterTitle);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta');
  twitterDesc.setAttribute('name', 'twitter:description');
  twitterDesc.setAttribute('content', description);
  if (!twitterDesc.parentNode) document.head.appendChild(twitterDesc);

  // 6. Schemas Integration
  // Remove existing dynamic schemas
  document.querySelectorAll('script[type="application/ld+json"].dynamic-schema').forEach(el => el.remove());

  // A. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": origin
      },
      ...(path !== '/' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": type === 'article' ? "Guías" : "Herramientas",
        "item": `${origin}${path.split('/').slice(0, -1).join('/')}`
      }, {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": canonicalUrl
      }] : [])
    ]
  };

  injectSchema(breadcrumbSchema);

  // B. Specific Schemas based on Page Type
  if (path.startsWith('/herramientas/')) {
    // SoftwareApplication
    const appSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": title,
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "DOP"
      }
    };
    injectSchema(appSchema);
  }

  // C. FAQPage Schema if FAQs are provided
  if (faqItems && faqItems.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
    injectSchema(faqSchema);
  }
};

// --- MULTI-TIER PRO vs FREE PAYWALL OVERLAY COMPONENT ---
interface PaywallProps {
  title: string;
  description: string;
  benefits: string[];
  onUpgrade: () => void;
}

function PremiumFeaturePaywall({ title, description, benefits, onUpgrade }: PaywallProps) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xs my-4 animate-in fade-in duration-200" id="premium-paywall">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 border border-amber-200">
        <span className="text-3xl text-amber-500">🔒</span>
      </div>
      
      <span className="px-3.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider inline-block mb-4">
        Función Exclusiva PRO
      </span>
      
      <h3 className="text-2xl font-extrabold text-[#111827] mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg mx-auto">{description}</p>
      
      <div className="bg-gray-50 rounded-xl p-5 mb-8 max-w-md mx-auto text-left border border-gray-150">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">¿Qué incluye la Licencia PRO?</span>
        <ul className="space-y-2.5">
          {benefits.map((b, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700">
              <span className="text-emerald-600 shrink-0">✔</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button 
          onClick={onUpgrade}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
        >
          <span>💎 Activar Prueba Gratis PRO en 1-Clic</span>
        </button>
      </div>
      
      <p className="text-[10px] text-gray-400 mt-4 leading-normal">
        Navegación libre de publicidad. Los datos introducidos se sincronizan automáticamente en tu navegador usando almacenamiento local encriptado.
      </p>
    </div>
  );
}

// --- GLOBAL PRO UPGRADE DIALOG MODAL ---
interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureName?: string;
}

function ProUpgradeModal({ isOpen, onClose, onUpgrade, featureName }: ProUpgradeModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-150 max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5 border border-amber-200 text-2xl">
            👑
          </div>

          <span className="px-3 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded-full uppercase tracking-wider inline-block mb-3">
            NegocioRD Licencias Premium
          </span>

          <h3 className="text-2xl font-extrabold text-[#111827] mb-2">
            {featureName ? `Desbloquear ${featureName}` : 'Acceso Ilimitado Profesional (PRO)'}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto mb-6">
            Adquiere acceso completo a todas las plataformas contables avanzadas, automatización de nóminas y plantillas de contratos para fiscales y pymes en la República Dominicana.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-150">
            <div className="flex items-start gap-2 text-xs font-semibold text-gray-700">
              <span className="text-emerald-600 font-extrabold">✓</span>
              <span>Lote Multi-facturas ITBIS con NCF</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-gray-700">
              <span className="text-emerald-600 font-extrabold">✓</span>
              <span>Centro de Nómina & Asistencias (RH)</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-gray-700">
              <span className="text-emerald-600 font-extrabold">✓</span>
              <span>Centro de Deudas & Repagos Franceses</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-gray-700">
              <span className="text-emerald-600 font-extrabold">✓</span>
              <span>Logo y Membrete en Reportes</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-gray-700">
              <span className="text-emerald-600 font-extrabold">✓</span>
              <span>Sin publicidad de Google AdSense</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-gray-700">
              <span className="text-emerald-600 font-extrabold">✓</span>
              <span>Soporte prioritario DGII & TSS</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onUpgrade}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              🚀 Activar Cuenta Demo PRO Gratis (1-Clic)
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold text-xs rounded-lg transition-all cursor-pointer"
            >
              Seguir explorando la versión limitada
            </button>
          </div>

          <p className="text-[10px] text-gray-400 mt-4">
            * Almacenamiento local privado garantizado bajo encriptado SSL del navegador.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'calculator' | 'blog' | 'nosotros' | 'news' | 'centro-laboral' | 'centro-financiero' | 'precios'>('home');
  const [activeCalculator, setActiveCalculator] = useState<CalculatorInfo | null>(null);
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subscription tier state
  const [userTier, setUserTier] = useState<'FREE' | 'PRO'>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem('negociord_user_tier') as 'FREE' | 'PRO') || 'FREE';
    }
    return 'FREE';
  });

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setFirebaseUser(current);
      if (current) {
        // Sync user role with Firestore
        try {
          const userDocRef = doc(db, 'users', current.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.role) {
              setUserTier(data.role as 'FREE' | 'PRO');
              localStorage.setItem('negociord_user_tier', data.role);
            }
          }
        } catch (err) {
          console.error("Error reading synced tier from Firestore:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetedProFeature, setTargetedProFeature] = useState<string>('');

  const activateProDemo = () => {
    setUserTier('PRO');
    localStorage.setItem('negociord_user_tier', 'PRO');
    setShowUpgradeModal(false);
  };

  const deactivateProDemo = () => {
    setUserTier('FREE');
    localStorage.setItem('negociord_user_tier', 'FREE');
  };

  const handleProRequired = (featureName: string) => {
    setTargetedProFeature(featureName);
    setShowUpgradeModal(true);
  };

  // Search state
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Home FAQ open state indices
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]); // first one open by default

  // Simple dialog for "Portal" or "Login"
  const [showPortalModal, setShowPortalModal] = useState(false);

  // --- CTA Interactive State (Contabilidad Gratis) ---
  const [ctaVentasMes, setCtaVentasMes] = useState<number>(75000);
  const [ctaGastosMes, setCtaGastosMes] = useState<number>(30000);
  const [ctaItbisCalculado, setCtaItbisCalculado] = useState<number>(8100);

  // Handle setting parameters for the interactive widget
  const handleCtaCalcular = (e: React.FormEvent) => {
    e.preventDefault();
    const itbisCalculado = Number(((ctaVentasMes - ctaGastosMes) * 0.18).toFixed(2));
    setCtaItbisCalculado(Math.max(0, itbisCalculado));
  };

  // --- 1. Reactive History API url parsing & navigation block ---
  const parseUrlToState = () => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (path.startsWith('/herramientas/')) {
      const slug = path.replace('/herramientas/', '');
      const calc = CALCULATORS.find(c => c.urlSlug === slug || c.id === slug);
      if (calc) {
        setCurrentView('calculator');
        setActiveCalculator(calc);
        return;
      } else {
        setCurrentView('404');
        setActiveCalculator(null);
        setSelectedGuideSlug(null);
        return;
      }
    } else if (path.startsWith('/guia/')) {
      const slug = path.replace('/guia/', '');
      const guide = PROGRAMMATIC_GUIDES.find(g => g.slug === slug);
      if (guide) {
        setCurrentView('blog');
        setSelectedGuideSlug(slug);
        return;
      } else {
        setCurrentView('404');
        setActiveCalculator(null);
        setSelectedGuideSlug(null);
        return;
      }
    } else if (path === '/nosotros') {
      setCurrentView('nosotros');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/noticias') {
      setCurrentView('news');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/centro-laboral') {
      setCurrentView('centro-laboral');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/centro-financiero') {
      setCurrentView('centro-financiero');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/precios') {
      setCurrentView('precios');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/') {
      setCurrentView('home');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    }
    
    // Default fallback to 404 for any other path (avoid soft 404)
    setCurrentView('404');
    setActiveCalculator(null);
    setSelectedGuideSlug(null);
  };

  // Safe navigation abstraction updating url bar
  const navigateTo = (path: string) => {
    if (typeof window === "undefined") return;
    window.history.pushState(null, '', path);
    parseUrlToState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Mounting popstate hook
  React.useEffect(() => {
    parseUrlToState();
    const handlePopState = () => parseUrlToState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Client-side SEO metadata update effect
  React.useEffect(() => {
    if (currentView === 'calculator' && activeCalculator) {
      const desc = activeCalculator.seoMetaDescription;
      const faqsList = [
        { question: `¿Cómo funciona la ${activeCalculator.name}?`, answer: activeCalculator.description },
        { question: `¿Qué tasas oficiales toma de referencia la ${activeCalculator.name}?`, answer: "Usa de referencia las tasas de ley más recientes del Ministerio de Trabajo, DGII dominicana para ITBIS e ISR, y topes de aportación a la TSS actualizados al año 2026." }
      ];
      updateMetaTags(activeCalculator.seoTitle, desc, `/herramientas/${activeCalculator.urlSlug}`, 'website', faqsList);
    } else if (currentView === 'blog' && selectedGuideSlug) {
      const guide = PROGRAMMATIC_GUIDES.find(g => g.slug === selectedGuideSlug);
      if (guide) {
        updateMetaTags(guide.seoTitle, guide.seoMetaDescription, `/guia/${selectedGuideSlug}`, 'article');
      }
    } else if (currentView === 'nosotros') {
      updateMetaTags("Sobre Nosotros | NegocioRD", "Conoce al equipo de NegocioRD y nuestro compromiso con proveer herramientas de cálculo y consultoría fiscal confiables en República Dominicana.", "/nosotros", "website");
    } else if (currentView === 'news') {
      updateMetaTags("Últimas Noticias Financieras y Fiscales de R.D. | NegocioRD", "Mantente al día con investigaciones exclusivas sobre reformas laborales, cambios de ley impositiva de la DGII y reglamentos de la TSS dominicana.", "/noticias", "website");
    } else if (currentView === 'centro-laboral') {
      updateMetaTags("Centro Laboral RD - Asistencia & Prestaciones | NegocioRD", "Herramientas de cálculo especializadas y guías de asistencia laboral de conformidad con el Código de Trabajo dominicano.", "/centro-laboral", "website");
    } else if (currentView === 'centro-financiero') {
      updateMetaTags("Centro Financiero RD - Amortizaciones & Tasas | NegocioRD", "Simuladores profesionales de créditos, amortizaciones francesas y divisores legales dominicanos.", "/centro-financiero", "website");
    } else if (currentView === 'precios') {
      updateMetaTags("Planes y Precios PRO | NegocioRD", "Membresía simple de NegocioRD: Navegación libre de publicidad, historial ampliado, exportación ilimitada y recursos exclusivos para contadores de RD.", "/precios", "website");
    } else {
      updateMetaTags("NegocioRD - Calculadoras Fiscales, Laborales y Financieras de R.D.", "La plataforma de herramientas fiscales, laborales y contables de referencia para la República Dominicana. Calcule prestaciones laborales, TSS, retenciones de ISR y recargos de la DGII.", "/", "website");
    }
  }, [currentView, activeCalculator, selectedGuideSlug]);

  // Switch to a calculator view
  const handleSelectCalculator = (calc: CalculatorInfo) => {
    try {
      const saved = localStorage.getItem('recent_calculators_ids');
      const recentIds: string[] = saved ? JSON.parse(saved) : [];
      const updated = [calc.id, ...recentIds.filter(id => id !== calc.id)].slice(0, 4);
      localStorage.setItem('recent_calculators_ids', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    navigateTo('/herramientas/' + calc.urlSlug);
  };

  // Navigating by slug string
  const handleNavigateToCalcBySlug = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace('calculadora-', '').replace('-dgii', '');
    const calc = CALCULATORS.find(c => {
      const cId = c.id.toLowerCase().replace('calculadora-', '').replace('-dgii', '');
      const cSlug = c.urlSlug.toLowerCase().replace('calculadora-', '').replace('-dgii', '');
      return cId === cleanSlug || cSlug === cleanSlug || c.urlSlug === slug || c.id === slug;
    });
    if (calc) {
      try {
        const saved = localStorage.getItem('recent_calculators_ids');
        const recentIds: string[] = saved ? JSON.parse(saved) : [];
        const updated = [calc.id, ...recentIds.filter(id => id !== calc.id)].slice(0, 4);
        localStorage.setItem('recent_calculators_ids', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      navigateTo('/herramientas/' + calc.urlSlug);
    }
  };

  // Switch to a guide view
  const handleSelectGuide = (slug: string) => {
    navigateTo('/guia/' + slug);
  };

  const toggleFaq = (idx: number) => {
    if (openFaqIndices.includes(idx)) {
      setOpenFaqIndices(openFaqIndices.filter(i => i !== idx));
    } else {
      setOpenFaqIndices([...openFaqIndices, idx]);
    }
  };

  // Highlight Featured Tools
  const featuredTools = useMemo(() => {
    return CALCULATORS.filter(c => 
      c.id === 'itbis-calc' || 
      c.id === 'prestaciones-laborales' || 
      c.id === 'salario-neto' || 
      c.id === 'prestamo-hipotecario'
    );
  }, []);

  // Global Header search input updates searchFilter & returns to Home view to list matching calculators
  const handleGlobalSearchChange = (val: string) => {
    setSearchFilter(val);
    if (currentView !== 'home') {
      setCurrentView('home');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#111827] font-sans antialiased flex flex-col justify-between selection:bg-teal-50 selection:text-[#0F766E]">
      
      {/* 1. Header component styled under Geometric Balance (exact match) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex justify-between items-center h-16">
          
          {/* Logo brand */}
          <div 
            onClick={() => { navigateTo('/'); setSearchFilter(''); }} 
            className="flex items-center gap-3 cursor-pointer group select-none hover:opacity-90 transition-opacity"
            id="header-logo-brand"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center font-bold text-white text-base">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] group-hover:text-[#0F766E] transition-colors">
              NegocioRD
            </span>
          </div>

          {/* Integrated Dynamic Search Bar inside Header */}
          <div className="relative flex-1 max-w-md mx-6 md:mx-10 hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <label htmlFor="global-header-search" className="sr-only">Buscar calculadora o guía</label>
            <input 
              id="global-header-search"
              type="text" 
              value={searchFilter}
              onChange={(e) => handleGlobalSearchChange(e.target.value)}
              className="block w-full pl-9 pr-12 py-1.5 border border-gray-200 rounded-md bg-[#F3F4F6] text-sm text-[#111827] placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
              placeholder="Buscar calculadora o guía..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <kbd className="hidden md:inline-block px-1.5 py-0.5 border border-gray-250 rounded text-gray-400 text-[10px] font-mono select-none">⌘K</kbd>
            </div>
          </div>

          {/* Nav links - hidden on mobile/tablet screens (< lg) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#6B7280]">
            <button 
              onClick={() => { navigateTo('/'); setSearchFilter(''); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'home' || currentView === 'calculator' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Herramientas
            </button>
            <button 
              onClick={() => { navigateTo('/centro-laboral'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'centro-laboral' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Centro Laboral RD
            </button>
            <button 
              onClick={() => { navigateTo('/centro-financiero'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'centro-financiero' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Centro Financiero RD
            </button>
            <button 
              onClick={() => { navigateTo('/guia/como-calcular-itbis'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'blog' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Guías y Blog
            </button>
            <button 
              onClick={() => { navigateTo('/noticias'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'news' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Noticias
            </button>
            <button 
              onClick={() => navigateTo('/nosotros')}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'nosotros' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Nosotros
            </button>
            <button 
              onClick={() => navigateTo('/precios')}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'precios' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Precios
            </button>
            <button 
              onClick={() => setShowPortalModal(true)}
              className="px-4 py-1.5 bg-[#0F766E] text-white rounded-md text-xs font-semibold hover:opacity-95 transition-opacity hidden md:inline-block cursor-pointer active:scale-95"
            >
              Acceso Profesional
            </button>

            {/* Google Account Profile / Login Button */}
            <div className="hidden md:flex items-center gap-2">
              {firebaseUser ? (
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="flex items-center gap-1.5 focus:outline-none cursor-pointer group active:scale-95 transition-all text-left bg-teal-50/40 p-1.5 rounded-lg border border-teal-100"
                  title="Gestionar mi cuenta y tarjetas"
                >
                  {firebaseUser.photoURL ? (
                    <img 
                      src={firebaseUser.photoURL} 
                      alt="Avatar" 
                      className="w-5.5 h-5.5 rounded-full border border-teal-600"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5.5 h-5.5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {firebaseUser.displayName ? firebaseUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-gray-750 max-w-[80px] truncate">
                    {firebaseUser.displayName?.split(' ')[0]}
                  </span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowAccountModal(true)}
                  className="px-3 py-1.5 border border-[#0F766E]/40 text-[#0F766E] hover:bg-teal-50/40 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>👤 Mi Cuenta</span>
                </button>
              )}
            </div>

            {/* Live Interactive Tier Selector */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 h-6 hidden sm:flex">
              {userTier === 'FREE' ? (
                <button
                  onClick={activateProDemo}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-650 text-white rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer animate-pulse"
                  title="Cambia a perfil PRO para probar libre de anuncios y con recursos Premium"
                >
                  <span>Plan: Gratis ✦</span>
                  <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">Demo PRO</span>
                </button>
              ) : (
                <button
                  onClick={deactivateProDemo}
                  className="px-3 py-1 bg-[#111827] text-white rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer border border-[#0F766E]/40"
                  title="Volver a plan Gratuito con anuncios para ver limitaciones"
                >
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-amber-400 font-extrabold">Plan: PRO 💎</span>
                  <span className="text-[10px] text-gray-400 hover:text-white underline">Free</span>
                </button>
              )}
            </div>
          </nav>

          {/* Hamburger Menu Toggle Button for Tablet/Mobile - visible on (< lg) screens */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-12 h-12 flex items-center justify-center rounded-md text-gray-500 hover:text-[#0F766E] hover:bg-gray-100/50 transition-colors focus:outline-none cursor-pointer"
              aria-label="Abrir menú"
              id="mobile-menu-toggle-btn"
            >
              <span className={`inline-flex items-center justify-center transition-transform duration-350 ease-in-out ${mobileMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Dropdown Navigation Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-white border-b border-gray-200 z-40 lg:hidden shadow-lg animate-in slide-in-from-top-4 duration-250">
          <div className="px-5 py-6 space-y-5">
            {/* Native Inline Search field on phones */}
            <div className="relative block sm:hidden">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <label htmlFor="mobile-search-nav" className="sr-only">Buscar calculadora o guía en menú móvil</label>
              <input 
                id="mobile-search-nav"
                type="text" 
                value={searchFilter}
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-[#F3F4F6] text-sm text-[#111827] placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                placeholder="Buscar calculadora o guía..."
              />
            </div>

            <div className="flex flex-col gap-1 font-medium text-gray-600">
              <button 
                onClick={() => { navigateTo('/'); setSearchFilter(''); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'home' || currentView === 'calculator' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-home"
              >
                Herramientas de Cálculos
              </button>
              <button 
                onClick={() => { navigateTo('/centro-laboral'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'centro-laboral' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-laboral"
              >
                Centro Laboral RD (RH)
              </button>
              <button 
                onClick={() => { navigateTo('/centro-financiero'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'centro-financiero' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-financiero"
              >
                Centro Financiero RD (Deudas)
              </button>
              <button 
                onClick={() => { navigateTo('/guia/como-calcular-itbis'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'blog' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-blog"
              >
                Guías y Blog Fiscal/Laboral
              </button>
              <button 
                onClick={() => { navigateTo('/noticias'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'news' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-news"
              >
                Noticias & Actualizaciones
              </button>
              <button 
                onClick={() => { navigateTo('/precios'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'precios' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-pricing"
              >
                Precios y Planes
              </button>
              <button 
                onClick={() => { navigateTo('/nosotros'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors font-semibold text-sm ${currentView === 'nosotros' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-about"
              >
                Nosotros
              </button>
            </div>

            {/* Mobile Google Account Portal Trigger */}
            <div className="pt-2">
              {firebaseUser ? (
                <button 
                  onClick={() => { setShowAccountModal(true); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 border border-teal-500/50 bg-teal-50/20 text-[#0F766E] rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  {firebaseUser.photoURL && (
                    <img src={firebaseUser.photoURL} alt="User" className="w-5 h-5 rounded-full border border-teal-600" referrerPolicy="no-referrer" />
                  )}
                  <span>Mi Perfil: {firebaseUser.displayName?.split(' ')[0]} 👤</span>
                </button>
              ) : (
                <button 
                  onClick={() => { setShowAccountModal(true); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 border border-[#0F766E]/40 text-[#0F766E] rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>👤 Iniciar Sesión con Google</span>
                </button>
              )}
            </div>

            <button 
              onClick={() => { setShowPortalModal(true); setMobileMenuOpen(false); }}
              className="w-full text-center py-2.5 bg-[#0F766E] text-white rounded-md text-sm font-semibold hover:opacity-95 transition-all cursor-pointer active:scale-95 shadow-xs"
              id="mob-nav-expertBtn"
            >
              Acceso Profesional
            </button>

            {/* Mobile plan switcher */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center mt-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Simulador de Licencias</span>
              {userTier === 'FREE' ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-500 leading-relaxed">Prueba el Centro Laboral (RH) y Financiero sin anuncios publicitarios.</p>
                  <button
                    onClick={() => { activateProDemo(); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-650 text-white rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>💎 Activar Versión PRO Demo</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-500">Licencia <strong className="text-[#0F766E] font-extrabold pb-0.5">PRO Activa</strong> libre de interrupciones.</p>
                  <button
                    onClick={() => { deactivateProDemo(); setMobileMenuOpen(false); }}
                    className="w-full py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg text-xs font-semibold transition-all active:scale-95"
                  >
                    Ver versión Gratuita (Free)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Responsive AdSense Layout Frame - flex column fallback on mobile and tablets */}
      <div className="pt-16 flex-grow w-full max-w-[1700px] mx-auto flex flex-col xl:grid xl:grid-cols-12 min-h-[calc(100vh-4rem)] bg-[#FAFAFA]" id="outer-adsense-grid-wrapper">
        
        {/* LEFT AD BANNER (Vertical Skyscraper, visible only on XL widescreen displays) */}
        <aside className="hidden xl:flex xl:col-span-2 border-r border-gray-200 bg-white p-4 sticky top-16 h-[calc(100vh-4rem)] self-start overflow-y-auto" id="left-adsense-skyscraper-column">
          <AdSenseBlock variant="skyscraper-left" />
        </aside>

        {/* CENTRAL CORE CONTENT CONTAINER (takes all 12 columns by default; reduces to 8 on XL to fit lateral ad blocks gracefully) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col lg:grid lg:grid-cols-12 border-x border-gray-150 bg-white" id="center-content-ad-hybrid">
          
          {/* SIDEBAR NAVIGATION - Exact Match */}
          <aside className="col-span-3 border-r border-gray-200 bg-white p-6 hidden lg:flex flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] self-start z-10">
          <div>
            <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-4">Herramientas Populares</h2>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => handleNavigateToCalcBySlug('calculadora-salario-neto')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left text-sm transition-all cursor-pointer ${
                    activeCalculator?.id === 'salario-neto' && currentView === 'calculator'
                      ? 'bg-teal-50 text-[#0F766E] font-bold shadow-xs'
                      : 'hover:bg-gray-50 text-[#6B7280] hover:text-[#111827] font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${activeCalculator?.id === 'salario-neto' && currentView === 'calculator' ? 'bg-[#0F766E]' : 'bg-gray-300'}`}></span>
                  Calculadora Salario Neto
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigateToCalcBySlug('calculadora-itbis')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left text-sm transition-all cursor-pointer ${
                    activeCalculator?.id === 'itbis-calc' && currentView === 'calculator'
                      ? 'bg-teal-50 text-[#0F766E] font-bold shadow-xs'
                      : 'hover:bg-gray-50 text-[#6B7280] hover:text-[#111827] font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${activeCalculator?.id === 'itbis-calc' && currentView === 'calculator' ? 'bg-[#0F766E]' : 'bg-gray-300'}`}></span>
                  Cálculo ITBIS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigateToCalcBySlug('calculadora-prestaciones-laborales')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left text-sm transition-all cursor-pointer ${
                    activeCalculator?.id === 'prestaciones-laborales' && currentView === 'calculator'
                      ? 'bg-teal-50 text-[#0F766E] font-bold shadow-xs'
                      : 'hover:bg-gray-50 text-[#6B7280] hover:text-[#111827] font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${activeCalculator?.id === 'prestaciones-laborales' && currentView === 'calculator' ? 'bg-[#0F766E]' : 'bg-gray-300'}`}></span>
                  Prestaciones Laborales
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigateToCalcBySlug('calculadora-cuota-prestamo')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left text-sm transition-all cursor-pointer ${
                    activeCalculator?.id === 'cuota-prestamo' && currentView === 'calculator'
                      ? 'bg-teal-50 text-[#0F766E] font-bold shadow-xs'
                      : 'hover:bg-gray-50 text-[#6B7280] hover:text-[#111827] font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${activeCalculator?.id === 'cuota-prestamo' && currentView === 'calculator' ? 'bg-[#0F766E]' : 'bg-gray-300'}`}></span>
                  Cuotas de Préstamo
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigateToCalcBySlug('calculadora-retenciones')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left text-sm transition-all cursor-pointer ${
                    activeCalculator?.id === 'retenciones-dgii' && currentView === 'calculator'
                      ? 'bg-teal-50 text-[#0F766E] font-bold shadow-xs'
                      : 'hover:bg-gray-50 text-[#6B7280] hover:text-[#111827] font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${activeCalculator?.id === 'retenciones-dgii' && currentView === 'calculator' ? 'bg-[#0F766E]' : 'bg-gray-300'}`}></span>
                  Retenciones ISR
                </button>
              </li>
            </ul>

            <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2.5 mt-6">Actualidad & Leyes</h2>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => { setSelectedGuideSlug(null); setCurrentView('news'); }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left text-sm transition-all cursor-pointer ${
                    currentView === 'news'
                      ? 'bg-teal-50 text-[#0F766E] font-bold shadow-xs'
                      : 'hover:bg-gray-50 text-[#6B7280] hover:text-[#111827] font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${currentView === 'news' ? 'bg-[#0F766E]' : 'bg-amber-500'}`}></span>
                  Noticias & Actualizaciones
                </button>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFA] text-center mb-4">
            <p className="text-xs text-[#6B7280] font-medium mb-2 leading-relaxed">¿Necesitas ayuda contable o timbrar facturas?</p>
            <button 
              onClick={() => setShowPortalModal(true)}
              className="text-sm font-semibold text-[#0F766E] hover:underline cursor-pointer transition-all"
            >
              Habla con un experto
            </button>
          </div>
        </aside>

        {/* WORKSPACE AREA - occupies col-span-9 on desktop, col-span-12 on smaller displays */}
        <div className="col-span-12 lg:col-span-9 p-4 md:p-8 flex flex-col bg-[#FAFAFA]" id="main-workspace-balance">
          
          {currentView === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              
              {/* PAGE TITLE & HEADER INFO */}
              <div className="flex flex-col border-b border-gray-200 pb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] mb-1.5 capitalize tracking-widest">
                  <span>República Dominicana</span>
                  <span>/</span>
                  <span className="text-[#6B7280]">Portal de Cálculos Generales</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#111827]">
                  Calculadoras Tributarias y Laborales 2026
                </h1>
                <p className="text-[#6B7280] text-sm mt-1.5 leading-relaxed max-w-4xl">
                  Simule salarios ordinarios netos, prestaciones, liquidación ministerial, amortización francesa bancaria e ITBIS, parametrizado debidamente bajo la TSS, DGII y el Código Laboral de la República Dominicana.
                </p>
              </div>

              {/* Ad Slot 1 & 2: Billboard Superior (Horizontal) - Rendered nicely after the Hero and optimized for SEO */}
              <div className="my-2 shrink-0" id="adsense-slot-1-billboard">
                <AdSenseBlock variant="results-inline" className="border border-teal-150 bg-teal-50/5 shadow-xs" />
              </div>

              <div className="xl:hidden my-2 shrink-0" id="adsense-slot-2-mobile-alternative">
                <AdSenseBlock variant="mobile-infeed" className="shadow-xs border border-gray-150" />
              </div>

              {/* SEARCH INPUT BAR inline */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                <label htmlFor="search-input-header" className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-2.5 block cursor-pointer">Buscar herramienta en tiempo real</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                  </div>
                  <input 
                    id="search-input-header"
                    type="text" 
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Escriba aquí para filtrar de inmediato... (e.g. ITBIS, Comisión, Liquidación, Préstamo)"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all text-sm outline-none text-[#111827]"
                  />
                </div>
              </div>

              {/* MAIN DYNAMIC DIRECTORY COMPONENT */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <CalculatorsList 
                  onSelectCalculator={handleSelectCalculator}
                  searchFilter={searchFilter}
                  setSearchFilter={setSearchFilter}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  userTier={userTier}
                  onProRequired={handleProRequired}
                />
              </div>

              {/* FEATURED TOOLS GRID */}
              <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0F766E] uppercase tracking-widest block mb-1">Finanzas y Normas</span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-[#111827]">Herramientas Destacadas</h2>
                    <p className="text-[#6B7280] text-xs mt-0.5">Fórmulas predilectas de contadores, empresarios y asalariados dominicanos.</p>
                  </div>
                  <button 
                    onClick={() => { setSearchFilter(''); setActiveCategory(null); }}
                    className="text-xs font-bold text-[#0F766E] hover:underline inline-flex items-center gap-1 cursor-pointer transition-all"
                  >
                    Ver todas las herramientas
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredTools.map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={() => handleSelectCalculator(tool)}
                      className="bg-[#FAFAFA] rounded-xl border border-gray-200 p-4 hover:border-[#0F766E] hover:bg-white transition-all cursor-pointer flex flex-col justify-between h-44 group"
                    >
                      <div>
                        <span className="px-2 py-0.5 bg-teal-50 text-[#0F766E] text-[9px] font-bold rounded uppercase tracking-wider block w-max mb-2">
                          {tool.category}
                        </span>
                        <h3 className="font-bold text-sm text-[#111827] mb-1 group-hover:text-[#0F766E] transition-colors">{tool.name}</h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{tool.shortDescription}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-[#0F766E] border-t border-gray-100 pt-2.5">
                        <span>Iniciar simulador</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SIMULADOR FISCAL EXPRESS (CONTABILIDAD GRATIS BLOCK) */}
              <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-[#0F766E] uppercase tracking-widest block mb-1">Estimación Rápida</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#111827] mb-3">
                      Simulador Fiscal Express (Ventas y Gastos)
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      Estime en un instante un balance aproximado de ITBIS neto a transferir a final de período ingresando sus ventas brutas mensuales desglosadas facturadas y deducciones de gastos válidos corporativos con NCF con tasas vigentes de impuestos de República Dominicana.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-650 font-medium">
                        <CheckCircle size={14} className="text-[#0F766E]" />
                        <span>Tasa legal 18%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-650 font-medium">
                        <CheckCircle size={14} className="text-[#0F766E]" />
                        <span>Deducción de Crédito</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-650 font-medium">
                        <CheckCircle size={14} className="text-[#0F766E]" />
                        <span>Fórmula de Referencia Oficial</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:max-w-sm bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                      <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={12} />
                        Simulador Express ITBIS
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono font-medium">RD$ DOP</span>
                    </div>

                    <form onSubmit={handleCtaCalcular} className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="sim-cta-ventas-mes" className="text-[10px] uppercase font-bold text-gray-500 block mb-1 cursor-pointer">Monto Ventas (RD$)</label>
                          <input 
                            id="sim-cta-ventas-mes"
                            type="number"
                            value={ctaVentasMes}
                            onChange={(e) => setCtaVentasMes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label htmlFor="sim-cta-gastos-mes" className="text-[10px] uppercase font-bold text-gray-500 block mb-1 cursor-pointer">Monto Gastos (RD$)</label>
                          <input 
                            id="sim-cta-gastos-mes"
                            type="number"
                            value={ctaGastosMes}
                            onChange={(e) => setCtaGastosMes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-1.5 bg-[#0F766E] text-white text-xs font-bold rounded cursor-pointer hover:opacity-95 shadow-xs transition-all active:scale-95"
                      >
                        Estimar Balance de Impuesto
                      </button>
                    </form>

                    <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-1.5">
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>ITBIS Ventas (18%):</span>
                        <span className="font-mono text-gray-900 font-semibold">RD$ {(ctaVentasMes * 0.18).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>ITBIS Gastos deducible:</span>
                        <span className="font-mono text-gray-900 font-semibold">RD$ {(ctaGastosMes * 0.18).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-gray-200 pt-1.5 font-bold text-xs text-[#0F766E]">
                        <span>ITBIS aproximado a Pagar:</span>
                        <span className="font-mono">RD$ {ctaItbisCalculado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CITACIONES DE INSTITUCIONES OFICIALES */}
              <section className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xs">
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-widest block mb-4">Cálculos amparados legalmente en las mejores fuentes</span>
                <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 text-xs font-bold text-gray-400">
                  <span className="hover:text-[#0F766E] transition-colors cursor-default">DGII Dominicana</span>
                  <span className="hover:text-[#0F766E] transition-colors cursor-default">Ministerio de Trabajo</span>
                  <span className="hover:text-[#0F766E] transition-colors cursor-default">TSS (Retenciones)</span>
                  <span className="hover:text-[#0F766E] transition-colors cursor-default">APAP (Financiera)</span>
                  <span className="hover:text-[#0F766E] transition-colors cursor-default">ProUsuario RD</span>
                </div>
              </section>

              {/* FAQ ACCORDION SECTION */}
              <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center justify-center gap-2">
                  <HelpCircle size={20} className="text-[#0F766E]" />
                  Preguntas Frecuentes sobre Negocios y Nómina en RD
                </h2>

                <div className="space-y-3">
                  {HOME_FAQS.map((faq, idx) => {
                    const isOpen = openFaqIndices.includes(idx);
                    return (
                      <div 
                        key={idx} 
                        className="border border-gray-200 rounded-lg overflow-hidden transition-all bg-[#FAFAFA]"
                      >
                        <button 
                          onClick={() => toggleFaq(idx)}
                          className="w-full text-left py-3 px-4 font-semibold text-[#111827] hover:text-[#0F766E] flex justify-between items-center transition-colors outline-none cursor-pointer"
                        >
                          <span className="text-sm">¿{faq.question}</span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1.5 text-xs text-[#6B7280] font-normal leading-relaxed border-t border-gray-100 bg-white">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          )}

          {/* CENTRO LABORAL (RH) */}
          {currentView === 'centro-laboral' && (
            <div className="animate-in fade-in duration-150">
              {userTier === 'PRO' ? (
                <CentroLaboral />
              ) : (
                <PremiumFeaturePaywall 
                  title="Centro Laboral de Recursos Humanos (TSS)"
                  description="Gestiona la nómina de tu personal, calcula retenciones TSS individuales en lote, monitorea horas extras trabajadas y lleva un control de asistencia fidedigno desde un panel consolidado."
                  benefits={[
                    "Cálculo automático de aportaciones SFS, AFP y Riesgos Laborales por colaborador",
                    "Registro persistente de ausencias, amonestaciones y primas salariales",
                    "Generación automatizada de reportes listos para la TSS y el SIRLA",
                    "Control local 100% privado de planillas para micro y medianas empresas"
                  ]}
                  onUpgrade={activateProDemo}
                />
              )}
            </div>
          )}

          {/* CENTRO FINANCIERO (DEUDAS/COMPARATIVAS) */}
          {currentView === 'centro-financiero' && (
            <div className="animate-in fade-in duration-150">
              {userTier === 'PRO' ? (
                <CentroFinanciero />
              ) : (
                <PremiumFeaturePaywall 
                  title="Centro de Planificación Financiera y Pasivos"
                  description="Consolida múltiples obligaciones financieras bajo tasas y metodologías de cooperativas y bancos dominicanos (APAP, Banreservas, Banco Popular). Simule pagos recurrentes para liquidar anticipadamente deudas pasivas."
                  benefits={[
                    "Gráficos interactivos de amortización y distribución de intereses",
                    "Simulador bento de deudas consolidadas con ponderación de deudas",
                    "Cálculo de ahorro proyectado por abonos extraordinarios al capital",
                    "Exportación limpia de calendarios de pago integrados"
                  ]}
                  onUpgrade={activateProDemo}
                />
              )}
            </div>
          )}

          {/* CALCULATOR VIEW */}
          {currentView === 'calculator' && activeCalculator && (
            <div className="animate-in fade-in duration-150">
              {/* Dynamic Path Breadcrumb matching design */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0F766E] mb-3 capitalize tracking-wider">
                <span>Directorio</span>
                <span>/</span>
                <span className="text-gray-400 capitalize">{activeCalculator.category}</span>
                <span>/</span>
                <span className="text-gray-400">{activeCalculator.name}</span>
              </div>
              
              {/* Ad Slots below header/breadcrumb */}
              <div className="mb-6 shrink-0" id="adsense-slot-1-billboard-calc">
                <AdSenseBlock variant="results-inline" className="border border-teal-150 bg-teal-50/5 shadow-xs" />
              </div>
              <div className="xl:hidden mb-6 shrink-0" id="adsense-slot-2-mobile-alternative-calc">
                <AdSenseBlock variant="mobile-infeed" className="shadow-xs border border-gray-150" />
              </div>
              
              <CalculatorForm 
                calc={activeCalculator} 
                onBack={() => { navigateTo('/'); }} 
                onNavigateToCalc={(slug) => handleNavigateToCalcBySlug(slug)}
              />
            </div>
          )}

          {/* CONTEXT SEO BLOG VIEWS */}
          {currentView === 'blog' && (
            <div className="animate-in fade-in duration-150">
              <GuidesView 
                onBackToHome={() => { navigateTo('/'); }} 
                onNavigateToCalcBySlug={handleNavigateToCalcBySlug}
                initialSelectedGuideSlug={selectedGuideSlug}
              />
            </div>
          )}

          {/* NEWS PORTAL VIEW */}
          {currentView === 'news' && (
            <div className="animate-in fade-in duration-150">
              <NewsSection 
                onBackToHome={() => { navigateTo('/'); }} 
                onNavigateToCalcBySlug={handleNavigateToCalcBySlug}
              />
            </div>
          )}

          {/* NOSOTROS VIEWS */}
          {currentView === 'nosotros' && (
            <div className="animate-in fade-in duration-150 py-4 max-w-4xl mx-auto w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 shadow-xs space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#111827] border-b pb-4 flex items-center gap-2">
                  <Info size={24} className="text-[#0F766E]" />
                  Acerca de NegocioRD
                </h1>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  <strong>NegocioRD</strong> se fundó con una visión tajante en el mercado dominicano: erradicar las hojas de cálculo confusas y los portales gubernamentales desactualizados, convirtiéndose en el estándar de oro de cálculo fiscal, laboral y bancario para la República Dominicana.
                </p>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  Nuestra plataforma ha sido minuciosamente programada para reflejar los marcos reales estipulados por la Dirección General de Impuestos Internos (DGII), el Ministerio de Trabajo y la Tesorería de la Seguridad Social (TSS). No toleramos aproximaciones vagas ni valores estáticos de prueba: todos los límites salariales, topes impositivos de salud y pensiones, y coeficientes divisionarios son actualizados de forma fidedigna.
                </p>
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 text-[#0F766E] space-y-2 text-xs leading-relaxed">
                  <span className="font-bold text-base block">Nuestro Compromiso</span>
                  <p className="text-gray-600">Proporcionar simulaciones de préstamo amortizado (método francés) al igual que las calculadoras que utilizan APAP y Banreservas, brindando una experiencia visual impecable que honra el diseño industrial más alto al nivel de Stripe, Linear y Vercel.</p>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <button
                    onClick={() => { navigateTo('/'); }}
                    className="px-6 py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:opacity-95 transition-all shadow-xs"
                  >
                    Regresar al portal principal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRECIOS VIEWS */}
          {currentView === 'precios' && (
            <div className="animate-in fade-in duration-150 py-4 max-w-5xl mx-auto w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 shadow-xs space-y-8">
                <div className="text-center space-y-3">
                  <span className="px-3 py-1 bg-teal-50 text-[#0F766E] text-xs font-black rounded-full uppercase tracking-wider inline-block">Membresía Simple PRO</span>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827]">Planes de Precios Flexibles</h1>
                  <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
                    Potencie su productividad contable en República Dominicana con nuestra licencia PRO simple y de valor incomparable. Sin burocracia empresarial.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  
                  {/* Plan 1: Free */}
                  <div className="border border-gray-200 rounded-2xl p-6 bg-[#FAFAFA] flex flex-col justify-between h-[450px]">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Básico Gratuito</h3>
                      <p className="text-xs text-gray-500 mt-1">Perfecto para consultas ocasionales.</p>
                      
                      <div className="my-6">
                        <span className="text-3xl font-extrabold text-gray-950">RD$ 0</span>
                        <span className="text-xs text-gray-400"> / siempre</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-gray-600">
                        <li className="flex items-center gap-1.5 font-medium">✨ Accesibilidad total a calculadoras</li>
                        <li className="flex items-center gap-1.5 font-medium">📣 Anuncios publicitarios visibles</li>
                        <li className="flex items-center gap-1.5 text-gray-400 line-through">🗄️ Historial ampliado de cálculos</li>
                        <li className="flex items-center gap-1.5 text-gray-400 line-through">📄 Exportaciones ilimitadas a PDF/CSV</li>
                        <li className="flex items-center gap-1.5 text-gray-400 line-through">⭐ Guardar cálculos favoritos</li>
                      </ul>
                    </div>

                    <button 
                      onClick={() => navigateTo('/')}
                      className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Usar Gratis Ahora
                    </button>
                  </div>

                  {/* Plan 2: Pro Mensual - DESTACADO */}
                  <div className="border-2 border-[#0F766E] rounded-2xl p-6 bg-white flex flex-col justify-between h-[450px] shadow-md relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-[#0F766E] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</div>
                    <div>
                      <h3 className="font-extrabold text-[#0F766E] text-lg">PRO Mensual</h3>
                      <p className="text-xs text-gray-500 mt-1">Para contadores independientes y pymes.</p>
                      
                      <div className="my-6">
                        <span className="text-3xl font-extrabold text-gray-950">RD$ 495</span>
                        <span className="text-xs text-gray-400"> / al mes</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-gray-800">
                        <li className="flex items-center gap-1.5 font-semibold text-[#0F766E]">✦ Totalmente libre de anuncios</li>
                        <li className="flex items-center gap-1.5 font-semibold">✦ Historial ilimitado de simulaciones</li>
                        <li className="flex items-center gap-1.5 font-semibold">✦ Exportaciones ilimitadas (PDF y CSV)</li>
                        <li className="flex items-center gap-1.5 font-semibold">✦ Guardar cálculos favoritos de nómina</li>
                        <li className="flex items-center gap-1.5 font-semibold">✦ Acceso completo Centro Laboral y Financiero</li>
                      </ul>
                    </div>

                    <button 
                      onClick={() => setShowAccountModal(true)}
                      className="w-full py-2.5 bg-[#0F766E] hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {userTier === 'PRO' ? 'Mi suscripción PRO' : 'Adquirir Licencia PRO'}
                    </button>
                  </div>

                  {/* Plan 3: Pro Anual */}
                  <div className="border border-gray-250 rounded-2xl p-6 bg-[#FAFAFA] flex flex-col justify-between h-[450px]">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">PRO Anual</h3>
                      <p className="text-xs text-gray-500 mt-1">El mejor valor para consultores fiscales de RD.</p>
                      
                      <div className="my-6">
                        <span className="text-3xl font-extrabold text-gray-950">RD$ 3,950</span>
                        <span className="text-xs text-gray-400"> / al año</span>
                        <span className="block text-[10px] text-emerald-600 font-extrabold tracking-wide mt-1">¡Ahorre un 33% sobre mensual!</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-gray-650">
                        <li className="flex items-center gap-1.5 font-medium text-[#0F766E]">✦ Todo lo incluido en mensual</li>
                        <li className="flex items-center gap-1.5 font-medium">✦ Cero publicidad garantizada</li>
                        <li className="flex items-center gap-1.5 font-medium">✦ Soporte prioritario por WhatsApp</li>
                        <li className="flex items-center gap-1.5 font-medium">✦ Factura fiscal con NCF de crédito</li>
                        <li className="flex items-center gap-1.5 font-medium text-emerald-600">✦ Regalo de plantillas avanzadas en Excel</li>
                      </ul>
                    </div>

                    <button 
                      onClick={() => setShowAccountModal(true)}
                      className="w-full py-2.5 bg-gray-900 hover:bg-stone-850 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {userTier === 'PRO' ? 'Mi membresía anual' : 'Comprar plan Anual'}
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left text-xs text-amber-900 leading-normal flex gap-2">
                  <span>💡</span>
                  <div className="space-y-1">
                    <span className="font-bold">Garantía de tranquilidad absoluta:</span>
                    <p className="text-gray-600">
                      Garantizamos de forma transparente reembolsos dentro de los primeros 14 días si no se encuentra satisfecho con las funcionalidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 404 NOT FOUND SECTION */}
          {currentView === '404' && (
            <div className="animate-in fade-in duration-150 py-10 max-w-2xl mx-auto w-full text-center px-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-[#111827]">Página No Encontrada</h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
                  La calculadora, guía o sección que busca no existe, ha sido movida o está fuera de servicio temporalmente.
                </p>
                <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                  <span className="text-xs font-bold text-gray-750 block mb-2">Herramientas populares de NegocioRD:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button onClick={() => navigateTo('/herramientas/calculadora-itbis')} className="flex items-center gap-1.5 text-[#0F766E] hover:underline font-semibold text-left cursor-pointer">
                      ✦ Calculadora de ITBIS
                    </button>
                    <button onClick={() => navigateTo('/herramientas/calculadora-salario-neto')} className="flex items-center gap-1.5 text-[#0F766E] hover:underline font-semibold text-left cursor-pointer">
                      ✦ Calculadora de Salario Neto
                    </button>
                    <button onClick={() => navigateTo('/herramientas/calculadora-prestaciones-laborales')} className="flex items-center gap-1.5 text-[#0F766E] hover:underline font-semibold text-left cursor-pointer">
                      ✦ Prestaciones Laborales
                    </button>
                    <button onClick={() => navigateTo('/herramientas/calculadora-retenciones-dgii')} className="flex items-center gap-1.5 text-[#0F766E] hover:underline font-semibold text-left cursor-pointer">
                      ✦ Retenciones de ISR/TSS
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => navigateTo('/')}
                    className="px-6 py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:opacity-95 transition-all shadow-xs inline-flex items-center gap-2"
                  >
                    Regresar al inicio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ad Slot 3 (Contraparte Móvil): Visible en móviles/tablets para completar las 4 inserciones publicitarias con alta visibilidad */}
          <div className="xl:hidden mt-6 shrink-0" id="adsense-slot-3-mobile-alternative">
            <AdSenseBlock variant="results-inline" className="shadow-xs border border-gray-150" />
          </div>

        </div>
      </div>

        {/* RIGHT AD BANNER (Vertical Skyscraper, visible only on XL widescreen displays) */}
        <aside className="hidden xl:flex xl:col-span-2 border-l border-gray-200 bg-white p-4 sticky top-16 h-[calc(100vh-4rem)] self-start overflow-y-auto" id="right-adsense-skyscraper-column">
          <AdSenseBlock variant="skyscraper-right" />
        </aside>

      </div>

      {/* 2. Publicidad Segura - Adsense horizontal placeholder */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 w-full" id="adsense-bottom-section">
        <AdSenseBlock variant="horizontal-bottom" />
      </section>

      {/* 3. Footer styled neatly matching design */}
      <footer className="w-full bg-white border-t border-gray-200 py-12 text-sm text-[#6B7280] z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-[#0F766E] flex items-center justify-center font-bold text-white text-xs">
                N
              </div>
              <span className="text-base font-bold text-[#111827]">NegocioRD</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Empoderando al ecosistema contable, empresarial y asalariado ordinario dominicano con simuladores y cálculos completamente precisos y actualizados.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3">Guías de cálculo SEO</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleSelectGuide('como-calcular-itbis')} className="hover:text-[#0F766E] transition-colors cursor-pointer text-left">
                  Como calcular el ITBIS en RD
                </button>
              </li>
              <li>
                <button onClick={() => handleSelectGuide('como-calcular-prestaciones')} className="hover:text-[#0F766E] transition-colors cursor-pointer text-left">
                  Como calcular prestaciones laborales
                </button>
              </li>
              <li>
                <button onClick={() => handleSelectGuide('como-calcular-salario-neto')} className="hover:text-[#0F766E] transition-colors cursor-pointer text-left">
                  Cómo calcular salario neto
                </button>
              </li>
              <li>
                <button onClick={() => handleSelectGuide('como-calcular-vacaciones')} className="hover:text-[#0F766E] transition-colors cursor-pointer text-left">
                  Desglose de vacaciones pagadas
                </button>
              </li>
              <li>
                <button onClick={() => handleSelectGuide('como-calcular-regalia')} className="hover:text-[#0F766E] transition-colors cursor-pointer text-left">
                  Salario de navidad / regalías
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3">Recursos Oficiales</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="https://dgii.gov.do" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F766E] transition-colors flex items-center gap-1">Página Web DGII <ExternalLink size={10} /></a></li>
              <li><a href="https://mt.gob.do" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F766E] transition-colors flex items-center gap-1">Ministerio de Trabajo <ExternalLink size={10} /></a></li>
              <li><a href="https://www.tss.gob.do" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F766E] transition-colors flex items-center gap-1">Seguridad Social TSS <ExternalLink size={10} /></a></li>
              <li><a href="https://ProUsuario.gob.do" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F766E] transition-colors flex items-center gap-1">ProUsuario SB <ExternalLink size={10} /></a></li>
            </ul>
          </div>

          <div>
            <label htmlFor="footer-email-monitoring" className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3 block cursor-pointer">Monitoreo De Cambios</label>
            <p className="text-xs text-gray-450 mb-3 leading-relaxed">Inscríbase para recibir alertas de cambios en las normativas del ISR o de retenciones de salud.</p>
            <div className="flex gap-1.5">
              <input 
                id="footer-email-monitoring"
                type="email" 
                placeholder="correo@ejemplo.com"
                className="bg-gray-50 border border-gray-300 rounded px-2 text-xs flex-grow outline-none focus:ring-1 focus:ring-[#0F766E] focus:bg-white transition-all"
              />
              <button 
                onClick={() => alert('¡Gracias por inscribirse a NegocioRD!')}
                className="bg-[#0F766E] text-white text-xs font-bold px-3 py-1.5 rounded hover:opacity-90 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                Inscribir
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-10 mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© 2026 NegocioRD. Todos los derechos reservados de conformidad con la Ley de Propiedad Intelectual de la República Dominicana.</p>
        </div>
      </footer>

      {/* Professional Portal Workspace (ITBIS NCF Desglose + Retenciones & Recargos DGII Calculators) */}
      <ProfessionalPortal 
        isOpen={showPortalModal} 
        onClose={() => setShowPortalModal(false)} 
        userTier={userTier}
        onUpgrade={activateProDemo}
      />

      {/* Trial Activation Pro Modal */}
      <ProUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        onUpgrade={activateProDemo}
        featureName={targetedProFeature}
      />

      {/* Dynamic Firebase-Backed Google Auth and Payments Portal Modal */}
      <UserAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        userTier={userTier}
        onTierChange={(newTier) => {
          setUserTier(newTier);
          localStorage.setItem('negociord_user_tier', newTier);
        }}
      />

    </div>
  );
}
