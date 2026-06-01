import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { ShieldCheck, Users, Sliders, Terminal, RefreshCw, Activity, Database, Lock, ArrowLeft, BadgeCheck, TrendingUp, Award } from 'lucide-react';
import { db } from '../lib/firebase';
import { isAdminEmail, ADMIN_EMAIL } from '../config/admin';
import { createActiveSubscriptionState, createDefaultSubscriptionState, subscriptionStateForFirestore } from '../config/subscription';
import { TAX_RATES_REGISTRY } from '../config/tax-rates';

const CALCULATOR_NAMES: Record<string, string> = {
  'salario-neto': 'Cálculo de Salario Neto',
  'itbis-calc': 'Cómputo de ITBIS / Facturas',
  'prestaciones-laborales': 'Prestaciones y Liquidación',
  'cuota-prestamo': 'Amortización de Préstamos',
  'retenciones-dgii': 'Retenciones de ISR y Terceros',
  'precio-venta': 'Precios de Venta y Margen'
};

type AdminTab = 'overview' | 'users' | 'metrics' | 'audits' | 'terminal';

interface AdminConsoleProps {
  firebaseUser: any;
  onBack: () => void;
}

export default function AdminConsole({ firebaseUser, onBack }: AdminConsoleProps) {
  const isAdmin = isAdminEmail(firebaseUser?.email);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [usersLoading, setUsersLoading] = useState(false);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [subscriptionLogs, setSubscriptionLogs] = useState<any[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [itbisFactor, setItbisFactor] = useState(18);
  const [minWageDop, setMinWageDop] = useState(23223);
  const [ncfSeed, setNcfSeed] = useState(4502);
  const [lastSync, setLastSync] = useState<string>('Nunca');

  const pushLog = (message: string) => {
    const stamp = new Date().toLocaleTimeString('es-DO');
    setTerminalLogs((prev) => [`[${stamp}] ${message}`, ...prev].slice(0, 80));
  };

  const totals = useMemo(() => {
    const proUsers = allUsers.filter((u) => u.role === 'PRO').length;
    const freeUsers = allUsers.filter((u) => u.role === 'FREE').length;
    return {
      users: allUsers.length,
      proUsers,
      freeUsers,
      usage: usageLogs.length,
      subscriptions: subscriptionLogs.length,
    };
  }, [allUsers, usageLogs.length, subscriptionLogs.length]);

  const topCalculators = useMemo(() => {
    const counts: Record<string, number> = {};
    usageLogs.forEach(log => {
      if (log.calculatorId) {
        counts[log.calculatorId] = (counts[log.calculatorId] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [usageLogs]);

  const fetchAdminData = async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    setAuditsLoading(true);
    pushLog('Sincronizando directorio, uso y auditoria...');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users: any[] = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllUsers(users);

      const usageSnap = await getDocs(collection(db, 'usageLogs'));
      const usage: any[] = usageSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      usage.sort((a, b) => new Date(String(b.timestamp || 0)).getTime() - new Date(String(a.timestamp || 0)).getTime());
      setUsageLogs(usage);

      const subSnap = await getDocs(collection(db, 'subscriptionLogs'));
      const subs: any[] = subSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      subs.sort((a, b) => new Date(String(b.timestamp || 0)).getTime() - new Date(String(a.timestamp || 0)).getTime());
      setSubscriptionLogs(subs);

      setLastSync(new Date().toLocaleString('es-DO'));
      pushLog(`Sincronizacion OK: ${users.length} usuarios, ${usage.length} usos y ${subs.length} suscripciones.`);
    } catch (err) {
      console.error(err);
      pushLog('Error sincronizando Firestore. Revisa las reglas de acceso.');
    } finally {
      setUsersLoading(false);
      setAuditsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const toggleUserRole = async (uid: string, currentRole: 'FREE' | 'PRO') => {
    const nextRole = currentRole === 'FREE' ? 'PRO' : 'FREE';
    setAllUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: nextRole } : u)));
    try {
      const nextSubscription = nextRole === 'PRO'
        ? createActiveSubscriptionState('mensual', 'admin-manual')
        : createDefaultSubscriptionState();
      await updateDoc(doc(db, 'users', uid), subscriptionStateForFirestore(nextSubscription));
      pushLog(`Rol actualizado: ${uid.slice(0, 8)}... => ${nextRole}`);
    } catch (err) {
      console.error(err);
      pushLog(`Falló la actualización del rol para ${uid.slice(0, 8)}...`);
      await fetchAdminData();
    }
  };

  const renderMetric = (label: string, value: string, accent: string) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
      <div className="text-[10px] uppercase tracking-widest font-black text-gray-400">{label}</div>
      <div className={`mt-2 text-2xl font-black ${accent}`}>{value}</div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-10 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={14} />
          Volver
        </button>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 mx-auto flex items-center justify-center text-rose-600">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-black text-gray-950">Acceso restringido</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Este módulo de administración está limitado a una sola cuenta autorizada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-8">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 md:px-8 py-6 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900">
              <ArrowLeft size={14} />
              Volver a Tu Negocio RD
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-gray-950">Administración y Backend</h1>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200">
                Privado
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-2xl">
              Consola interna para usuarios, auditorías, ajustes del simulador y control operativo. Acceso exclusivo para {ADMIN_EMAIL}.
            </p>
          </div>
          <button
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-sm"
          >
            <RefreshCw size={14} className={usersLoading || auditsLoading ? 'animate-spin' : ''} />
            Sincronizar ahora
          </button>
        </div>

        <div className="px-5 md:px-8 py-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
          {renderMetric('Usuarios', String(totals.users), 'text-[#111827]')}
          {renderMetric('PRO', String(totals.proUsers), 'text-amber-600')}
          {renderMetric('FREE', String(totals.freeUsers), 'text-gray-700')}
          {renderMetric('Uso API/UI', String(totals.usage), 'text-[#0F766E]')}
          {renderMetric('Suscripciones', String(totals.subscriptions), 'text-rose-600')}
        </div>

        <div className="px-5 md:px-8 pb-4">
          <div className="inline-flex flex-wrap items-center gap-2 p-1 bg-gray-100 rounded-2xl">
            {([
              ['overview', 'Resumen', Activity],
              ['users', 'Usuarios', Users],
              ['metrics', 'Variables', Sliders],
              ['audits', 'Auditoría', ShieldCheck],
              ['terminal', 'Terminal', Terminal],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === key ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon size={12} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 md:px-8 pb-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Core Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 p-4 bg-[#FAFAFA]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</div>
                  <div className="mt-2 text-lg font-black text-gray-950 flex items-center gap-2">
                    <BadgeCheck className="text-emerald-600" size={18} />
                    Admin activo
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Sesión iniciada como {firebaseUser?.email || ADMIN_EMAIL}.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 p-4 bg-[#FAFAFA]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Última sincronización</div>
                  <div className="mt-2 text-lg font-black text-gray-950">{lastSync}</div>
                  <p className="text-xs text-gray-500 mt-2">Usuarios, auditorías y suscripciones desde Firestore.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 p-4 bg-[#FAFAFA]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Backend</div>
                  <div className="mt-2 text-lg font-black text-gray-950 flex items-center gap-2">
                    <Database className="text-[#0F766E]" size={18} />
                    Firestore
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Reglas activas por email y UID del propietario.</p>
                </div>
              </div>

              {/* Advanced Analytics / Metrics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual conversion and MRR Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-5">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#0F766E]" />
                      Métricas de Suscripciones y Conversión (PRO)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* MRR Estimator */}
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">MRR Estimado (Recurrente)</div>
                        <div className="mt-1 text-2xl font-black text-amber-950">
                          RD$ {(totals.proUsers * 495).toLocaleString('es-DO')}
                        </div>
                        <p className="text-[10px] text-amber-600 mt-1">Cálculo dinámico basado en {totals.proUsers} usuario(s) PRO activo(s) (Tarifa mensual base: RD$ 495).</p>
                      </div>

                      {/* Conversión Ratio */}
                      <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Tasa de Conversión</div>
                        <div className="mt-1 text-2xl font-black text-teal-950">
                          {totals.users > 0 ? ((totals.proUsers / totals.users) * 100).toFixed(1) : '0.0'}%
                        </div>
                        <p className="text-[10px] text-teal-600 mt-1">Relación porcentual de suscriptores PRO sobre la base total de {totals.users} usuario(s).</p>
                      </div>
                    </div>

                    {/* Progress Bar conversions */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-gray-600">Porcentaje total de cuentas premium</span>
                        <span className="font-bold text-[#0F766E]">
                          {totals.users > 0 ? ((totals.proUsers / totals.users) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0F766E] to-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${totals.users > 0 ? Math.min((totals.proUsers / totals.users) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular tools count Column */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      <Award size={16} className="text-[#0F766E]" />
                      Herramientas más utilizadas
                    </h3>
                    
                    <div className="space-y-3">
                      {topCalculators.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400">Sin datos de uso en esta sesión.</div>
                      ) : (
                        topCalculators.map((item, index) => {
                          const totalUsageCount = usageLogs.length || 1;
                          const pct = Math.round((item.count / totalUsageCount) * 100);
                          const cleanName = CALCULATOR_NAMES[item.id] || item.id;
                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-extrabold text-gray-800 truncate max-w-[170px]">{cleanName}</span>
                                <span className="font-mono text-gray-500 text-[10px]">{item.count} usos ({pct}%)</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    index === 0 ? 'bg-[#0F766E]' : index === 1 ? 'bg-emerald-500' : index === 2 ? 'bg-amber-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">Métricas acumuladas del historial operacional de auditores y usuarios en Firestore.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Control directo de roles para cuentas registradas.</span>
                <button onClick={fetchAdminData} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 font-bold text-gray-700">
                  <RefreshCw size={10} className={usersLoading ? 'animate-spin' : ''} />
                  Sincronizar
                </button>
              </div>
              {usersLoading ? (
                <div className="py-10 text-center text-xs text-gray-400">Cargando directorio...</div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 divide-y divide-gray-100">
                  {allUsers.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400">No hay usuarios registrados.</div>
                  ) : (
                    allUsers.map((u) => (
                      <div key={u.uid} className="flex items-center justify-between gap-3 p-4 text-xs">
                        <div className="min-w-0">
                          <div className="font-black text-gray-900 truncate">{u.displayName || 'Sin nombre'}</div>
                          <div className="font-mono text-[10px] text-gray-400 truncate">{u.email}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${u.role === 'PRO' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                          <button
                            onClick={() => toggleUserRole(u.uid, u.role as 'FREE' | 'PRO')}
                            className="px-2.5 py-1 rounded-lg bg-gray-950 text-white text-[10px] font-bold"
                          >
                            {u.role === 'FREE' ? 'Habilitar PRO' : 'Bajar a FREE'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Simulator Inputs & Test Variables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 p-4 space-y-3 bg-white">
                  <h3 className="text-sm font-black text-gray-950">Ajustes visuales de prueba en consola</h3>
                  <p className="text-xs text-gray-400">Permite modular temporalmente las barras dentro del panel de administrador.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                      <span>ITBIS</span>
                      <span className="text-[#0F766E]">{itbisFactor}%</span>
                    </div>
                    <input type="range" min="1" max="30" value={itbisFactor} onChange={(e) => setItbisFactor(Number(e.target.value))} className="w-full accent-[#0F766E]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                      <span>Salario mínimo</span>
                      <span className="text-[#0F766E]">RD$ {minWageDop.toLocaleString()}</span>
                    </div>
                    <input type="range" min="11500" max="25000" step="100" value={minWageDop} onChange={(e) => setMinWageDop(Number(e.target.value))} className="w-full accent-[#0F766E]" />
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 p-4 space-y-3 bg-[#FAFAFA]">
                  <h3 className="text-sm font-black text-gray-950">Generador de Facturas y NCF</h3>
                  <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 p-3">
                    <span className="font-mono text-sm font-bold text-gray-700">B010000{ncfSeed}</span>
                    <button onClick={() => setNcfSeed((v) => v + 1)} className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-[10px] font-bold">
                      Generar siguiente
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">NCF de Crédito Fiscal (Estructura de comprobante fiscal secuencial B01 directo de la DGII).</p>
                </div>
              </div>

              {/* Static Reference Directory representing real, important data for the web */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900">Directorio Tributario, Laboral y de Seguridad Social (República Dominicana)</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Tasas oficiales integradas en la lógica computacional del sistema para los años fiscales 2024 - 2026.
                    </p>
                  </div>
                  <span className="mt-2 sm:mt-0 text-[10px] px-2.5 py-1 bg-[#0F766E]/10 rounded-full font-bold text-[#0F766E]">
                    Valores Vigentes de Ley
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Category: ITBIS */}
                  <div className="rounded-xl border border-gray-100 p-3 bg-[#FAFAFA]/50 space-y-2">
                    <h4 className="font-black text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wide text-[#0F766E]">Impuesto sobre Bienes (ITBIS)</h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">{TAX_RATES_REGISTRY.itbis.general.label}</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.itbis.general.value * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">{TAX_RATES_REGISTRY.itbis.reducida.label}</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.itbis.reducida.value * 100)}%</span>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1 leading-snug">Fuente: {TAX_RATES_REGISTRY.itbis.general.sourceName}. {TAX_RATES_REGISTRY.itbis.general.notes}</div>
                    </div>
                  </div>

                  {/* Category: TSS Empleado */}
                  <div className="rounded-xl border border-gray-100 p-3 bg-[#FAFAFA]/50 space-y-2">
                    <h4 className="font-black text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wide text-amber-700">TSS Deducciones Empleado</h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">AFP (Pensiones/Vejez)</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.tssEmpleado.afp.value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">SFS (Seguro de Salud)</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.tssEmpleado.sfs.value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1 leading-snug">Fuente: {TAX_RATES_REGISTRY.tssEmpleado.afp.sourceName}. Total deducción al sueldo bruto ordinario de {((TAX_RATES_REGISTRY.tssEmpleado.afp.value + TAX_RATES_REGISTRY.tssEmpleado.sfs.value) * 100).toFixed(2)}%.</div>
                    </div>
                  </div>

                  {/* Category: TSS Empleador */}
                  <div className="rounded-xl border border-gray-100 p-3 bg-[#FAFAFA]/50 space-y-2">
                    <h4 className="font-black text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wide text-rose-700">TSS Cargas Empleador</h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">AFP (Patronal)</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.tssEmpleador.afp.value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">SFS (Patronal)</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.tssEmpleador.sfs.value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">SRL (Riesgos Laborales)</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.tssEmpleador.srlBase.value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">INFOTEP Capacitación</span>
                        <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.tssEmpleador.infotep.value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1 leading-snug">Total recargo sobre la nómina patronal: {((TAX_RATES_REGISTRY.tssEmpleador.afp.value + TAX_RATES_REGISTRY.tssEmpleador.sfs.value + TAX_RATES_REGISTRY.tssEmpleador.srlBase.value + TAX_RATES_REGISTRY.tssEmpleador.infotep.value) * 100).toFixed(2)}%.</div>
                    </div>
                  </div>

                  {/* Category: Topes TSS */}
                  <div className="rounded-xl border border-gray-100 p-3 bg-[#FAFAFA]/50 space-y-2">
                    <h4 className="font-black text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wide text-blue-700">Topes Cotizables TSS</h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Salario Base Cotizable</span>
                        <span className="font-bold text-gray-950 font-mono">RD$ {TAX_RATES_REGISTRY.topesCotizables.salarioMinimoTSS.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Tope AFP (20 Salarios)</span>
                        <span className="font-bold text-gray-950 font-mono">RD$ {(TAX_RATES_REGISTRY.topesCotizables.salarioMinimoTSS.value * TAX_RATES_REGISTRY.topesCotizables.afpMultiplicador.value).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Tope SFS (10 Salarios)</span>
                        <span className="font-bold text-gray-950 font-mono">RD$ {(TAX_RATES_REGISTRY.topesCotizables.salarioMinimoTSS.value * TAX_RATES_REGISTRY.topesCotizables.sfsMultiplicador.value).toLocaleString()}</span>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1 leading-snug">No se deducen aportaciones sobre montos excedentes a estos topes de ley.</div>
                    </div>
                  </div>

                  {/* Category: ISR Escalas */}
                  <div className="rounded-xl border border-gray-100 p-3 bg-[#FAFAFA]/50 space-y-2 lg:col-span-2">
                    <h4 className="font-black text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wide text-[#0F766E]">Escala de Impuesto sobre la Renta (ISR Anual)</h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Tramo I: Hasta RD$ 416,220.00</span>
                        <span className="font-bold text-emerald-600 font-mono">Exento (0%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Tramo II: RD$ 416,220.01 a RD$ 624,329.00</span>
                        <span className="font-bold text-gray-950 font-mono">15% del excedente</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Tramo III: RD$ 624,329.01 a RD$ 867,123.00</span>
                        <span className="font-mono text-gray-950">RD$ 31,216 + <span className="font-bold">20% exc.</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">Tramo IV: Más de RD$ 867,123.01</span>
                        <span className="font-mono text-gray-950">RD$ 79,776 + <span className="font-bold">25% exc.</span></span>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1 leading-snug">Fuente: {TAX_RATES_REGISTRY.isrEscalasAnuales.metadata.sourceName}. {TAX_RATES_REGISTRY.isrEscalasAnuales.metadata.notes}</div>
                    </div>
                  </div>

                  {/* Category: Recargos y Factores laborables */}
                  <div className="rounded-xl border border-gray-100 p-3 bg-[#FAFAFA]/50 space-y-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-black text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wide text-rose-700">Recargos por Mora DGII</h4>
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-semibold">Primer mes o fracción</span>
                          <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.recargosDGII.primerMes.value * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-semibold">Meses subsiguientes</span>
                          <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.recargosDGII.mesesSiguientes.value * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-semibold">Interés indemnizatorio mensual</span>
                          <span className="font-bold text-gray-950 font-mono">{(TAX_RATES_REGISTRY.recargosDGII.interesIndemnizatorio.value * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 border-b border-gray-100 pb-1.5 uppercase text-[10px] tracking-wide text-[#0F766E]">Factores Laborales (Ministerio de Trabajo)</h4>
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-semibold">Factor divisor mensual</span>
                          <span className="font-bold text-gray-950 font-mono">{TAX_RATES_REGISTRY.laboralFactoresDivision.mensual.value} días</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-semibold">Factor divisor quincenal</span>
                          <span className="font-bold text-gray-950 font-mono">{TAX_RATES_REGISTRY.laboralFactoresDivision.quincenal.value} días</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-semibold">Factor divisor semanal</span>
                          <span className="font-bold text-gray-950 font-mono">{TAX_RATES_REGISTRY.laboralFactoresDivision.semanal.value} días</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-gray-950">Uso de herramientas</h3>
                  <button onClick={fetchAdminData} className="text-xs font-bold text-[#0F766E]">Sincronizar</button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {auditsLoading ? (
                    <div className="py-8 text-center text-xs text-gray-400">Cargando auditorías...</div>
                  ) : usageLogs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">Sin registros de uso todavía.</div>
                  ) : (
                    usageLogs.map((log) => (
                      <div key={log.id} className="rounded-xl border border-gray-100 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-[#0F766E]">{log.calculatorId}</span>
                          <span className="text-[10px] text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleString('es-DO') : ''}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{log.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-gray-950">Suscripciones y cambios</h3>
                  <button onClick={fetchAdminData} className="text-xs font-bold text-[#0F766E]">Sincronizar</button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {auditsLoading ? (
                    <div className="py-8 text-center text-xs text-gray-400">Cargando suscripciones...</div>
                  ) : subscriptionLogs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">Sin registros de suscripción todavía.</div>
                  ) : (
                    subscriptionLogs.map((log) => (
                      <div key={log.id} className="rounded-xl border border-gray-100 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-amber-700">{log.previousTier} → {log.newTier}</span>
                          <span className="text-[10px] text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleString('es-DO') : ''}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{log.reason || 'Sin motivo'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="rounded-2xl border border-gray-200 bg-[#0B0F19] p-4 text-[#A7F3D0] font-mono text-[10px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-gray-400">
                <span>Terminal admin - acceso privado</span>
                <button onClick={() => setTerminalLogs([])} className="text-white font-bold">Limpiar</button>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {terminalLogs.length === 0 ? (
                  <p className="text-gray-500">Sin actividad registrada.</p>
                ) : (
                  terminalLogs.map((line, idx) => <div key={idx}>{line}</div>)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
