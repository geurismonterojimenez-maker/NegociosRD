import React from 'react';

// Color Palette from actual logo image
const COLORS = {
  darkTeal: '#005556',    // Deep, professional corporate corporate teal
  lightTeal: '#0E8D82',   // Vibrant growth arrow teal
  gold: '#C5932D',        // Warm mustard gold for bars and 'RD'
};

interface LogoProps {
  className?: string;
  size?: number; // Size for the logo icon
  showText?: boolean;
}

/**
 * 1. LogoSymbol: The central vector icon from the user's uploaded logo.
 * Features:
 * - Professional interlocking 'T' and 'N' capital letters in deep teal.
 * - Rising gold bar chart columns nested in the core diagonal of the N.
 * - A sharp upward-right growth arrow in vibrant growth teal cutting across.
 */
export const LogoSymbol: React.FC<LogoProps & { strokeWidth?: number }> = ({ 
  size = 40, 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
    >
      {/* 1. Deep Teal T-Bar and Stem */}
      <path
        d="M20 35H90V47H63V105H47V47H20V35Z"
        fill={COLORS.darkTeal}
      />
      {/* Slanted facet on top of T (as in original logo, which has a distinct sleek serif layout) */}
      <path
        d="M20 35L26 29H84L90 35H20Z"
        fill={COLORS.darkTeal}
        opacity="0.9"
      />

      {/* 2. Deep Teal N-Shape */}
      {/* The N integrates with the T stem: Left diagonal, vertical right stem, styled corners */}
      <path
        d="M63.5 39H79L120 102V47H136V117H120L79 54V105H63.5V39Z"
        fill={COLORS.darkTeal}
      />

      {/* 3. Gold Bar Chart (Growing columns) */}
      {/* Column 1 (Left, Short) */}
      <rect
        x="90.5"
        y="42"
        width="10"
        height="22"
        rx="1"
        transform="skewX(-28) rotate(-1)"
        fill={COLORS.gold}
      />
      {/* Column 2 (Middle, Medium) */}
      <rect
        x="100.5"
        y="22"
        width="10"
        height="40"
        rx="1"
        transform="skewX(-28) rotate(-1)"
        fill={COLORS.gold}
      />
      {/* Column 3 (Right, Tall) */}
      <rect
        x="110.5"
        y="2"
        width="10"
        height="58"
        rx="1"
        transform="skewX(-28) rotate(-1)"
        fill={COLORS.gold}
      />

      {/* 4. Vibrant Teal Growth Arrow */}
      {/* Cutting up and to the right over the center diagonal of N */}
      <path
        d="M72 108L140 40M140 40H118M140 40V62"
        stroke={COLORS.lightTeal}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 2. LogoFull: Horizontal brand presentation (Icon + "TU NEGOCIO RD" typography).
 * Replaces the header and footer generic representations perfectly.
 */
export const LogoFull: React.FC<LogoProps & { textClass?: string }> = ({ 
  size = 32, 
  className = '', 
  textClass = 'text-xl font-black' 
}) => {
  return (
    <div className={`flex items-center gap-2 md:gap-3 select-none ${className}`}>
      <LogoSymbol size={size} />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
          <span 
            className={`${textClass} tracking-tight font-extrabold`} 
            style={{ color: COLORS.darkTeal }}
          >
            TU NEGOCIO
          </span>
          <span 
            className={`${textClass} ml-1.5 font-bold`} 
            style={{ color: COLORS.gold }}
          >
            RD
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. LogoComplete: The complex complete branded seal with baseline subheadings.
 * Matches the uploaded PNG layout:
 * "TU NEGOCIO RD"
 * "— SOLUCIONES, SIMULADORES Y HERRAMIENTAS —"
 * "IMPUESTOS | FINANZAS | NÓMINA"
 * Extremely beautiful for welcome pages, invoices, reports, and logins.
 */
export const LogoComplete: React.FC<{ size?: number; className?: string }> = ({ 
  size = 140, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Central Emblem symbol - larger */}
      <LogoSymbol size={size} className="mb-3" />
      
      {/* Title block */}
      <div className="flex items-baseline justify-center leading-none mb-1">
        <span 
          className="text-2xl sm:text-3xl font-black tracking-tight" 
          style={{ color: COLORS.darkTeal }}
        >
          TU NEGOCIO
        </span>
        <span 
          className="text-2xl sm:text-3xl ml-1.5 font-black" 
          style={{ color: COLORS.gold }}
        >
          RD
        </span>
      </div>

      {/* Decorative subtitle with lines */}
      <div className="flex items-center justify-center w-full gap-2 sm:gap-3 mb-1 px-4 max-w-sm">
        <div className="h-[1.5px] flex-1" style={{ backgroundColor: COLORS.darkTeal }} />
        <span 
          className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.14em] whitespace-nowrap"
          style={{ color: COLORS.darkTeal }}
        >
          Soluciones, Simuladores y Herramientas
        </span>
        <div className="h-[1.5px] flex-1" style={{ backgroundColor: COLORS.darkTeal }} />
      </div>

      {/* Bottom categorization tags */}
      <div 
        className="text-[10px] font-black tracking-[0.18em] uppercase flex items-center gap-2 justify-center opacity-90 mt-1"
        style={{ color: COLORS.darkTeal }}
      >
        <span>IMPUESTOS</span>
        <span style={{ color: COLORS.gold }}>|</span>
        <span>FINANZAS</span>
        <span style={{ color: COLORS.gold }}>|</span>
        <span>NÓMINA</span>
      </div>
    </div>
  );
};
