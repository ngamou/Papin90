/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Stethoscope,
  Lock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  LogOut,
  Building2,
  Award,
} from 'lucide-react';
import { accountService } from '../../services/accountService';
import { PatientAccount, DoctorAccount } from '../../types';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'patient' | 'doctor';
  onAuthenticated?: (type: 'patient' | 'doctor', data: PatientAccount | DoctorAccount) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'patient',
  onAuthenticated,
}) => {
  const [role, setRole] = useState<'patient' | 'doctor'>(defaultRole);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Patient Form State
  const [patientEmailOrPhone, setPatientEmailOrPhone] = useState('samuel.moukoko@gmail.com');
  const [patientPassword, setPatientPassword] = useState('Patient@2026');
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('+237 6');
  const [pQuarter, setPQuarter] = useState('Akwa');
  const [pBlood, setPBlood] = useState('O+');
  const [pAllergies, setPAllergies] = useState('Aucune allergie connue');
  const [pEmergency, setPEmergency] = useState('');

  // Doctor Form State
  const [doctorEmailOrPhone, setDoctorEmailOrPhone] = useState('jp.kamdem@cardio-douala.cm');
  const [doctorPassword, setDoctorPassword] = useState('Doctor@2026');
  const [dName, setDName] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dPhone, setDPhone] = useState('+237 6');
  const [dSpecialty, setDSpecialty] = useState('Cardiologie & Hypertension');
  const [dOnmc, setDOnmc] = useState('ONMC-DLA-');
  const [dClinic, setDClinic] = useState('Clinique du Littoral');
  const [dQuarter, setDQuarter] = useState('Bonanjo');
  const [dFee, setDFee] = useState(20000);

  const activePatient = accountService.getActivePatient();
  const activeDoctor = accountService.getActiveDoctor();

  useEffect(() => {
    if (defaultRole) setRole(defaultRole);
  }, [defaultRole]);

  if (!isOpen) return null;

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await accountService.loginPatient(patientEmailOrPhone, patientPassword);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Identifiants patient invalides');
      return;
    }
    setSuccessMessage(`Bienvenue ${res.session?.patient.name} !`);
    setTimeout(() => {
      if (res.session && onAuthenticated) {
        onAuthenticated('patient', res.session.patient);
      }
      onClose();
    }, 600);
  };

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await accountService.registerPatient({
      name: pName,
      email: pEmail,
      phone: pPhone,
      quarter: pQuarter,
      password: patientPassword,
      bloodGroup: pBlood,
      allergies: pAllergies,
      emergencyContact: pEmergency,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Erreur lors de la création du compte');
      return;
    }
    setSuccessMessage(`Compte créé avec succès ! Bienvenue ${res.session?.patient.name}`);
    setTimeout(() => {
      if (res.session && onAuthenticated) {
        onAuthenticated('patient', res.session.patient);
      }
      onClose();
    }, 600);
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await accountService.loginDoctor(doctorEmailOrPhone, doctorPassword);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Identifiants médecin invalides');
      return;
    }
    setSuccessMessage(`Bienvenue ${res.session?.doctor.name} !`);
    setTimeout(() => {
      if (res.session && onAuthenticated) {
        onAuthenticated('doctor', res.session.doctor);
      }
      onClose();
    }, 600);
  };

  const handleDoctorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await accountService.registerDoctor({
      name: dName,
      email: dEmail,
      phone: dPhone,
      specialty: dSpecialty,
      onmcNumber: dOnmc,
      clinicName: dClinic,
      quarter: dQuarter,
      password: doctorPassword,
      consultationFee: dFee,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Erreur lors de la création du compte médecin');
      return;
    }
    setSuccessMessage(`Compte Praticien créé ! Bienvenue ${res.session?.doctor.name}`);
    setTimeout(() => {
      if (res.session && onAuthenticated) {
        onAuthenticated('doctor', res.session.doctor);
      }
      onClose();
    }, 600);
  };

  // Quick 1-click test helper
  const quickPatientLogin = (email: string, phone: string, name: string) => {
    setPatientEmailOrPhone(email);
    setPatientPassword('Patient@2026');
    accountService.loginPatient(email, 'Patient@2026').then((res) => {
      if (res.success && res.session) {
        setSuccessMessage(`Connecté en tant que ${name}`);
        if (onAuthenticated) onAuthenticated('patient', res.session.patient);
        setTimeout(onClose, 500);
      }
    });
  };

  const quickDoctorLogin = (email: string, name: string) => {
    setDoctorEmailOrPhone(email);
    setDoctorPassword('Doctor@2026');
    accountService.loginDoctor(email, 'Doctor@2026').then((res) => {
      if (res.success && res.session) {
        setSuccessMessage(`Connecté en tant que ${name}`);
        if (onAuthenticated) onAuthenticated('doctor', res.session.doctor);
        setTimeout(onClose, 500);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {role === 'patient' ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{role === 'patient' ? 'Espace Patient · Carnet de Santé' : 'Espace Médecin · Ordre ONMC'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {role === 'patient'
                  ? 'Réservation immédiate de créneaux & billets de consultation QR'
                  : 'Gestion des créneaux de consultation & dossiers médicaux'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200 shrink-0">
          <button
            onClick={() => {
              setRole('patient');
              setError(null);
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              role === 'patient'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>Compte Patient (RDV & Créneaux)</span>
          </button>
          <button
            onClick={() => {
              setRole('doctor');
              setError(null);
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              role === 'doctor'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Compte Médecin (Praticien ONMC)</span>
          </button>
        </div>

        {/* Current Active Account Banner (if already logged in) */}
        {role === 'patient' && activePatient && (
          <div className="bg-teal-50 px-4 py-2.5 border-b border-teal-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Connecté en tant que <strong>{activePatient.name}</strong> ({activePatient.phone})
              </span>
            </div>
            <button
              onClick={() => accountService.logoutPatient()}
              className="text-xs text-rose-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3 h-3" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {role === 'doctor' && activeDoctor && (
          <div className="bg-teal-50 px-4 py-2.5 border-b border-teal-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Connecté en tant que <strong>{activeDoctor.name}</strong> ({activeDoctor.specialty})
              </span>
            </div>
            <button
              onClick={() => accountService.logoutDoctor()}
              className="text-xs text-rose-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3 h-3" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode Switcher: Connexion vs Inscription */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`pb-1 border-b-2 transition ${
                  mode === 'login'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Se connecter
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`pb-1 border-b-2 transition ${
                  mode === 'register'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Créer un compte
              </button>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              <span>Chiffrement Loi 2024/017</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: PATIENT ACCOUNT FORM */}
          {/* ========================================================= */}
          {role === 'patient' && (
            <div>
              {mode === 'login' ? (
                <form onSubmit={handlePatientLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email ou Numéro Mobile (+237)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={patientEmailOrPhone}
                        onChange={(e) => setPatientEmailOrPhone(e.target.value)}
                        placeholder="ex: samuel.moukoko@gmail.com ou +237 699..."
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Connexion en cours...' : 'Accéder à mon Espace Patient'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick test buttons for demonstration */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      Comptes patients de démonstration (1-clic) :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          quickPatientLogin('samuel.moukoko@gmail.com', '+237 699 88 77 66', 'Samuel Moukoko')
                        }
                        className="p-2 text-left bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-lg text-[11px] transition"
                      >
                        <strong className="block text-slate-900">Samuel Moukoko</strong>
                        <span className="text-slate-500">Bonanjo · +237 699 88 77 66</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          quickPatientLogin('mireille.essomba@gmail.com', '+237 677 12 34 56', 'Mireille Essomba')
                        }
                        className="p-2 text-left bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-lg text-[11px] transition"
                      >
                        <strong className="block text-slate-900">Mireille Essomba</strong>
                        <span className="text-slate-500">Akwa · +237 677 12 34 56</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePatientRegister} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet *</label>
                      <input
                        type="text"
                        required
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        placeholder="ex: Jean-Marc Ndongo"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone camerounais *</label>
                      <input
                        type="tel"
                        required
                        value={pPhone}
                        onChange={(e) => setPPhone(e.target.value)}
                        placeholder="+237 6..."
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Email *</label>
                      <input
                        type="email"
                        required
                        value={pEmail}
                        onChange={(e) => setPEmail(e.target.value)}
                        placeholder="patient@gmail.com"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Quartier de résidence à Douala *</label>
                      <select
                        value={pQuarter}
                        onChange={(e) => setPQuarter(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      >
                        <option value="Akwa">Akwa</option>
                        <option value="Bonanjo">Bonanjo</option>
                        <option value="Bonapriso">Bonapriso</option>
                        <option value="Makepe">Makepe</option>
                        <option value="Deïdo">Deïdo</option>
                        <option value="Bépanda">Bépanda</option>
                        <option value="Ndogpassi">Ndogpassi</option>
                        <option value="Logbessou">Logbessou</option>
                        <option value="Kotto">Kotto</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Groupe sanguin</label>
                      <select
                        value={pBlood}
                        onChange={(e) => setPBlood(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      >
                        <option value="O+">O+ (Le plus fréquent à Douala)</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O- (Donneur universel)</option>
                        <option value="Inconnu">Inconnu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe *</label>
                      <input
                        type="password"
                        required
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Allergies ou antécédents médicaux
                    </label>
                    <input
                      type="text"
                      value={pAllergies}
                      onChange={(e) => setPAllergies(e.target.value)}
                      placeholder="ex: Allergie pénicilline, asthme, hypertension..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    {loading ? 'Création en cours...' : 'Créer mon Compte Patient & Réserver'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DOCTOR ACCOUNT FORM */}
          {/* ========================================================= */}
          {role === 'doctor' && (
            <div>
              {mode === 'login' ? (
                <form onSubmit={handleDoctorLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email, N° ONMC ou Téléphone mobile
                    </label>
                    <div className="relative">
                      <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={doctorEmailOrPhone}
                        onChange={(e) => setDoctorEmailOrPhone(e.target.value)}
                        placeholder="ex: jp.kamdem@cardio-douala.cm ou ONMC-DLA-4821"
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe professionnel</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={doctorPassword}
                        onChange={(e) => setDoctorPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Authentification...' : 'Ouvrir mon Agenda Praticien'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Pre-seeded demo doctors */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      Comptes médecins certifiés ONMC (Accès 1-clic) :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => quickDoctorLogin('jp.kamdem@cardio-douala.cm', 'Dr. Jean-Paul Kamdem')}
                        className="p-2 text-left bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-lg text-[10px] transition"
                      >
                        <strong className="block text-slate-900 truncate">Dr. J-P Kamdem</strong>
                        <span className="text-teal-700 font-medium">Cardiologie</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickDoctorLogin('s.eboa@pediatrie-douala.cm', 'Dr. Samuel Eboa')}
                        className="p-2 text-left bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-lg text-[10px] transition"
                      >
                        <strong className="block text-slate-900 truncate">Dr. Samuel Eboa</strong>
                        <span className="text-teal-700 font-medium">Pédiatrie</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickDoctorLogin('h.ngombock@bonapriso-medical.cm', 'Dr. Henriette Ngo Mbock')}
                        className="p-2 text-left bg-slate-50 hover:bg-teal-50 hover:border-teal-200 border border-slate-200 rounded-lg text-[10px] transition"
                      >
                        <strong className="block text-slate-900 truncate">Dr. H. Ngo Mbock</strong>
                        <span className="text-teal-700 font-medium">Gynécologie</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleDoctorRegister} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet (avec Dr.) *</label>
                      <input
                        type="text"
                        required
                        value={dName}
                        onChange={(e) => setDName(e.target.value)}
                        placeholder="ex: Dr. Joseph Mouelle"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">N° Ordre ONMC *</label>
                      <input
                        type="text"
                        required
                        value={dOnmc}
                        onChange={(e) => setDOnmc(e.target.value)}
                        placeholder="ONMC-DLA-5490"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Spécialité médicale *</label>
                      <select
                        value={dSpecialty}
                        onChange={(e) => setDSpecialty(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      >
                        <option value="Cardiologie & Hypertension">Cardiologie & Hypertension</option>
                        <option value="Pédiatrie & Néonatalogie">Pédiatrie & Néonatalogie</option>
                        <option value="Gynécologie & Obstétrique">Gynécologie & Obstétrique</option>
                        <option value="Médecine Générale & Urgences">Médecine Générale & Urgences</option>
                        <option value="Ophtalmologie">Ophtalmologie</option>
                        <option value="Dermatologie">Dermatologie</option>
                        <option value="Neurologie">Neurologie</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Clinique principale à Douala</label>
                      <input
                        type="text"
                        required
                        value={dClinic}
                        onChange={(e) => setDClinic(e.target.value)}
                        placeholder="ex: Clinique du Littoral Bonanjo"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email professionnel *</label>
                      <input
                        type="email"
                        required
                        value={dEmail}
                        onChange={(e) => setDEmail(e.target.value)}
                        placeholder="docteur@clinique.cm"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone de contact *</label>
                      <input
                        type="tel"
                        required
                        value={dPhone}
                        onChange={(e) => setDPhone(e.target.value)}
                        placeholder="+237 6..."
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tarif consultation (FCFA)
                      </label>
                      <input
                        type="number"
                        min={5000}
                        step={1000}
                        value={dFee}
                        onChange={(e) => setDFee(Number(e.target.value) || 20000)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe sécurisé *</label>
                      <input
                        type="password"
                        required
                        value={doctorPassword}
                        onChange={(e) => setDoctorPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    {loading ? 'Création en cours...' : 'Inscrire le profil Praticien ONMC'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
