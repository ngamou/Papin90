import React, { useState } from 'react';
import {
  Layers,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Volume2,
  Send,
  Plus,
  Thermometer,
  Activity,
  Heart,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { QueueItem, TriageUrgency } from '../../types';
import { db } from '../../services/db';
import { syncEngine } from '../../services/syncEngine';

export const WaitingRoomKanban: React.FC = () => {
  const facilities = db.getHealthFacilities();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');
  const [mobileColumn, setMobileColumn] = useState<'waiting' | 'triage' | 'consultation' | 'post_consultation'>('waiting');
  const [queue, setQueue] = useState<QueueItem[]>(db.getQueue());
  const [selectedItemForVitals, setSelectedItemForVitals] = useState<QueueItem | null>(null);
  const [callAlertMessage, setCallAlertMessage] = useState<string | null>(null);

  // Vitals form
  const [bp, setBp] = useState('125/82');
  const [temp, setTemp] = useState(37.1);
  const [weight, setWeight] = useState(70);
  const [pulse, setPulse] = useState(78);

  const refreshData = () => {
    setQueue(db.getQueue());
  };

  const moveItem = (itemId: string, targetCol: QueueItem['column']) => {
    const updated = queue.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          column: targetCol,
          calledAt: targetCol === 'consultation' ? new Date().toISOString() : item.calledAt,
        };
      }
      return item;
    });
    setQueue(updated);
    db.saveQueue(updated);

    // If moved to consultation, notify patient via WhatsApp
    if (targetCol === 'consultation') {
      const patient = updated.find((i) => i.id === itemId);
      if (patient) {
        syncEngine.queueAsyncWhatsAppNotification({
          recipientPhone: patient.patientPhone,
          recipientName: patient.patientName,
          type: 'queue_call',
          language: 'fr',
          messageContent: `DoualaSanté : C'est votre tour ! Le ${patient.practitionerName} vous attend en cabinet.`,
          scheduledTime: new Date().toISOString(),
        });
        triggerCallAnnouncement(patient.patientName, patient.practitionerName);
      }
    }
  };

  const triggerCallAnnouncement = (patientName: string, doctorName: string) => {
    setCallAlertMessage(`Appel en cours : ${patientName} est invité(e) en consultation avec le ${doctorName}`);
    // Simulate vocal chime
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`${patientName}, en consultation`);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Audio fallback
    }
    setTimeout(() => setCallAlertMessage(null), 6000);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForVitals) return;

    const updated = queue.map((item) => {
      if (item.id === selectedItemForVitals.id) {
        return {
          ...item,
          vitalSigns: {
            bloodPressure: bp,
            temperature: temp,
            weightKg: weight,
            pulseBpm: pulse,
          },
          column: 'triage' as const,
        };
      }
      return item;
    });

    setQueue(updated);
    db.saveQueue(updated);
    setSelectedItemForVitals(null);
  };

  // Sort function based on triage priority and arrival
  const priorityWeight: Record<TriageUrgency, number> = {
    red: 4,
    orange: 3,
    yellow: 2,
    green: 1,
  };

  const sortColumnItems = (items: QueueItem[]) => {
    return [...items].sort((a, b) => {
      const pDiff = priorityWeight[b.triageUrgency] - priorityWeight[a.triageUrgency];
      if (pDiff !== 0) return pDiff;
      return new Date(a.arrivalTimestamp).getTime() - new Date(b.arrivalTimestamp).getTime();
    });
  };

  const waitingItems = sortColumnItems(queue.filter((i) => i.column === 'waiting'));
  const triageItems = sortColumnItems(queue.filter((i) => i.column === 'triage'));
  const consultationItems = queue.filter((i) => i.column === 'consultation');
  const postItems = queue.filter((i) => i.column === 'post_consultation');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Salle d’Attente & Triage Médical Intelligent
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            File d’attente temps réel · Priorisation vitale (Rouge/Orange/Jaune/Vert) · Appel vocal & push WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="all">Toutes les formations sanitaires</option>
            {facilities.map((fosa) => (
              <option key={fosa.id} value={fosa.id}>
                {fosa.name} ({fosa.quarter.split(' ')[0]})
              </option>
            ))}
          </select>

          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Real-time Call Alert Strip */}
      {callAlertMessage && (
        <div className="mb-6 p-4 rounded-xl bg-teal-600 text-white flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <span className="text-sm font-bold">{callAlertMessage}</span>
          </div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">SMS/WhatsApp Notifié</span>
        </div>
      )}

      {/* Triage Legend Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-rose-900 block truncate">🔴 Niveau 1 - Rouge</span>
            <span className="text-[10px] text-rose-700">Urgence vitale immédiate</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-orange-900 block truncate">🟠 Niveau 2 - Orange</span>
            <span className="text-[10px] text-orange-700">Très urgent (&lt; 15 min)</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-900 block truncate">🟡 Niveau 3 - Jaune</span>
            <span className="text-[10px] text-amber-700">Prise en charge &lt; 60 min</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-emerald-900 block truncate">🟢 Niveau 4 - Vert</span>
            <span className="text-[10px] text-emerald-700">Consultation de routine</span>
          </div>
        </div>
      </div>

      {/* Mobile Column Tabs Switcher (< lg) */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 bg-slate-200/90 rounded-xl mb-4 overflow-x-auto">
        <button
          onClick={() => setMobileColumn('waiting')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 text-center rounded-lg text-xs font-semibold transition ${
            mobileColumn === 'waiting'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Attente ({waitingItems.length})
        </button>
        <button
          onClick={() => setMobileColumn('triage')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 text-center rounded-lg text-xs font-semibold transition ${
            mobileColumn === 'triage'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Triage ({triageItems.length})
        </button>
        <button
          onClick={() => setMobileColumn('consultation')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 text-center rounded-lg text-xs font-semibold transition ${
            mobileColumn === 'consultation'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          En Consult. ({consultationItems.length})
        </button>
        <button
          onClick={() => setMobileColumn('post_consultation')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 text-center rounded-lg text-xs font-semibold transition ${
            mobileColumn === 'post_consultation'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Soins & Caisse ({postItems.length})
        </button>
      </div>

      {/* Kanban 4 Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Col 1: Waiting */}
        <div className={`${mobileColumn === 'waiting' ? 'flex' : 'hidden'} lg:flex bg-slate-100 rounded-xl p-3 border border-slate-200 flex-col h-[calc(100dvh-280px)] min-h-[460px] lg:h-[620px]`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-xs font-bold text-slate-800">1. En Attente Accueil</h3>
            </div>
            <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 tabular-nums">
              {waitingItems.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {waitingItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.patientName}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{item.patientPhone}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      item.triageUrgency === 'red'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : item.triageUrgency === 'orange'
                        ? 'bg-orange-100 text-orange-800'
                        : item.triageUrgency === 'yellow'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.triageUrgency}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600">
                  <span>Médecin : </span>
                  <strong className="text-slate-800">{item.practitionerName}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="tabular-nums">Attente ~{item.estimatedWaitMinutes} min</span>
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedItemForVitals(item);
                      if (item.vitalSigns) {
                        setBp(item.vitalSigns.bloodPressure || '120/80');
                        setTemp(item.vitalSigns.temperature || 37.0);
                        setWeight(item.vitalSigns.weightKg || 65);
                      }
                    }}
                    className="flex-1 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition"
                  >
                    Prendre Constantes
                  </button>
                  <button
                    onClick={() => moveItem(item.id, 'triage')}
                    className="p-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded"
                    title="Envoyer au Triage"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Triage & Constantes */}
        <div className={`${mobileColumn === 'triage' ? 'flex' : 'hidden'} lg:flex bg-slate-100 rounded-xl p-3 border border-slate-200 flex-col h-[calc(100dvh-280px)] min-h-[460px] lg:h-[620px]`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold text-slate-800">2. Tri & Constantes</h3>
            </div>
            <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 tabular-nums">
              {triageItems.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {triageItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.patientName}</h4>
                    <span className="text-[11px] text-teal-600">{item.practitionerName}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.triageUrgency === 'red'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.triageUrgency}
                  </span>
                </div>

                {item.vitalSigns && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] grid grid-cols-2 gap-1 text-slate-700 font-mono">
                    <div>TA : {item.vitalSigns.bloodPressure || 'N/A'}</div>
                    <div>T° : {item.vitalSigns.temperature || '37'}°C</div>
                    <div>Poids : {item.vitalSigns.weightKg || 'N/A'} kg</div>
                    <div>Pouls : {item.vitalSigns.pulseBpm || 'N/A'} bpm</div>
                  </div>
                )}

                <button
                  onClick={() => moveItem(item.id, 'consultation')}
                  className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Appeler en Consultation</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: En Consultation */}
        <div className={`${mobileColumn === 'consultation' ? 'flex' : 'hidden'} lg:flex bg-teal-50/70 rounded-xl p-3 border border-teal-200 flex-col h-[calc(100dvh-280px)] min-h-[460px] lg:h-[620px]`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
              <h3 className="text-xs font-bold text-teal-900">3. En Consultation</h3>
            </div>
            <span className="text-xs font-bold bg-white text-teal-800 px-2 py-0.5 rounded-full border border-teal-200 tabular-nums">
              {consultationItems.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {consultationItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-lg border border-teal-300 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider block">
                      Cabinet Actif
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{item.patientName}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.calledAt
                      ? `Appelé à ${new Date(item.calledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`
                      : 'En cours'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Praticien : <strong>{item.practitionerName}</strong>
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => moveItem(item.id, 'post_consultation')}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded flex items-center justify-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fin Consultation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 4: Post-Consultation / Facturation / Sortie */}
        <div className={`${mobileColumn === 'post_consultation' ? 'flex' : 'hidden'} lg:flex bg-slate-100 rounded-xl p-3 border border-slate-200 flex-col h-[calc(100dvh-280px)] min-h-[460px] lg:h-[620px]`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">4. Soins & Caisse</h3>
            </div>
            <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 tabular-nums">
              {postItems.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {postItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.patientName}</h4>
                  <p className="text-[11px] text-slate-500">Ordonnance générée · Solde Caisse dû</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Soins validés</span>
                  </span>
                  <button
                    onClick={() => {
                      const updated = queue.filter((i) => i.id !== item.id);
                      setQueue(updated);
                      db.saveQueue(updated);
                    }}
                    className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition"
                  >
                    Clôturer dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vitals Input Modal */}
      {selectedItemForVitals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Prise de Constantes : {selectedItemForVitals.patientName}
                </h3>
                <p className="text-xs text-slate-500">Enregistrement infirmerie avant consultation</p>
              </div>
              <button
                onClick={() => setSelectedItemForVitals(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Tension Artérielle (mmHg) :
                  </label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Température (°C) :</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Poids (kg) :</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pouls (bpm) :</label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForVitals(null)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded shadow-2xs"
                >
                  Valider les constantes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
