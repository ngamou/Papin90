import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminUser, TwoFactorSetupData } from '../../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: AdminUser) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [email, setEmail] = useState('mauricengamou39@gmail.com');
  const [password, setPassword] = useState('Admin@Douala2026#');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA Setup Data (QR Code, secret)
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorSetupData | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [timeLeftInStep, setTimeLeftInStep] = useState<number>(30);

  // Countdown timer for 30s TOTP window
  useEffect(() => {
    const updateCountdown = () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      setTimeLeftInStep(30 - (nowSeconds % 30));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-fetch 2FA QR code when modal opens or step is 2fa
  useEffect(() => {
    if (isOpen) {
      adminApi.get2FASetup('mauricengamou39@gmail.com').then((data) => {
        setTwoFactorData(data);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySecret = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await adminApi.login(email, password, totpCode ? totpCode.trim() : undefined);

      if (!result.success) {
        setError(result.error || 'Identifiants invalides');
        setLoading(false);
        return;
      }

      if (result.requires2FA) {
        if (result.qrCodeDataUrl) {
          setTwoFactorData({
            secret: result.secret || '',
            otpauthUrl: result.otpauthUrl || '',
            qrCodeDataUrl: result.qrCodeDataUrl,
            account: result.user?.email || email,
            issuer: 'DoualaSanté',
            currentCode: result.currentCode,
          });
        }
        setStep('2fa');
        setLoading(false);
        return;
      }

      if (result.user) {
        onAuthenticated(result.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length !== 6) {
      setError('Veuillez entrer les 6 chiffres affichés sur Google Authenticator');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await adminApi.verify2FA(email, totpCode.trim());
      if (!result.success || !result.user) {
        setError(result.error || 'Code Google Authenticator invalide ou expiré');
        setLoading(false);
        return;
      }

      onAuthenticated(result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur vérification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94dvh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Administration DoualaSanté</h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-sm font-semibold">
                  Accès Protégé 2FA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentification forte Google Authenticator (TOTP RFC 6238)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Official Request Banner */}
          <div className="p-3 bg-teal-50/80 border border-teal-200/90 rounded-xl text-teal-900 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-teal-800 uppercase tracking-wider">
                Compte Administrateur Officiel :
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-mono px-2 py-0.5 rounded-md font-bold">
                Super Admin
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-slate-900">
              mauricengamou39@gmail.com
            </p>
            <p className="text-[11px] text-teal-700">
              Cet espace permet d’administrer en temps réel l'ensemble de la plateforme (Praticiens, FOSA, Caisse SYSCOHADA, Urgences, Stocks et Audit).
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Erreur d'authentification :</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* STEP 1: CREDENTIALS (EMAIL & PASSWORD) */}
          {step === 'credentials' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Adresse Email Administrateur :</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-semibold focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mot de passe :</span>
                  </label>
                  <span className="text-[10px] text-teal-700 font-medium">
                    Initial : <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Admin@Douala2026#</code>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Direct 2FA token input if user already has Google Authenticator open */}
              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                    <span>Code Google Authenticator (Optionnel à cette étape) :</span>
                  </label>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 489201 (laisser vide pour afficher le QR Code)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono tracking-wider text-sm focus:outline-hidden focus:border-teal-500 text-center"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('2fa')}
                  className="text-teal-700 hover:underline font-semibold flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Afficher QR Code 2FA</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition ml-auto"
                >
                  <span>{loading ? 'Vérification...' : 'Continuer vers le QR Code'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: GOOGLE AUTHENTICATOR QR CODE & TOTP VERIFICATION */}
          {step === '2fa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-teal-600" />
                  <span>Scanner avec l'application Google Authenticator</span>
                </span>
                <button
                  onClick={() => setStep('credentials')}
                  className="text-slate-500 hover:text-slate-800 text-[11px] underline"
                >
                  Modifier identifiants
                </button>
              </div>

              {/* QR Code Container */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3 text-center">
                {twoFactorData?.qrCodeDataUrl ? (
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                    <img
                      src={twoFactorData.qrCodeDataUrl}
                      alt="Google Authenticator QR Code"
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-slate-200 rounded-xl flex items-center justify-center animate-pulse">
                    <QrCode className="w-12 h-12 text-slate-400" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <span>Compte :</span>
                    <span className="font-mono text-teal-700">{twoFactorData?.account || email}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Scannez ce QR Code dans Google Authenticator (Android ou iOS)
                  </p>
                </div>

                {/* Secret Key with one-click copy */}
                {twoFactorData?.secret && (
                  <div className="w-full max-w-xs pt-1">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      Ou saisissez la clé secrète manuellement :
                    </span>
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-1.5 text-xs">
                      <span className="font-mono font-bold text-slate-800 tracking-wider truncate px-1 text-[11px]">
                        {twoFactorData.secret}
                      </span>
                      <button
                        onClick={() => handleCopySecret(twoFactorData.secret)}
                        className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-50 rounded transition shrink-0"
                        title="Copier la clé secrète"
                      >
                        {copiedSecret ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TOTP 6-Digit Code Input Form */}
              <form onSubmit={handleVerify2FA} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 text-xs">
                      Entrez le code à 6 chiffres généré :
                    </label>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                      <span>Expire dans {timeLeftInStep}s</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full tracking-widest text-center text-xl font-bold font-mono py-2 bg-slate-50 border-2 border-teal-500/50 rounded-xl text-slate-900 focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                {/* Instant Simulator Helper (for fast test directly without phone) */}
                {twoFactorData?.currentCode && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-900 block text-[11px]">
                        Code actuel en direct (pour test immédiat) :
                      </span>
                      <span className="font-mono font-bold text-amber-950 text-sm tracking-widest">
                        {twoFactorData.currentCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTotpCode(twoFactorData.currentCode!)}
                      className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold rounded text-[11px] transition"
                    >
                      Remplir
                    </button>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || totpCode.trim().length !== 6}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Validation...' : 'Valider & Ouvrir la Console Admin'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
