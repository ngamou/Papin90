import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  User,
  MapPin,
  CheckCircle,
  Video,
  FileText,
  Filter,
  Layers,
  Building2,
  Settings,
  ArrowRight,
  Stethoscope,
  LogOut,
  Award,
} from 'lucide-react';
import { Practitioner, Appointment, TriageUrgency, HealthFacility, DoctorAccount } from '../../types';
import { db } from '../../services/db';
import { accountService } from '../../services/accountService';
import { DoctorFacilityScheduleModal } from './DoctorFacilityScheduleModal';
import { UserAuthModal } from '../auth/UserAuthModal';

interface PractitionerAgendaProps {
  onStartConsultation: (app: Appointment) => void;
  onOpenTeleconsultation: (app: Appointment) => void;
  onOpenPrescription: (app: Appointment) => void;
}

export const PractitionerAgenda: React.FC<PractitionerAgendaProps> = ({
  onStartConsultation,
  onOpenTeleconsultation,
  onOpenPrescription,
}) => {
  const [activeDoctor, setActiveDoctor] = useState<DoctorAccount | null>(accountService.getActiveDoctor());
  const [isDoctorAuthModalOpen, setIsDoctorAuthModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(activeDoctor?.id || 'all');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [viewMode, setViewMode] = useState<'daily' | 'matrix'>('daily');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [scheduleModalDoctor, setScheduleModalDoctor] = useState<Practitioner | null>(null);

  useEffect(() => {
    const unsub = accountService.subscribe(() => {
      const doc = accountService.getActiveDoctor();
      setActiveDoctor(doc);
      if (doc) setSelectedDoctorId(doc.id);
    });
    return () => unsub();
  }, []);

  const practitioners = db.getPractitioners();
  const facilities = db.getHealthFacilities();
  const appointments = db.getAppointments();

  // Form states for adding urgent appointment
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('+237 6');
  const [newDocId, setNewDocId] = useState(practitioners[0]?.id || 'dr_kamdem');
  const [newFacilityId, setNewFacilityId] = useState(facilities[0]?.id || 'fosa_littoral');
  const [newTimeSlot, setNewTimeSlot] = useState('11:30');
  const [newReason, setNewReason] = useState('Urgence hypertensive ou détresse');
  const [newTriage, setNewTriage] = useState<TriageUrgency>('orange');
  const [newRoom, setNewRoom] = useState(facilities[0]?.rooms[0] || 'Cabinet 1');

  const filteredAppointments = appointments.filter((app) => {
    const matchDoc = selectedDoctorId === 'all' || app.practitionerId === selectedDoctorId;
    const matchFacility =
      selectedFacilityId === 'all' ||
      app.facilityId === selectedFacilityId ||
      (!app.facilityId && selectedFacilityId === 'fosa_littoral');
    const matchDate = app.date === selectedDate;
    return matchDoc && matchFacility && matchDate;
  });

  // Check for room & cross-facility conflicts
  const conflicts: string[] = [];
  const roomSlotMap = new Map<string, string>();
  const doctorSlotMap = new Map<string, { docName: string; facilityName: string; time: string }>();

  filteredAppointments.forEach((app) => {
    const fosaName = app.facilityName || 'Clinique';
    const roomKey = `${fosaName}_${app.room}_${app.timeSlot}`;
    if (roomSlotMap.has(roomKey)) {
      conflicts.push(
        `Conflit de salle à ${fosaName} : "${app.room}" est réservée à ${app.timeSlot} (${app.patientName} & ${roomSlotMap.get(roomKey)})`
      );
    } else {
      roomSlotMap.set(roomKey, app.patientName);
    }

    const docKey = `${app.practitionerId}_${app.timeSlot}`;
    if (doctorSlotMap.has(docKey)) {
      const prev = doctorSlotMap.get(docKey)!;
      if (prev.facilityName !== fosaName) {
        conflicts.push(
          `Conflit multi-sites : ${app.practitionerName} est programmé(e) simultanément à ${prev.facilityName} et à ${fosaName} à ${app.timeSlot} !`
        );
      }
    } else {
      doctorSlotMap.set(docKey, { docName: app.practitionerName, facilityName: fosaName, time: app.timeSlot });
    }
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = practitioners.find((p) => p.id === newDocId) || practitioners[0];
    const fosa = facilities.find((f) => f.id === newFacilityId) || facilities[0];

    const newApp: Appointment = {
      id: 'rdv-urg-' + Date.now().toString().slice(-4),
      patientId: 'pat_urg_' + Date.now(),
      patientName: newPatientName,
      patientPhone: newPatientPhone,
      practitionerId: doc.id,
      practitionerName: doc.name,
      specialty: doc.specialty,
      date: selectedDate,
      timeSlot: newTimeSlot,
      type: 'urgent',
      facilityId: fosa.id,
      facilityName: fosa.name,
      facilityQuarter: fosa.quarter,
      room: newRoom,
      reason: newReason,
      triageUrgency: newTriage,
      status: 'confirmed',
      amountTotal: doc.consultationFee,
      amountPaid: 2000,
      paymentMethod: 'cash',
      bookingChannel: 'reception',
      qrTicketCode: `DS-URG-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    db.saveAppointment(newApp);
    setShowAddModal(false);
    setNewPatientName('');
  };

  const handleFacilityChangeForUrgent = (facilityId: string) => {
    setNewFacilityId(facilityId);
    const f = facilities.find((item) => item.id === facilityId);
    if (f && f.rooms.length > 0) {
      setNewRoom(f.rooms[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Top Header & Multi-Facility Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Agenda Médical Multi-Praticiens & Multi-Sites (Douala)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plannings personnalisés par formation sanitaire (FOSA) · Détection des chevauchements · Créneaux d’urgence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda du Jour
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matrice Hebdo FOSA
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto text-xs font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            />

            {/* Facility Filter */}
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full sm:w-auto text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium truncate"
            >
              <option value="all">Toutes les formations sanitaires</option>
              {facilities.map((fosa) => (
                <option key={fosa.id} value={fosa.id}>
                  {fosa.name} ({fosa.quarter.split(' ')[0]})
                </option>
              ))}
            </select>

            {/* Doctor Filter */}
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full sm:w-auto text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium truncate"
            >
              <option value="all">Tous les médecins</option>
              {practitioners.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créneau d’Urgence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Doctor Account Banner */}
      {activeDoctor ? (
        <div className="bg-teal-900 text-white rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-teal-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-800 border border-teal-600/50 flex items-center justify-center font-bold text-white shrink-0">
              <Stethoscope className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{activeDoctor.name}</span>
                <span className="text-[10px] bg-teal-800 text-teal-200 border border-teal-700 px-2 py-0.5 rounded font-mono">
                  {activeDoctor.onmcNumber}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-medium">
                  Praticien Connecté
                </span>
              </div>
              <span className="text-[11px] text-teal-200/90">
                {activeDoctor.specialty} · {activeDoctor.clinicName} · {activeDoctor.consultationFee.toLocaleString()} FCFA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const currentPrac = practitioners.find((p) => p.id === activeDoctor.id) || practitioners[0];
                setScheduleModalDoctor(currentPrac);
              }}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition border border-teal-600 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gérer mes créneaux FOSA</span>
            </button>
            <button
              onClick={() => accountService.logoutDoctor()}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Espace Praticien & Agenda Médecin</div>
              <p className="text-[11px] text-slate-500">
                Connectez-vous avec votre compte médecin certifié ONMC pour gérer vos plages horaires et vos consultations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDoctorAuthModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Connexion / Inscription Médecin</span>
            </button>
          </div>
        </div>
      )}

      {/* Conflicts Alert if any */}
      {conflicts.length > 0 && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold">Alerte de conflits de plannings inter-établissements :</strong>
            {conflicts.map((c, i) => (
              <p key={i}>{c}</p>
            ))}
          </div>
        </div>
      )}

      {/* Practitioner Profiles Preview Strip with Multi-Facility Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {practitioners.map((doc) => {
          const isSelected = selectedDoctorId === doc.id || selectedDoctorId === 'all';
          const facilityCount = doc.facilitySchedules?.length || 1;

          return (
            <div
              key={doc.id}
              className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-teal-500 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-teal-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                    <p className="text-[11px] text-teal-600 truncate">{doc.specialty}</p>
                  </div>
                </div>

                {/* Multi-facility badge pills */}
                <div className="mt-2.5 space-y-1 border-t border-slate-100 pt-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Formations sanitaires ({facilityCount}) :
                  </span>
                  <div className="space-y-1">
                    {doc.facilitySchedules?.map((sched) => (
                      <div
                        key={sched.id}
                        className="text-[10px] text-slate-700 bg-slate-50 border border-slate-200/80 p-1 rounded flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900 truncate">
                          {sched.facilityName.split(' ')[0]} {sched.facilityName.split(' ')[1] || ''}
                        </span>
                        <span className="text-slate-500 font-mono text-[9px]">
                          {sched.days.map((d) => d.slice(0, 3)).join('/')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className="text-[11px] font-medium text-teal-700 hover:underline"
                >
                  Filtrer agenda
                </button>
                <button
                  onClick={() => setScheduleModalDoctor(doc)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                  title="Gérer les formations sanitaires et horaires de ce médecin"
                >
                  <Settings className="w-3 h-3" />
                  <span>Gérer FOSA</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW MODE 1: DAILY AGENDA */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>
                Consultations programmées pour le {selectedDate}
                {selectedFacilityId !== 'all' && (
                  <span className="text-teal-700">
                    {' '}
                    · {facilities.find((f) => f.id === selectedFacilityId)?.name}
                  </span>
                )}
              </span>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              {filteredAppointments.length} rendez-vous au total
            </span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Aucun rendez-vous planifié pour cette date dans cette formation sanitaire.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 shrink-0 text-center py-1.5 px-2 bg-slate-100 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {app.timeSlot}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{app.patientName}</span>
                        <span className="text-xs font-mono text-slate-500">{app.patientPhone}</span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-sm font-semibold uppercase tracking-wider ${
                            app.triageUrgency === 'red'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : app.triageUrgency === 'orange'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : app.triageUrgency === 'yellow'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {app.triageUrgency}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        <strong>Établissement :</strong>{' '}
                        <span className="text-teal-800 font-semibold">
                          {app.facilityName || 'Clinique du Littoral'} ({app.facilityQuarter || 'Bonanjo'})
                        </span>{' '}
                        · <strong>Salle :</strong> {app.room}
                      </p>

                      <p className="text-xs text-slate-600">
                        <strong>Médecin :</strong> {app.practitionerName} ({app.specialty})
                      </p>

                      <p className="text-xs text-slate-500 italic">
                        Motif : {app.reason} {app.triageNotes && `(Note triage: ${app.triageNotes})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {app.type === 'teleconsultation' ? (
                      <button
                        onClick={() => onOpenTeleconsultation(app)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Téléconsultation</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartConsultation(app)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Prendre en charge</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenPrescription(app)}
                      className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1 transition"
                      title="Rédiger une ordonnance numérique"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ordonnance</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: WEEKLY MULTI-FACILITY MATRIX */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Matrice Hebdomadaire des Médecins par Formation Sanitaire à Douala
              </h3>
              <p className="text-[11px] text-slate-500">
                Vue synoptique des jours d'intervention, créneaux horaires et salles de chaque spécialiste
              </p>
            </div>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="md:hidden divide-y divide-slate-100">
            {practitioners.map((doc) => (
              <div key={doc.id} className="p-3.5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-teal-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs">{doc.name}</div>
                    <div className="text-[11px] text-teal-600">{doc.specialty}</div>
                  </div>
                  <button
                    onClick={() => setScheduleModalDoctor(doc)}
                    className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold rounded-md border border-slate-200 transition"
                  >
                    Modifier FOSA
                  </button>
                </div>

                <div className="space-y-2 pl-2 border-l-2 border-teal-500/30">
                  {(doc.facilitySchedules || []).map((sched) => (
                    <div
                      key={sched.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="truncate">{sched.facilityName}</span>
                        <span className="text-teal-700 font-mono font-bold shrink-0">
                          {sched.consultationFee.toLocaleString()} F
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{sched.facilityQuarter}</span>
                        </span>
                        <span>·</span>
                        <span className="font-medium text-slate-800">{sched.days.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono font-medium text-slate-700">
                          {sched.timeSlots.start} - {sched.timeSlots.end}
                        </span>
                        <span>Salle : {sched.rooms.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Médecin Spécialiste</th>
                  <th className="py-2.5 px-4">Formation Sanitaire (FOSA)</th>
                  <th className="py-2.5 px-4">Quartier Douala</th>
                  <th className="py-2.5 px-4">Jours de Présence</th>
                  <th className="py-2.5 px-4">Tranche Horaire</th>
                  <th className="py-2.5 px-4">Salle Attribuée</th>
                  <th className="py-2.5 px-4 text-right">Tarif Consultation</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {practitioners.flatMap((doc) =>
                  (doc.facilitySchedules || []).map((sched, idx) => (
                    <tr key={sched.id} className="hover:bg-slate-50 transition">
                      {idx === 0 ? (
                        <td
                          rowSpan={doc.facilitySchedules?.length || 1}
                          className="py-3 px-4 font-bold text-slate-900 bg-white border-r border-slate-100 align-top"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={doc.avatar}
                              alt={doc.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <div>{doc.name}</div>
                              <span className="text-[10px] text-teal-600 font-normal block">
                                {doc.specialty}
                              </span>
                            </div>
                          </div>
                        </td>
                      ) : null}

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {sched.facilityName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{sched.facilityQuarter}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {sched.days.join(', ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 tabular-nums">
                        {sched.timeSlots.start} - {sched.timeSlots.end}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{sched.rooms.join(', ')}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        {sched.consultationFee.toLocaleString()} F
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setScheduleModalDoctor(doc)}
                          className="text-teal-700 hover:underline text-[11px] font-medium"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Urgent Appointment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Ajouter un Créneau d’Urgence / Surbooking Médical
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nom complet du patient :</label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="Ex: David Ngando"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Téléphone Douala :</label>
                  <input
                    type="text"
                    required
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Heure de consultation :</label>
                  <input
                    type="time"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Health Facility Choice */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Formation Sanitaire du rendez-vous :
                </label>
                <select
                  value={newFacilityId}
                  onChange={(e) => handleFacilityChangeForUrgent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {facilities.map((fosa) => (
                    <option key={fosa.id} value={fosa.id}>
                      {fosa.name} ({fosa.quarter})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Praticien référent :</label>
                  <select
                    value={newDocId}
                    onChange={(e) => setNewDocId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    {practitioners.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Salle réservée :</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Niveau d’urgence de triage :</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['green', 'yellow', 'orange', 'red'] as TriageUrgency[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewTriage(level)}
                      className={`py-1.5 px-2 rounded border uppercase font-bold text-[10px] tracking-wider transition ${
                        newTriage === level
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Motif d'urgence :</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Confirmer le créneau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Facility Schedule Management Modal */}
      {scheduleModalDoctor && (
        <DoctorFacilityScheduleModal
          isOpen={!!scheduleModalDoctor}
          onClose={() => setScheduleModalDoctor(null)}
          selectedDoctor={scheduleModalDoctor}
          onScheduleUpdated={() => {
            // refresh
          }}
        />
      )}

      {/* Doctor Auth Modal */}
      <UserAuthModal
        isOpen={isDoctorAuthModalOpen}
        onClose={() => setIsDoctorAuthModalOpen(false)}
        defaultRole="doctor"
        onAuthenticated={() => {
          setActiveDoctor(accountService.getActiveDoctor());
        }}
      />
    </div>
  );
};
