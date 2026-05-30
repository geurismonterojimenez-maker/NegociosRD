import React, { useState, useMemo } from 'react';
import { CALCULATORS, CATEGORIES, HOME_FAQS, PROGRAMMATIC_GUIDES } from './data';
import { CalculatorInfo } from './types';
import CalculatorsList from './components/CalculatorsList';
import CalculatorForm from './components/CalculatorForm';
import GuidesView from './components/GuidesView';
import NewsSection from './components/NewsSection';
import AdSenseBlock from './components/AdSenseBlock';
import ProfessionalPortal from './components/ProfessionalPortal';
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

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'calculator' | 'blog' | 'nosotros' | 'news'>('home');
  const [activeCalculator, setActiveCalculator] = useState<CalculatorInfo | null>(null);
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Switch to a calculator view
  const handleSelectCalculator = (calc: CalculatorInfo) => {
    setActiveCalculator(calc);
    setCurrentView('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      handleSelectCalculator(calc);
    }
  };

  // Switch to a guide view
  const handleSelectGuide = (slug: string) => {
    setSelectedGuideSlug(slug);
    setCurrentView('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            onClick={() => { setCurrentView('home'); setActiveCalculator(null); setSelectedGuideSlug(null); setSearchFilter(''); }} 
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
            <input 
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
              onClick={() => { setCurrentView('home'); setActiveCalculator(null); setSelectedGuideSlug(null); setSearchFilter(''); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'home' || currentView === 'calculator' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Herramientas
            </button>
            <button 
              onClick={() => { setCurrentView('centro-laboral'); setActiveCalculator(null); setSelectedGuideSlug(null); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'centro-laboral' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Centro Laboral RD
            </button>
            <button 
              onClick={() => { setCurrentView('centro-financiero'); setActiveCalculator(null); setSelectedGuideSlug(null); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'centro-financiero' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Centro Financiero RD
            </button>
            <button 
              onClick={() => { setSelectedGuideSlug(null); setCurrentView('blog'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'blog' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Guías y Blog
            </button>
            <button 
              onClick={() => { setSelectedGuideSlug(null); setCurrentView('news'); }}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'news' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Noticias
            </button>
            <button 
              onClick={() => setCurrentView('nosotros')}
              className={`hover:text-[#0F766E] cursor-pointer transition-colors ${
                currentView === 'nosotros' ? 'text-[#0F766E] font-semibold' : ''
              }`}
            >
              Nosotros
            </button>
            <button 
              onClick={() => setShowPortalModal(true)}
              className="px-4 py-1.5 bg-[#0F766E] text-white rounded-md text-xs font-semibold hover:opacity-95 transition-opacity hidden md:inline-block cursor-pointer active:scale-95"
            >
              Acceso Profesional
            </button>
          </nav>

          {/* Hamburger Menu Toggle Button for Tablet/Mobile - visible on (< lg) screens */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-md text-gray-500 hover:text-[#0F766E] hover:bg-gray-100/50 transition-colors focus:outline-none cursor-pointer"
              aria-label="Abrir menú"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
              <input 
                type="text" 
                value={searchFilter}
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-[#F3F4F6] text-sm text-[#111827] placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
                placeholder="Buscar calculadora o guía..."
              />
            </div>

            <div className="flex flex-col gap-1 font-medium text-gray-600">
              <button 
                onClick={() => { setCurrentView('home'); setActiveCalculator(null); setSelectedGuideSlug(null); setSearchFilter(''); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'home' || currentView === 'calculator' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-home"
              >
                Herramientas de Cálculos
              </button>
              <button 
                onClick={() => { setCurrentView('centro-laboral'); setActiveCalculator(null); setSelectedGuideSlug(null); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'centro-laboral' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-laboral"
              >
                Centro Laboral RD (RH)
              </button>
              <button 
                onClick={() => { setCurrentView('centro-financiero'); setActiveCalculator(null); setSelectedGuideSlug(null); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'centro-financiero' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-financiero"
              >
                Centro Financiero RD (Deudas)
              </button>
              <button 
                onClick={() => { setSelectedGuideSlug(null); setCurrentView('blog'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'blog' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-blog"
              >
                Guías y Blog Fiscal/Laboral
              </button>
              <button 
                onClick={() => { setSelectedGuideSlug(null); setCurrentView('news'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors border-b border-gray-100 font-semibold text-sm ${currentView === 'news' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-news"
              >
                Noticias & Actualizaciones
              </button>
              <button 
                onClick={() => { setCurrentView('nosotros'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left hover:text-[#0F766E] transition-colors font-semibold text-sm ${currentView === 'nosotros' ? 'text-[#0F766E]' : ''}`}
                id="mob-nav-about"
              >
                Nosotros
              </button>
            </div>

            <button 
              onClick={() => { setShowPortalModal(true); setMobileMenuOpen(false); }}
              className="w-full text-center py-2.5 bg-[#0F766E] text-white rounded-md text-sm font-semibold hover:opacity-95 transition-all cursor-pointer active:scale-95 shadow-xs"
              id="mob-nav-expertBtn"
            >
              Acceso Profesional
            </button>
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
          
          {/* Ad Slot 1: Billboard Superior (Horizontal) - Siempre visible y optimizado para SEO */}
          <div className="mb-6 shrink-0" id="adsense-slot-1-billboard">
            <AdSenseBlock variant="results-inline" className="border border-teal-150 bg-teal-50/5 shadow-xs" />
          </div>

          {/* Ad Slot 2 (Contraparte Móvil): Visible en móviles/tablets para completar 4 anuncios de alto rendimiento */}
          <div className="xl:hidden mb-6 shrink-0" id="adsense-slot-2-mobile-alternative">
            <AdSenseBlock variant="mobile-infeed" className="shadow-xs border border-gray-150" />
          </div>
          
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

              {/* SEARCH INPUT BAR inline */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-2.5 block">Buscar herramienta en tiempo real</span>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                  </div>
                  <input 
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
                        <span>Fórmula 100% Exacta</span>
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
                          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Monto Ventas (RD$)</label>
                          <input 
                            type="number"
                            value={ctaVentasMes}
                            onChange={(e) => setCtaVentasMes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Monto Gastos (RD$)</label>
                          <input 
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
              <CentroLaboral />
            </div>
          )}

          {/* CENTRO FINANCIERO (DEUDAS/COMPARATIVAS) */}
          {currentView === 'centro-financiero' && (
            <div className="animate-in fade-in duration-150">
              <CentroFinanciero />
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
              
              <CalculatorForm 
                calc={activeCalculator} 
                onBack={() => { setCurrentView('home'); setActiveCalculator(null); }} 
                onNavigateToCalc={(slug) => handleNavigateToCalcBySlug(slug)}
              />
            </div>
          )}

          {/* CONTEXT SEO BLOG VIEWS */}
          {currentView === 'blog' && (
            <div className="animate-in fade-in duration-150">
              <GuidesView 
                onBackToHome={() => { setCurrentView('home'); setSelectedGuideSlug(null); }} 
                onNavigateToCalcBySlug={handleNavigateToCalcBySlug}
                initialSelectedGuideSlug={selectedGuideSlug}
              />
            </div>
          )}

          {/* NEWS PORTAL VIEW */}
          {currentView === 'news' && (
            <div className="animate-in fade-in duration-150">
              <NewsSection 
                onBackToHome={() => { setCurrentView('home'); }} 
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
                    onClick={() => { setCurrentView('home'); }}
                    className="px-6 py-2.5 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:opacity-95 transition-all shadow-xs"
                  >
                    Regresar al portal principal
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
            <h4 className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3">Monitoreo De Cambios</h4>
            <p className="text-xs text-gray-450 mb-3 leading-relaxed">Inscríbase para recibir alertas de cambios en las normativas del ISR o de retenciones de salud.</p>
            <div className="flex gap-1.5">
              <input 
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
      />

    </div>
  );
}
