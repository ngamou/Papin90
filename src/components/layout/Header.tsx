import React from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  MessageCircle,
  Calendar,
  Layers,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Package,
  Lock,
  User,
  Stethoscope,
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { useSyncEngine } from '../../services/syncEngine';
import { accountService } from '../../services/accountService';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenCompliance: () => void;
  onOpenAdmin?: () => void;
  onOpenUserAuth: (role?: 'patient' | 'doctor') => void;
  isAdminAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageChange,
  onOpenCompliance,
  onOpenAdmin,
  onOpenUserAuth,
  isAdminAuthenticated,
}) => {
  const t = translations[language];
  const { isOnline, isSimulatedOffline, pendingSyncCount, isSyncing, triggerSync, toggleSimulatedOffline } =
    useSyncEngine();

  const [activePatient, setActivePatient] = React.useState(accountService.getActivePatient());
  const [activeDoctor, setActiveDoctor] = React.useState(accountService.getActiveDoctor());

  React.useEffect(() => {
    const unsub = accountService.subscribe(() => {
      setActivePatient(accountService.getActivePatient());
      setActiveDoctor(accountService.getActiveDoctor());
    });
    return () => unsub();
  }, []);

  const navItems = [
    { id: 'whatsapp', label: 'WhatsApp Flows', icon: MessageCircle },
    { id: 'patient_pwa', label: 'Portail Patient', icon: Globe },
    { id: 'agenda', label: 'Agenda Médecin', icon: Calendar },
    { id: 'kanban', label: 'Salle d’Attente & Tri', icon: Layers },
    { id: 'cash_desk', label: 'Caisse & Stocks', icon: CreditCard },
    { id: 'analytics', label: 'Analytique & ROI', icon: BarChart3 },
    ...(isAdminAuthenticated && currentTab === 'admin'
      ? [{ id: 'admin', label: 'Console Admin (2FA)', icon: ShieldCheck }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Offline Alert Strip if offline or pending changes */}
      {(!isOnline || pendingSyncCount > 0) && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-medium">
              {!isOnline
                ? 'Mode Hors-Ligne actif (Réseau coupé à Douala) — Toutes vos modifications sont enregistrées localement'
                : `${pendingSyncCount} modification(s) en attente de synchronisation différentielle`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isOnline && pendingSyncCount > 0 && (
              <button
                onClick={() => triggerSync()}
                disabled={isSyncing}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white rounded px-2 py-0.5 font-medium transition"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}</span>
              </button>
            )}
            <button
              onClick={() => toggleSimulatedOffline(false)}
              className="underline text-amber-100 hover:text-white"
            >
              Rétablir réseau
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (4-6 Nav Links) — Zone 3 (Primary Actions) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single element brand wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onTabChange('whatsapp')}
            className="flex items-center gap-2 text-left focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
              DS
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-sans">
              Douala<span className="text-teal-600">Santé</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 Nav Links, single line, no pills */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap transition-colors py-1 border-b-2 font-medium ${
                  isActive
                    ? 'border-teal-600 text-teal-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Offline simulator switch, Compliance, Language, PWA install) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Offline/Online Network Simulation Switch */}
          <button
            onClick={() => toggleSimulatedOffline()}
            title={
              isOnline
                ? 'Simuler une coupure Internet Douala (tester le mode Offline-First)'
                : 'Simuler le retour de la connexion Internet'
            }
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              isOnline
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Online (CEMAC)</span>
                <span className="sm:hidden text-[10px] font-semibold">Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span className="hidden sm:inline">Offline (Simulé)</span>
                <span className="sm:hidden text-[10px] font-semibold text-amber-900">Offline</span>
              </>
            )}
          </button>

          {/* Compliance & Law 2024/017 Link */}
          <button
            onClick={onOpenCompliance}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Conformité Loi camerounaise n° 2024/017 & Chiffrement AES-256"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="hidden md:inline">Loi 2024/017</span>
          </button>

          {/* Language Selector (FR, EN, Douala, Ewondo, Bassa) */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="pl-6 sm:pl-7 pr-1 sm:pr-2 py-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-800 hover:border-slate-300 focus:outline-hidden cursor-pointer"
              title="Langue de l'interface & messages locaux"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="douala">DLA (Douala)</option>
              <option value="ewondo">EWD (Ewondo)</option>
              <option value="bassa">BAS (Bassa)</option>
            </select>
          </div>

          {/* In-app PWA install button */}
          <PWAInstallButton />

          {/* Patient & Doctor Account Access / Badge */}
          {activePatient ? (
            <button
              onClick={() => onOpenUserAuth('patient')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 transition shadow-2xs"
              title="Mon Carnet de Santé Patient (DoualaSanté)"
            >
              <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden md:inline max-w-[110px] truncate">{activePatient.name}</span>
              <span className="md:hidden">Patient</span>
            </button>
          ) : activeDoctor ? (
            <button
              onClick={() => onOpenUserAuth('doctor')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border border-teal-700 bg-teal-800 text-white hover:bg-teal-900 transition shadow-2xs"
              title="Mon Espace Médecin Praticien ONMC"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span className="hidden md:inline max-w-[110px] truncate">{activeDoctor.name}</span>
              <span className="md:hidden">Dr.</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenUserAuth('patient')}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
              title="Connexion / Inscription Patient ou Médecin"
            >
              <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">Comptes</span>
            </button>
          )}

          {/* Admin Indicator only when authenticated and active inside /admin */}
          {isAdminAuthenticated && currentTab === 'admin' && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-teal-700 bg-teal-800 text-white shadow-2xs"
              title="Session Administrateur active (mauricengamou39@gmail.com)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span className="hidden sm:inline">Admin (2FA Actif)</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
