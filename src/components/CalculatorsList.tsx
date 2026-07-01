import React, { useState, useMemo } from 'react';
import { CALCULATORS, CATEGORIES } from '../data';
import { CalculatorInfo } from '../types';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Fuse from 'fuse.js';

interface CalculatorsListProps {
  onSelectCalculator: (calc: CalculatorInfo) => void;
  searchFilter: string;
  setSearchFilter: (term: string) => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  userTier?: 'FREE' | 'PRO';
  onProRequired?: (featureName: string) => void;
}

// OPTIMIZATION 1 - Pre-compiled O(1) local memory indexing
const CATEGORY_INDEX: Record<string, CalculatorInfo[]> = {
  all: CALCULATORS,
  impuestos: CALCULATORS.filter(c => c.category === 'impuestos'),
  laboral: CALCULATORS.filter(c => c.category === 'laboral'),
  finanzas: CALCULATORS.filter(c => c.category === 'finanzas'),
};


// OPTIMIZATION 2 - Static Fuse.js cache to prevent instance rebuilding during keystroke cycles
const FUSE_CACHE: Record<string, Fuse<CalculatorInfo>> = {};

const getFuseInstanceForCategory = (catKey: string, dataset: CalculatorInfo[]) => {
  if (!FUSE_CACHE[catKey]) {
    FUSE_CACHE[catKey] = new Fuse(dataset, {
      keys: ['name', 'shortDescription', 'description', 'tags'],
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 1
    });
  }
  return FUSE_CACHE[catKey];
};

// OPTIMIZATION 3 - Preheat global indices during requestIdleCallback when browser thread is free
if (typeof window !== 'undefined') {
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
  idleCallback(() => {
    Object.entries(CATEGORY_INDEX).forEach(([catKey, dataset]) => {
      getFuseInstanceForCategory(catKey, dataset);
    });
  });
}

