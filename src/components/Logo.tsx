import React from 'react';

// Color Palette from actual logo image
const COLORS = {
  darkTeal: '#005556',    // Deep, professional corporate corporate teal
  lightTeal: '#0E8D82',   // Vibrant growth arrow teal
  gold: '#8B6508',        // Accessible warm gold for bars and 'RD'
};

interface LogoProps {
  className?: string;
  size?: number; // Size for the logo icon
  showText?: boolean;
}

/**
 * 1. LogoSymbol: compact brand seal optimized for header, favicon and small UI.
 * The previous mark had too many crossing shapes at small sizes, so this keeps
 * the same corporate colors while making the monogram readable.
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
      <rect
        x="10"
        y="10"
        width="140"
        height="140"
        rx="34"
        fill={COLORS.darkTeal}
      />

      <path
        d="M26 45H84V62H64V116H45V62H26V45Z"
        fill="#FFFFFF"
      />
      <path
        d="M82 45H100L121 85V45H139V116H121L100 76V116H82V45Z"
        fill="#FFFFFF"
      />

      <path
        d="M36 118C62 106 91 85 122 42"
        stroke={COLORS.gold}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M122 42H101M122 42V63"
        stroke={COLORS.gold}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 44C10 25.2223 25.2223 10 44 10H116C134.778 10 150 25.2223 150 44V116C150 134.778 134.778 150 116 150H44C25.2223 150 10 134.778 10 116V44Z"
        stroke={COLORS.lightTeal}
        strokeWidth="6"
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
