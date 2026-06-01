import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { ShieldCheck, Users, Sliders, Terminal, RefreshCw, Activity, Database, Lock, ArrowLeft, BadgeCheck } from 'lucide-react';
import { db } from '../lib/firebase';
import { isAdminEmail, ADMIN_EMAIL } from '../config/admin';
import { createActiveSubscriptionState, createDefaultSubscriptionState, subscriptionStateForFirestore } from '../config/subscription';

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
                <h3 className="text-sm font-black text-gray-950">Variables del simulador</h3>
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
                <h3 className="text-sm font-black text-gray-950">NCF de prueba</h3>
                <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 p-3">
                  <span className="font-mono text-sm font-bold text-gray-700">B010000{ncfSeed}</span>
                  <button onClick={() => setNcfSeed((v) => v + 1)} className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white text-[10px] font-bold">
                    Generar siguiente
                  </button>
                </div>
                <p className="text-xs text-gray-500">Variables internas para pruebas visuales del backend administrativo.</p>
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
