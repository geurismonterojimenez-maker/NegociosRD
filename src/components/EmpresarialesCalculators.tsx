import React, { useState, useEffect } from 'react';
import { CalculatorInfo } from '../types';
import { 
  Building, FileText, CheckCircle, Plus, Trash2, Printer, Download, Copy,
  Sparkles, ShieldAlert, Layers, HelpCircle, DollarSign, ArrowRight, BookOpen, Calculator
} from 'lucide-react';
import { 
  calculateBusinessMargins, 
  calculatePuntoEquilibrio, 
  calculateReturnOnInvestment, 
  calculateCashFlow 
} from '../lib/calculations/all_new_calculations';

interface EmpresarialesCalculatorsProps {
  calc: CalculatorInfo;
  onBack: () => void;
}

interface ItemRow {
  id: string;
  desc: string;
  qty: number;
  price: number;
}

interface InfluxRow {
  id: string;
  desc: string;
  m: number;
}

export default function EmpresarialesCalculators({ calc, onBack }: EmpresarialesCalculatorsProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states for Generators (Cotización, Recibo, Proforma, Orden, Presupuesto)
  const [empresaNombre, setEmpresaNombre] = useState('Mi Empresa Dominicana SRL');
  const [empresaRnc, setEmpresaRnc] = useState('1-31-89412-3');
  const [clienteNombre, setClienteNombre] = useState('Peralta Comercial SRL');
  const [ncfVence, setNcfVence] = useState('31-12-2026');
  const [documentNumber, setDocumentNumber] = useState('NCF-B0100000104');
  
  // Dynamic line items list
  const [lineItems, setLineItems] = useState<ItemRow[]>([
    { id: '1', desc: 'Asesoría de Negocios Mensual', qty: 1, price: 25000 },
    { id: '2', desc: 'Desarrollo de Software / Modificaciones', qty: 1, price: 45000 },
    { id: '3', desc: 'Soporte Técnico de Redes en sitio', qty: 2, price: 5000 }
  ]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(1000);

  // Form states for Business Calculations
  const [revenue, setRevenue] = useState<number>(300000);
  const [cogs, setCogs] = useState<number>(120000); // Cost of goods sold
  const [opex, setOpex] = useState<number>(45000);  // Operating Expenses

  const [fixedCosts, setFixedCosts] = useState<number>(80000);
  const [unitPrice, setUnitPrice] = useState<number>(2500);
  const [unitVariableCost, setUnitVariableCost] = useState<number>(1100);

  const [netProfitInput, setNetProfitInput] = useState<number>(150000);
  const [investmentCostInput, setInvestmentCostInput] = useState<number>(100000);

  // Cash flow lists
  const [initialCash, setInitialCash] = useState<number>(50000);
  const [inflows, setInflows] = useState<InfluxRow[]>([
    { id: '1', desc: 'Cobro de Facturas Cliente Acme', m: 95000 },
    { id: '2', desc: 'Ventas de Mostrador Oficina', m: 45000 }
  ]);
  const [outflows, setOutflows] = useState<InfluxRow[]>([
    { id: '1', desc: 'Pago de Alquiler de Local', m: 35000 },
    { id: '2', desc: 'Nómina Administrativa + TSS', m: 60000 },
    { id: '3', desc: 'Pago Factura Luz Eléctrica', m: 8500 }
  ]);

  const [newInflowDesc, setNewInflowDesc] = useState('');
  const [newInflowVal, setNewInflowVal] = useState<number>(1000);
  const [newOutflowDesc, setNewOutflowDesc] = useState('');
  const [newOutflowVal, setNewOutflowVal] = useState<number>(500);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Line item modifiers
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc) return;
    const row: ItemRow = {
      id: Date.now().toString(),
      desc: newItemDesc,
      qty: Math.max(1, newItemQty),
      price: Math.max(0, newItemPrice)
    };
    setLineItems([...lineItems, row]);
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(1000);
    showToast('Contacto/Servicio añadido al documento.');
  };

  const handleDeleteItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
    showToast('Línea eliminada del documento.');
  };

  // Cash Flow modifiers
  const handleAddInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInflowDesc) return;
    setInflows([...inflows, { id: Date.now().toString(), desc: newInflowDesc, m: newInflowVal }]);
    setNewInflowDesc('');
    setNewInflowVal(1000);
    showToast('Ingreso agregado al Flujo de Caja.');
  };

  const handleAddOutflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutflowDesc) return;
    setOutflows([...outflows, { id: Date.now().toString(), desc: newOutflowDesc, m: newOutflowVal }]);
    setNewOutflowDesc('');
    setNewOutflowVal(500);
    showToast('Egreso agregado al Flujo de Caja.');
  };

  // Sums calculations for invoices/proformas/quotes
  const documentTotals = lineItems.reduce((acc, curr) => {
    const rawSum = curr.qty * curr.price;
    const itbis = rawSum * 0.18;
    return {
      subtotal: acc.subtotal + rawSum,
      itbis: acc.itbis + itbis,
      total: acc.total + rawSum + itbis
    };
  }, { subtotal: 0, itbis: 0, total: 0 });

  // Core Math operations
  const compute = () => {
    switch (calc.id) {
      case 'margen-bruto':
      case 'margen-neto':
        return calculateBusinessMargins(revenue, cogs, opex);
      case 'punto-equilibrio':
        return calculatePuntoEquilibrio(fixedCosts, unitPrice, unitVariableCost);
      case 'roi-calc':
        return calculateReturnOnInvestment(netProfitInput, investmentCostInput);
      case 'flujo-caja':
        return calculateCashFlow(initialCash, inflows, outflows);
      default:
        return null;
    }
  };

  const mathRes = compute();

  const handleCopy = () => {
    let raw = `--- NegocioRD Documento: ${calc.name} ---\n`;
    raw += `Empresa: ${empresaNombre} (RNC: ${empresaRnc})\n`;
    raw += `Cliente: ${clienteNombre}\n`;
    raw += `NCF Número: ${documentNumber}\n`;
    raw += `Monto Global Estimado: RD$ ${documentTotals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
    navigator.clipboard.writeText(raw);
    showToast('Copiado perfectamente en el portapapeles.');
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Descripcion,Cantidad,Precio Unitario,Total Ordinario\n";
    lineItems.forEach(item => {
      csv += `"${item.desc.replace(/"/g, '""')}",${item.qty},${item.price.toFixed(2)},${(item.qty * item.price).toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NegocioRD_Negocios_${calc.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFaqs = () => {
    return [
      { q: "¿Qué estructura tiene un RNC corporativo dominicano?", a: "El RNC comercial consta de un código de 9 dígitos consecutivos iniciados comúnmente con 1 (e.g. 1-31-89412-3), bajo fiscalización del Registro de Aportantes de la DGII." },
      { q: "¿En qué consiste una Factura Proforma?", a: "Es una factura borrador de carácter puramente informativo que describe bienes y servicios, cantidades y tasas de impuestos para acordar de manera contractual las condiciones de compra antes de timbrar el comprobante fiscal definitivo." }
    ];
  };

  // Checking if the tool is actually a document builder or mathematical calculator
  const isDocGenerator = [
    'gen-cotizacion', 'gen-recibo', 'gen-proforma', 'gen-orden', 'gen-presupuesto'
  ].includes(calc.id);

  return (
    <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm print:border-none print:shadow-none animate-in fade-in duration-200">
      
      {/* Visual Toast */}
      {feedback && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#111827] text-white py-3 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg border">
          <Sparkles size={13} className="text-teal-400 rotate-12" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Column */}
        <div className="lg:col-span-5 space-y-5 print:hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-150">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Building size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Configuración de Negocios</h3>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Tácticas corporativas de RD</p>
            </div>
          </div>

          {/* Conditional layout for document generators */}
          {isDocGenerator && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la Empresa Emisora</label>
                <input
                  type="text"
                  value={empresaNombre}
                  onChange={(e) => setEmpresaNombre(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none focus:ring-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">RNC Emisor</label>
                  <input
                    type="text"
                    value={empresaRnc}
                    onChange={(e) => setEmpresaRnc(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">NCF Comprobante</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-center"
                  />
                </div>
              </div>

              <div className="border-t pt-2">
                <label className="block text-xs font-bold text-gray-750 mb-1">Nombre del Cliente Receptor</label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              {/* Dynamic Line-Item form */}
              <form onSubmit={handleAddItem} className="p-3 bg-gray-50 border rounded-xl space-y-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Agregar Línea de Detalle</span>
                <div>
                  <input
                    type="text"
                    placeholder="Descripción del servicio/artículo..."
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border rounded-lg text-xs font-semibold focus:ring-1 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase">Cantidad</label>
                    <input
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1.5 bg-white border rounded-lg text-xs font-semibold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase">Precio Unitario (RD$)</label>
                    <input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1.5 bg-white border rounded-lg text-xs font-semibold text-center"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Confirmar línea
                </button>
              </form>
            </div>
          )}

          {/* Conditional inputs for margins calculations */}
          {(calc.id === 'margen-bruto' || calc.id === 'margen-neto') && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ingresos / Ventas Mensuales (RD$)</label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Costo de Mercancía Vendida COGS (RD$)</label>
                <input
                  type="number"
                  value={cogs}
                  onChange={(e) => setCogs(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gastos Operativos OPEX (RD$)</label>
                <input
                  type="number"
                  value={opex}
                  onChange={(e) => setOpex(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {/* Point-of-even equilibrium inputs */}
          {calc.id === 'punto-equilibrio' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Costos Fijos Operativos (RD$)</label>
                <input
                  type="number"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Unitario (RD$)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cost Var Unitario (RD$)</label>
                  <input
                    type="number"
                    value={unitVariableCost}
                    onChange={(e) => setUnitVariableCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ROI inputs */}
          {calc.id === 'roi-calc' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Utilidad o Retorno Neto Generado (RD$)</label>
                <input
                  type="number"
                  value={netProfitInput}
                  onChange={(e) => setNetProfitInput(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Costo Inversión de Campaña/Infra (RD$)</label>
                <input
                  type="number"
                  value={investmentCostInput}
                  onChange={(e) => setInvestmentCostInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {/* Cash Flow dynamic lists form */}
          {calc.id === 'flujo-caja' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fondo de Caja Inicial (RD$)</label>
                <input
                  type="number"
                  value={initialCash}
                  onChange={(e) => setInitialCash(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-emerald-700"
                />
              </div>

              {/* Inflow adder */}
              <form onSubmit={handleAddInflow} className="p-3 bg-gray-50 border rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Registrar Cobro/Entrada</span>
                <input
                  type="text"
                  placeholder="Detalle del cobro..."
                  value={newInflowDesc}
                  onChange={(e) => setNewInflowDesc(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
                <input
                  type="number"
                  value={newInflowVal}
                  onChange={(e) => setNewInflowVal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2 py-1 border rounded text-xs font-semibold"
                />
                <button type="submit" className="w-full py-1 bg-emerald-700 text-white text-[10px] rounded uppercase font-bold cursor-pointer">Registrar entrada</button>
              </form>

              {/* Outflow adder */}
              <form onSubmit={handleAddOutflow} className="p-3 bg-gray-50 border rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block">Registrar Pago/Egreso</span>
                <input
                  type="text"
                  placeholder="Detalle del egreso..."
                  value={newOutflowDesc}
                  onChange={(e) => setNewOutflowDesc(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
                <input
                  type="number"
                  value={newOutflowVal}
                  onChange={(e) => setNewOutflowVal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2 py-1 border rounded text-xs font-semibold"
                />
                <button type="submit" className="w-full py-1 bg-rose-700 text-white text-[10px] rounded uppercase font-bold cursor-pointer font-sans">Registrar salida</button>
              </form>
            </div>
          )}

        </div>

        {/* Right Output Sheet segment */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Visual document (Cotización/Proforma/Recibo sheet) */}
          {isDocGenerator ? (
            <div className="bg-[#FCFCFC] border border-gray-300 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm overflow-hidden" id="print-sheet-segment">
              
              {/* Receipt Header elements */}
              <div className="flex flex-col md:flex-row md:items-start justify-between border-b pb-5 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-indigo-650 flex items-center justify-center font-bold text-white text-sm">
                      D
                    </div>
                    <span className="text-base font-bold text-[#111827]">{empresaNombre}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">RNC: {empresaRnc}</span>
                </div>
                
                <div className="text-right space-y-1 self-start md:self-auto">
                  <span className="text-xs font-bold text-indigo-600 block uppercase tracking-wider">{calc.name.replace('Generador de ', '')} Oficial</span>
                  <span className="font-mono text-[11px] font-semibold text-gray-900 block">{documentNumber}</span>
                  <span className="text-[9px] text-gray-400 block">Vence NCF: {ncfVence}</span>
                </div>
              </div>

              {/* Client specifications */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Facturado a:</span>
                  <strong className="text-gray-900 block text-xs">{clienteNombre}</strong>
                  <span className="text-gray-500 block">Santo Domingo, República Dominicana</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wider">Fecha Emisión:</span>
                  <strong className="text-gray-900 block text-xs">{new Date().toLocaleDateString('es-DO')}</strong>
                  <span className="text-[10px] text-gray-500 block font-semibold font-mono">Moneda: DOP ($)</span>
                </div>
              </div>

              {/* Dynamic spreadsheet items list */}
              <div className="border rounded-xl overflow-hidden divide-y">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFA] font-bold text-[10px] text-gray-500 uppercase tracking-wider divide-y">
                    <tr className="border-b">
                      <th className="px-3.5 py-2">Detalle del servicio / artículo</th>
                      <th className="px-3.5 py-2 text-center">Cant</th>
                      <th className="px-3.5 py-2 text-right">Precio Unit</th>
                      <th className="px-3.5 py-2 text-right">Total Neto</th>
                      <th className="px-3.5 py-2 text-center print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-semibold text-gray-700">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-3.5 py-3 text-xs text-gray-900">{item.desc}</td>
                        <td className="px-3.5 py-3 text-center font-mono">{item.qty}</td>
                        <td className="px-3.5 py-3 text-right font-mono">RD$ {item.price.toLocaleString('en-US')}</td>
                        <td className="px-3.5 py-3 text-right font-mono">RD$ {(item.qty * item.price).toLocaleString('en-US')}</td>
                        <td className="px-3.5 py-3 text-center print:hidden">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Aggregated Totals summary for receipt */}
              <div className="flex flex-col items-end pt-2 text-xs space-y-1.5 border-t">
                <div className="w-64 flex justify-between">
                  <span className="text-gray-500">Subtotal Neto:</span>
                  <span className="font-mono font-semibold text-gray-950">RD$ {documentTotals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-64 flex justify-between">
                  <span className="text-gray-500">ITBIS Soportado (18%):</span>
                  <span className="font-mono font-semibold text-gray-950">RD$ {documentTotals.itbis.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-64 flex justify-between border-t border-dashed pt-2 text-sm font-extrabold text-indigo-600">
                  <span>Total Documento:</span>
                  <span className="font-mono">RD$ {documentTotals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Footnote stamp */}
              <p className="text-[10px] text-gray-400 text-center italic mt-4 border-t pt-3">Este documento constituye una simulación corporativa emitida via NegocioRD. Libre de validez fiscal corporativa si no está debidamente sellado por la oficina del emisor.</p>

              {/* Action indicators for sheets block */}
              <div className="flex gap-2.5 pt-3 border-t print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-900 cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Printer size={13} />
                  Imprimir Comprobante
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-900 cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Download size={13} />
                  Exportar CSV
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-900 cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Copy size={13} />
                  Copiar Estructura
                </button>
              </div>

            </div>
          ) : (
            // Layout for Mathematical Margins/EvenBreak points calculators
            <div className="bg-[#FAFAFA] border rounded-2xl p-6 md:p-8 space-y-6">
              <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block flex items-center gap-1.5 border-b pb-2">
                <Sparkles size={13} className="text-indigo-600 animate-pulse" />
                Matriz de Resultado Operativo
              </span>

              {mathRes && (
                <div className="space-y-6">
                  
                  {/* Big metrics displays */}
                  <div className="text-center md:text-left py-2">
                    <span className="text-xs text-gray-500 font-semibold block">Margen o Inbound Final Obtenido</span>
                    <div className="text-3xl md:text-4xl font-extrabold text-[#111827] mt-1 font-sans">
                      {(() => {
                        if ('margenBrutoPorcentaje' in mathRes) {
                          return calc.id === 'margen-bruto' 
                            ? `${mathRes.margenBrutoPorcentaje}%`
                            : `${mathRes.margenNetoPorcentaje}%`;
                        }
                        if ('breakEvenUnits' in mathRes) return `${mathRes.breakEvenUnits.toLocaleString('en-US')} Unidades`;
                        if ('roiRatio' in mathRes) return `${mathRes.roiRatio}%`;
                        if ('endingCash' in mathRes) return `RD$ ${mathRes.endingCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                        return "0.00";
                      })()}
                    </div>
                  </div>

                  {/* Profit Margin Details Rows */}
                  <div className="border rounded-xl bg-white p-4.5 space-y-3 text-xs text-gray-650 font-medium">
                    <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block border-b pb-1.5 border-dashed">Desglose Analítico Físico</span>
                    
                    {calc.id === 'flujo-caja' && 'endingCash' in mathRes && (
                      <div className="space-y-4">
                        <div className="flex justify-between border-b pb-1"><span>Saldo Inicial en Caja:</span><span className="font-mono">RD$ {mathRes.initialCash.toLocaleString('en-US')}</span></div>
                        
                        {/* List entries of cash flow */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Ingresos de Efectivo ({inflows.length})</span>
                          {inflows.map(inf => (
                            <div key={inf.id} className="flex justify-between pl-2">
                              <span className="text-gray-500 font-normal">{inf.desc}:</span>
                              <span className="font-mono text-emerald-700">+ RD$ {inf.m.toLocaleString('en-US')}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pl-2 border-t pt-1 font-bold text-emerald-800">
                            <span>Total Entradas:</span>
                            <span>RD$ {mathRes.totalInflows.toLocaleString('en-US')}</span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block">Egresos de Efectivo ({outflows.length})</span>
                          {outflows.map(out => (
                            <div key={out.id} className="flex justify-between pl-2">
                              <span className="text-gray-500 font-normal">{out.desc}:</span>
                              <span className="font-mono text-rose-700">- RD$ {out.m.toLocaleString('en-US')}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pl-2 border-t pt-1 font-bold text-rose-800">
                            <span>Total Salidas:</span>
                            <span>RD$ {mathRes.totalOutflows.toLocaleString('en-US')}</span>
                          </div>
                        </div>

                        <div className="flex justify-between border-t pt-2 font-bold text-xs">
                          <span>Balance Mensual Neto de Efectivo:</span>
                          <span className={mathRes.netFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            RD$ {mathRes.netFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}

                    {('margenBrutoPorcentaje' in mathRes) && (calc.id === 'margen-bruto' || calc.id === 'margen-neto') && (
                      <div className="space-y-2">
                        <div className="flex justify-between"><span>Suma Ventas Totales:</span><span className="font-mono">RD$ {mathRes.revenue.toLocaleString('en-US')}</span></div>
                        <div className="flex justify-between"><span>Ganancia o Margen Bruto:</span><span className="font-mono text-emerald-600 font-bold">RD$ {mathRes.gananciaBruta.toLocaleString('en-US')}</span></div>
                        <div className="flex justify-between"><span>Porcentaje Margen Bruto:</span><span className="font-semibold text-gray-900">{mathRes.margenBrutoPorcentaje}%</span></div>
                        <div className="flex justify-between"><span>Utilidades Netas de Ejercicio:</span><span className="font-mono text-indigo-600 font-bold">RD$ {mathRes.utilidadesNetas.toLocaleString('en-US')}</span></div>
                        <div className="flex justify-between"><span>Porcentaje Margen Neto Final:</span><span className="font-semibold text-gray-900">{mathRes.margenNetoPorcentaje}%</span></div>
                      </div>
                    )}

                    {('breakEvenUnits' in mathRes) && calc.id === 'punto-equilibrio' && (
                      <div className="space-y-2">
                        <div className="flex justify-between"><span>Margen de Contribución Unitario:</span><span className="font-mono">RD$ {mathRes.marginPerUnit.toLocaleString('en-US')}</span></div>
                        <div className="flex justify-between"><span>Ventas de Equilibrio en Pesos:</span><span className="font-mono text-emerald-700 font-bold">RD$ {mathRes.breakEvenRevenue.toLocaleString('en-US')}</span></div>
                        <div className="flex justify-between"><span>Costos fijos a amortizar:</span><span className="font-mono">RD$ {mathRes.fixedCosts.toLocaleString('en-US')}</span></div>
                      </div>
                    )}

                    {/* Formula details */}
                    <div className="mt-4 pt-3 border-t text-[11px] font-normal leading-relaxed text-gray-500 flex items-start gap-1">
                      <FileText size={12} className="text-gray-400 mt-0.5 shrink-0" />
                      <p><strong>Ecuación comercial:</strong> {mathRes.formula}</p>
                    </div>

                    <div className="text-[11px] font-normal leading-relaxed text-gray-500 flex items-start gap-1">
                      <ShieldAlert size={12} className="text-gray-400 mt-0.5 shrink-0" />
                      <p><strong>Normativa Tributaria:</strong> Código Tributario de la República Dominicana.</p>
                    </div>

                  </div>
                </div>
              )}

              {/* Form document exporters */}
              <div className="flex gap-2.5 pt-2 border-t print:hidden">
                <button onClick={() => window.print()} className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-xs font-bold cursor-pointer">Imprimir Reporte</button>
              </div>

            </div>
          )}

          {/* Core FAQs for business calculators */}
          <div className="bg-white border rounded-2xl p-6">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-4">
              <HelpCircle size={15} className="text-[#0f766e]" />
              Preguntas Frecuentes Relacionadas a Emprendimientos en RD
            </h4>
            <div className="space-y-4 divide-y divide-gray-100">
              {getFaqs().map((item, index) => (
                <div key={index} className={`${index > 0 ? "pt-4.5" : ""} space-y-1`}>
                  <strong className="block text-xs font-bold text-gray-900 font-sans">¿{item.q}</strong>
                  <p className="text-xs text-gray-650 font-normal leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