// OPTIMIZATION 4 - Standalone Component
export default function CalculatorsList({
  onSelectCalculator,
  searchFilter,
  setSearchFilter,
  activeCategory,
  setActiveCategory
}: CalculatorsListProps) {

  // OPTIMIZATION 5 - Cached subset fuzzy search results using useMemo
  const filteredCalculators = useMemo(() => {
    const catKey = activeCategory || 'all';
    const targetSet = CATEGORY_INDEX[catKey] || CALCULATORS;

    if (!searchFilter.trim()) {
      return targetSet;
    }

    const fuse = getFuseInstanceForCategory(catKey, targetSet);
    return fuse.search(searchFilter).map(res => res.item);
  }, [searchFilter, activeCategory]);

  // Suggested keywords callback
  const handleSuggestionClick = (term: string, slug: string) => {
    const matched = CALCULATORS.find(c => c.urlSlug === slug || c.id === slug);
    if (matched) {
      onSelectCalculator(matched);
    } else {
      setSearchFilter(term);
    }
  };

  // Load recently viewed calculators safely from localStorage
  const [recentCalcIds, setRecentCalcIds] = useState<string[]>([]);
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('recent_calculators_ids');
      if (saved) {
        setRecentCalcIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_COUNT = 6;

  // Reset expansion when category or search changes to show clean top results first
  React.useEffect(() => {
    setIsExpanded(false);
  }, [activeCategory, searchFilter]);

  const displayedCalculators = useMemo(() => {
    if (isExpanded) {
      return filteredCalculators;
    }
    return filteredCalculators.slice(0, INITIAL_COUNT);
  }, [filteredCalculators, isExpanded]);

  const recentCalcsOfUser = useMemo(() => {
    if (recentCalcIds.length === 0) return [];
    return recentCalcIds
      .map(id => CALCULATORS.find(c => c.id === id))
      .filter((c): c is CalculatorInfo => !!c);
  }, [recentCalcIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Recent Calculators Row */}
      {recentCalcsOfUser.length > 0 && (
        <div className="mb-8 p-4 bg-[#F9FAFB] rounded-xl border border-gray-150 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span>Tus Cálculos Recientes</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {recentCalcsOfUser.map((calc) => (
              <button
                key={calc.id}
                onClick={() => onSelectCalculator(calc)}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#0F766E] hover:text-[#0F766E] text-xs font-semibold text-gray-755 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <span>⚡</span>
                <span>{calc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category boxes Bento Grid */}
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Sparkles size={14} className="text-[#0F766E]" />
        <span>Filtrar por Categoría</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          type="button"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 overflow-hidden ${
            activeCategory === null
              ? 'border-[#0F766E] bg-teal-50/20 text-[#0F766E] font-bold'
              : 'border-[#E5E7EB] bg-white hover:border-[#bdc9c6] text-gray-700 font-medium'
          }`}
        >
          <span className="text-lg shrink-0">🌟</span>
          <div className="min-w-0 flex-1">
            <div className="text-xs truncate">Todas</div>
            <p className="text-[10px] text-gray-400 font-normal truncate">{CALCULATORS.length} herramientas</p>
          </div>
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              type="button"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 overflow-hidden ${
                isSelected
                  ? 'border-[#0F766E] bg-teal-50/20 text-[#0F766E] font-bold'
                  : 'border-[#E5E7EB] bg-white hover:border-[#bdc9c6] text-gray-700 font-medium'
              }`}
            >
              <span className="text-lg shrink-0">
                {cat.id === 'impuestos' && '🏛️'}
                {cat.id === 'laboral' && '💼'}
                {cat.id === 'finanzas' && '📈'}
                {cat.id === 'negocios' && '🏬'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs truncate">{cat.name}</div>
                <p className="text-[10px] text-gray-400 font-normal truncate">{cat.descdgii}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Directory Grid Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827] mb-1">
            {activeCategory 
              ? `${CATEGORIES.find(c => c.id === activeCategory)?.name} — República Dominicana` 
              : 'Directorio de cálculos'
            }
          </h2>

        </div>


      </div>

      {filteredCalculators.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center max-w-lg mx-auto animate-in fade-in duration-200">
          <p className="text-gray-400 font-bold mb-2">No se encontraron herramientas</p>
          <p className="text-gray-500 text-sm">Prueba ajustando el término de búsqueda o seleccionando "Todas" para restablecer la lista.</p>
          <button 
            type="button"
            onClick={() => { setSearchFilter(''); setActiveCategory(null); }}
            className="mt-4 px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#115E59]"
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Natively responsive grid: preserves dynamic auto-wrap heights perfectly */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-250">
            {displayedCalculators.map((calc) => (
              <div 
                key={calc.id}
                onClick={() => onSelectCalculator(calc)}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0F766E] cursor-pointer transition-all flex flex-col justify-between min-h-[190px] h-auto group overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 font-bold rounded text-[9px] uppercase tracking-wider ${
                      calc.category === 'impuestos' ? 'text-teal-700 bg-teal-50' :
                      calc.category === 'laboral' ? 'text-amber-700 bg-amber-50' :
                      calc.category === 'finanzas' ? 'text-blue-700 bg-blue-50' :
                      'text-indigo-700 bg-indigo-50'
                    }`}>
                      {calc.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#0F766E] transition-colors mb-1.5">
                    {calc.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] line-clamp-3 leading-relaxed">
                    {calc.description}
                  </p>
                </div>

                {/* Clean Action footer */}
                <div className="flex items-center justify-end text-[11px] font-semibold text-[#0F766E] border-t border-gray-50 mt-3 pt-3">
                  <span className="opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all text-[11px] font-bold flex items-center gap-0.5">
                    Calcular <span>→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredCalculators.length > INITIAL_COUNT && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:border-[#0F766E] hover:text-[#0F766E] text-xs font-bold text-gray-755 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
              >
                {isExpanded ? (
                  <>
                    <span>Mostrar menos herramientas</span>
                    <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    <span>Mostrar más herramientas</span>
                    <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function getCalculatorCardStyle(category: string): string {
  return category === 'impuestos' ? 'text-teal-600' : 'text-amber-600';
}
