import React, { useState, useMemo, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { CALCULATORS, CATEGORIES, HOME_FAQS, PROGRAMMATIC_GUIDES } from './data';
import { CalculatorInfo } from './types';
import {
  BillingCycle,
  SubscriptionState,
  cancelSubscriptionState,
  createActiveSubscriptionState,
  createDefaultSubscriptionState,
  createPendingSubscriptionState,
  createTrialSubscriptionState,
  expireSubscriptionState,
  getTierFromSubscription,
  isSubscriptionActive,
  normalizeSubscriptionState,
  parseStoredSubscriptionState,
  serializeSubscriptionState,
  subscriptionNeedsRefresh,
  subscriptionStateForFirestore,
} from './config/subscription';
import AdSenseBlock from './components/AdSenseBlock';
import { isAdminEmail } from './config/admin';
import { logSubscription } from './lib/firebase';
import { TAX_RATES_REGISTRY } from './config/tax-rates';
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
  X,
  ShieldCheck,
  Lock
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

export const PUBLIC_SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || "https://tunegociord.com").replace(/\/$/, "");
const DEFAULT_SHARE_IMAGE = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop";

const TRUST_PAGES = {
  contacto: {
    title: 'Contacto | Tu Negocio RD',
    description: 'Contacta a Tu Negocio RD para soporte, alianzas y dudas sobre herramientas fiscales, laborales y financieras.',
    heading: 'Contacto y soporte',
    body: 'Para soporte de cuenta, consultas sobre calculadoras o alianzas profesionales, escribe a servicioalcliente@tunegociord.com. Respondemos solicitudes operativas y comerciales en horario laboral de Republica Dominicana.',
    bullets: ['Soporte para herramientas y cuenta', 'Correcciones de datos o fuentes oficiales', 'Alianzas con contadores, firmas y pymes'],
  },
  privacidad: {
    title: 'Politica de Privacidad | Tu Negocio RD',
    description: 'Politica de privacidad de Tu Negocio RD sobre autenticacion, datos de cuenta y uso de herramientas.',
    heading: 'Politica de privacidad',
    body: 'Tu Negocio RD recoge solo la informacion necesaria para autenticacion, administracion de cuenta, seguridad operativa y mejora de herramientas. Las tarjetas en modo local son simuladas; una pasarela real debera procesar datos sensibles fuera de nuestros servidores.',
    bullets: ['No vendemos datos personales', 'Los calculos introducidos se tratan como informacion operativa del usuario', 'La autenticacion protege el acceso de cuenta y administra preferencias'],
  },
  terminos: {
    title: 'Términos de Uso | Tu Negocio RD',
    description: 'Términos de uso de las calculadoras fiscales, laborales y financieras de Tu Negocio RD.',
    heading: 'Términos de uso',
    body: 'Las herramientas de Tu Negocio RD son de apoyo informativo y no sustituyen asesoria contable, fiscal, financiera o legal individualizada. El usuario debe validar resultados criticos contra fuentes oficiales y documentacion propia.',
    bullets: ['Uso permitido para calculos internos y educativos', 'No garantizamos decision administrativa de DGII, TSS o Ministerio de Trabajo', 'El usuario es responsable de verificar datos antes de presentar declaraciones'],
  },
  reembolsos: {
    title: 'Politica de Reembolsos | Tu Negocio RD',
    description: 'Politica comercial de cancelaciones y reembolsos para servicios digitales de Tu Negocio RD.',
    heading: 'Cancelaciones y reembolsos',
    body: 'Cuando exista pasarela real, las cancelaciones y reembolsos se revisaran segun fecha de compra, uso del servicio y reglas del proveedor de pago.',
    bullets: ['Cancelacion disponible desde el portal de cuenta', 'Modo demo no realiza cargos reales', 'Pagos reales deberan emitir referencia y recibo de compra'],
  },
} as const;

const SOURCE_SUMMARY = [
  TAX_RATES_REGISTRY.itbis.general,
  TAX_RATES_REGISTRY.topesCotizables.salarioMinimoTSS,
  TAX_RATES_REGISTRY.isrEscalasAnuales.metadata,
  TAX_RATES_REGISTRY.recargosDGII.interesIndemnizatorio,
];

const AdminConsole = React.lazy(() => import('./components/AdminConsole'));
const CalculatorsList = React.lazy(() => import('./components/CalculatorsList'));
const CalculatorForm = React.lazy(() => import('./components/CalculatorForm'));
const CentroFinanciero = React.lazy(() => import('./components/CentroFinanciero'));
const CentroLaboral = React.lazy(() => import('./components/CentroLaboral'));
const GuidesView = React.lazy(() => import('./components/GuidesView'));
const NewsSection = React.lazy(() => import('./components/NewsSection'));
const ProfessionalPortal = React.lazy(() => import('./components/ProfessionalPortal'));
const UserAccountModal = React.lazy(() => import('./components/UserAccountModal'));

function LazyFallback({ label = 'Cargando modulo...' }: { label?: string }) {
  return (
    <div className="py-10 text-center text-xs font-bold text-gray-500">
      {label}
    </div>
  );
}

