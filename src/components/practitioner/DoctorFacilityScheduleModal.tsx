import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  DollarSign,
  X,
} from 'lucide-react';
import { Practitioner, HealthFacility, FacilitySchedule } from '../../types';
import { db } from '../../services/db';

interface DoctorFacilityScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoctor: Practitioner;
  onScheduleUpdated: () => void;
}

export const DoctorFacilityScheduleModal: React.FC<DoctorFacilityScheduleModalProps> = ({
  isOpen,
  onClose,
  selectedDoctor,
  onScheduleUpdated,
}) => {
  const facilities = db.getHealthFacilities();
  const allDoctors = db.getPractitioners();
  const currentDoc = allDoctors.find((d) => d.id === selectedDoctor.id) || selectedDoctor;

  const [isAdding, setIsAdding] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0]?.id || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Lundi', 'Mercredi']);
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('13:30');
  const [roomName, setRoomName] = useState('Cabinet Spécialisé 1');
  const [consultationFee, setConsultationFee] = useState(selectedDoctor.consultationFee);
  const [notes, setNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleValidateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert('Veuillez sélectionner au moins un jour de consultation.');
      return;
    }

    const facility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

    // Check for overlap with existing schedules of this doctor in OTHER facilities
    let hasConflict = false;
    currentDoc.facilitySchedules?.forEach((s) => {
      const commonDays = s.days.filter((d) => selectedDays.includes(d));
      if (commonDays.length > 0 && s.facilityId !== facility.id) {
        // Simple hour comparison
        if (
          (startTime >= s.timeSlots.start && startTime < s.timeSlots.end) ||
          (endTime > s.timeSlots.start && endTime <= s.timeSlots.end) ||
          (startTime <= s.timeSlots.start && endTime >= s.timeSlots.end)
        ) {
          hasConflict = true;
          setConflictWarning(
            `Chevauchement horaire détecté le ${commonDays.join(', ')} : ${currentDoc.name} est déjà programmé(e) à ${s.facilityName} (${s.timeSlots.start} - ${s.timeSlots.end}). Veuillez décaler vos créneaux.`
          );
        }
      }
    });

    if (hasConflict) {
      return;
    }

    const newSchedule: FacilitySchedule = {
      id: 'sched_' + Date.now(),
      facilityId: facility.id,
      facilityName: facility.name,
      facilityQuarter: facility.quarter,
      days: selectedDays,
      timeSlots: { start: startTime, end: endTime },
      slotDurationMinutes: 30,
      rooms: [roomName],
      consultationFee,
      depositFee: 2000,
      notes: notes || `Consultations spécialisées à ${facility.name}`,
    };

    db.addDoctorFacilitySchedule(currentDoc.id, newSchedule);
    onScheduleUpdated();
    setIsAdding(false);
    setConflictWarning(null);
  };

  const handleRemoveSchedule = (schedId: string) => {
    if (confirm('Voulez-vous supprimer ce créneau dans cette formation sanitaire ?')) {
      db.removeDoctorFacilitySchedule(currentDoc.id, schedId);
      onScheduleUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2.5 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={currentDoc.avatar}
              alt={currentDoc.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-teal-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold">{currentDoc.name}</h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-sm">
                  {currentDoc.specialty}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Gestion des plannings multi-sites & formations sanitaires à Douala (FOSA)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-xs">
          {/* Top Info Banner */}
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">
                Exercice Médical Multi-Sites à Douala (Cliniques & Hôpitaux)
              </strong>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Ce spécialiste peut intervenir dans différentes formations sanitaires de la ville (Bonanjo, Akwa,
                Bonapriso, Makepe, Deïdo). Chaque établissement dispose de ses propres jours, tranches horaires et honoraires de consultation.
              </p>
            </div>
          </div>

          {/* Conflict Alert if any */}
          {conflictWarning && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <strong className="font-semibold block">Conflit de planning détecté :</strong>
                <span>{conflictWarning}</span>
              </div>
            </div>
          )}

          {/* List of current schedules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Formations sanitaires actives pour ce médecin ({currentDoc.facilitySchedules?.length || 0}) :
              </h4>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une Formation Sanitaire</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentDoc.facilitySchedules?.map((sched) => (
                <div
                  key={sched.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{sched.facilityName}</span>
                      <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{sched.facilityQuarter}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-600 text-xs">
                      <span className="flex items-center gap-1 font-medium text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sched.days.join(', ')}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {sched.timeSlots.start} - {sched.timeSlots.end}
                        </span>
                      </span>
                      <span className="text-slate-500">Salle : {sched.rooms.join(', ')}</span>
                    </div>

                    {sched.notes && (
                      <p className="text-[11px] text-slate-500 italic">{sched.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Tarif consultation :</span>
                      <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        {sched.consultationFee.toLocaleString()} FCFA
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveSchedule(sched.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      title="Supprimer ce créneau"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Add New Facility Schedule */}
          {isAdding && (
            <form
              onSubmit={handleValidateSchedule}
              className="p-5 rounded-2xl bg-white border-2 border-teal-500/40 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>Programmer un créneau dans une nouvelle formation sanitaire</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Facility Select */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Formation Sanitaire d’affectation à Douala :
                </label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  {facilities.map((fosa) => (
                    <option key={fosa.id} value={fosa.id}>
                      {fosa.name} — {fosa.quarter} ({fosa.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* Days multi-select */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jours de présence dans cet établissement :
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Heure de début :</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Heure de fin :</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Salle / Bureau :</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Cabinet 2"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Fee in this facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Honoraires Consultation (FCFA) :
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(parseInt(e.target.value) || 10000)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Activité spécifique / Précisions :
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Échographie Doppler, Suivi prénatal..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Enregistrer ce planning dans la formation sanitaire
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Synchronisation instantanée avec le chatbot WhatsApp et le portail patient
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
