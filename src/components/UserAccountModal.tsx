import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType,
  logUsage,
  logSubscription
} from '../lib/firebase';
import { ADMIN_EMAIL, isAdminEmail } from '../config/admin';
import { 
  X, 
  CreditCard, 
  Trash2, 
  Plus, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  Mail, 
  User as UserIcon, 
  Award, 
  Sparkles,
  DollarSign,
  ChevronDown,
  Info,
  Sliders,
  Settings,
  Users,
  Terminal,
  RefreshCw,
  TrendingUp,
  Briefcase
} from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: 'FREE' | 'PRO';
  onTierChange: (tier: 'FREE' | 'PRO') => void;
}

export interface PaymentMethodItem {
  id: string;
  cardholderName: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  createdAt?: any;
}

export default function UserAccountModal({ isOpen, onClose, userTier, onTierChange }: UserAccountModalProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cards, setCards] = useState<PaymentMethodItem[]>([]);
  const [cardsLoading, setCardsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Email / Password Form States
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);

  // New Credit Card Form States
  const [showAddCard, setShowAddCard] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex'>('visa');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Admin Panel States
  const [adminActiveTab, setAdminActiveTab] = useState<'users' | 'metrics' | 'terminal' | 'audits'>('users');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [adminLogs, setAdminLogs] = useState<string[]>([]);
  const [simulatedNcfSec, setSimulatedNcfSec] = useState<number>(4502);
  const [itbisFactor, setItbisFactor] = useState<number>(18);
  const [minWageDop, setMinWageDop] = useState<number>(19300);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [subscriptionLogs, setSubscriptionLogs] = useState<any[]>([]);
  const [auditsLoading, setAuditsLoading] = useState<boolean>(false);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Sync user profile state in Firestore as standard or PRO
        await syncUserProfile(currentUser);
        // Load saved payment methods
        await fetchPaymentMethods(currentUser.uid);

        // If the user's email is the designated admin, bootstrap backend data
        if (isAdminEmail(currentUser.email)) {
          fetchAdminData();
        }
      } else {
        setCards([]);
        setAllUsers([]);
      }
    });

    return () => unsubscribe();
  }, [userTier]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAdminLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // Sync profile document with Firestore
  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.role) {
          onTierChange(data.role as 'FREE' | 'PRO');
        }
      } else {
        // Create user record in Firestore
        const newUserPayload = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          photoURL: firebaseUser.photoURL || '',
          role: isAdminEmail(firebaseUser.email) ? 'PRO' : (userTier || 'FREE'),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newUserPayload);
        onTierChange(newUserPayload.role as 'FREE' | 'PRO');
      }
    } catch (err) {
      console.error("Error fetching or syncing user details in Firestore:", err);
    }
  };

  // Fetch payment methods collection
  const fetchPaymentMethods = async (uid: string) => {
    setCardsLoading(true);
    const colPath = `users/${uid}/paymentMethods`;
    try {
      const qSnap = await getDocs(collection(db, colPath));
      const fetchedCards: PaymentMethodItem[] = [];
      qSnap.forEach((doc) => {
        fetchedCards.push({
          id: doc.id,
          ...doc.data()
        } as PaymentMethodItem);
      });
      setCards(fetchedCards);
    } catch (err) {
      console.error("Error reading cards:", err);
    } finally {
      setCardsLoading(false);
    }
  };

  // Fetch Admin user directory
  const fetchAdminData = async () => {
    if (!auth.currentUser || !isAdminEmail(auth.currentUser.email)) return;
    setUsersLoading(true);
    setAuditsLoading(true);
    addLog("Inicializando conexión con directorio administrativo de usuarios...");
    try {
      const qSnap = await getDocs(collection(db, 'users'));
      const fetchedList: any[] = [];
      qSnap.forEach((doc) => {
        fetchedList.push(doc.data());
      });
      setAllUsers(fetchedList);
      addLog(`Éxito: Se obtuvieron ${fetchedList.length} cuentas de usuario registradas.`);
    } catch (err) {
      console.error("Admin fetch directory failed:", err);
      addLog("Fallo crítico: No se pudo obtener el listado por políticas de Firebase.");
    } finally {
      setUsersLoading(false);
    }

    try {
      addLog("Cargando logs de uso de herramientas (usageLogs)...");
      const usageSnap = await getDocs(collection(db, 'usageLogs'));
      const fetchedUsage: any[] = [];
      usageSnap.forEach((doc) => {
        fetchedUsage.push({ id: doc.id, ...doc.data() });
      });
      fetchedUsage.sort((a, b) => {
        const tA = (a.timestamp && a.timestamp.seconds) || 0;
        const tB = (b.timestamp && b.timestamp.seconds) || 0;
        return tB - tA;
      });
      setUsageLogs(fetchedUsage);

      addLog("Cargando logs de suscripciones (subscriptionLogs)...");
      const subSnap = await getDocs(collection(db, 'subscriptionLogs'));
      const fetchedSubs: any[] = [];
      subSnap.forEach((doc) => {
        fetchedSubs.push({ id: doc.id, ...doc.data() });
      });
      fetchedSubs.sort((a, b) => {
        const tA = (a.timestamp && a.timestamp.seconds) || 0;
        const tB = (b.timestamp && b.timestamp.seconds) || 0;
        return tB - tA;
      });
      setSubscriptionLogs(fetchedSubs);
      addLog(`Éxito auditoría: Carga de registros finalizada.`);
    } catch (err) {
      console.error("Audit logs fetch failed:", err);
      addLog("Fallo de auditoría: No se pudo obtener la bitácora de uso / suscripción.");
    } finally {
      setAuditsLoading(false);
    }
  };

  // Switch any user's role directly from Admin Console
  const handleToggleUserRole = async (targetUid: string, currentRole: 'FREE' | 'PRO') => {
    const nextRole = currentRole === 'FREE' ? 'PRO' : 'FREE';
    addLog(`Enviando actualización de rol para usuario: [${targetUid}] -> [${nextRole}]`);
    
    // Optimistic UI updates
    setAllUsers(prev => prev.map(u => u.uid === targetUid ? { ...u, role: nextRole } : u));
    
    try {
      const userDocRef = doc(db, 'users', targetUid);
      await updateDoc(userDocRef, {
        role: nextRole,
        updatedAt: new Date().toISOString()
      });
      addLog(`Confirmado: Mutación aplicada en Firestore para ${targetUid}.`);
      triggerToast(`Rol actualizado a ${nextRole} exitosamente.`);
      await logSubscription(currentRole, nextRole, `Modificación manual desde panel por correo administrador. Target UID: ${targetUid}`);
      
      // If updating our self, trigger local state mutation
      if (targetUid === user?.uid) {
        onTierChange(nextRole);
      }
    } catch (err) {
      addLog(`Error de escritura Firestore en actualización de rol: ${err instanceof Error ? err.message : String(err)}`);
      // Revert optimistic updates
      setAllUsers(prev => prev.map(u => u.uid === targetUid ? { ...u, role: currentRole } : u));
      alert("Error al actualizar rol del usuario.");
    }
  };

  // Google popup sign-in
  const handleGoogleSignIn = async () => {
    setActionLoading(true);
    setCredentialsError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      triggerToast(`¡Bienvenido, ${result.user.displayName || 'usuario'}!`);
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setCredentialsError("Surgió un error con el inicio de sesión con Google. Inténtalo de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  // Action Email and Password authentication (Login / Signup)
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError(null);
    if (!authEmail.trim() || !authPassword.trim()) {
      setCredentialsError("Por favor, llena todos los campos solicitados.");
      return;
    }
    if (isRegisterMode && !authName.trim()) {
      setCredentialsError("El nombre es requerido para crear una cuenta.");
      return;
    }

    setActionLoading(true);
    try {
      if (isRegisterMode) {
        // Register flow
        const credentials = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(credentials.user, {
          displayName: authName
        });
        
        // Save initial user profile in Firestore
        const newUserPayload = {
          uid: credentials.user.uid,
          email: credentials.user.email || '',
          displayName: authName,
          photoURL: '',
          role: isAdminEmail(credentials.user.email) ? 'PRO' : 'FREE',
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', credentials.user.uid), newUserPayload);
        
        triggerToast("¡Tu cuenta ha sido creada exitosamente!");
        setIsRegisterMode(false);
      } else {
        // Login flow
        const credentials = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        triggerToast(`Sesión iniciada como: ${credentials.user.displayName || credentials.user.email}`);
      }
    } catch (err: any) {
      console.error("Authorization Error:", err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setCredentialsError("Credenciales incorrectas. Verifica el correo e inténtalo de nuevo.");
      } else if (err.code === 'auth/email-already-in-use') {
        setCredentialsError("Este correo electrónico ya se encuentra registrado.");
      } else if (err.code === 'auth/weak-password') {
        setCredentialsError("La contraseña provista debe contener al menos 6 caracteres.");
      } else if (err.code === 'auth/invalid-email') {
        setCredentialsError("Escribe un correo electrónico que tenga formato válido.");
      } else {
        setCredentialsError(err.message || "Error al autenticar con el servidor de seguridad.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Log Out
  const handleSignOut = async () => {
    setActionLoading(true);
    try {
      await signOut(auth);
      triggerToast("Sesión cerrada correctamente.");
      onClose();
    } catch (err) {
      console.error("Log Out error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Upgrades role to PRO in Firestore
  const handleUpgradeToPro = async (cardId: string) => {
    if (!user) return;
    setActionLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        role: 'PRO',
        updatedAt: new Date().toISOString()
      });
      onTierChange('PRO');
      triggerToast("¡Felicidades! Tu Licencia PRO de NegocioRD ha sido activada.");
      await logSubscription('FREE', 'PRO', 'Actualización de licencia mediante simulación de datos de tarjeta.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel / revert subscription demo
  const handleCancelSubscription = async () => {
    if (!user) return;
    setActionLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        role: 'FREE',
        updatedAt: new Date().toISOString()
      });
      onTierChange('FREE');
      triggerToast("Suscripción cambiada a versión Gratuita (Free) exitosamente.");
      await logSubscription('PRO', 'FREE', 'Remoción voluntaria o baja de suscripción solicitada.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Formatter card input details
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value.replace(/\s?/g, '').replace(/\D/g, '');
    let formattedVal = '';
    
    for (let i = 0; i < inputVal.length; i++) {
      if (i > 0 && i % 4 === 0) formattedVal += ' ';
      formattedVal += inputVal[i];
    }
    
    if (formattedVal.length <= 19) {
      setCardNumber(formattedVal);
      if (inputVal.startsWith('4')) {
        setCardBrand('visa');
      } else if (inputVal.startsWith('5')) {
        setCardBrand('mastercard');
      } else if (inputVal.startsWith('3')) {
        setCardBrand('amex');
      }
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value.replace(/\s?/g, '').replace(/\D/g, '');
    if (inputVal.length > 4) return;
    
    if (inputVal.length >= 2) {
      inputVal = inputVal.substring(0, 2) + '/' + inputVal.substring(2);
    }
    setCardExpiry(inputVal);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);

    const matchDigits = cardNumber.replace(/\D/g, '');
    if (matchDigits.length < 15) {
      setFormError('Número de tarjeta inválido (mínimo 15-16 dígitos).');
      return;
    }
    if (!cardName.trim()) {
      setFormError('Introduce el nombre del tarjetahabiente.');
      return;
    }
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setFormError('Introduce una fecha de expiración válida (MM/YY).');
      return;
    }
    if (cardCvv.length < 3) {
      setFormError('Introduce un código CVV válido.');
      return;
    }

    const cardId = 'card_' + Date.now().toString(36);
    const methodPath = `users/${user.uid}/paymentMethods/${cardId}`;
    
    const newCardPayload = {
      id: cardId,
      cardholderName: cardName,
      brand: cardBrand,
      last4: matchDigits.slice(-4),
      expiry: cardExpiry,
      createdAt: new Date().toISOString()
    };

    setActionLoading(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/paymentMethods`, cardId), newCardPayload);
      triggerToast('Tarjeta de pago guardada de forma segura.');
      
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvv('');
      setShowAddCard(false);
      
      await fetchPaymentMethods(user.uid);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, methodPath);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    
    setActionLoading(true);
    const methodPath = `users/${user.uid}/paymentMethods/${cardId}`;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/paymentMethods`, cardId));
      triggerToast('Tarjeta eliminada correctamente.');
      await fetchPaymentMethods(user.uid);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, methodPath);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateFakeNCF = () => {
    const nextNcf = simulatedNcfSec + 1;
    setSimulatedNcfSec(nextNcf);
    const ncf = `B010000${nextNcf}`;
    addLog(`NCF Fiscal Emitido de forma simulada: [${ncf}] para módulo prestador.`);
    triggerToast(`NCF Generado: ${ncf}`);
  };

  if (!isOpen) return null;

  const isAdminUser = isAdminEmail(user?.email);

  return (
    <div className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Toast alert system localized in popup */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0F766E] border-l-4 border-emerald-400 text-white px-5 py-3.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>🛡️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-150 p-6 md:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150" id="account-portal">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-200 text-lg">
            🏢
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#111827]">Portal Seguro NegocioRD</h3>
            <p className="text-xs text-gray-400">Autenticación Firebase & Consola Integrada de Pagos</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 font-semibold">Cargando base de datos segura de NegocioRD...</p>
          </div>
        ) : !user ? (
          /* --- EXQUISITE DUAL SIGN IN PANELS (EMAIL/PASSWORD + GOOGLE) --- */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4">
            
            {/* COLUMN A: EMAIL & PASSWORD ACCESS WITH LIVE MODE MUTATOR */}
            <div className="md:col-span-12 lg:col-span-7 space-y-5 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h4 className="font-extrabold text-sm text-gray-800 tracking-tight">
                  {isRegisterMode ? 'Crear Cuenta Profesional' : 'Ingreso por Correo Electrónico'}
                </h4>
                <button
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setCredentialsError(null);
                  }}
                  className="text-xs font-bold text-[#0F766E] hover:underline"
                >
                  {isRegisterMode ? '¿Ya tienes cuenta? Ingresa' : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>

              <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                {credentialsError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-semibold border border-red-100 leading-relaxed">
                    ⚠️ {credentialsError}
                  </div>
                )}

                {isRegisterMode && (
                  <div className="space-y-1">
                    <label htmlFor="auth-register-name" className="text-xs font-bold text-gray-500">Nombre Completo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400 text-xs">👤</span>
                      <input 
                        id="auth-register-name"
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ej. Jeuri Perdomo"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pl-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="auth-login-email" className="text-xs font-bold text-gray-500">Correo Electrónico</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-xs">✉️</span>
                    <input 
                      id="auth-login-email"
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="ejemplo@negociord.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pl-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="auth-login-password" className="text-xs font-bold text-gray-500">Contraseña de Seguridad</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-xs">🔒</span>
                    <input 
                      id="auth-login-password"
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pl-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3 bg-[#0F766E] hover:bg-opacity-95 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs transform active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Verificando con Firebase...' : (isRegisterMode ? '✨ Completar Registro Gratuito' : '🔒 Iniciar Sesión de forma Segura')}
                </button>
              </form>

              {/* Special Tip for direct Admin Auto-Open */}
              <div className="bg-amber-50 text-amber-900 text-[10px] p-2.5 rounded-xl border border-amber-200 leading-normal flex gap-1.5 font-sans">
                <span>🔐</span>
                <span>
                  <strong>Tip de Acceso:</strong> Si inicias sesión con la cuenta administradora autorizada se habilitará al instante el panel de control administrativo y backend de la plataforma con herramientas interactivas.
                </span>
              </div>
            </div>

            {/* COLUMN B: FAST SOCIAL SIGN IN */}
            <div className="md:col-span-12 lg:col-span-5 border-t lg:border-t-0 lg:border-l border-gray-150 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-center space-y-5 text-center">
              <div>
                <span className="px-3 py-1 bg-teal-50 text-[#0F766E] text-[10px] font-black rounded-full uppercase tracking-wider inline-block mb-2 border border-teal-100">
                  Acceso en un Clic
                </span>
                <h5 className="text-xs font-black text-gray-700">¿Prefieres tu cuenta de Google?</h5>
                <p className="text-[10px] text-gray-450 mt-1 leading-normal">
                  Sincroniza tus datos de inmediato sin memorizar contraseñas adicionales.
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={actionLoading}
                className="w-full py-3 px-4 border-2 border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 rounded-xl font-bold text-xs text-gray-800 flex items-center justify-center gap-3.5 cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google Logo" 
                  className="w-5 h-5 pointer-events-none"
                />
                <span>Entrar con Google</span>
              </button>

              <div className="flex justify-center items-center gap-1.5 text-[9px] text-gray-400">
                <ShieldCheck size={12} className="text-[#0F766E]" />
                <span>Encriptado de datos SSL de Google Cloud</span>
              </div>
            </div>

          </div>
        ) : (
          /* --- BRAND NEW COMPREHENSIVE VIEW: LOGGED IN USER STATE --- */
          <div className="space-y-6">
            
            {/* User Profile Banner */}
            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between text-left">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Photo avatar" 
                    className="w-12 h-12 rounded-full border-2 border-[#0F766E]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-lg font-bold uppercase">
                    {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : 'U')}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-[#111827]">{user.displayName || 'Usuario Digital'}</h4>
                    {isAdminUser && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-black rounded-md uppercase tracking-wider">
                        ⚡ ADMINISTRADOR
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Mail size={12} />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              {/* License Level Banner */}
              <div className="text-center sm:text-right">
                {userTier === 'PRO' ? (
                  <div className="flex flex-col items-center sm:items-end gap-1">
                    <span className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ring-2 ring-amber-300">
                      💎 Licencia PRO Activa
                    </span>
                    <button 
                      onClick={handleCancelSubscription}
                      className="text-[9px] text-gray-400 underline hover:text-red-500 mt-1 cursor-pointer"
                      title="Volver a versión gratuita para probar límites"
                    >
                      Bajar a Plan Gratuito (Demo)
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center sm:items-end gap-1">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Licencia Básica Gratuita
                    </span>
                    <button
                      onClick={() => setShowAddCard(true)}
                      className="text-[10px] text-[#0F766E] font-bold hover:underline"
                    >
                      Registrar tarjeta simulada para ser PRO
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- CORE SECTOR FOR ADMIN: DETECTED ADMIN EXCLUSIVE ACCESS BACKEND --- */}
            {isAdminUser ? (
              <div className="border-2 border-dashed border-rose-200 rounded-3xl p-5 bg-rose-50/10 space-y-4">
                
                {/* Admin Title Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-left gap-2 border-b border-rose-100 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 bg-rose-600 text-white font-black text-[9px] rounded-md uppercase tracking-widest inline-block animate-pulse mb-1">
                      DIRECT BACKEND CONSOLE LIVE
                    </span>
                    <h4 className="font-extrabold text-sm text-gray-900">Control de Datos de República Dominicana</h4>
                  </div>
                  
                  {/* Tabs Selector for Admin Control */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setAdminActiveTab('users')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        adminActiveTab === 'users' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Users size={12} />
                      <span>Usuarios ({allUsers.length})</span>
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('metrics')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        adminActiveTab === 'metrics' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Sliders size={12} />
                      <span>Variables Grales</span>
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('audits')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        adminActiveTab === 'audits' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <ShieldCheck size={12} />
                      <span>Auditoría ({usageLogs.length + subscriptionLogs.length})</span>
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('terminal')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        adminActiveTab === 'terminal' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Terminal size={12} />
                      <span>Terminal ({adminLogs.length})</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: USER ACCOUNT ACCESS MANAGEMENT */}
                {adminActiveTab === 'users' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
                      <span>Acceso directo para promover a PRO o revertir acceso de forma inmediata:</span>
                      <button 
                        onClick={fetchAdminData}
                        className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <RefreshCw size={10} className={usersLoading ? "animate-spin" : ""} />
                        <span>Sincronizar DB</span>
                      </button>
                    </div>

                    {usersLoading ? (
                      <div className="py-12 text-center text-xs text-gray-400">
                        Actualizando directorio de usuarios fiscales...
                      </div>
                    ) : allUsers.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400 font-sans">
                        No hay usuarios adicionales registrados en esta región Firestore.
                      </div>
                    ) : (
                      <div className="border border-gray-150 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-gray-105 text-left bg-white">
                        {allUsers.map((u) => (
                          <div key={u.uid} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50 font-semibold">
                            <div className="space-y-0.5 max-w-[70%]">
                              <span className="font-extrabold text-gray-800 break-words block">{u.displayName || 'Anon'} (ID: {u.uid.slice(0, 6)}...)</span>
                              <span className="font-mono text-[10px] text-gray-450 block">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                u.role === 'PRO' ? 'bg-amber-100 text-amber-700' : 'bg-gray-150 text-gray-600'
                              }`}>
                                {u.role}
                              </span>
                              <button
                                onClick={() => handleToggleUserRole(u.uid, u.role as 'FREE' | 'PRO')}
                                className="px-2.5 py-1 bg-gray-900 text-white rounded text-[10px] hover:bg-stone-800 cursor-pointer active:scale-95 transition-all"
                              >
                                {u.role === 'FREE' ? 'Habilitar PRO' : 'Restringir Gral'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: GENERAL VARIABLES & DGII MOCK NCF SEQUENCER */}
                {adminActiveTab === 'metrics' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-sans">
                    <div className="bg-white rounded-xl border border-gray-150 p-3.5 space-y-3">
                      <h5 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border-b pb-1.5">
                        <span>📋</span> 
                        <span>NCF Dominicana (Ficticio)</span>
                      </h5>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        Controla el secuenciador simulado de Números de Comprobante Fiscal (Comprobantes de Crédito Fiscal):
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 p-2 rounded-lg font-mono text-xs font-bold text-gray-700">
                          B010000{simulatedNcfSec}
                        </span>
                        <button
                          onClick={handleGenerateFakeNCF}
                          className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-[10px] font-bold hover:bg-opacity-90 cursor-pointer active:scale-95"
                        >
                          Generar Siguiente NCF
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-150 p-3.5 space-y-3.5">
                      <h5 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 border-b pb-1.5">
                        <span>⚙️</span> 
                        <span>Ajustes Generales del Simulador</span>
                      </h5>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                          <span>ITBIS Actual:</span>
                          <span className="text-[#0F766E] font-bold">{itbisFactor}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          value={itbisFactor}
                          aria-label="Factor de ITBIS actual"
                          onChange={(e) => {
                            setItbisFactor(Number(e.target.value));
                            addLog(`Configuración de sesión: Variación de factor ITBIS establecido en ${e.target.value}%.`);
                          }}
                          className="w-full accent-[#0F766E]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                          <span>Salario Mínimo Nacional Promedio:</span>
                          <span className="text-[#0F766E] font-bold">RD$ {minWageDop.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="11500" 
                          max="25000" 
                          step="100" 
                          value={minWageDop}
                          aria-label="Salario Mínimo Nacional Promedio de Referencia"
                          onChange={(e) => {
                            setMinWageDop(Number(e.target.value));
                            addLog(`Configuración laboral: Salario mínimo nacional mutado a RD$ ${Number(e.target.value).toLocaleString()}`);
                          }}
                          className="w-full accent-[#0F766E]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SYSTEM CONSOLE STREAM (TERMINAL FEED) */}
                {adminActiveTab === 'terminal' && (
                  <div className="bg-[#0B0F19] rounded-xl p-3.5 border border-stone-800 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-800 text-[10px] text-stone-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        <span>Terminal Activa: {ADMIN_EMAIL}</span>
                      </span>
                      <button 
                        onClick={() => { setAdminLogs([]); triggerToast("Consola Limpiada"); }}
                        className="hover:text-stone-300 font-bold"
                      >
                        Limpiar feed
                      </button>
                    </div>
                    <div className="h-36 overflow-y-auto mt-2 font-mono text-[9px] text-[#A7F3D0] space-y-1.5">
                      {adminLogs.length === 0 ? (
                        <p className="text-stone-500">No hay registros de transacciones para la sesión actual.</p>
                      ) : (
                        adminLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: AUDIT LOGS TRAIL */}
                {adminActiveTab === 'audits' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
                      <span className="text-gray-500 font-sans">Bitácora en tiempo real de operaciones de la plataforma (Firestore DB):</span>
                      <button 
                        type="button"
                        onClick={fetchAdminData}
                        className="p-1 px-2.5 bg-gray-150 hover:bg-gray-200 rounded-lg font-bold text-gray-700 flex items-center gap-1 cursor-pointer active:scale-95 self-end"
                      >
                        <RefreshCw size={10} className={auditsLoading ? "animate-spin" : ""} />
                        <span>Sincronizar Bitácora</span>
                      </button>
                    </div>

                    {auditsLoading ? (
                      <div className="py-12 text-center text-xs text-gray-400">
                        Sincronizando auditorías desde Firestore...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
                        
                        {/* Column Left: Tool Usage Audit Trail */}
                        <div className="space-y-2.5 bg-white border border-gray-150 p-3.5 rounded-2xl">
                          <h5 className="text-xs font-black text-[#0f766e] flex items-center gap-1.5 border-b pb-2">
                            <span>📊</span>
                            <span>Uso de Calculadoras y Herramientas ({usageLogs.length})</span>
                          </h5>

                          <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-gray-105 pr-1">
                            {usageLogs.length === 0 ? (
                              <p className="text-[10px] text-gray-400 text-center py-8 font-sans">No se han registrado auditorías de herramientas aún.</p>
                            ) : (
                              usageLogs.map((log) => (
                                <div key={log.id} className="pt-2 text-[10px] space-y-1">
                                  <div className="flex justify-between items-start">
                                    <span className="font-extrabold text-gray-800 uppercase px-1.5 py-0.5 bg-sky-50 text-sky-800 rounded">
                                      {log.calculatorId}
                                    </span>
                                    <span className="text-[8px] text-gray-400 font-mono">
                                      {log.timestamp ? new Date(log.timestamp).toLocaleString('es-DO') : ''}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 font-medium leading-relaxed font-sans">{log.description}</p>
                                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono pt-0.5">
                                    <span className="truncate max-w-[140px]" title={log.uid}>User: {log.uid ? log.uid.slice(0, 8) : 'Anónimo'}...</span>
                                    <span className="truncate max-w-[120px]" title={log.email}>{log.email || 'Invitado'}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Column Right: Subscription Logs Audit Trail */}
                        <div className="space-y-2.5 bg-white border border-gray-150 p-3.5 rounded-2xl">
                          <h5 className="text-xs font-black text-rose-700 flex items-center gap-1.5 border-b pb-2">
                            <span>💎</span>
                            <span>Suscripciones y Licencias ({subscriptionLogs.length})</span>
                          </h5>

                          <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-gray-105 pr-1">
                            {subscriptionLogs.length === 0 ? (
                              <p className="text-[10px] text-gray-400 text-center py-8 font-sans">No se han registrado auditorías de suscripciones.</p>
                            ) : (
                              subscriptionLogs.map((log) => (
                                <div key={log.id} className="pt-2 text-[10px] space-y-1">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-1">
                                      <span className="font-extrabold text-gray-500 line-through bg-gray-50 px-1 py-0.5 rounded text-[8px]">
                                        {log.previousTier}
                                      </span>
                                      <span className="text-gray-400">&rarr;</span>
                                      <span className="font-extrabold text-amber-700 bg-amber-50 px-1 py-0.5 rounded text-[8px]">
                                        {log.newTier}
                                      </span>
                                    </div>
                                    <span className="text-[8px] text-gray-400 font-mono">
                                      {log.timestamp ? new Date(log.timestamp).toLocaleString('es-DO') : ''}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 font-medium leading-relaxed font-sans">{log.reason || 'Sin causa descrita'}</p>
                                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono pt-0.5">
                                    <span className="truncate max-w-[140px]" title={log.uid}>User: {log.uid ? log.uid.slice(0, 8) : 'Anónimo'}...</span>
                                    <span className="truncate max-w-[120px]" title={log.email}>{log.email || 'Invitado'}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : null}

            {/* --- COMPONENT SECTOR: WALLET (TARJETAS VINCULADAS) --- */}
            <div className="border border-gray-150 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <CreditCard size={18} className="text-[#0F766E]" />
                  <h4 className="font-extrabold text-sm text-[#111827]">Mis Hojas de Tarjetas</h4>
                </div>
                {!showAddCard && (
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="px-3 py-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Registrar Tarjeta</span>
                  </button>
                )}
              </div>

              {/* CREDIT CARD INTERACTIVE FORM */}
              {showAddCard && (
                <div className="bg-gray-50 rounded-2xl border border-gray-150 p-4 md:p-6 space-y-5 relative animate-in slide-in-from-top-4 duration-250">
                  <button 
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xs font-semibold underline cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-left">Ingresa un nuevo método de pago simulado</h5>

                  {/* INTERACTIVE FLIPPABLE CREDIT CARD */}
                  <div className="max-w-[340px] mx-auto perspective-1000 mb-6 font-mono">
                    <div 
                      className={`relative w-full h-[190px] rounded-2xl transition-transform duration-700 transform-style-3d shadow-2xl cursor-pointer select-none hover:scale-105 active:scale-95 ${
                        isFlipped ? 'rotate-y-180' : ''
                      } bg-gradient-to-br ${
                        cardBrand === 'visa' 
                          ? 'from-[#0F172A] via-[#1E293B] to-[#334155]' 
                          : cardBrand === 'mastercard' 
                          ? 'from-[#1E1E1E] via-[#2D2D30] to-[#434447]' 
                          : 'from-[#022C22] via-[#064E3B] to-[#0F766E]'
                      } text-white p-6 border border-white/10`}
                      onClick={() => setIsFlipped(!isFlipped)}
                      title="Haz clic para dar la vuelta a la tarjeta virtual"
                    >
                      {/* FRONT CARD SIDE */}
                      <div className="absolute inset-0 backface-hidden p-6 flex flex-col justify-between rounded-2xl overflow-hidden">
                        {/* Elegant background texture glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

                        <div className="flex justify-between items-start">
                          {/* Tactile Metallic Chip Container */}
                          <div className="relative w-11 h-8 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-md border border-amber-600/30 shadow-inner flex flex-col justify-between p-1.5 overflow-hidden">
                            {/* Chip details lines simulating contacts */}
                            <div className="w-full h-[1px] bg-amber-800/30" />
                            <div className="w-full h-[1px] bg-amber-800/30" />
                            <div className="w-full h-full flex justify-between absolute inset-0 px-2 py-1 pointer-events-none">
                              <div className="w-[1px] h-full bg-amber-800/25" />
                              <div className="w-[1px] h-full bg-amber-800/25" />
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest block font-sans">
                              {userTier === 'PRO' ? '✦ PRO MEMBER' : '✦ VIP ACCESS'}
                            </span>
                            <span className="text-xs font-black uppercase italic tracking-widest mt-0.5">
                              {cardBrand === 'visa' ? 'VISA PREMIUM' : cardBrand === 'mastercard' ? 'MC BLACK' : 'AMEX LITE'}
                            </span>
                          </div>
                        </div>

                        {/* Card Number spacing */}
                        <div className="text-xl tracking-[0.18em] text-center py-2 font-semibold text-gray-100 drop-shadow-md">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="text-left">
                            <span className="text-[7px] text-gray-400 block uppercase font-sans tracking-wider">Tarjetahabiente</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px] block text-white">
                              {cardName || 'JUAN PÉREZ'}
                            </span>
                          </div>
                          <div className="flex items-end gap-3.5">
                            <div className="text-right">
                              <span className="text-[7px] text-gray-400 block uppercase font-sans tracking-wider">Expira</span>
                              <span className="text-[11px] font-semibold tracking-wider block font-sans text-gray-200">
                                {cardExpiry || 'MM/YY'}
                              </span>
                            </div>
                            
                            {/* Shiny Hologram Sticker Element */}
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 opacity-80 border border-white/20 animate-pulse pointer-events-none shadow-sm" />
                          </div>
                        </div>
                      </div>

                      {/* BACK CARD SIDE */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 flex flex-col justify-between border border-white/10 overflow-hidden">
                        <div className="absolute -inset-0 bg-radial from-transparent to-black/20 pointer-events-none" />
                        
                        {/* Magnetic Strip */}
                        <div className="w-full h-10 bg-gray-950 absolute left-0 top-6" />
                        
                        <div className="mt-12">
                          <div className="flex items-center justify-between border border-white/15 p-2 rounded-lg bg-white/5">
                            <span className="text-[8px] text-gray-400 font-sans tracking-wide">Firma Autorizada</span>
                            <div className="bg-amber-50 text-gray-900 font-bold italic px-3 py-1 rounded shadow-inner text-xs tracking-wider">
                              CVV: {cardCvv || '•••'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-[7px] text-gray-400 leading-normal text-left font-sans pt-2 border-t border-white/5 flex gap-1">
                          <span>🔔</span>
                          <p>Módulo de pago de simulación segura de NegocioRD. Ningún cobro real es aplicado. Versión de demostración premium.</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-450 text-center block mt-2 font-sans font-medium">
                      💡 Toca la tarjeta digital para rotarla y ver el CVV.
                    </span>
                  </div>

                  {/* FORM FIELDS FOR CARD REGISTRY */}
                  <form onSubmit={handleSaveCard} className="space-y-4">
                    {formError && (
                      <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-lg font-bold text-left">
                        ⚠️ {formError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div>
                        <label htmlFor="card-name-input" className="block text-xs font-bold text-gray-500 mb-1">Nombre en Tarjeta</label>
                        <input 
                          id="card-name-input"
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Nombre tarjetahabiente"
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="card-number-input" className="block text-xs font-bold text-gray-500 mb-1">Número de Tarjeta</label>
                        <div className="relative">
                          <input 
                            id="card-number-input"
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4000 1234 5678 9010"
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none"
                            required
                          />
                          <span className="absolute right-3.5 top-3.5 text-[9px] font-black text-gray-400 uppercase font-sans">
                            {cardBrand}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                        <label htmlFor="card-expiry-input" className="block text-xs font-bold text-gray-500 mb-1 font-sans">Expira (MM/YY)</label>
                        <input 
                          id="card-expiry-input"
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="12/28"
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="card-cvv-input" className="block text-xs font-bold text-gray-500 mb-1">Código CVV</label>
                        <input 
                          id="card-cvv-input"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                            setCardCvv(val);
                          }}
                          onFocus={() => setIsFlipped(true)}
                          onBlur={() => setIsFlipped(false)}
                          placeholder="•••"
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-[#0F766E] hover:bg-opacity-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs disabled:opacity-50"
                    >
                      {actionLoading ? 'Guardando...' : '💾 Registrar Tarjeta Simulada'}
                    </button>
                  </form>
                </div>
              )}

              {/* LIST OF SAVED CARDS WITH AUTO-UPGRADE LINKS */}
              {cardsLoading ? (
                <div className="py-8 text-center text-xs text-gray-400 font-sans">
                  Obteniendo tarjetas guardadas en servidor...
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-150 space-y-2">
                  <span className="text-3xl text-gray-300 block">💳</span>
                  <p className="text-xs font-bold text-gray-650 font-sans">No tienes tarjetas de pago registradas</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mx-auto font-sans">
                    Inserta una tarjeta de crédito o débito simulada de prueba para experimentar el flujo de cobros, y habilitar la suscripción de Licencia PRO.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 font-mono">
                  {cards.map((card) => (
                    <div key={card.id} className="py-3 flex items-center justify-between font-semibold text-xs text-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-base text-left">
                          {card.brand === 'visa' ? '💳 VISA' : card.brand === 'mastercard' ? '💳 M.C' : '💳 AMEX'}
                        </span>
                        <div className="text-left font-sans">
                          <span className="font-mono text-gray-800">•••• •••• •••• {card.last4}</span>
                          <span className="text-[9px] text-gray-400 block font-sans leading-normal">
                            Expira {card.expiry} — Tarjetahabiente: <strong className="uppercase font-mono">{card.cardholderName}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-sans">
                        {userTier === 'FREE' && (
                          <button
                            onClick={() => handleUpgradeToPro(card.id)}
                            disabled={actionLoading}
                            className="bg-amber-500 hover:bg-amber-600 font-bold text-[9px] text-white px-2.5 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs"
                          >
                            <span>💎</span>
                            <span>Usar para PRO</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          disabled={actionLoading}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-40 text-center"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Info Panel */}
            <div className="bg-[#0F766E]/5 border border-[#0F766E]/15 rounded-2xl p-4 flex gap-3 text-left">
              <Info size={16} className="text-[#0F766E] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-extrabold text-[#0F766E] leading-relaxed block">Sobre la seguridad de la información fiscal:</span>
                <p className="text-gray-500 leading-relaxed mt-1">
                  Ningún dato real de tarjetas reales es solicitado u almacenado externamente. El procesamiento es un modelo formativo seguro para simular las gestiones de impuestos y planillas formales ante la DGII dominicana.
                </p>
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={handleSignOut}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-600 hover:text-red-600 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-45 flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Cerrar Sesión</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#0F766E] hover:bg-opacity-95 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
