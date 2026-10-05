/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { PatientWhatsAppView } from './components/patient/PatientWhatsAppView';
import { PatientPWAView } from './components/patient/PatientPWAView';
import { PractitionerAgenda } from './components/practitioner/PractitionerAgenda';
import { WaitingRoomKanban } from './components/practitioner/WaitingRoomKanban';
import { RegulatoryComplianceModal } from './components/compliance/RegulatoryComplianceModal';
import { DigitalPrescriptionModal } from './components/practitioner/DigitalPrescriptionModal';
import { TeleconsultationModal } from './components/practitioner/TeleconsultationModal';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { UserAuthModal } from './components/auth/UserAuthModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Language, Appointment, AdminUser } from './types';
import { getBrowserLanguage } from './i18n/translations';
import { db } from './services/db';
import { adminApi } from './services/adminApi';
import { Lock } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('whatsapp');
  const [language, setLanguage] = useState<Language>('fr');
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);
  const [userAuthRole, setUserAuthRole] = useState<'patient' | 'doctor'>('patient');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(adminApi.getCurrentUser());

  // Active appointment for modals
  const [activeAppointmentForPrescription, setActiveAppointmentForPrescription] = useState<Appointment | null>(null);
  const [activeAppointmentForTeleconsult, setActiveAppointmentForTeleconsult] = useState<Appointment | null>(null);

  // Auto-detect browser language on mount
  useEffect(() => {
    setLanguage(getBrowserLanguage());
  }, []);

  // Listen to browser URL path for /admin access
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/') || hash === '#admin';

      if (isAdminRoute) {
        if (adminUser) {
          setCurrentTab('admin');
        } else {
          setIsAdminAuthModalOpen(true);
        }
      } else if (currentTab === 'admin' && !isAdminRoute) {
        setCurrentTab('whatsapp');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [adminUser, currentTab]);

  const handleOpenPrescription = (app: Appointment) => {
    setActiveAppointmentForPrescription(app);
  };

  const handleOpenTeleconsultation = (app: Appointment) => {
    setActiveAppointmentForTeleconsult(app);
  };

  const handleAppointmentBooked = () => {
    // When appointment is booked through WhatsApp Flow, update local list
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'cash_desk' || tab === 'analytics' || tab === 'admin') {
      if (!adminUser) {
        setIsAdminAuthModalOpen(true);
        return;
      }
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
      setCurrentTab('admin');
      return;
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Universal Top Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        language={language}
        onLanguageChange={setLanguage}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        onOpenUserAuth={(role) => {
          setUserAuthRole(role || 'patient');
          setIsUserAuthModalOpen(true);
        }}
        isAdminAuthenticated={!!adminUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-12">
        {currentTab === 'whatsapp' && (
          <PatientWhatsAppView
            language={language}
            onLanguageChange={setLanguage}
            onAppointmentBooked={handleAppointmentBooked}
          />
        )}

        {currentTab === 'patient_pwa' && (
          <PatientPWAView
            language={language}
            onOpenTeleconsultation={handleOpenTeleconsultation}
            onOpenPrescription={(id) => {
              const app = db.getAppointments()[0];
              if (app) setActiveAppointmentForPrescription(app);
            }}
            onSwitchToWhatsApp={() => setCurrentTab('whatsapp')}
          />
        )}

        {currentTab === 'agenda' && (
          <PractitionerAgenda
            onStartConsultation={(app) => {
              setCurrentTab('kanban');
            }}
            onOpenTeleconsultation={handleOpenTeleconsultation}
            onOpenPrescription={handleOpenPrescription}
          />
        )}

        {currentTab === 'kanban' && <WaitingRoomKanban />}

        {currentTab === 'admin' && adminUser && (
          <AdminPortalView
            adminUser={adminUser}
            onLogout={() => {
              adminApi.logout();
              setAdminUser(null);
              window.history.pushState(null, '', '/');
              setCurrentTab('whatsapp');
            }}
            onOpen2FASettings={() => setIsAdminAuthModalOpen(true)}
          />
        )}

        {currentTab === 'admin' && !adminUser && (
          <div className="max-w-md mx-auto my-16 px-6 py-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
              <Lock className="w-6 h-6 text-slate-800" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Espace Administrateur Sécurisé</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Accès strictement restreint au personnel habilité. Authentification à double facteur (2FA Google Authenticator) requise.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                S'authentifier (2FA Google Authenticator)
              </button>
              <button
                onClick={() => {
                  window.history.pushState(null, '', '/');
                  setCurrentTab('whatsapp');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 pb-24 lg:pb-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">DoualaSanté</span>
            <span>· Plateforme Médicale de Référence à Douala (Cameroun)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Loi camerounaise n° 2024/017</span>
            <span>·</span>
            <span>Chiffrement AES-256</span>
            <span>·</span>
            <span>Plan comptable OHADA</span>
            <span>·</span>
            <button
              onClick={() => setIsComplianceOpen(true)}
              className="text-teal-700 hover:underline font-medium"
            >
              Mentions Légales & Sécurité
            </button>
            {adminUser && (
              <>
                <span>·</span>
                <button
                  onClick={() => {
                    if (window.location.pathname !== '/admin') {
                      window.history.pushState(null, '', '/admin');
                    }
                    setCurrentTab('admin');
                  }}
                  className="text-teal-700 hover:underline font-semibold flex items-center gap-1"
                >
                  <Lock className="w-3 h-3 text-teal-600" />
                  <span>Session Admin ({adminUser.email})</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isAdminAuthenticated={!!adminUser}
      />

      {/* Global Modals */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => {
          setIsAdminAuthModalOpen(false);
          const pathname = window.location.pathname;
          const hash = window.location.hash;
          if (!adminUser && (pathname === '/admin' || pathname.startsWith('/admin/') || hash === '#admin')) {
            window.history.pushState(null, '', '/');
            if (currentTab === 'admin') setCurrentTab('whatsapp');
          }
        }}
        onAuthenticated={(user) => {
          setAdminUser(user);
          setCurrentTab('admin');
          if (window.location.pathname !== '/admin') {
            window.history.pushState(null, '', '/admin');
          }
        }}
      />

      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
        defaultRole={userAuthRole}
        onAuthenticated={(type) => {
          if (type === 'doctor') {
            setCurrentTab('agenda');
          } else {
            setCurrentTab('patient_pwa');
          }
        }}
      />

      <RegulatoryComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />

      <DigitalPrescriptionModal
        isOpen={!!activeAppointmentForPrescription}
        appointment={activeAppointmentForPrescription}
        onClose={() => setActiveAppointmentForPrescription(null)}
      />

      <TeleconsultationModal
        isOpen={!!activeAppointmentForTeleconsult}
        appointment={activeAppointmentForTeleconsult}
        onClose={() => setActiveAppointmentForTeleconsult(null)}
        onOpenPrescription={(app) => {
          setActiveAppointmentForTeleconsult(null);
          setActiveAppointmentForPrescription(app);
        }}
      />
    </div>
  );
}
