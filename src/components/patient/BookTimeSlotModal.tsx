/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  QrCode,
  Download,
  Building2,
  ShieldCheck,
  Video,
  Smartphone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Practitioner, Appointment, HealthFacility, TriageUrgency } from '../../types';
import { db } from '../../services/db';
import { accountService } from '../../services/accountService';

interface BookTimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoctor?: Practitioner | null;
  onAppointmentConfirmed?: (appointment: Appointment) => void;
  onOpenAuth?: () => void;
}

export const BookTimeSlotModal: React.FC<BookTimeSlotModalProps> = ({
  isOpen,
  onClose,
  selectedDoctor,
  onAppointmentConfirmed,
  onOpenAuth,
}) => {
  const doctors = db.getPractitioners();
  const facilities = db.getHealthFacilities();
  const activePatient = accountService.getActivePatient();

  const [doctorId, setDoctorId] = useState<string>(selectedDoctor?.id || doctors[0]?.id || 'dr_kamdem');
  const [facilityId, setFacilityId] = useState<string>(facilities[0]?.id || 'fosa_littoral');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:30');
  const [consultationType, setConsultationType] = useState<'in_person' | 'teleconsultation'>('in_person');
  const [symptoms, setSymptoms] = useState('Consultation de suivi & contrôle tensionnel');
  const [urgency, setUrgency] = useState<TriageUrgency>('yellow');

  // Patient Info
  const [patientName, setPatientName] = useState(activePatient?.name || 'Samuel Moukoko');
  const [patientPhone, setPatientPhone] = useState(activePatient?.phone || '+237 699 88 77 66');
  const [patientEmail, setPatientEmail] = useState(activePatient?.email || 'samuel.moukoko@gmail.com');
  const [patientQuarter, setPatientQuarter] = useState(activePatient?.quarter || 'Bonanjo');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'orange_money' | 'cash'>('mtn_momo');
  const [paymentPhone, setPaymentPhone] = useState(activePatient?.phone || '+237 699 88 77 66');

  // Steps: 'form' | 'processing' | 'confirmed'
  const [step, setStep] = useState<'form' | 'processing' | 'confirmed'>('form');
  const [loading, setLoading] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  const currentDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];
  const currentFacility = facilities.find((f) => f.id === facilityId) || facilities[0];

  const availableSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep('processing');

    try {
      // Simulate real-time Cameroon MoMo push prompt (*126# / *150#)
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const res = await accountService.bookSlot({
        patientId: activePatient?.id,
        patientName,
        patientPhone,
        patientEmail,
        patientQuarter,
        practitionerId: currentDoctor.id,
        practitionerName: currentDoctor.name,
        facilityId: currentFacility.id,
        facilityName: currentFacility.name,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        consultationType,
        symptoms,
        triageUrgency: urgency,
        paymentMethod,
        amountPaid: 2000,
      });

      if (res.success && res.appointment) {
        setConfirmedAppointment(res.appointment);
        setStep('confirmed');
        if (onAppointmentConfirmed) {
          onAppointmentConfirmed(res.appointment);
        }
      } else {
        alert(res.error || 'Erreur lors de la réservation');
        setStep('form');
      }
    } catch {
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2.5 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Réservation de Créneau Horaire</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Confirmation Immédiate
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Choix du médecin, du lieu de consultation et validation du billet QR avec acompte MoMo
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

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {step === 'form' && (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Patient Banner */}
              {activePatient ? (
                <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-teal-900">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>
                      Compte Patient actif : <strong>{activePatient.name}</strong> ({activePatient.quarter} · {activePatient.phone})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                    Auto-rempli
                  </span>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Vous réservez en tant qu’invité ou nouveau patient.</span>
                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="text-xs text-teal-700 font-bold hover:underline"
                    >
                      Se connecter / Créer un compte →
                    </button>
                  )}
                </div>
              )}

              {/* 1. Doctor & Facility Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Médecin Spécialiste *</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden font-medium"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Formation Sanitaire à Douala *
                  </label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden font-medium"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.quarter.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Details Pill */}
              {currentDoctor && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{currentDoctor.name}</span>
                    <span className="text-teal-700 font-medium text-[11px]">{currentDoctor.specialty}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Tarif de consultation</span>
                    <strong className="text-slate-900 font-mono">
                      {currentDoctor.consultationFee.toLocaleString()} FCFA
                    </strong>
                  </div>
                </div>
              )}

              {/* 2. Date & Time Slot Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Date & Créneaux Horaires Disponibles *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs px-2.5 py-1 border border-slate-200 rounded-md font-mono"
                  />
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-mono font-bold transition border ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Mode & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de consultation *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultationType('in_person')}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border flex items-center justify-center gap-1.5 transition ${
                        consultationType === 'in_person'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>En Clinique</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('teleconsultation')}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border flex items-center justify-center gap-1.5 transition ${
                        consultationType === 'teleconsultation'
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-teal-600" />
                      <span>Téléconsultation</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Niveau d’urgence</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as TriageUrgency)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                  >
                    <option value="green">Vert (Routine / Contrôle de santé)</option>
                    <option value="yellow">Jaune (Symptômes modérés, fièvre légère)</option>
                    <option value="orange">Orange (Douleur aiguë, hypertension)</option>
                    <option value="red">Rouge (Urgence vitale immédiate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif de consultation / Symptômes
                </label>
                <input
                  type="text"
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="ex: Palpitations, fièvre persistante, renouvellement traitement..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              {/* 4. Patient Information */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block mb-2">Coordonnées du Patient :</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Nom et Prénom *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Samuel Moukoko"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Numéro de téléphone (+237) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => {
                        setPatientPhone(e.target.value);
                        setPaymentPhone(e.target.value);
                      }}
                      placeholder="+237 6..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Mobile Money Deposit (2,000 FCFA) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Acompte de Réservation obligatoire : 2 000 FCFA
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Garantit le créneau sans surbooking · Déduit du tarif de consultation
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    2 000 FCFA
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_momo')}
                    className={`p-2 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'mtn_momo'
                        ? 'border-yellow-500 bg-yellow-50 text-slate-900 font-bold ring-1 ring-yellow-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-yellow-600" />
                    <span className="text-[11px]">MTN MoMo (*126#)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`p-2 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'orange_money'
                        ? 'border-orange-500 bg-orange-50 text-slate-900 font-bold ring-1 ring-orange-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span className="text-[11px]">Orange Money (*150#)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'cash'
                        ? 'border-teal-600 bg-teal-50 text-slate-900 font-bold ring-1 ring-teal-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span className="text-[11px]">Caisse / Espèces</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-4"
              >
                <span>Confirmer le créneau de {selectedTimeSlot} (Payer 2 000 FCFA)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-500 mx-auto flex items-center justify-center animate-spin">
                <Clock className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Validation du Paiement Mobile Money...</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Envoi de la requête USSD vers votre mobile ({paymentPhone}). Réservation en cours du créneau de{' '}
                  {selectedTimeSlot} avec {currentDoctor.name}...
                </p>
              </div>
            </div>
          )}

          {step === 'confirmed' && confirmedAppointment && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Créneau Réservé avec Succès !</h3>
                <p className="text-xs text-slate-500">
                  Votre billet de consultation a été généré et enregistré dans votre carnet de santé.
                </p>
              </div>

              {/* Digital Consultation Ticket Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      DS
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 block">Billet Numérique de Consultation</strong>
                      <span className="text-[10px] text-slate-500">DoualaSanté · Loi 2024/017 Cameroun</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {confirmedAppointment.qrTicketCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Patient</span>
                    <strong className="text-slate-900">{confirmedAppointment.patientName}</strong>
                    <span className="text-[10px] text-slate-500 block">{confirmedAppointment.patientPhone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Médecin</span>
                    <strong className="text-slate-900">{confirmedAppointment.practitionerName}</strong>
                    <span className="text-[10px] text-teal-700 block">{currentDoctor.specialty}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Lieu & Heure</span>
                    <strong className="text-slate-900">
                      {confirmedAppointment.date} à {confirmedAppointment.timeSlot}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">{confirmedAppointment.facilityName}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 block">Pass d'accès Salle d’Attente</strong>
                      <span className="text-[10px] text-slate-500">
                        À présenter à l’accueil pour coupe-file automatique
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    Payé (2 000 F)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const ticketData = `Billet Consultation DoualaSante\nCode: ${confirmedAppointment.qrTicketCode}\nPatient: ${confirmedAppointment.patientName}\nDocteur: ${confirmedAppointment.practitionerName}\nDate: ${confirmedAppointment.date} a ${confirmedAppointment.timeSlot}\nLieu: ${confirmedAppointment.facilityName}`;
                    const blob = new Blob([ticketData], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Ticket-RDV-${confirmedAppointment.id}.txt`;
                    a.click();
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le Billet</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
