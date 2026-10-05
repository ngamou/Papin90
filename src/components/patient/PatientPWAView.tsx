import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Smartphone,
  Phone,
  ArrowRight,
  Shield,
  Download,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Practitioner, Language, Appointment, PatientAccount } from '../../types';
import { db, INITIAL_PRACTITIONERS } from '../../services/db';
import { translations } from '../../i18n/translations';
import { accountService } from '../../services/accountService';
import { BookTimeSlotModal } from './BookTimeSlotModal';
import { UserAuthModal } from '../auth/UserAuthModal';

interface PatientPWAViewProps {
  language: Language;
  onOpenTeleconsultation: (appointment: Appointment) => void;
  onOpenPrescription: (prescriptionId: string) => void;
  onSwitchToWhatsApp: () => void;
}

export const PatientPWAView: React.FC<PatientPWAViewProps> = ({
  language,
  onOpenTeleconsultation,
  onOpenPrescription,
  onSwitchToWhatsApp,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('Tous');
  const [activeTab, setActiveTab] = useState<'specialists' | 'my_appointments' | 'prescriptions'>('specialists');
  const [activePatient, setActivePatient] = useState<PatientAccount | null>(accountService.getActivePatient());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Practitioner | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = accountService.subscribe(() => {
      setActivePatient(accountService.getActivePatient());
    });
    return () => unsubscribe();
  }, []);

  const [appointments, setAppointments] = useState<Appointment[]>(db.getAppointments());
  const doctors = db.getPractitioners();
  const quarters = ['Tous', 'Bonanjo', 'Akwa', 'Bonapriso', 'Makepe', 'Deïdo'];

  const refreshAppointments = () => {
    setAppointments(db.getAppointments());
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.facilitySchedules?.some((s) => s.facilityName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchQuarter =
      selectedQuarter === 'Tous' ||
      doc.quarter.toLowerCase().includes(selectedQuarter.toLowerCase()) ||
      doc.facilitySchedules?.some((s) => s.facilityQuarter.toLowerCase().includes(selectedQuarter.toLowerCase()));

    return matchSearch && matchQuarter;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Banner with Clinic Hero Image */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm border border-slate-200 bg-slate-900 text-white">
        <img
          src="/src/assets/images/hero_douala_clinic_1790957081093.jpg"
          alt="Clinique de référence Douala"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative z-10 p-6 sm:p-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Réseau Médical de Spécialistes · Douala, Cameroun</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Prenez rendez-vous médical à Douala sans file d’attente
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Consultez les créneaux en direct des cardiologues, pédiatres et gynécologues. Acompte sécurisé par MTN MoMo &
            Orange Money. Mode 100% hors-ligne garanti.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onSwitchToWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Réserver via WhatsApp Bot</span>
            </button>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Conforme Loi n° 2024/017</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Account Status Bar */}
      {activePatient ? (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {activePatient.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Carnet de Santé : {activePatient.name}</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
                  Compte Connecté
                </span>
              </div>
              <span className="text-[11px] text-slate-600">
                {activePatient.quarter} · {activePatient.phone} · Groupe {activePatient.bloodGroup || 'O+'} · Allergies : {activePatient.allergies || 'Aucune'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedDoctorForBooking(null);
                setIsBookingModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Réserver un créneau</span>
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              Changer de compte
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Espace Patient & Réservation de Créneaux</div>
              <p className="text-[11px] text-slate-500">
                Créez votre compte ou connectez-vous pour réserver directement auprès des spécialistes et recevoir vos billets QR.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
            >
              Connexion / Inscription Patient
            </button>
          </div>
        </div>
      )}

      {/* Tabs Control */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('specialists')}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition ${
            activeTab === 'specialists'
              ? 'bg-teal-600 text-white shadow-2xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Spécialistes & Cabinets Douala
        </button>
        <button
          onClick={() => setActiveTab('my_appointments')}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
            activeTab === 'my_appointments'
              ? 'bg-teal-600 text-white shadow-2xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Mes Rendez-vous</span>
          <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full tabular-nums">
            {appointments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-2xs font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ordonnances Numériques
        </button>
      </div>

      {/* Tab: Specialists Directory */}
      {activeTab === 'specialists' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher nom, spécialité, clinique..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">Quartier :</span>
              {quarters.map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`text-xs px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                    selectedQuarter === q
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-300'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h3>
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-sm tabular-nums">
                          {doc.rating} ★
                        </span>
                      </div>
                      <p className="text-xs font-medium text-teal-600 mt-0.5">{doc.specialty}</p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.clinicName} · {doc.quarter}</span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  {doc.facilitySchedules && doc.facilitySchedules.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Lieux & Créneaux de Consultation à Douala :
                      </span>
                      <div className="space-y-1">
                        {doc.facilitySchedules.map((s) => (
                          <div
                            key={s.id}
                            className="text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                          >
                            <div>
                              <strong className="text-slate-900">{s.facilityName}</strong>{' '}
                              <span className="text-slate-500">({s.facilityQuarter.split(' ')[0]})</span>
                              <div className="text-[10px] text-teal-700 font-medium">
                                {s.days.join(', ')} · {s.timeSlots.start} - {s.timeSlots.end}
                              </div>
                            </div>
                            <span className="text-slate-900 font-bold font-mono text-[11px] tabular-nums">
                              {s.consultationFee.toLocaleString()} F
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Tarif moyen :</div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {doc.consultationFee.toLocaleString()} FCFA
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDoctorForBooking(doc);
                        setIsBookingModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Réserver créneau</span>
                    </button>
                    <button
                      onClick={onSwitchToWhatsApp}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition"
                      title="Réserver via WhatsApp Bot"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: My Appointments */}
      {activeTab === 'my_appointments' && (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 font-mono">{app.id}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : app.status === 'in_consultation'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    · Acompte : {app.amountPaid.toLocaleString()} FCFA ({app.paymentMethod?.toUpperCase()})
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{app.practitionerName}</h3>
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-900">
                    {app.facilityName || 'Clinique du Littoral'}
                  </strong>{' '}
                  ({app.facilityQuarter || 'Bonanjo'}) · {app.specialty} · Salle : {app.room}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="tabular-nums">{app.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="tabular-nums">{app.timeSlot}</span>
                  </span>
                  <span className="text-teal-600 font-medium">Billet : {app.qrTicketCode}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {app.type === 'teleconsultation' && (
                  <button
                    onClick={() => onOpenTeleconsultation(app)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Rejoindre Téléconsultation</span>
                  </button>
                )}
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-700 text-xs">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span className="font-mono text-[11px]">{app.qrTicketCode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Digital Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div>
                <span className="text-xs font-semibold text-teal-600">Ordonnance Certifiée #ORD-2026-991</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">Dr. Jean-Paul Kamdem (Cardiologie)</h4>
                <p className="text-xs text-slate-500">Clinique du Littoral - Bonanjo · Date : 02/10/2026</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Signé numériquement (SHA-256)
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Hash: 8f9b...a12c</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">1. Amlodipine 5mg comprimé</strong>
                  <p className="text-slate-500 text-[11px]">1 comprimé chaque matin au petit-déjeuner pendant 3 mois</p>
                </div>
                <span className="font-mono text-[11px] text-slate-600">QSP 3 boîtes</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900">2. Bilan biologique de contrôle</strong>
                  <p className="text-slate-500 text-[11px]">Créatininémie, Ionogramme sanguin, DFG à réaliser à jeun</p>
                </div>
                <span className="font-mono text-[11px] text-slate-600">Sous 1 mois</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-500 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-teal-600" />
                <span>Vérifiable par les pharmacies partenaires de Douala (Akwa, Bonanjo, Deïdo)</span>
              </div>
              <button
                onClick={() => alert('Ordonnance sécurisée téléchargée en PDF conforme.')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" />
                <span>Télécharger PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Slot Reservation Modal */}
      <BookTimeSlotModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedDoctor={selectedDoctorForBooking}
        onAppointmentConfirmed={(_app) => {
          refreshAppointments();
          setActiveTab('my_appointments');
        }}
        onOpenAuth={() => {
          setIsBookingModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* User Auth Modal (Patient login/register) */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole="patient"
        onAuthenticated={() => {
          setActivePatient(accountService.getActivePatient());
        }}
      />
    </div>
  );
};
