import React, { useState, useMemo } from 'react';
import { CALCULATORS, CATEGORIES } from '../data';
import { CalculatorInfo, CalculatorCategory } from '../types';
import { Search, Sparkles, Receipt, Users, Landmark, Landmark as Piggy, TrendingUp, Info, HelpCircle } from 'lucide-react';

interface CalculatorsListProps {
  onSelectCalculator: (calc: CalculatorInfo) => void;
  searchFilter: string;
  setSearchFilter: (term: string) => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  userTier?: 'FREE' | 'PRO';
  onProRequired?: (featureName: string) => void;
}

export default function CalculatorsList({
  onSelectCalculator,
  searchFilter,
  setSearchFilter,
  activeCategory,
  setActiveCategory,
  userTier = 'FREE',
  onProRequired
}: CalculatorsListProps) {

  // Suggestion chips handler
  const handleSuggestionClick = (term: string, slug: string) => {
    // Navigate directly if we match a calculator
    const matched = CALCULATORS.find(c => c.urlSlug === slug || c.id === slug);
    if (matched) {
      onSelectCalculator(matched);
    } else {
      setSearchFilter(term);
    }
  };

  // Filtered calculators list based on search and category
  const filteredCalculators = useMemo(() => {
    return CALCULATORS.filter(calc => {
      const matchesSearch = 
        calc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        calc.shortDescription.toLowerCase().includes(searchFilter.toLowerCase()) ||
        calc.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
      
      const matchesCategory = activeCategory ? calc.category === activeCategory : true;

      return matchesSearch && matchesCategory;
    });
  }, [searchFilter, activeCategory]);

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
    return recentCalcIds
      .map(id => CALCULATORS.find(c => c.id === id))
      .filter((c): c is CalculatorInfo => !!c);
  }, [recentCalcIds]);

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

      {/* Category boxes or buttons - Bento style */}
      <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
        <Sparkles size={20} className="text-[#0F766E]" />
        Explorar herramientas por categoría
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex flex-col items-start p-5 rounded-xl border text-left transition-all cursor-pointer ${
            activeCategory === null
              ? 'border-[#0F766E] bg-teal-50/25 ring-1 ring-[#0F766E]'
              : 'border-[#E5E7EB] bg-white hover:border-[#bdc9c6]'
          }`}
        >
          <span className="text-2xl mb-3">🌟</span>
          <span className="font-bold text-sm text-[#111827]">Todas</span>
          <span className="text-xs text-[#6B7280] mt-1">20 herramientas iniciales</span>
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-start p-5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#0F766E] bg-teal-50/25 ring-1 ring-[#0F766E]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#bdc9c6]'
              }`}
            >
              <span className={`p-2 rounded-lg ${cat.color} text-sm mb-3 font-bold`}>
                {cat.id === 'impuestos' && '🏛️'}
                {cat.id === 'laboral' && '💼'}
                {cat.id === 'finanzas' && '📈'}
                {cat.id === 'negocios' && '🏬'}
              </span>
              <span className="font-bold text-sm text-[#111827]">{cat.name}</span>
              <span className="text-xs text-[#6B7280] mt-1">{cat.descdgii}</span>
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
            Mostrando {filteredCalculators.length} de {CALCULATORS.length} calculadoras exactas.
          </p>
        </div>

        {/* Suggestion Chips Quick Trigger */}
        <div className="flex flex-wrap gap-2 text-xs items-center">
          <span className="text-gray-500 font-medium">Sugeridos:</span>
          <button 
            onClick={() => handleSuggestionClick('Calculadora ITBIS', 'calculadora-itbis')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Factura ITBIS
          </button>
          <button 
            onClick={() => handleSuggestionClick('Salario neto', 'calculadora-salario-neto')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Sueldo Neto
          </button>
          <button 
            onClick={() => handleSuggestionClick('Prestaciones laborales', 'calculadora-prestaciones-laborales')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Liquidación
          </button>
          <button 
            onClick={() => handleSuggestionClick('Préstamo Hipotecario', 'calculadora-prestamo-hipotecario')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#0F766E] text-gray-700 hover:text-[#0F766E] transition-all cursor-pointer font-medium"
          >
            Hipotecas
          </button>
        </div>
      </div>

      {filteredCalculators.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center max-w-lg mx-auto">
          <p className="text-gray-400 font-bold mb-2">No se encontraron herramientas</p>
          <p className="text-gray-500 text-sm">Prueba ajustando el término de búsqueda o seleccionando "Todas" para restablecer la lista.</p>
          <button 
            onClick={() => { setSearchFilter(''); setActiveCategory(null); }}
            className="mt-4 px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#115E59]"
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalculators.map((calc) => {
            const isProCalculator = calc.id === 'recargos-dgii' || calc.id === 'retenciones-dgii';
            const isLocked = isProCalculator && userTier === 'FREE';

            const handleClick = () => {
              if (isLocked) {
                if (onProRequired) {
                  onProRequired(calc.name);
                } else {
                  alert(`La ${calc.name} es una función Premium PRO.`);
                }
              } else {
                onSelectCalculator(calc);
              }
            };

            return (
              <div 
                key={calc.id}
                onClick={handleClick}
                className={`bg-white border rounded-xl p-5 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between min-h-[250px] h-auto group ${
                  isLocked 
                    ? 'border-amber-200 bg-amber-50/5 hover:border-amber-500' 
                    : 'border-[#E5E7EB] hover:border-[#0F766E]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex gap-1.5 items-center">
                      <span className={`px-2.5 py-1 font-bold rounded-full text-[10px] uppercase tracking-wider ${
                        calc.category === 'impuestos' ? 'text-teal-700 bg-teal-50' :
                        calc.category === 'laboral' ? 'text-amber-700 bg-amber-50' :
                        calc.category === 'finanzas' ? 'text-blue-700 bg-blue-50' :
                        'text-indigo-700 bg-indigo-50'
                      }`}>
                        {calc.category}
                      </span>
                      {isProCalculator && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black rounded-md uppercase tracking-tight flex items-center gap-0.5">
                          👑 PRO
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className={`text-xs font-semibold ${isLocked ? 'text-amber-600' : 'text-[#0F766E]'}`}>
                        {isLocked ? 'Desbloquear PRO 🔒' : 'Abrir Calculadora →'}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-[#111827] group-hover:text-[#0F766E] transition-colors mb-2 flex items-center gap-1">
                    {calc.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] line-clamp-3 leading-relaxed">
                    {calc.description}
                  </p>
                </div>

                {/* Tags panel */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50 items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {calc.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {isLocked && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 bg-amber-55 px-1.5 py-0.5 rounded uppercase">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export function getCalculatorCardStyle(category: string): string {
  return category === 'impuestos' ? 'text-teal-600' : 'text-amber-600';
}