const updateMetaTags = (title: string, description: string, path: string, type: 'article' | 'website' = 'website', faqItems?: FaqSchemaItem[], robots: string = 'index, follow') => {
  if (typeof document === "undefined") return;
  
  // 1. Update Title
  document.title = title;

  // 2. Update Meta Description
  const metaTitle = document.querySelector('meta[name="title"]') || document.createElement('meta');
  metaTitle.setAttribute('name', 'title');
  metaTitle.setAttribute('content', title);
  if (!metaTitle.parentNode) document.head.appendChild(metaTitle);

  const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
  metaDesc.setAttribute('name', 'description');
  metaDesc.setAttribute('content', description);
  if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

  const metaRobots = document.querySelector('meta[name="robots"]') || document.createElement('meta');
  metaRobots.setAttribute('name', 'robots');
  metaRobots.setAttribute('content', robots);
  if (!metaRobots.parentNode) document.head.appendChild(metaRobots);

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

  const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
  ogImage.setAttribute('property', 'og:image');
  ogImage.setAttribute('content', DEFAULT_SHARE_IMAGE);
  if (!ogImage.parentNode) document.head.appendChild(ogImage);

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

  const twitterImage = document.querySelector('meta[name="twitter:image"]') || document.createElement('meta');
  twitterImage.setAttribute('name', 'twitter:image');
  twitterImage.setAttribute('content', DEFAULT_SHARE_IMAGE);
  if (!twitterImage.parentNode) document.head.appendChild(twitterImage);

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
  } else if (type === 'article') {
    injectSchema({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "inLanguage": "es-DO",
      "author": {
        "@type": "Organization",
        "name": "Tu Negocio RD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Tu Negocio RD"
      },
      "mainEntityOfPage": canonicalUrl
    });
  } else if (path === '/') {
    injectSchema({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Tu Negocio RD",
      "url": PUBLIC_SITE_URL,
      "inLanguage": "es-DO",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${PUBLIC_SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });
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
    <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-white p-1.5 my-6 shadow-sm animate-in fade-in duration-300" id="premium-paywall">
      {/* Blurred Dashboard Frame Underneath */}
      <div className="absolute inset-x-2 inset-y-2 opacity-50 blur-[5px] select-none pointer-events-none grid grid-cols-12 gap-4 p-6 bg-slate-50 rounded-2xl">
        <div className="col-span-3 border border-slate-200 rounded-xl p-4 space-y-4 bg-white/40">
          <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-1/2 bg-slate-200 rounded-md"></div>
          <div className="space-y-2 pt-4">
            <div className="h-8 bg-slate-200 rounded-lg"></div>
            <div className="h-8 bg-slate-200 rounded-lg"></div>
            <div className="h-8 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
        <div className="col-span-9 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 border border-slate-200 rounded-xl bg-white/40 p-4 space-y-3">
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-6 w-2/3 bg-slate-200 rounded"></div>
            </div>
            <div className="h-24 border border-slate-200 rounded-xl bg-white/40 p-4 space-y-3">
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-6 w-2/3 bg-slate-200 rounded"></div>
            </div>
            <div className="h-24 border border-slate-200 rounded-xl bg-white/40 p-4 space-y-3">
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-6 w-2/3 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="h-64 border border-slate-200 rounded-xl bg-white/40 p-6 space-y-4">
            <div className="h-6 w-1/4 bg-slate-200 rounded-md"></div>
            <div className="space-y-2 pt-2">
              <div className="h-10 bg-slate-100 rounded-lg"></div>
              <div className="h-10 bg-slate-100 rounded-lg"></div>
              <div className="h-10 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actual High-End Paywall Overlay */}
      <div className="relative z-10 bg-white/92 backdrop-blur-md px-6 py-12 md:py-16 md:px-12 rounded-2xl flex flex-col items-center text-center">
        <div className="relative mb-6">
          {/* Glowing Ring */}
          <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl text-white shadow-lg border border-amber-300">
            👑
          </div>
        </div>

        <span className="px-3.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider inline-block mb-3 border border-amber-200">
          Función Exclusiva PRO
        </span>

        <h3 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight leading-none mb-3">
          {title}
        </h3>
        <p className="text-gray-500 text-xs md:text-sm max-w-lg leading-relaxed mb-8">
          {description}
        </p>

        {/* Exclusive Benefits Grid */}
        <div className="w-full max-w-lg bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-150 p-6 text-left mb-8 block font-semibold text-gray-800">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-4">
            ¿Qué incluye la Licencia PRO de Tu Negocio RD?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="text-emerald-500 shrink-0 font-extrabold">✔</span>
                <span className="text-gray-700 font-semibold">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Call to Action */}
        <div className="w-full max-w-md space-y-4">
          <button 
            onClick={onUpgrade}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 bg-[length:200%_auto] hover:bg-right transition-all duration-300 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <span>💎 Activar prueba PRO en 1 clic</span>
          </button>
          
          <p className="text-[10px] text-gray-400 leading-normal">
            Navegación libre de publicidad. Los datos introducidos se sincronizan automáticamente en tu navegador usando almacenamiento seguro encriptado de Firebase.
          </p>
        </div>
        <div className="w-full max-w-4xl mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
          {[
            ['1', 'Configura datos', 'Registra empleados, deudas o escenarios con campos guiados y validaciones claras.'],
            ['2', 'Genera reportes', 'Obtiene resumenes exportables para revision interna, clientes o soporte contable.'],
            ['3', 'Trabaja sin ruido', 'Interfaz privada, sin anuncios laterales y preparada para uso recurrente profesional.'],
          ].map(([step, heading, copy]) => (
            <div key={step} className="rounded-xl border border-gray-200 bg-white/80 p-4 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-[#0F766E] flex items-center justify-center text-xs font-black mb-3">
                {step}
              </div>
              <h4 className="text-sm font-extrabold text-gray-950 mb-1">{heading}</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>
      </div>
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
            Tu Negocio RD Licencias Premium
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
              🚀 Activar prueba PRO gratis
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

const PUBLIC_PRO_FEATURES_ENABLED = false;
const OFFICIAL_ADSENSE_CLIENT_ID = 'ca-pub-6144599865368963';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'calculator' | 'blog' | 'nosotros' | 'contacto' | 'privacidad' | 'terminos' | 'reembolsos' | 'news' | 'centro-laboral' | 'centro-financiero' | 'precios' | 'admin' | '404'>('home');
  const [activeCalculator, setActiveCalculator] = useState<CalculatorInfo | null>(null);
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [footerEmail, setFooterEmail] = useState('');
  const [footerEmailStatus, setFooterEmailStatus] = useState<'idle' | 'error' | 'success'>('idle');

  // Load Google AdSense library dynamically on mount if it was not already injected in index.html.
  useEffect(() => {
    const customId = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_ADSENSE_CLIENT_ID || OFFICIAL_ADSENSE_CLIENT_ID : OFFICIAL_ADSENSE_CLIENT_ID;
    const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV === true;
    
    if (customId && customId !== 'ca-pub-XXXXXXXXXXXXXXXX' && customId.startsWith('ca-pub-') && !isDev && typeof window !== 'undefined') {
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${customId}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        console.log(`[Google AdSense] Inicializado con el ID: ${customId}`);
      }
    }
  }, []);

  // High-End Premium Interactive pricing & ROI estimator states
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');
  const [roiCalculos, setRoiCalculos] = useState<number>(35);
  const [roiTarifaHora, setRoiTarifaHora] = useState<number>(800);

  // Subscription tier state
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(() => {
    if (typeof window !== "undefined") {
      return parseStoredSubscriptionState(localStorage.getItem('negociord_subscription_state'));
    }
    return createDefaultSubscriptionState();
  });
  const subscriptionTier = getTierFromSubscription(subscriptionState.status);
  const userTier: 'FREE' | 'PRO' = PUBLIC_PRO_FEATURES_ENABLED ? subscriptionTier : 'FREE';
  const featureAccessTier: 'FREE' | 'PRO' = PUBLIC_PRO_FEATURES_ENABLED ? subscriptionTier : 'PRO';

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<Exclude<BillingCycle, 'trial'>>('mensual');
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setFirebaseUser(current);
      setAuthReady(true);
      if (current) {
        // Sync user subscription state with Firestore
        try {
          const userDocRef = doc(db, 'users', current.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const normalized = normalizeSubscriptionState({
              ...data,
              role: data.role,
            });
            const refreshed = subscriptionNeedsRefresh(normalized)
              ? expireSubscriptionState(normalized)
              : normalized;
            setSubscriptionState(refreshed);
            localStorage.setItem('negociord_subscription_state', serializeSubscriptionState(refreshed));
            localStorage.setItem('negociord_user_tier', refreshed.plan);

            if (
              refreshed.status !== data.subscriptionStatus ||
              refreshed.plan !== data.role ||
              refreshed.endsAt !== data.subscriptionEndsAt ||
              refreshed.trialEndsAt !== data.subscriptionTrialEndsAt
            ) {
              await setDoc(userDocRef, subscriptionStateForFirestore(refreshed), { merge: true });
            }
          }
        } catch (err) {
          console.error("Error reading synced tier from Firestore:", err);
        }
      } else {
        const fallback = parseStoredSubscriptionState(localStorage.getItem('negociord_subscription_state'));
        setSubscriptionState(fallback);
      }
    });
    return () => unsubscribe();
  }, []);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetedProFeature, setTargetedProFeature] = useState<string>('');

  const handleFooterEmailSubmit = () => {
    const email = footerEmail.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setFooterEmailStatus('error');
      return;
    }
    setFooterEmailStatus('success');
    setFooterEmail('');
  };

  const syncSubscriptionState = async (nextState: SubscriptionState, reason: string) => {
    const safeState = normalizeSubscriptionState(nextState);
    const previousTier = getTierFromSubscription(subscriptionState.status);
    setSubscriptionBusy(true);
    try {
      setSubscriptionState(safeState);
      localStorage.setItem('negociord_subscription_state', serializeSubscriptionState(safeState));
      localStorage.setItem('negociord_user_tier', safeState.plan);

      if (firebaseUser?.uid) {
        await setDoc(doc(db, 'users', firebaseUser.uid), subscriptionStateForFirestore(safeState), { merge: true });
      }
      if (firebaseUser) {
        await logSubscription(
          previousTier,
          safeState.plan,
          reason,
          {
            previousStatus: subscriptionState.status,
            newStatus: safeState.status,
            billingCycle: safeState.billingCycle,
            startsAt: safeState.startedAt,
            endsAt: safeState.endsAt,
            trialEndsAt: safeState.trialEndsAt,
            paymentMethod: safeState.paymentMethod,
          }
        );
      }
      setShowUpgradeModal(false);
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const activateProTrial = async (reason = 'Prueba PRO solicitada desde paywall o modal de cuenta.') => {
    await syncSubscriptionState(createTrialSubscriptionState(), reason);
  };

  const activateProPaid = async (billingCycle: Exclude<BillingCycle, 'trial'> = 'mensual', reason = 'Suscripción PRO activada desde el flujo de precios o cuenta.') => {
    await syncSubscriptionState(createActiveSubscriptionState(billingCycle, billingCycle === 'anual' ? 'annual-demo-card' : 'demo-card'), reason);
  };

  const activatePendingPayment = async (billingCycle: Exclude<BillingCycle, 'trial'> = 'mensual') => {
    await syncSubscriptionState(createPendingSubscriptionState(billingCycle), 'Pago pendiente confirmado por el usuario.');
  };

  const openProCheckout = (billingCycle: Exclude<BillingCycle, 'trial'> = 'mensual') => {
    setPendingCheckoutPlan(billingCycle);
    setShowAccountModal(true);
  };

  const resetSubscriptionToFree = async () => {
    await syncSubscriptionState(createDefaultSubscriptionState(), 'Suscripción cancelada o revertida a plan FREE.');
  };

  const renewSubscription = async (billingCycle: Exclude<BillingCycle, 'trial'> = subscriptionState.billingCycle === 'anual' ? 'anual' : 'mensual') => {
    await syncSubscriptionState(createActiveSubscriptionState(billingCycle, subscriptionState.paymentMethod || 'demo-card'), 'Renovación de suscripción PRO.');
  };

  const handleProRequired = useCallback((featureName: string) => {
    setTargetedProFeature(featureName);
    setShowUpgradeModal(true);
  }, []);

  const activateProDemo = () => activateProTrial('Prueba PRO activada desde la vista interactiva.');
  const deactivateProDemo = () => resetSubscriptionToFree();

  // Search state (searchQuery is real-time for inputs; searchFilter is debounced for results list)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Debouncing effect for search filter (FASE 2)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchFilter(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Home FAQ open state indices
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]); // first one open by default

  // Simple dialog for "Portal" or "Login"
  const [showPortalModal, setShowPortalModal] = useState(false);
  const shouldShowAdRail = currentView !== 'precios' && currentView !== 'admin';
  const shouldShowGlobalBottomAds = shouldShowAdRail && currentView !== 'calculator';

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
    } else if (path === '/contacto') {
      setCurrentView('contacto');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/privacidad') {
      setCurrentView('privacidad');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/terminos') {
      setCurrentView('terminos');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/reembolsos') {
      setCurrentView('reembolsos');
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
      setCurrentView('home');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
      return;
    } else if (path === '/admin') {
      setCurrentView('admin');
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
      updateMetaTags("Sobre Nosotros | Tu Negocio RD", "Conoce al equipo de Tu Negocio RD y nuestro compromiso con proveer herramientas de cálculo y consultoría fiscal confiables en República Dominicana.", "/nosotros", "website");
    } else if (currentView in TRUST_PAGES) {
      const page = TRUST_PAGES[currentView as keyof typeof TRUST_PAGES];
      updateMetaTags(page.title, page.description, `/${currentView}`, "website");
    } else if (currentView === 'news') {
      updateMetaTags("Últimas Noticias Financieras y Fiscales de R.D. | Tu Negocio RD", "Mantente al día con investigaciones exclusivas sobre reformas laborales, cambios de ley impositiva de la DGII y reglamentos de la TSS dominicana.", "/noticias", "website");
    } else if (currentView === 'centro-laboral') {
      updateMetaTags("Centro Laboral RD - Asistencia & Prestaciones | Tu Negocio RD", "Herramientas de cálculo especializadas y guías de asistencia laboral de conformidad con el Código de Trabajo dominicano.", "/centro-laboral", "website");
    } else if (currentView === 'centro-financiero') {
      updateMetaTags("Centro Financiero RD - Amortizaciones & Tasas | Tu Negocio RD", "Simuladores profesionales de créditos, amortizaciones francesas y divisores legales dominicanos.", "/centro-financiero", "website");
    } else if (currentView === 'admin') {
      updateMetaTags("Administración Privada | Tu Negocio RD", "Consola interna privada para administración y backend de Tu Negocio RD.", "/admin", "website", undefined, "noindex, nofollow");
    } else {
      updateMetaTags("Tu Negocio RD - Calculadoras Fiscales, Laborales y Financieras de R.D.", "La plataforma de herramientas fiscales, laborales y contables de referencia para la República Dominicana. Calcule prestaciones laborales, TSS, retenciones de ISR y recargos de la DGII.", "/", "website");
    }
  }, [currentView, activeCalculator, selectedGuideSlug]);

  // Switch to a calculator view
  const handleSelectCalculator = useCallback((calc: CalculatorInfo) => {
    try {
      const saved = localStorage.getItem('recent_calculators_ids');
      const recentIds: string[] = saved ? JSON.parse(saved) : [];
      const updated = [calc.id, ...recentIds.filter(id => id !== calc.id)].slice(0, 4);
      localStorage.setItem('recent_calculators_ids', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    navigateTo('/herramientas/' + calc.urlSlug);
  }, []);

  // Navigating by slug string
  const handleNavigateToCalcBySlug = useCallback((slug: string) => {
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
  }, []);

  // Switch to a guide view
  const handleSelectGuide = useCallback((slug: string) => {
    navigateTo('/guia/' + slug);
  }, []);

  const toggleFaq = useCallback((idx: number) => {
    setOpenFaqIndices(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  }, []);

  // Highlight Featured Tools
  const featuredTools = useMemo(() => {
    return CALCULATORS.filter(c => 
      c.id === 'itbis-calc' || 
      c.id === 'prestaciones-laborales' || 
      c.id === 'salario-neto' || 
      c.id === 'prestamo-hipotecario'
    );
  }, []);

  // Global Header search input updates searchQuery & returns to Home view to list matching calculators
  const handleGlobalSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    if (currentView !== 'home') {
      setCurrentView('home');
      setActiveCalculator(null);
      setSelectedGuideSlug(null);
    }
  }, [currentView]);

  const isAdminUser = authReady && isAdminEmail(firebaseUser?.email);

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#111827] font-sans antialiased flex flex-col justify-between selection:bg-teal-50 selection:text-[#0F766E] overflow-x-hidden">
      
      {/* 1. Header component styled under Geometric Balance (exact match) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex justify-between items-center h-16">
          
          {/* Logo brand */}
          <div 
            onClick={() => { navigateTo('/'); setSearchQuery(''); setSearchFilter(''); }} 
            className="flex items-center gap-3 cursor-pointer group select-none hover:opacity-90 transition-opacity"
            id="header-logo-brand"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center font-bold text-white text-xs">
              TN
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] group-hover:text-[#0F766E] transition-colors">
              Tu Negocio RD
            </span>
          </div>

          {/* Integrated Dynamic Search Bar inside Header */}
          <div className="relative flex-1 max-w-sm mx-5 hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <label htmlFor="global-header-search" className="sr-only">Buscar calculadora o guía</label>
            <input 
              id="global-header-search"
              type="text" 
              value={searchQuery}
              onChange={(e) => handleGlobalSearchChange(e.target.value)}
              className="block w-full pl-9 pr-12 py-1.5 border border-gray-200 rounded-md bg-[#F3F4F6] text-sm text-[#111827] placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
              placeholder="Buscar calculadora o guía..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <kbd className="hidden md:inline-block px-1.5 py-0.5 border border-gray-250 rounded text-gray-400 text-[10px] font-mono select-none">⌘K</kbd>
            </div>
          </div>

          {/* Nav links - hidden on mobile/tablet screens (< lg) */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-[#6B7280]">
            <button 
              onClick={() => { navigateTo('/'); setSearchQuery(''); setSearchFilter(''); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'home' || currentView === 'calculator' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Herramientas
            </button>
            <button 
              onClick={() => { navigateTo('/centro-laboral'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'centro-laboral' || currentView === 'centro-financiero' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Centros RD
            </button>
            <button 
              onClick={() => { navigateTo('/guia/como-calcular-itbis'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'blog' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Guías
            </button>
            <button 
              onClick={() => { navigateTo('/noticias'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'news' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Noticias
            </button>

            {isAdminUser && (
              <button 
                onClick={() => navigateTo('/admin')}
                className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                  currentView === 'admin' ? 'text-[#0F766E] font-semibold' : ''
                }`}
              >
                Administración
              </button>
            )}
            <button 
              onClick={() => setShowPortalModal(true)}
              className="px-4 py-1.5 bg-[#0F766E] text-white rounded-md text-xs font-semibold hover:opacity-95 transition-opacity hidden md:inline-block cursor-pointer active:scale-95"
            >
              Documentos RD
            </button>

            <AdSenseBlock variant="nav-inline" className="shrink-0" />

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

            {/* Live Interactive Tier Selector - Hidden */}
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
                value={searchQuery}
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-[#F3F4F6] text-sm text-[#111827] placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                placeholder="Buscar calculadora o guía..."
              />
            </div>

            <div className="flex flex-col gap-1 font-medium text-gray-600">
              <button 
                onClick={() => { navigateTo('/'); setSearchQuery(''); setSearchFilter(''); setMobileMenuOpen(false); }}
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

              {isAdminUser && (
                <button 
                  onClick={() => { navigateTo('/admin'); setMobileMenuOpen(false); }}
                  className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'admin' ? 'text-[#0F766E]' : ''}`}
                  id="mob-nav-admin"
                >
                  Administración
                </button>
              )}
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
              Documentos RD
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Responsive AdSense Layout Frame - flex column fallback on mobile and tablets */}
      <div className="pt-16 flex-grow w-full max-w-[1920px] mx-auto flex flex-col xl:grid xl:grid-cols-12 min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-[#FAFAFA]" id="outer-adsense-grid-wrapper">
        
        {/* LEFT AD BANNER (Vertical Skyscraper, visible only on XL widescreen displays) */}
        {shouldShowAdRail && (
        <aside className="hidden xl:flex xl:col-span-2 border-r border-gray-200 bg-white p-3 2xl:p-4 sticky top-16 h-[calc(100vh-4rem)] self-start overflow-y-auto" id="left-adsense-skyscraper-column">
          <AdSenseBlock variant="skyscraper-left" />
        </aside>
        )}

        {/* CENTRAL CORE CONTENT CONTAINER (takes all 12 columns by default; reduces to 8 on XL to fit lateral ad blocks gracefully) */}
        <div className={`${shouldShowAdRail ? 'xl:col-span-8' : 'xl:col-span-12'} col-span-12 flex flex-col lg:grid lg:grid-cols-12 border-x border-gray-150 bg-white min-w-0 lg:h-full lg:overflow-hidden`} id="center-content-ad-hybrid">
          
          {/* SIDEBAR NAVIGATION - Exact Match */}
          <aside className="min-[1700px]:col-span-2 border-r border-gray-200 bg-white p-4 xl:p-5 hidden min-[1700px]:flex flex-col justify-between lg:h-full lg:overflow-y-auto z-10">
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

          {/* Habla con un experto card removed */}
        </aside>

        {/* WORKSPACE AREA - occupies col-span-9 on desktop, col-span-12 on smaller displays */}
        <div className="col-span-12 min-[1700px]:col-span-10 p-4 md:p-6 2xl:p-8 flex flex-col bg-[#FAFAFA] min-w-0 overflow-x-hidden lg:h-full lg:overflow-y-auto" id="main-workspace-balance">
          
          {currentView === 'home' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* COMPACT & elegant HERO WITH INTEGRATED SEARCH */}
              <div className="bg-[#115E59]/5 border border-[#115E59]/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#0F766E] uppercase tracking-wider mb-2">
                    <span>Oficial RD</span>
                    <span>•</span>
                    <span className="text-[#6B7280]">Actualizado 2026</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827] mb-2 leading-tight">
                    Calculadoras de República Dominicana
                  </h1>
                  <p className="text-gray-550 text-xs md:text-sm leading-relaxed mb-6">
                    Estime sueldos netos, deducciones TSS (AFP/SFS), prestaciones laborales, ITBIS y préstamos bancarios con tasas oficiales documentadas.
                  </p>
                </div>

                {/* INLINE CORE ACTION SEARCH BAR */}
                <div className="relative group max-w-xl w-full">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Search size={16} />
                  </div>
                  <input 
                    id="search-input-header"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar herramienta: ITBIS, liquidación, ISR..."
                    className="w-full h-11 pl-11 pr-4 bg-white border border-gray-250 rounded-xl focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none text-xs text-[#111827] shadow-xs"
                  />
                </div>
              </div>

              <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block mb-1">Fuentes y vigencia</span>
                    <h2 className="text-base font-extrabold text-[#111827]">Tasas criticas visibles antes de calcular</h2>
                  </div>
                  <button
                    onClick={() => navigateTo('/contacto')}
                    className="text-xs font-bold text-[#0F766E] hover:underline text-left"
                  >
                    Reportar una tasa desactualizada
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {SOURCE_SUMMARY.map((rate) => (
                    <a
                      key={rate.label}
                      href={rate.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-gray-200 bg-[#FAFAFA] p-4 hover:border-[#0F766E]/40 transition-colors"
                    >
                      <div className="text-[10px] uppercase tracking-wider font-black text-gray-400">{rate.sourceName}</div>
                      <div className="mt-1 text-xs font-extrabold text-gray-950 leading-snug">{rate.label}</div>
                      <div className="mt-2 text-[10px] text-gray-500">Verificado: {rate.lastChecked}</div>
                    </a>
                  ))}
                </div>
              </section>

              {/* MAIN DYNAMIC DIRECTORY COMPONENT */}
              <div className="bg-white rounded-2xl border border-gray-250/80 shadow-xs overflow-hidden">
                <React.Suspense fallback={<LazyFallback label="Cargando directorio..." />}>
                  <CalculatorsList 
                    onSelectCalculator={handleSelectCalculator}
                    searchFilter={searchFilter}
                    setSearchFilter={setSearchQuery}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    userTier={userTier}
                    onProRequired={handleProRequired}
                  />
                </React.Suspense>
              </div>

              <div className="shrink-0" id="adsense-slot-1-billboard">
                <AdSenseBlock variant="results-inline" className="border border-gray-200 bg-gray-50/20" />
              </div>

              {/* SIMULADOR FISCAL EXPRESS (COMPRESSED WIDGET DESIGN) */}
              <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7">
                    <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block mb-1">Estimador de Impuestos</span>
                    <h2 className="text-base font-extrabold text-[#111827] mb-2">
                      Simulador Fiscal Express (ITBIS del Mes)
                    </h2>
                    <p className="text-gray-500 text-xs leading-relaxed max-w-xl">
                      ¿Necesitas un estimado súper rápido? Introduzca sus ventas y gastos brutos mensuales para obtener un cálculo estimado del ITBIS (18%) a pagar a final de mes.
                    </p>
                  </div>

                  <div className="lg:col-span-5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-4">
                    <form onSubmit={handleCtaCalcular} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="sim-cta-ventas-mes" className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Ventas Brutas ($)</label>
                          <input 
                            id="sim-cta-ventas-mes"
                            type="number"
                            value={ctaVentasMes}
                            onChange={(e) => setCtaVentasMes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none focus:border-[#0F766E]"
                          />
                        </div>
                        <div>
                          <label htmlFor="sim-cta-gastos-mes" className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Gastos con NCF ($)</label>
                          <input 
                            id="sim-cta-gastos-mes"
                            type="number"
                            value={ctaGastosMes}
                            onChange={(e) => setCtaGastosMes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none focus:border-[#0F766E]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-center justify-between pt-2 border-t border-gray-200 border-dashed">
                        <div>
                          <div className="text-[10px] text-gray-400">ITBIS Mensual Aproximado</div>
                          <div className="text-sm font-bold font-mono text-[#0F766E]">RD$ {ctaItbisCalculado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-[#0F766E] text-white text-xs font-semibold rounded-lg hover:opacity-95 shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          Calcular
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </section>

              {/* CITACIONES DE INSTITUCIONES OFICIALES */}
              <div className="text-center py-2">
                <span className="text-[9px] uppercase font-semibold text-gray-450 tracking-wider">
                  Cálculos formulados de acuerdo con: DGII Dominicana • Ministerio de Trabajo • TSS (Ley de Seguridad Social)
                </span>
              </div>

              {/* COMPACT COLLAPSIBLE FAQ SECTION */}
              <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-xs">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-center gap-1.5">
                  <HelpCircle size={14} className="text-[#0F766E]" />
                  <span>Preguntas Frecuentes</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HOME_FAQS.map((faq, idx) => {
                    const isOpen = openFaqIndices.includes(idx);
                    return (
                      <div 
                        key={idx} 
                        className="border border-gray-200 rounded-xl overflow-hidden transition-all bg-[#FAFAFA]"
                      >
                        <button 
                          onClick={() => toggleFaq(idx)}
                          className="w-full text-left py-2.5 px-4 font-semibold text-[#111827] hover:text-[#0F766E] flex justify-between items-center transition-colors outline-none cursor-pointer"
                        >
                          <span className="text-xs">¿{faq.question}</span>
                          {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-3 pt-1 text-[11px] text-[#6B7280] font-normal leading-relaxed border-t border-gray-150 bg-white">
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
              {featureAccessTier === 'PRO' ? (
                <React.Suspense fallback={<LazyFallback label="Cargando Centro Laboral..." />}>
                  <CentroLaboral />
                </React.Suspense>
              ) : (
                <PremiumFeaturePaywall 
                  title="Centro Laboral de Recursos Humanos (TSS)"
                  description="Administra nómina, retenciones TSS, ausencias y reportes laborales desde un panel privado preparado para trabajo recurrente."
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
              {featureAccessTier === 'PRO' ? (
                <React.Suspense fallback={<LazyFallback label="Cargando Centro Financiero..." />}>
                  <CentroFinanciero />
                </React.Suspense>
              ) : (
                <PremiumFeaturePaywall 
                  title="Centro de Planificación Financiera y Pasivos"
                  description="Organiza deudas, pagos recurrentes y escenarios de amortización para comparar decisiones financieras con más claridad."
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

              <div className="mb-5 shrink-0" id="adsense-slot-1-top-calc">
                <AdSenseBlock variant="results-inline" className="border border-teal-150 bg-teal-50/5 shadow-xs" />
              </div>
              
              <React.Suspense fallback={<LazyFallback label="Cargando calculadora..." />}>
                <CalculatorForm 
                  calc={activeCalculator} 
                  onBack={() => { navigateTo('/'); }} 
                  onNavigateToCalc={(slug) => handleNavigateToCalcBySlug(slug)}
                  userTier={featureAccessTier}
                  onProRequired={handleProRequired}
                />
              </React.Suspense>
            </div>
          )}

          {/* CONTEXT SEO BLOG VIEWS */}
          {currentView === 'blog' && (
            <div className="animate-in fade-in duration-150">
              <React.Suspense fallback={<LazyFallback label="Cargando guia..." />}>
                <GuidesView 
                  onBackToHome={() => { navigateTo('/'); }} 
                  onNavigateToCalcBySlug={handleNavigateToCalcBySlug}
                  initialSelectedGuideSlug={selectedGuideSlug}
                />
              </React.Suspense>
            </div>
          )}

          {/* NEWS PORTAL VIEW */}
          {currentView === 'news' && (
            <div className="animate-in fade-in duration-150">
              <React.Suspense fallback={<LazyFallback label="Cargando noticias..." />}>
                <NewsSection 
                  onBackToHome={() => { navigateTo('/'); }} 
                  onNavigateToCalcBySlug={handleNavigateToCalcBySlug}
                />
              </React.Suspense>
            </div>
          )}

          {/* NOSOTROS VIEWS */}
          {currentView === 'nosotros' && (
            <div className="animate-in fade-in duration-150 py-4 max-w-4xl mx-auto w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 shadow-xs space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#111827] border-b pb-4 flex items-center gap-2">
                  <Info size={24} className="text-[#0F766E]" />
                  Acerca de Tu Negocio RD
                </h1>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  <strong>Tu Negocio RD</strong> ayuda a profesionales y negocios dominicanos a resolver cálculos fiscales, laborales y financieros sin depender de hojas sueltas o fórmulas difíciles de auditar.
                </p>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  La plataforma documenta tasas, topes y referencias de entidades como DGII, Ministerio de Trabajo y TSS para que cada resultado sea más fácil de revisar antes de tomar una decisión.
                </p>
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 text-[#0F766E] space-y-2 text-xs leading-relaxed">
                  <span className="font-bold text-base block">Nuestro Compromiso</span>
                  <p className="text-gray-600">Ofrecer herramientas claras, rápidas y verificables para cálculos frecuentes de impuestos, nómina, préstamos y gestión financiera en República Dominicana.</p>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <button
                    onClick={() => { navigateTo('/'); }}
                    className="px-6 py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:opacity-95 transition-all shadow-xs"
                  >
                    Regresar al Inicio
                  </button>
                </div>
              </div>
            </div>
          )}

          {(currentView === 'contacto' || currentView === 'privacidad' || currentView === 'terminos' || currentView === 'reembolsos') && (
            <div className="animate-in fade-in duration-150 py-4 max-w-4xl mx-auto w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 shadow-xs space-y-6">
                <div className="flex items-start gap-3 border-b border-gray-100 pb-5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-[#0F766E] flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">
                      {TRUST_PAGES[currentView as keyof typeof TRUST_PAGES].heading}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      {TRUST_PAGES[currentView as keyof typeof TRUST_PAGES].description}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {TRUST_PAGES[currentView as keyof typeof TRUST_PAGES].body}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TRUST_PAGES[currentView as keyof typeof TRUST_PAGES].bullets.map((item) => (
                    <li key={item} className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-semibold text-gray-700 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
                  Tu Negocio RD ofrece herramientas de apoyo informativo. Para decisiones fiscales, laborales o financieras definitivas, valida con la institucion oficial correspondiente o con tu asesor profesional.
                </div>
              </div>
            </div>
          )}

          {/* PRECIOS VIEWS */}
          {PUBLIC_PRO_FEATURES_ENABLED && currentView === 'precios' && (
            <div className="animate-in fade-in duration-200 py-4 max-w-5xl mx-auto w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 md:p-10 shadow-md space-y-8 md:space-y-10 relative overflow-hidden">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                  <span className="px-3.5 py-1 bg-amber-50 text-amber-700 text-xs font-black rounded-full uppercase tracking-widest inline-block border border-amber-200 animate-pulse">
                    🏆 MEMBRESÍA PROFESIONAL
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#111827] tracking-tight leading-tight md:leading-none">
                    Invierte en Precisión, <span className="text-[#0F766E]">Duplica tu Velocidad</span>
                  </h1>
                  <p className="text-gray-550 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    Sustituya hojas de cálculo rústicas y errores manuales por simuladores de alto estándar con soporte oficial de normativas DGII, TSS y Código Laboral de RD.
                  </p>

                  {/* Period Selector Toggle */}
                  <div className="inline-flex w-full max-w-xs sm:max-w-none sm:w-auto items-center gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200/50 mt-4 select-none">
                    <button
                      onClick={() => setBillingCycle('mensual')}
                      className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        billingCycle === 'mensual' 
                          ? 'bg-[#0F766E] text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Pago Mensual
                    </button>
                    <button
                      onClick={() => setBillingCycle('anual')}
                      className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        billingCycle === 'anual' 
                          ? 'bg-[#0F766E] text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <span>Pago Anual</span>
                      <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 text-[8px] font-black rounded-md block uppercase">
                        -33%
                      </span>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC PRICING CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 md:pt-4 items-stretch min-w-0">
                  
                  {/* Plan 1: Free */}
                  <div className="border border-gray-200/80 rounded-2xl p-5 sm:p-6 bg-[#FAFAFA]/75 flex flex-col justify-between hover:border-gray-300 transition-all shadow-xs min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900">Básico Gratuito</h3>
                          <p className="text-[10px] text-gray-450 mt-0.5">Para consultas esporádicas.</p>
                        </div>
                        <span className="text-xs text-gray-400 font-extrabold uppercase shrink-0">Free</span>
                      </div>
                      
                      <div className="my-6">
                        <span className="text-4xl font-black text-gray-950 tracking-tight break-words">RD$ 0</span>
                        <span className="text-xs text-gray-400 block mt-1">/ para siempre</span>
                      </div>

                      <div className="border-t border-gray-200/60 my-4" />

                      <ul className="space-y-3 text-xs text-gray-600 font-medium">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          <span>Acceso a calculadoras base</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          <span>Vistas con anuncios integrados</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-400 line-through decoration-gray-300">
                          <span>Historial de cálculos recurrentes</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-400 line-through decoration-gray-300">
                          <span>Exportaciones ilimitadas a PDF/CSV</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-400 line-through decoration-gray-300">
                          <span>Gestor multi-nómina & contratos</span>
                        </li>
                      </ul>
                    </div>

                    <button 
                      onClick={() => navigateTo('/')}
                      className="w-full mt-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Usar Plan Gratuito
                    </button>
                  </div>

                  {/* Plan 2: Pro Mensual - DESTACADO */}
                  <div className="border-2 border-[#0F766E] rounded-2xl p-5 sm:p-6 bg-white flex flex-col justify-between shadow-lg relative overflow-hidden ring-4 ring-[#0F766E]/5 hover:scale-[1.01] transition-all min-w-0">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm hidden sm:block">
                      Recomendado
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-extrabold text-[#0F766E] text-base">Plan Profesional (PRO)</h3>
                          <p className="text-[10px] text-gray-450 mt-0.5">Para contadores, pymes y consultores independientes.</p>
                        </div>
                      </div>
                      
                      <div className="my-6">
                        <span className="text-4xl font-black text-gray-950 tracking-tight break-words">
                          {billingCycle === 'mensual' ? 'RD$ 495' : 'RD$ 329'}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold"> / mes</span>
                        {billingCycle === 'anual' && (
                          <span className="block text-[10px] text-amber-600 font-extrabold mt-1">
                            Facturado anualmente (RD$ 3,950 al año)
                          </span>
                        )}
                        {billingCycle === 'mensual' && (
                          <span className="block text-[10px] text-gray-400 mt-1">
                            Cancela cuando quieras
                          </span>
                        )}
                      </div>

                      <div className="border-t border-[#0F766E]/20 my-4" />

                      <ul className="space-y-3 text-xs text-gray-800 font-bold leading-normal">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-[#0F766E] shrink-0" />
                          <span>100% Libre de Publicidad (AdSense)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-[#0F766E] shrink-0" />
                          <span>Acceso completo a Centro Laboral y Financiero</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-[#0F766E] shrink-0" />
                          <span>Amortizaciones e Impuestos Ilimitados</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-[#0F766E] shrink-0" />
                          <span>Personalización con Logo/Membrete de Oficina</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-[#0F766E] shrink-0" />
                          <span>Reportes Oficiales PDF y Matrices Excel</span>
                        </li>
                      </ul>
                    </div>

                      <button 
                        onClick={() => openProCheckout('mensual')}
                        className="w-full mt-8 py-3.5 bg-[#0F766E] hover:bg-opacity-95 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60"
                        disabled={subscriptionBusy}
                      >
                        <span>💎 {userTier === 'PRO' ? 'Plan PRO activo' : 'Activar PRO mensual'}</span>
                      </button>
                  </div>

                  {/* Plan 3: Pro Anual */}
                  <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 bg-[#FAFAFA]/75 flex flex-col justify-between hover:border-gray-300 transition-all shadow-xs min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900">PRO Licencia Corporativa</h3>
                          <p className="text-[10px] text-gray-450 mt-0.5">Soporte premium para bufetes de asesores.</p>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md font-black uppercase border border-emerald-200 shrink-0 hidden sm:inline">Ahorra más</span>
                      </div>
                      
                      <div className="my-6">
                        <span className="text-4xl font-black text-gray-950 tracking-tight break-words">RD$ 3,950</span>
                        <span className="text-xs text-gray-400"> / año</span>
                        <span className="block text-[10px] text-emerald-600 font-extrabold tracking-wide mt-1">
                          Equivale a RD$ 329 mensuales (Ahórrate RD$ 1,990 al año)
                        </span>
                      </div>

                      <div className="border-t border-gray-200/60 my-4" />

                      <ul className="space-y-3 text-xs text-gray-600 font-medium">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          <span>Todo lo incluido en la Licencia PRO</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          <span>Factura Fiscal válida para crédito (NCF de gasto)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          <span>Soporte directo prioritario VIP vía WhatsApp</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          <span>Pack especial de 25 plantillas financieras en Excel</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                          <span>Actualizaciones regulatorias inmediatas garantizadas</span>
                        </li>
                      </ul>
                    </div>

                    <button 
                      onClick={() => openProCheckout('anual')}
                      className="w-full mt-8 py-3 bg-gray-900 hover:bg-stone-850 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
                      disabled={subscriptionBusy}
                    >
                      {userTier === 'PRO' ? 'Renovar licencia anual' : 'Activar PRO anual'}
                    </button>
                  </div>
                </div>

                {/* HIGH-END INTERACTIVE VALUE CALCULATOR (ROI DEMONSTRATOR) */}
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-6 md:p-8 text-left space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 bg-[#0F766E]/10 text-[#0F766E] text-[10px] font-black rounded-md block w-fit mb-1 uppercase tracking-wider">
                        Simulador de Productividad Financiera
                      </span>
                      <h4 className="font-extrabold text-[#111827] text-lg">
                        ¿Cuál es tu retorno económico con Tu Negocio RD Pro?
                      </h4>
                    </div>
                    <div className="text-xs text-gray-400 font-medium max-w-xs sm:text-right leading-tight">
                      Calcula estimativamente las horas de trabajo contable que optimizas y valorizas.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    
                    {/* Input Sliders Panel */}
                    <div className="md:col-span-7 space-y-6">
                      
                      {/* Metric 1: Calculations */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-700">Simulaciones / Cálculos al mes:</span>
                          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-gray-900">
                            {roiCalculos} cálculos
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="200"
                          step="5"
                          value={roiCalculos}
                          aria-label="Cálculos fiscales o simulaciones estimadas al mes"
                          onChange={(e) => setRoiCalculos(Number(e.target.value))}
                          className="w-full accent-[#0F766E]"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                          <span>Básico (5)</span>
                          <span>Estudio Profesional (100)</span>
                          <span>Firma Independiente (200)</span>
                        </div>
                      </div>

                      {/* Metric 2: Hourly labor rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-700">Estima tu tarifa por hora laboral (RD$):</span>
                          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-[#0F766E]">
                            RD$ {roiTarifaHora.toLocaleString()} / hr
                          </span>
                        </div>
                        <input
                          type="range"
                          min="300"
                          max="3000"
                          step="100"
                          value={roiTarifaHora}
                          aria-label="Cargos o costos estimados por cada hora de servicios técnicos"
                          onChange={(e) => setRoiTarifaHora(Number(e.target.value))}
                          className="w-full accent-[#0F766E]"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                          <span>Junior (RD$ 300)</span>
                          <span>Asesor Senior (RD$ 1,500)</span>
                          <span>Consultor Especializado (RD$ 3,000)</span>
                        </div>
                      </div>

                    </div>

                    {/* Highly Designed Summary Panel */}
                    <div className="md:col-span-5 bg-white border border-gray-150/70 p-5 rounded-2xl shadow-xs space-y-4 font-sans text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full pointer-events-none" />
                      
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Productividad mensual estimada</span>
                        <div className="text-3xl font-black text-[#111827]">
                          RD${' '}
                          {Math.floor(
                            parseFloat((roiCalculos * 15 / 60).toFixed(2)) * roiTarifaHora
                          ).toLocaleString()}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                          Tiempo optimizado: {parseFloat((roiCalculos * 15 / 60).toFixed(1))} horas/mes
                        </span>
                      </div>

                      <div className="border-t border-gray-100 my-2" />

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                          <span className="text-[9px] text-gray-400 block font-semibold">Costo Licencia</span>
                          <span className="text-xs font-black text-gray-800">
                            RD$ {billingCycle === 'mensual' ? '495' : '329'} / mes
                          </span>
                        </div>
                        
                        <div className="bg-amber-50 p-2.5 rounded-xl text-center border border-amber-100">
                          <span className="text-[9px] text-amber-800 block font-extrabold uppercase">RETORNO ROI</span>
                          <span className="text-xs font-black text-amber-900">
                            {billingCycle === 'mensual' 
                              ? ( (parseFloat((roiCalculos * 15 / 60).toFixed(2)) * roiTarifaHora) / 495 * 100 ).toFixed(0)
                              : ( (parseFloat((roiCalculos * 15 / 60).toFixed(2)) * roiTarifaHora) / 329 * 100 ).toFixed(0)
                            }% Neto
                          </span>
                        </div>
                      </div>

                      <p className="text-[9px] text-gray-400 text-center leading-normal pt-1">
                        * Evite multas de hasta <strong>RD$ 45,000</strong> por presentar datos errados de TSS o DGII al automatizar el proceso de manera profesional.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 max-w-4xl mx-auto text-left flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 font-bold text-amber-600 flex items-center justify-center text-lg shrink-0">
                    🛡️
                  </div>
                  <div className="space-y-1.5 leading-normal">
                    <span className="font-extrabold text-amber-950 text-sm block">Garantía Dominicana de Tranquilidad Absoluta:</span>
                    <p className="text-xs text-gray-700">
                      Garantizamos de forma transparente reembolsos dentro de los primeros 14 días si no se encuentra 100% satisfecho con las funcionalidades. Para cualquier soporte fiscal o reajuste emitido por cambio de normativas en la República Dominicana, nuestro asesoramiento es continuo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN PRIVATE CONSOLE */}
          {currentView === 'admin' && !authReady && (
            <div className="animate-in fade-in duration-200 py-12 max-w-2xl mx-auto w-full px-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-[#0F766E]">
                  <ShieldCheck size={22} />
                </div>
                <h1 className="text-2xl font-black text-[#111827]">Verificando acceso privado</h1>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Estamos confirmando tu sesión antes de abrir la consola administrativa.
                </p>
              </div>
            </div>
          )}

          {currentView === 'admin' && authReady && isAdminUser && (
            <React.Suspense fallback={<LazyFallback label="Cargando administracion..." />}>
              <AdminConsole
                firebaseUser={firebaseUser}
                onBack={() => navigateTo('/')}
              />
            </React.Suspense>
          )}

          {currentView === 'admin' && authReady && !isAdminUser && (
            <div className="animate-in fade-in duration-200 py-12 max-w-2xl mx-auto w-full px-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600">
                  <Lock size={22} />
                </div>
                <h1 className="text-2xl font-black text-[#111827]">Acceso restringido</h1>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Esta área está reservada para la cuenta administradora autorizada.
                </p>
                <button
                  onClick={() => navigateTo('/')}
                  className="mt-2 px-5 py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:opacity-95 transition-all"
                >
                  Volver al inicio
                </button>
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
                  <span className="text-xs font-bold text-gray-750 block mb-2">Herramientas populares de Tu Negocio RD:</span>
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
                    <button onClick={() => navigateTo('/herramientas/calculadora-retenciones')} className="flex items-center gap-1.5 text-[#0F766E] hover:underline font-semibold text-left cursor-pointer">
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
          {shouldShowGlobalBottomAds && (
          <div className="xl:hidden mt-6 shrink-0" id="adsense-slot-3-mobile-alternative">
            <AdSenseBlock variant="results-inline" className="shadow-xs border border-gray-150" />
          </div>
          )}

          {/* 2. Publicidad Segura - Adsense horizontal placeholder rendered inside scrollable workspace */}
          {shouldShowGlobalBottomAds && (
          <section className="max-w-7xl mx-auto px-4 py-6 w-full mt-6" id="adsense-bottom-section">
            <AdSenseBlock variant="horizontal-bottom" />
          </section>
          )}

          {/* 3. Footer styled neatly matching design rendered inside scrollable workspace */}
          <footer className="w-full bg-white border-t border-gray-200 py-12 text-sm text-[#6B7280] z-20 mt-8 rounded-2xl border border-gray-150 shadow-xs">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-[#0F766E] flex items-center justify-center font-bold text-white text-[10px]">
                    TN
                  </div>
                  <span className="text-base font-bold text-[#111827]">Tu Negocio RD</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Herramientas dominicanas para calcular, planificar y tomar mejores decisiones de negocio con fuentes documentadas.
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
                  <li><button onClick={() => navigateTo('/contacto')} className="hover:text-[#0F766E] transition-colors text-left">Contacto</button></li>
                  <li><button onClick={() => navigateTo('/privacidad')} className="hover:text-[#0F766E] transition-colors text-left">Privacidad</button></li>
                  <li><button onClick={() => navigateTo('/terminos')} className="hover:text-[#0F766E] transition-colors text-left">Términos</button></li>
                </ul>
              </div>

              <div>
                <label htmlFor="footer-email-monitoring" className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3 block cursor-pointer">Monitoreo De Cambios</label>
                <p className="text-xs text-gray-450 mb-3 leading-relaxed">Inscríbase para recibir alertas de cambios en las normativas del ISR o de retenciones de salud.</p>
                <div className="flex gap-1.5">
                  <input 
                    id="footer-email-monitoring"
                    type="email" 
                    value={footerEmail}
                    onChange={(event) => {
                      setFooterEmail(event.target.value);
                      if (footerEmailStatus !== 'idle') setFooterEmailStatus('idle');
                    }}
                    placeholder="correo@ejemplo.com"
                    className="bg-gray-50 border border-gray-300 rounded px-2 text-xs flex-grow outline-none focus:ring-1 focus:ring-[#0F766E] focus:bg-white transition-all"
                  />
                  <button 
                    onClick={handleFooterEmailSubmit}
                    className="bg-[#0F766E] text-white text-xs font-bold px-3 py-1.5 rounded hover:opacity-90 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Inscribir
                  </button>
                </div>
                {footerEmailStatus === 'error' && (
                  <p className="mt-2 text-[11px] font-semibold text-red-600">Escribe un correo valido para recibir alertas.</p>
                )}
                {footerEmailStatus === 'success' && (
                  <p className="mt-2 text-[11px] font-semibold text-[#0F766E]">Listo. Guardamos tu interes para alertas normativas.</p>
                )}
              </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>© 2026 Tu Negocio RD. Todos los derechos reservados de conformidad con la Ley de Propiedad Intelectual de la República Dominicana.</p>
            </div>
          </footer>

        </div>
      </div>

        {/* RIGHT AD BANNER (Vertical Skyscraper, visible only on XL widescreen displays) */}
        {shouldShowAdRail && (
        <aside className="hidden xl:flex xl:col-span-2 border-l border-gray-200 bg-white p-3 2xl:p-4 sticky top-16 h-[calc(100vh-4rem)] self-start overflow-y-auto" id="right-adsense-skyscraper-column">
          <AdSenseBlock variant="skyscraper-right" />
        </aside>
        )}

      </div>

      {/* Professional Portal Workspace (ITBIS NCF Desglose + Retenciones & Recargos DGII Calculators) */}
      <React.Suspense fallback={null}>
        <ProfessionalPortal 
          isOpen={showPortalModal} 
          onClose={() => setShowPortalModal(false)} 
          userTier={featureAccessTier}
          onUpgrade={activateProDemo}
        />
      </React.Suspense>

      {/* Trial Activation Pro Modal */}
      {PUBLIC_PRO_FEATURES_ENABLED && (
        <ProUpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
          onUpgrade={activateProDemo}
          featureName={targetedProFeature}
        />
      )}

      {/* Dynamic Firebase-Backed Google Auth and Payments Portal Modal */}
      <React.Suspense fallback={null}>
        <UserAccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          userTier={userTier}
          subscriptionState={subscriptionState}
          initialCheckoutPlan={pendingCheckoutPlan}
          onTierChange={(newTier) => {
            const nextState = newTier === 'PRO'
              ? createActiveSubscriptionState(subscriptionState.billingCycle === 'anual' ? 'anual' : 'mensual', subscriptionState.paymentMethod || 'demo-card')
              : createDefaultSubscriptionState();
            setSubscriptionState(nextState);
            localStorage.setItem('negociord_subscription_state', serializeSubscriptionState(nextState));
            localStorage.setItem('negociord_user_tier', newTier);
          }}
          onSubscriptionChange={(nextState) => {
            setSubscriptionState(nextState);
            localStorage.setItem('negociord_subscription_state', serializeSubscriptionState(nextState));
            localStorage.setItem('negociord_user_tier', nextState.plan);
          }}
        />
      </React.Suspense>

    </div>
  );
}
