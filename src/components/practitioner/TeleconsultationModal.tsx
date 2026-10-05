import React, { useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  FileText,
  Shield,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { Appointment } from '../../types';
import { db } from '../../services/db';

interface TeleconsultationModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPrescription: (app: Appointment) => void;
}

export const TeleconsultationModal: React.FC<TeleconsultationModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onOpenPrescription,
}) => {
  if (!isOpen || !appointment) return null;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [consultationNotes, setConsultationNotes] = useState(
    'Patient se plaint de légers vertiges au réveil. Tension rapportée à domicile : 138/88 mmHg. Recommandation : Ajustement posologique.'
  );
  const [callEnded, setCallEnded] = useState(false);

  const handleEndCall = () => {
    setCallEnded(true);
    db.addAuditLog(
      appointment.practitionerName,
      'Clôture Téléconsultation HD',
      `Téléconsultation vidéo terminée pour ${appointment.patientName}. Durée: 14 min. Données chiffrées de bout en bout (TLS 1.3 / SRTP).`,
      appointment.patientId
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[92dvh] sm:h-[650px] text-white">
        {/* Top bar */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Téléconsultation Vidéo Sécurisée DoualaSanté</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded-sm font-mono">
                  TLS 1.3 / SRTP
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Patient : {appointment.patientName} · {appointment.practitionerName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {/* Video Call Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-y-auto md:overflow-hidden bg-slate-950">
          {/* Main Patient Video Box */}
          <div className="md:col-span-2 relative p-4 flex flex-col items-center justify-center bg-slate-900 border-r border-slate-800">
            {isVideoOn ? (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden border border-slate-700">
                <div className="w-24 h-24 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center text-teal-300 text-3xl font-bold">
                  {appointment.patientName.charAt(0)}
                </div>
                <span className="mt-3 text-sm font-bold text-white">{appointment.patientName}</span>
                <span className="text-xs text-teal-400">Flux vidéo HD actif (Douala Orange 4G)</span>

                {/* Self View (Doctor PIP) */}
                <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg bg-slate-950 border border-teal-500/50 overflow-hidden shadow-lg">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-[10px] text-slate-300">
                    <span className="font-semibold text-teal-300 truncate px-1">Dr. Kamdem</span>
                    <span>Caméra Médecin</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs">
                <VideoOff className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <span>Caméra désactivée</span>
              </div>
            )}

            {/* Video Controls bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 rounded-full transition ${
                  isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
                title="Microphone"
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2.5 rounded-full transition ${
                  isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
                title="Caméra"
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition"
                title="Raccrocher"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Sidebar: Doctor Clinical Notes during Call */}
          <div className="p-4 flex flex-col justify-between bg-slate-900 border-t md:border-t-0 border-slate-800 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dossier Consultation Directe</span>
                </h4>
                <span className="text-[10px] text-slate-400">Temps : 14:20</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Observations cliniques médecin :
                </label>
                <textarea
                  rows={5}
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[11px] space-y-1 text-slate-300">
                <div className="text-slate-400 font-semibold">Antécédents du patient :</div>
                <div>· Allergie : Pénicilline</div>
                <div>· Hypertension traitée depuis 2023</div>
                <div>· Suivi à la Clinique du Littoral</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onOpenPrescription(appointment)}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Rédiger l'Ordonnance en direct</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition"
              >
                Quitter la session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
