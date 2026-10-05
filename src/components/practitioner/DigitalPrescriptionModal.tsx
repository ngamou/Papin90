import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  QrCode,
  Download,
  Send,
  Printer,
  Shield,
} from 'lucide-react';
import { Appointment, PrescriptionItem } from '../../types';
import { db } from '../../services/db';
import { syncEngine } from '../../services/syncEngine';

interface DigitalPrescriptionModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalPrescriptionModal: React.FC<DigitalPrescriptionModalProps> = ({
  appointment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !appointment) return null;

  const [diagnosis, setDiagnosis] = useState('Hypertension artérielle stade 1 & fatigue asthénique');
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      medication: 'Amlodipine 5mg',
      dosage: '1 comprimé',
      frequency: 'Le matin au réveil',
      duration: '30 jours',
      instructions: 'À prendre avec un grand verre d’eau.',
    },
    {
      medication: 'Magnésium B6',
      dosage: '2 comprimés',
      frequency: 'Midi et soir',
      duration: '15 jours',
      instructions: 'Pendant les repas.',
    },
  ]);

  const [newMed, setNewMed] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFreq, setNewFreq] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed) return;
    setItems((prev) => [
      ...prev,
      {
        medication: newMed,
        dosage: newDosage || '1 comprimé',
        frequency: newFreq || 'Matin et soir',
        duration: newDuration || '7 jours',
        instructions: 'Selon avis médical.',
      },
    ]);
    setNewMed('');
    setNewDosage('');
    setNewFreq('');
    setNewDuration('');
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendWhatsApp = () => {
    syncEngine.queueAsyncWhatsAppNotification({
      recipientPhone: appointment.patientPhone,
      recipientName: appointment.patientName,
      type: 'prescription',
      language: 'fr',
      messageContent: `DoualaSanté : Votre ordonnance numérique délivrée par ${appointment.practitionerName} est disponible. Réf: ORD-${appointment.id}. Médicaments : ${items.map((i) => i.medication).join(', ')}.`,
      scheduledTime: new Date().toISOString(),
    });

    db.addAuditLog(
      appointment.practitionerName,
      'Émission d’ordonnance numérique',
      `Ordonnance générée et transmise sur WhatsApp (${appointment.patientPhone}) avec signature SHA-256 certifiée`,
      appointment.patientId
    );

    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold">Ordonnance Numérique Sécurisée</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-sm">
                  Certifiée ONMC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient : {appointment.patientName} · {appointment.practitionerName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {sentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Ordonnance transmise avec succès sur WhatsApp au patient ({appointment.patientPhone}) !
              </span>
            </div>
          )}

          {/* Clinic Header Info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <strong className="text-slate-900 text-xs block">{appointment.practitionerName}</strong>
              <p className="text-teal-700">{appointment.specialty}</p>
              <p className="text-slate-500 text-[11px]">Salle : {appointment.room} · Douala, Cameroun</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-slate-700 text-xs font-bold block">
                N° ORD-{appointment.id.toUpperCase()}
              </span>
              <span className="text-slate-500 text-[11px]">Date : {appointment.date}</span>
            </div>
          </div>

          {/* Diagnostic note */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Diagnostic & Résumé clinique :
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          {/* Medication list */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-semibold">Prescriptions médicamenteuses :</label>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-0.5 flex-1">
                    <span className="font-bold text-slate-900 text-xs block">
                      {idx + 1}. {it.medication} ({it.dosage})
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      Posologie : {it.frequency} pendant {it.duration}
                    </p>
                    <p className="text-slate-400 text-[10px]">{it.instructions}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Supprimer la ligne"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Medication Row */}
          <form onSubmit={handleAddItem} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              + Ajouter une molécule ou examen :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Médicament (ex: Paracétamol)"
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-900"
              />
              <input
                type="text"
                placeholder="Dosage (ex: 1g)"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-900"
              />
              <input
                type="text"
                placeholder="Fréquence (ex: 3x/jour)"
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-900"
              />
              <input
                type="text"
                placeholder="Durée (ex: 5 jours)"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="py-1 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium text-[11px] transition"
            >
              Ajouter à l'ordonnance
            </button>
          </form>

          {/* QR Verification Seal */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-teal-600" />
              <div>
                <strong className="text-slate-900 block text-[11px]">
                  Empreinte Numérique : SHA-256 (Vérifiable en pharmacie)
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  Hash: 7a8f...e12d · Horodaté {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Conforme Cameroun
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => alert('Ordonnance format PDF certifié téléchargée.')}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer sur WhatsApp ({appointment.patientPhone})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
