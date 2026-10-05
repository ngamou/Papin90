import React, { useState } from 'react';
import {
  Send,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Smartphone,
  Phone,
  Video,
  FileText,
  Languages,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Building2,
} from 'lucide-react';
import { Practitioner, Language, TriageUrgency, Appointment, FacilitySchedule } from '../../types';
import { db } from '../../services/db';
import { translations } from '../../i18n/translations';
import { paymentService } from '../../services/paymentService';
import { syncEngine } from '../../services/syncEngine';

interface PatientWhatsAppViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onAppointmentBooked: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  flowCard?: 'welcome' | 'specialist_picker' | 'facility_picker' | 'slot_picker' | 'triage_picker' | 'payment' | 'ticket';
  ticketData?: Appointment;
  localText?: string;
}

export const PatientWhatsAppView: React.FC<PatientWhatsAppViewProps> = ({
  language,
  onLanguageChange,
  onAppointmentBooked,
}) => {
  const t = translations[language];

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Bonjour et bienvenue sur DoualaSanté ! 🇨🇲\nPrenez rendez-vous en quelques clics avec les meilleurs spécialistes de Douala, sans installer d’application.',
      time: '09:00',
      localText: t.localPhrases.welcomeGreeting,
      flowCard: 'welcome',
    },
  ]);

  // Selected booking parameters
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const [selectedFacilitySchedule, setSelectedFacilitySchedule] = useState<FacilitySchedule | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Tous');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00');
  const [triageUrgency, setTriageUrgency] = useState<TriageUrgency>('green');
  const [symptomsReason, setSymptomsReason] = useState<string>('Consultation de contrôle et renouvellement');
  const [patientName, setPatientName] = useState<string>('Mireille Essomba');
  const [patientPhone, setPatientPhone] = useState<string>('+237 677 12 34 56');
  const [paymentChoice, setPaymentChoice] = useState<'deposit' | 'full'>('deposit');
  const [momoProvider, setMomoProvider] = useState<'mtn_momo' | 'orange_money'>('mtn_momo');

  // Interactive USSD modal simulation
  const [showUssdPrompt, setShowUssdPrompt] = useState(false);
  const [ussdPin, setUssdPin] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Available Douala quarters
  const quarters = ['Tous', 'Akwa', 'Bonanjo', 'Bonapriso', 'Makepe', 'Deïdo'];

  const allPractitioners = db.getPractitioners();
  const filteredPractitioners =
    selectedQuarter === 'Tous'
      ? allPractitioners
      : allPractitioners.filter((p) => {
          const matchPrimary = p.quarter.toLowerCase().includes(selectedQuarter.toLowerCase());
          const matchFacilities = p.facilitySchedules?.some((s) =>
            s.facilityQuarter.toLowerCase().includes(selectedQuarter.toLowerCase())
          );
          return matchPrimary || matchFacilities;
        });

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'time'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleStartFlow = () => {
    addMessage({
      sender: 'user',
      text: '🏥 Rechercher un médecin spécialiste',
    });

    setTimeout(() => {
      addMessage({
        sender: 'bot',
        text: 'Veuillez sélectionner le quartier de Douala ou le spécialiste de votre choix :',
        flowCard: 'specialist_picker',
      });
    }, 400);
  };

  const handleSelectDoctor = (doctor: Practitioner) => {
    setSelectedPractitioner(doctor);
    addMessage({
      sender: 'user',
      text: `J'ai choisi ${doctor.name} (${doctor.specialty})`,
    });

    if (doctor.facilitySchedules && doctor.facilitySchedules.length > 0) {
      setTimeout(() => {
        addMessage({
          sender: 'bot',
          text: `${doctor.name} consulte dans plusieurs formations sanitaires à Douala à des horaires et jours différents. Choisissez l’établissement de votre choix :`,
          flowCard: 'facility_picker',
        });
      }, 400);
    } else {
      setTimeout(() => {
        addMessage({
          sender: 'bot',
          text: `Voici les disponibilités en temps réel pour ${doctor.name} à ${doctor.clinicName} (${doctor.quarter}) :`,
          flowCard: 'slot_picker',
        });
      }, 400);
    }
  };

  const handleSelectFacility = (sched: FacilitySchedule) => {
    setSelectedFacilitySchedule(sched);
    addMessage({
      sender: 'user',
      text: `Clinique choisie : ${sched.facilityName} (${sched.facilityQuarter})`,
    });

    setTimeout(() => {
      addMessage({
        sender: 'bot',
        text: `Parfait ! À ${sched.facilityName}, le ${selectedPractitioner?.name} consulte : ${sched.days.join(', ')} de ${sched.timeSlots.start} à ${sched.timeSlots.end}. Tarif : ${sched.consultationFee.toLocaleString()} FCFA.\nChoisissez votre créneau horaire :`,
        flowCard: 'slot_picker',
      });
    }, 400);
  };

  const handleConfirmSlot = (slot: string) => {
    setSelectedSlot(slot);
    addMessage({
      sender: 'user',
      text: `Créneau sélectionné : Aujourd'hui à ${slot}`,
    });

    setTimeout(() => {
      addMessage({
        sender: 'bot',
        text: 'Afin d’assurer votre prise en charge prioritaire à la clinique, quel est votre niveau d’urgence et le motif de votre visite ?',
        flowCard: 'triage_picker',
      });
    }, 400);
  };

  const handleConfirmTriage = () => {
    addMessage({
      sender: 'user',
      text: `Motif : ${symptomsReason} (Urgence : ${t.triage[triageUrgency]})`,
    });

    setTimeout(() => {
      addMessage({
        sender: 'bot',
        text: `Pour confirmer définitivement votre réservation et éviter les no-shows à Douala, vous pouvez régler un acompte de 2 000 FCFA ou la totalité via Mobile Money :`,
        flowCard: 'payment',
      });
    }, 400);
  };

  const handleTriggerMoMoPayment = () => {
    setPaymentError(null);
    setShowUssdPrompt(true);
  };

  const handleExecuteUssd = async (outcome: 'success' | 'insufficient_funds' | 'timeout') => {
    setIsProcessingPayment(true);
    setShowUssdPrompt(false);

    try {
      const activeFee = selectedFacilitySchedule?.consultationFee || selectedPractitioner?.consultationFee || 20000;
      const amount = paymentChoice === 'deposit' ? 2000 : activeFee;
      const fosaName = selectedFacilitySchedule?.facilityName || selectedPractitioner?.clinicName || 'Clinique Douala';

      const res = await paymentService.processPayment(
        {
          appointmentId: 'rdv_' + Date.now(),
          patientName,
          patientPhone,
          amount,
          paymentType: paymentChoice,
          provider: momoProvider,
          doctorName: selectedPractitioner?.name || 'Spécialiste Douala',
          clinicName: fosaName,
        },
        outcome
      );

      setIsProcessingPayment(false);

      if (!res.success) {
        setPaymentError(res.message);
        addMessage({
          sender: 'bot',
          text: `⚠️ Échec de paiement : ${res.message}`,
        });
        return;
      }

      // Create appointment object with multi-facility schedule data
      const newAppointment: Appointment = {
        id: 'rdv-dla-' + Date.now().toString().slice(-4),
        patientId: 'pat_' + Date.now(),
        patientName,
        patientPhone,
        practitionerId: selectedPractitioner?.id || 'dr_kamdem',
        practitionerName: selectedPractitioner?.name || 'Dr. Jean-Paul Kamdem',
        specialty: selectedPractitioner?.specialty || 'Cardiologie',
        facilityId: selectedFacilitySchedule?.facilityId || 'fosa_littoral',
        facilityName: fosaName,
        facilityQuarter: selectedFacilitySchedule?.facilityQuarter || selectedPractitioner?.quarter || 'Bonanjo',
        date: selectedDate,
        timeSlot: selectedSlot,
        type: 'in_person',
        room: selectedFacilitySchedule?.rooms[0] || selectedPractitioner?.rooms[0] || 'Cabinet 1',
        reason: symptomsReason,
        triageUrgency,
        status: 'confirmed',
        amountTotal: activeFee,
        amountPaid: amount,
        paymentMethod: momoProvider,
        paymentReference: res.providerReference,
        bookingChannel: 'whatsapp',
        qrTicketCode: `DS-TICKET-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: true,
      };

      db.saveAppointment(newAppointment);

      // Queue asynchronous reminders
      syncEngine.queueAsyncWhatsAppNotification({
        recipientPhone: patientPhone,
        recipientName: patientName,
        type: 'booking_confirmation',
        language,
        messageContent: t.messages.bookingConfirmedBody,
        scheduledTime: new Date().toISOString(),
      });

      onAppointmentBooked();

      addMessage({
        sender: 'bot',
        text: `✅ ${res.message}\nVoici votre reçu et confirmation de rendez-vous avec billet QR officiel :`,
        flowCard: 'ticket',
        ticketData: newAppointment,
        localText: t.localPhrases.confirmationAudioText,
      });
    } catch {
      setIsProcessingPayment(false);
      setPaymentError('Erreur de connexion avec la passerelle Mobile Money.');
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'm1',
        sender: 'bot',
        text: 'Bonjour et bienvenue sur DoualaSanté ! 🇨🇲\nPrenez rendez-vous en quelques clics avec les meilleurs spécialistes de Douala, sans installer d’application.',
        time: '09:00',
        localText: t.localPhrases.welcomeGreeting,
        flowCard: 'welcome',
      },
    ]);
    setSelectedPractitioner(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 px-0 sm:px-4">
      {/* Editorial Header Section */}
      <div className="mb-3 sm:mb-6 px-3 sm:px-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-3 sm:pb-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
            Simulateur WhatsApp Flows (DoualaSanté)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Réservation conversationnelle · Paiement MTN MoMo & Orange Money · Billet QR officiel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Interface Wrapper */}
      <div className="bg-[#0b141a] rounded-none sm:rounded-2xl shadow-xl overflow-hidden border-y sm:border border-slate-700/50 flex flex-col h-[calc(100dvh-200px)] min-h-[480px] sm:h-[680px] lg:h-[740px]">
        {/* WhatsApp Top Bar */}
        <div className="bg-[#202c33] text-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-[#313d45] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0 text-xs sm:text-sm">
              DS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm text-white">DoualaSanté Officiel</span>
                <span className="text-[9px] sm:text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded-sm">
                  Vérifié
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-teal-400">En ligne · Bot médical Douala</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
            <Video className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* WhatsApp Chat Body */}
        <div
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#0b141a]"
          style={{
            backgroundImage:
              'radial-gradient(#1f2c34 1px, transparent 1px), radial-gradient(#1f2c34 1px, #0b141a 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[78%] rounded-xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm shadow-md ${
                  m.sender === 'user'
                    ? 'bg-[#005c4b] text-white rounded-tr-xs'
                    : 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {/* Local African Language Voice Note / Key Message */}
                {m.localText && language !== 'fr' && (
                  <div className="mt-2 pt-2 border-t border-slate-600/50 text-xs italic text-teal-200">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-teal-400 block not-italic">
                      Traduction ({language.toUpperCase()}) :
                    </span>
                    « {m.localText} »
                  </div>
                )}

                {/* Welcome Card Action */}
                {m.flowCard === 'welcome' && (
                  <div className="mt-3 pt-3 border-t border-[#313d45]">
                    <button
                      onClick={handleStartFlow}
                      className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Ouvrir WhatsApp Flow Douala</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Specialist Picker Flow Card */}
                {m.flowCard === 'specialist_picker' && (
                  <div className="mt-3 pt-3 border-t border-[#313d45] space-y-3">
                    {/* Quarter Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {quarters.map((q) => (
                        <button
                          key={q}
                          onClick={() => setSelectedQuarter(q)}
                          className={`text-[11px] px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                            selectedQuarter === q
                              ? 'bg-teal-600 text-white font-semibold'
                              : 'bg-[#2a3942] text-slate-300 hover:bg-[#32444f]'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Specialist Cards */}
                    <div className="space-y-2">
                      {filteredPractitioners.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleSelectDoctor(doc)}
                          className="p-2.5 rounded-lg bg-[#111b21] hover:bg-[#182229] border border-[#2a3942] cursor-pointer transition flex items-center gap-3"
                        >
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover shrink-0 border border-teal-500/40"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate">{doc.name}</h4>
                            <p className="text-[11px] text-teal-400 truncate">{doc.specialty}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{doc.quarter}</span>
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-emerald-400 tabular-nums">
                              {doc.consultationFee.toLocaleString()} F
                            </span>
                            <span className="block text-[9px] text-slate-400">Acompte 2 000 F</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facility Picker Flow Card */}
                {m.flowCard === 'facility_picker' && selectedPractitioner && (
                  <div className="mt-3 pt-3 border-t border-[#313d45] space-y-2.5">
                    <div className="text-[11px] text-teal-400 font-semibold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Formations sanitaires où consulte {selectedPractitioner.name} :</span>
                    </div>

                    <div className="space-y-2">
                      {selectedPractitioner.facilitySchedules?.map((sched) => (
                        <div
                          key={sched.id}
                          onClick={() => handleSelectFacility(sched)}
                          className="p-3 rounded-lg bg-[#111b21] hover:bg-[#182229] border border-[#2a3942] hover:border-teal-500/50 cursor-pointer transition flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{sched.facilityName}</span>
                            <span className="text-xs font-bold text-emerald-400 tabular-nums font-mono">
                              {sched.consultationFee.toLocaleString()} FCFA
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="text-slate-300 font-medium">{sched.facilityQuarter}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#2a3942]">
                            <span className="text-teal-300 font-medium">Jours : {sched.days.join(', ')}</span>
                            <span className="text-slate-300 font-mono">
                              {sched.timeSlots.start} - {sched.timeSlots.end}
                            </span>
                          </div>

                          {sched.notes && (
                            <span className="text-[9px] text-slate-400 italic">{sched.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Slot Picker Flow Card */}
                {m.flowCard === 'slot_picker' && selectedPractitioner && (
                  <div className="mt-3 pt-3 border-t border-[#313d45] space-y-3">
                    <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>Date : Vendredi 2 Octobre 2026</span>
                      </div>
                      <span className="text-[10px] text-teal-300 font-medium">
                        {selectedFacilitySchedule?.facilityName || selectedPractitioner.clinicName}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(selectedFacilitySchedule
                        ? selectedFacilitySchedule.timeSlots.start.startsWith('08') ||
                          selectedFacilitySchedule.timeSlots.start.startsWith('09')
                          ? ['08:30', '09:15', '10:00', '10:45', '11:30', '12:15']
                          : ['14:00', '14:45', '15:30', '16:15', '17:00', '17:30']
                        : ['09:30', '10:00', '11:00', '14:30', '15:00', '16:00']
                      ).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handleConfirmSlot(slot)}
                          className="py-1.5 px-2 rounded bg-[#111b21] hover:bg-teal-700 text-teal-200 hover:text-white border border-[#2a3942] text-xs font-medium tabular-nums transition"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Triage & Symptoms Flow Card */}
                {m.flowCard === 'triage_picker' && (
                  <div className="mt-3 pt-3 border-t border-[#313d45] space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Niveau d’urgence médicale :
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTriageUrgency('green')}
                          className={`p-2 rounded text-left text-xs border transition ${
                            triageUrgency === 'green'
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-300'
                          }`}
                        >
                          <span className="font-semibold block text-emerald-400">🟢 Routine</span>
                          <span className="text-[10px] text-slate-400">Contrôle / Suivi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTriageUrgency('yellow')}
                          className={`p-2 rounded text-left text-xs border transition ${
                            triageUrgency === 'yellow'
                              ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-300'
                          }`}
                        >
                          <span className="font-semibold block text-amber-400">🟡 Urgent</span>
                          <span className="text-[10px] text-slate-400">&lt; 60 min</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTriageUrgency('orange')}
                          className={`p-2 rounded text-left text-xs border transition ${
                            triageUrgency === 'orange'
                              ? 'bg-orange-950/60 border-orange-500 text-orange-200'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-300'
                          }`}
                        >
                          <span className="font-semibold block text-orange-400">🟠 Très Urgent</span>
                          <span className="text-[10px] text-slate-400">&lt; 15 min</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTriageUrgency('red')}
                          className={`p-2 rounded text-left text-xs border transition ${
                            triageUrgency === 'red'
                              ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-300'
                          }`}
                        >
                          <span className="font-semibold block text-rose-400">🔴 Vital</span>
                          <span className="text-[10px] text-slate-400">Immédiat</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Motif ou symptômes :
                      </label>
                      <input
                        type="text"
                        value={symptomsReason}
                        onChange={(e) => setSymptomsReason(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#111b21] border border-[#2a3942] rounded text-slate-100 focus:outline-hidden"
                      />
                    </div>

                    <button
                      onClick={handleConfirmTriage}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded transition"
                    >
                      Continuer vers le paiement MoMo
                    </button>
                  </div>
                )}

                {/* Payment Flow Card */}
                {m.flowCard === 'payment' && (
                  <div className="mt-3 pt-3 border-t border-[#313d45] space-y-3">
                    {/* Amount choice */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Montant à régler :
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentChoice('deposit')}
                          className={`p-2 rounded text-left border text-xs transition ${
                            paymentChoice === 'deposit'
                              ? 'bg-teal-900/40 border-teal-400 text-white'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-400'
                          }`}
                        >
                          <span className="font-bold text-emerald-400 block tabular-nums">2 000 FCFA</span>
                          <span className="text-[10px]">Acompte de garantie</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentChoice('full')}
                          className={`p-2 rounded text-left border text-xs transition ${
                            paymentChoice === 'full'
                              ? 'bg-teal-900/40 border-teal-400 text-white'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-400'
                          }`}
                        >
                          <span className="font-bold text-emerald-400 block tabular-nums">
                            {selectedPractitioner?.consultationFee.toLocaleString() || 20000} FCFA
                          </span>
                          <span className="text-[10px]">Consultation complète</span>
                        </button>
                      </div>
                    </div>

                    {/* Operator Choice */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Opérateur Mobile Money Cameroun :
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMomoProvider('mtn_momo')}
                          className={`p-2 rounded flex items-center gap-2 border text-xs transition ${
                            momoProvider === 'mtn_momo'
                              ? 'bg-amber-950/50 border-amber-400 text-white'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-400'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                            M
                          </div>
                          <div>
                            <span className="font-bold block text-[11px]">MTN MoMo</span>
                            <span className="text-[9px] text-slate-400">*126# USSD</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMomoProvider('orange_money')}
                          className={`p-2 rounded flex items-center gap-2 border text-xs transition ${
                            momoProvider === 'orange_money'
                              ? 'bg-orange-950/50 border-orange-500 text-white'
                              : 'bg-[#111b21] border-[#2a3942] text-slate-400'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-[10px]">
                            OM
                          </div>
                          <div>
                            <span className="font-bold block text-[11px]">Orange Money</span>
                            <span className="text-[9px] text-slate-400">*150# USSD</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Patient Phone Input */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-medium block mb-1">
                        Numéro Mobile Money (+237) :
                      </label>
                      <input
                        type="text"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#111b21] border border-[#2a3942] rounded text-slate-100 font-mono"
                      />
                    </div>

                    {paymentError && (
                      <div className="p-2 rounded bg-rose-950/50 border border-rose-600/50 text-[11px] text-rose-300">
                        {paymentError}
                      </div>
                    )}

                    <button
                      onClick={handleTriggerMoMoPayment}
                      disabled={isProcessingPayment}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>
                        Envoyer le Push USSD (
                        {paymentChoice === 'deposit' ? '2 000 FCFA' : `${selectedPractitioner?.consultationFee || 20000} FCFA`}
                        )
                      </span>
                    </button>
                  </div>
                )}

                {/* Final Appointment QR Ticket Card */}
                {m.flowCard === 'ticket' && m.ticketData && (
                  <div className="mt-3 pt-3 border-t border-[#313d45]">
                    <div className="bg-[#111b21] border border-teal-500/40 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#2a3942] pb-2">
                        <div>
                          <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider block">
                            Billet Médical Validé
                          </span>
                          <span className="text-sm font-bold text-white">
                            Réf : {m.ticketData.qrTicketCode}
                          </span>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>Patient :</span>
                          <span className="font-semibold text-white">{m.ticketData.patientName}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Praticien :</span>
                          <span className="font-semibold text-teal-300">{m.ticketData.practitionerName}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Établissement :</span>
                          <span className="font-semibold text-white">
                            {m.ticketData.facilityName || 'Clinique du Littoral'} ({m.ticketData.facilityQuarter || 'Bonanjo'})
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Date & Heure :</span>
                          <span className="font-semibold text-white tabular-nums">
                            {m.ticketData.date} à {m.ticketData.timeSlot}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Salle réservée :</span>
                          <span className="text-white">{m.ticketData.room}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Acompte réglé :</span>
                          <span className="font-bold text-emerald-400 tabular-nums">
                            {m.ticketData.amountPaid.toLocaleString()} FCFA ({m.ticketData.paymentMethod?.toUpperCase()})
                          </span>
                        </div>
                      </div>

                      {/* QR Ticket Display */}
                      <div className="bg-white p-3 rounded-lg flex items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-slate-900 rounded-sm p-1.5 flex items-center justify-center text-white">
                          <QrCode className="w-full h-full text-teal-400" />
                        </div>
                        <div className="text-[10px] text-slate-700 leading-tight">
                          <strong className="block text-slate-900 text-xs font-semibold">
                            QR Code d’accès DoualaSanté
                          </strong>
                          Présentez ce QR Code à l’accueil pour être scanné et priorisé dans la salle d’attente.
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 border-t border-[#2a3942] pt-2 space-y-1">
                        <p className="flex items-center gap-1 text-teal-300 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Rappels automatiques programmés à H-24 et H-2
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Données de santé hébergées à Douala conformément à la Loi n° 2024/017.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">{m.time}</div>
              </div>
            </div>
          ))}

          {isProcessingPayment && (
            <div className="flex items-center gap-2 p-3 bg-[#202c33] rounded-xl text-teal-300 text-xs w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
              <span>En attente de validation USSD sur le téléphone du patient...</span>
            </div>
          )}
        </div>

        {/* WhatsApp Fake Input Footer */}
        <div className="bg-[#202c33] px-4 py-3 border-t border-[#313d45] flex items-center gap-3">
          <input
            type="text"
            placeholder="Tapez un message ou '1' pour confirmer votre venue..."
            disabled
            className="flex-1 bg-[#2a3942] text-xs text-slate-200 placeholder-slate-400 px-3.5 py-2 rounded-lg border-0 focus:outline-hidden"
          />
          <button className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulated USSD Push Popup Modal */}
      {showUssdPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-4 sm:p-6 text-white shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold font-mono">
                  {momoProvider === 'mtn_momo' ? 'MTN MoMo (*126#)' : 'Orange Money (*150#)'}
                </h3>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-sm">
                Push USSD Direct
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-200 space-y-2">
              <p>
                Transférer{' '}
                <strong>
                  {paymentChoice === 'deposit'
                    ? '2 000 FCFA'
                    : `${(selectedPractitioner?.consultationFee || 20000).toLocaleString()} FCFA`}
                </strong>{' '}
                au marchand <strong>CLINIQUE DOUALA SANTE</strong> ?
              </p>
              <p className="text-[11px] text-slate-400">
                Frais de transaction : 1% inclus · Entrez votre code secret à 4 chiffres :
              </p>
              <input
                type="password"
                maxLength={4}
                value={ussdPin}
                onChange={(e) => setUssdPin(e.target.value)}
                placeholder="****"
                className="w-full tracking-widest text-center text-lg bg-slate-900 border border-amber-500/50 rounded py-1.5 text-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleExecuteUssd('success')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition"
              >
                Confirmer avec Code PIN (Succès)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteUssd('insufficient_funds')}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 text-[11px] rounded transition"
                >
                  Simuler Solde insuffisant
                </button>
                <button
                  onClick={() => handleExecuteUssd('timeout')}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/50 text-[11px] rounded transition"
                >
                  Simuler Timeout USSD
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowUssdPrompt(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
