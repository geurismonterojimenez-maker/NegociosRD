import React, { useState, useMemo } from 'react';
import { CALCULATORS, CATEGORIES } from '../data';
import { CalculatorInfo } from '../types';
import { Sparkles } from 'lucide-react';
// @ts-ignore
import * as pkg from 'react-window';
// @ts-ignore
const List = pkg.FixedSizeList || pkg.default?.FixedSizeList || pkg;
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

// FASE 3 - Pre-compiled local memory index (O(1) category routing)
const CATEGORY_INDEX: Record<string, CalculatorInfo[]> = {
  all: CALCULATORS,
  impuestos: CALCULATORS.filter(c => c.category === 'impuestos'),
  laboral: CALCULATORS.filter(c => c.category === 'laboral'),
  finanzas: CALCULATORS.filter(c => c.category === 'finanzas'),
  negocios: CALCULATORS.filter(c => c.category === 'negocios'),
};

// Static Fuse.js cache to avoid constructing search instances during typing frames
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

// FASE 9 - Preheat and pre-build indexes using requestIdleCallback when browser thread is free
if (typeof window !== 'undefined') {
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
  idleCallback(() => {
    Object.entries(CATEGORY_INDEX).forEach(([catKey, dataset]) => {
      getFuseInstanceForCategory(catKey, dataset);
    });
  });
}

const MemoizedCalculatorsList = React.memo(function CalculatorsList({
  onSelectCalculator,
  searchFilter,
  setSearchFilter,
  activeCategory,
  setActiveCategory
}: CalculatorsListProps) {

  // FASE 4 - Subset fuzzy-searching with Fuse.js
  const filteredCalculators = useMemo(() => {
    const catKey = activeCategory || 'all';
    const targetSet = CATEGORY_INDEX[catKey] || CALCULATORS;

    if (!searchFilter.trim()) {
      return targetSet;
    }

    const fuse = getFuseInstanceForCategory(catKey, targetSet);
    return fuse.search(searchFilter).map(res => res.item);
  }, [searchFilter, activeCategory]);

  // Suggested chips handler
  const handleSuggestionClick = (term: string, slug: string) => {
    const matched = CALCULATORS.find(c => c.urlSlug === slug || c.id === slug);
    if (matched) {
      onSelectCalculator(matched);
    } else {
      setSearchFilter(term);
    }
  };

  // Load recently viewed calculators from localStorage
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

  const recentCalcsOfUser = useMemo(() => {
    if (recentCalcIds.length === 0) return [];
    return recentCalcIds
      .map(id => CALCULATORS.find(c => c.id === id))
      .filter((c): c is CalculatorInfo => !!c);
  }, [recentCalcIds]);

  // FASE 5 - Responsive grid columns detection for virtualization
  const [columns, setColumns] = useState(3);
  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setColumns(1);
      } else if (w < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // FASE 5 - Slicing rows
  const rows = useMemo(() => {
    const chunked = [];
    for (let i = 0; i < filteredCalculators.length; i += columns) {
      chunked.push(filteredCalculators.slice(i, i + columns));
    }
    return chunked;
  }, [filteredCalculators, columns]);

  // Virtual Row Renderer
  const VirtualRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowItems = rows[index] || [];
    const gridColsClass = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
      <div style={style} className="px-1">
        <div className={`grid ${gridColsClass} gap-6 h-full pb-4`}>
          {rowItems.map((calc) => (
            <div 
              key={calc.id}
              onClick={() => onSelectCalculator(calc)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xs hover:border-[#0F766E] cursor-pointer transition-all flex flex-col justify-between h-[180px] group overflow-hidden"
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
                <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#0F766E] transition-colors mb-1.5 truncate">
                  {calc.name}
                </h3>
                <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                  {calc.description}
                </p>
              </div>

              {/* Tags panel */}
              <div className="flex flex-wrap gap-1 pt-2 items-center justify-between text-[11px] font-semibold text-[#0F766E]">
                <div className="flex flex-wrap gap-1">
                  {calc.tags.slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-medium text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                  Calcular →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const showVirtualization = filteredCalculators.length > 20;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Recent Calculators Row if present */}
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#0F766E] hover:text-[#0F766E] text-xs font-semibold text-gray-755 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <span>⚡</span>
                <span>{calc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category boxes or buttons - Sleek and Compact Bento style */}
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Sparkles size={14} className="text-[#0F766E]" />
        <span>Filtrar por Categoría</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
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

      {/* Directory Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827] mb-1">
            {activeCategory 
              ? `${CATEGORIES.find(c => c.id === activeCategory)?.name} — República Dominicana` 
              : 'Directorio de cálculos'
            }
          </h2>
          <p className="text-sm text-[#6B7280]">
            Mostrando {filteredCalculators.length} de {CALCULATORS.length} calculadoras con fuentes documentadas.
          </p>
        </div>

        {/* Suggestion Chips Quick Trigger */}
        <div className="flex flex-wrap gap-2 text-xs items-center">
          <span className="text-gray-500 font-medium">Sugeridos:</span>
          <button 
            type="button"
            onClick={() => handleSuggestionClick('Calculadora ITBIS', 'calculadora-itbis')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Factura ITBIS
          </button>
          <button 
            type="button"
            onClick={() => handleSuggestionClick('Salario neto', 'calculadora-salario-neto')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Sueldo Neto
          </button>
          <button 
            type="button"
            onClick={() => handleSuggestionClick('Prestaciones laborales', 'calculadora-prestaciones-laborales')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Liquidación
          </button>
          <button 
            type="button"
            onClick={() => handleSuggestionClick('Préstamo Hipotecario', 'calculadora-prestamo-hipotecario')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Hipotecas
          </button>
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
      ) : showVirtualization ? (
        /* FASE 5 - Virtualized react-window grid */
        <div className="w-full">
          <List
            height={Math.min(rows.length * 196, 620)}
            itemCount={rows.length}
            itemSize={196}
            width="100%"
            className="overflow-x-hidden scrollbar-thin"
          >
            {VirtualRow}
          </List>
        </div>
      ) : (
        /* Native Grid rendering for small lists <= 20 results (keeps natural layout) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-250">
          {filteredCalculators.map((calc) => (
            <div 
              key={calc.id}
              onClick={() => onSelectCalculator(calc)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xs hover:border-[#0F766E] cursor-pointer transition-all flex flex-col justify-between min-h-[190px] h-auto group overflow-hidden"
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
                <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                  {calc.description}
                </p>
              </div>

              {/* Tags panel */}
              <div className="flex flex-wrap gap-1 pt-2 items-center justify-between text-[11px] font-semibold text-[#0F766E]">
                <div className="flex flex-wrap gap-1">
                  {calc.tags.slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-medium text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                  Calcular →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default MemoizedCalculatorsList;

export function getCalculatorCardStyle(category: string): string {
  return category === 'impuestos' ? 'text-teal-600' : 'text-amber-600';
}
