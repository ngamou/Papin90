import {
  Practitioner,
  Patient,
  Appointment,
  QueueItem,
  PaymentTransaction,
  Prescription,
  StockItem,
  SyscohadaInvoice,
  SyncQueueItem,
  AuditLog,
  HealthFacility,
  FacilitySchedule,
} from '../types';

const DB_NAME = 'doualasanté_db';
const DB_VERSION = 3;

export const HEALTH_FACILITIES: HealthFacility[] = [
  {
    id: 'fosa_littoral',
    name: 'Clinique du Littoral',
    type: 'clinique_privee',
    quarter: 'Bonanjo (Face Port Autonome)',
    address: 'Boulevard de la Liberté / Rue du Port, Bonanjo, Douala',
    phone: '+237 233 42 10 00',
    rooms: ['Cabinet Cardiologie 1', 'Salle ECG & Écho Cœur', 'Box Accueil Urgences', 'Salle de Soins Intensifs'],
  },
  {
    id: 'fosa_sainte_anne',
    name: 'Polyclinique Sainte-Anne',
    type: 'polyclinique',
    quarter: 'Akwa (Boulevard de la Liberté)',
    address: 'Angle Rue Pau & Boulevard de la Liberté, Akwa, Douala',
    phone: '+237 233 43 55 12',
    rooms: ['Salle Pédiatrique Éveil', 'Cabinet Pédiatrie 1', 'Salle Consultations Spécialisées B', 'Bloc Ambulatoire'],
  },
  {
    id: 'fosa_saint_luc',
    name: 'Centre Médical Saint-Luc',
    type: 'clinique_privee',
    quarter: 'Bonapriso (Rue des Palmiers)',
    address: 'Rue des Palmiers, Bonapriso, Douala',
    phone: '+237 233 42 88 90',
    rooms: ['Salle d’Échographie 4D', 'Cabinet Gynéco 2', 'Cabinet Cardio Polyvalent'],
  },
  {
    id: 'fosa_makepe',
    name: 'Cabinet Médical de Makepe',
    type: 'cabinet_medical',
    quarter: 'Makepe (Carrefour Rhône Poulenc)',
    address: 'Carrefour Rhône Poulenc, Makepe Missoke, Douala',
    phone: '+237 690 33 21 00',
    rooms: ['Cabinet Consultation Polyvalente', 'Salle de Petits Soins', 'Box Pédiatrie Nord'],
  },
  {
    id: 'fosa_deido',
    name: 'Hôpital de District de Deïdo (Pavillon Spécialités)',
    type: 'hopital_district',
    quarter: 'Deïdo (Rue de la Joie)',
    address: 'Carrefour 4 Étages, Deïdo, Douala',
    phone: '+237 233 40 12 34',
    rooms: ['Cabinet Maternité & Échographie', 'Salle Consultations Externes 3'],
  },
];

export const INITIAL_PRACTITIONERS: Practitioner[] = [
  {
    id: 'dr_kamdem',
    name: 'Dr. Jean-Paul Kamdem',
    specialty: 'Cardiologie & Hypertension',
    avatar: '/src/assets/images/avatar_doctor_kamdem_1790957093094.jpg',
    phone: '+237 677 42 19 80',
    email: 'jp.kamdem@cliniquedouala.cm',
    quarter: 'Bonanjo (Face Port Autonome)',
    clinicName: 'Clinique du Littoral - Bonanjo',
    consultationFee: 20000,
    depositFee: 2000,
    availableDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Samedi'],
    workingHours: { start: '08:00', end: '18:00' },
    slotDurationMinutes: 30,
    rooms: ['Cabinet Cardiologie 1', 'Salle ECG & Écho Cœur'],
    rating: 4.9,
    patientsCount: 420,
    bio: 'Ancien interne des hôpitaux, spécialiste en hypertension artérielle sévère, arythmies et échocardiographie doppler.',
    facilitySchedules: [
      {
        id: 'sched_kamdem_1',
        facilityId: 'fosa_littoral',
        facilityName: 'Clinique du Littoral',
        facilityQuarter: 'Bonanjo (Face Port Autonome)',
        days: ['Lundi', 'Mercredi'],
        timeSlots: { start: '08:00', end: '13:00' },
        slotDurationMinutes: 30,
        rooms: ['Cabinet Cardiologie 1', 'Salle ECG & Écho Cœur'],
        consultationFee: 20000,
        depositFee: 2000,
        notes: 'Explorations cardiaques poussées (Échocardiographie Doppler & Holter)',
      },
      {
        id: 'sched_kamdem_2',
        facilityId: 'fosa_sainte_anne',
        facilityName: 'Polyclinique Sainte-Anne',
        facilityQuarter: 'Akwa (Boulevard de la Liberté)',
        days: ['Mardi', 'Jeudi'],
        timeSlots: { start: '13:30', end: '18:00' },
        slotDurationMinutes: 30,
        rooms: ['Salle Consultations Spécialisées B'],
        consultationFee: 22000,
        depositFee: 2000,
        notes: 'Consultations externes spécialisées en cardiologie adulte',
      },
      {
        id: 'sched_kamdem_3',
        facilityId: 'fosa_saint_luc',
        facilityName: 'Centre Médical Saint-Luc',
        facilityQuarter: 'Bonapriso (Rue des Palmiers)',
        days: ['Samedi'],
        timeSlots: { start: '08:30', end: '13:30' },
        slotDurationMinutes: 30,
        rooms: ['Cabinet Cardio Polyvalent'],
        consultationFee: 20000,
        depositFee: 2000,
        notes: 'Bilan cardio-vasculaire de fin de semaine et prévention',
      },
    ],
  },
  {
    id: 'dr_ngombock',
    name: 'Dr. Henriette Ngo Mbock',
    specialty: 'Gynécologie & Obstétrique',
    avatar: '/src/assets/images/avatar_doctor_ngombock_1790957106563.jpg',
    phone: '+237 699 15 48 23',
    email: 'h.ngombock@bonapriso-medical.cm',
    quarter: 'Bonapriso (Rue des Palmiers)',
    clinicName: 'Centre Médical Saint-Luc Bonapriso',
    consultationFee: 18000,
    depositFee: 2000,
    availableDays: ['Mardi', 'Mercredi', 'Vendredi', 'Samedi'],
    workingHours: { start: '08:30', end: '16:30' },
    slotDurationMinutes: 30,
    rooms: ['Salle d’Échographie 4D', 'Cabinet Gynéco 2'],
    rating: 4.95,
    patientsCount: 610,
    bio: 'Suivi de grossesse à risque, échographie morphologique foetale, bilans de fertilité du couple et santé gynécologique.',
    facilitySchedules: [
      {
        id: 'sched_ngombock_1',
        facilityId: 'fosa_saint_luc',
        facilityName: 'Centre Médical Saint-Luc',
        facilityQuarter: 'Bonapriso (Rue des Palmiers)',
        days: ['Mardi', 'Vendredi'],
        timeSlots: { start: '08:30', end: '14:30' },
        slotDurationMinutes: 30,
        rooms: ['Salle d’Échographie 4D', 'Cabinet Gynéco 2'],
        consultationFee: 18000,
        depositFee: 2000,
        notes: 'Échographies obstétricales 3D/4D et bilan fertilité',
      },
      {
        id: 'sched_ngombock_2',
        facilityId: 'fosa_deido',
        facilityName: 'Hôpital de District de Deïdo (Pavillon Spécialités)',
        facilityQuarter: 'Deïdo (Rue de la Joie)',
        days: ['Mercredi', 'Samedi'],
        timeSlots: { start: '09:00', end: '15:30' },
        slotDurationMinutes: 25,
        rooms: ['Cabinet Maternité & Échographie'],
        consultationFee: 12000,
        depositFee: 2000,
        notes: 'Suivi prénatal et consultations gynécologiques tarif district',
      },
    ],
  },
  {
    id: 'dr_eboa',
    name: 'Dr. Marc Eboa',
    specialty: 'Pédiatrie & Néonatalogie',
    avatar: '/src/assets/images/avatar_doctor_eboa_1790957117675.jpg',
    phone: '+237 675 88 32 10',
    email: 'm.eboa@akwa-pediatrie.cm',
    quarter: 'Akwa (Boulevard de la Liberté)',
    clinicName: 'Polyclinique Sainte-Anne Akwa',
    consultationFee: 15000,
    depositFee: 2000,
    availableDays: ['Lundi', 'Mercredi', 'Jeudi', 'Vendredi'],
    workingHours: { start: '08:00', end: '18:30' },
    slotDurationMinutes: 20,
    rooms: ['Salle Pédiatrique Éveil', 'Cabinet Pédiatrie 1'],
    rating: 4.88,
    patientsCount: 540,
    bio: 'Vaccination pédiatrique internationale, paludisme infantile, troubles de croissance et urgences néonatales à Douala.',
    facilitySchedules: [
      {
        id: 'sched_eboa_1',
        facilityId: 'fosa_sainte_anne',
        facilityName: 'Polyclinique Sainte-Anne',
        facilityQuarter: 'Akwa (Boulevard de la Liberté)',
        days: ['Lundi', 'Jeudi'],
        timeSlots: { start: '08:00', end: '13:00' },
        slotDurationMinutes: 20,
        rooms: ['Salle Pédiatrique Éveil', 'Cabinet Pédiatrie 1'],
        consultationFee: 15000,
        depositFee: 2000,
        notes: 'Vaccinations, suivi du nouveau-né et petite enfance',
      },
      {
        id: 'sched_eboa_2',
        facilityId: 'fosa_makepe',
        facilityName: 'Cabinet Médical de Makepe',
        facilityQuarter: 'Makepe (Carrefour Rhône Poulenc)',
        days: ['Mercredi', 'Vendredi'],
        timeSlots: { start: '14:00', end: '18:30' },
        slotDurationMinutes: 20,
        rooms: ['Box Pédiatrie Nord'],
        consultationFee: 14000,
        depositFee: 2000,
        notes: 'Consultations après-midi pour nourrissons et enfants scolarisés',
      },
    ],
  },
  {
    id: 'dr_talla',
    name: 'Dr. Fabrice Talla',
    specialty: 'Médecine Générale & Urgences',
    avatar: '/src/assets/images/avatar_doctor_kamdem_1790957093094.jpg',
    phone: '+237 690 33 21 00',
    email: 'f.talla@makepe-sante.cm',
    quarter: 'Makepe (Carrefour Rhône Poulenc)',
    clinicName: 'Cabinet Médical de Makepe',
    consultationFee: 12000,
    depositFee: 2000,
    availableDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    workingHours: { start: '07:30', end: '19:30' },
    slotDurationMinutes: 20,
    rooms: ['Cabinet Consultation Polyvalente', 'Salle de Petits Soins'],
    rating: 4.82,
    patientsCount: 780,
    bio: 'Bilan de santé général, diabète de type 2, paludisme aigu, traumatologie légère et orientation vers spécialistes.',
    facilitySchedules: [
      {
        id: 'sched_talla_1',
        facilityId: 'fosa_makepe',
        facilityName: 'Cabinet Médical de Makepe',
        facilityQuarter: 'Makepe (Carrefour Rhône Poulenc)',
        days: ['Lundi', 'Mardi', 'Mercredi'],
        timeSlots: { start: '07:30', end: '14:00' },
        slotDurationMinutes: 20,
        rooms: ['Cabinet Consultation Polyvalente', 'Salle de Petits Soins'],
        consultationFee: 12000,
        depositFee: 2000,
        notes: 'Médecine générale de proximité et bilans métaboliques',
      },
      {
        id: 'sched_talla_2',
        facilityId: 'fosa_littoral',
        facilityName: 'Clinique du Littoral',
        facilityQuarter: 'Bonanjo (Face Port Autonome)',
        days: ['Jeudi', 'Vendredi'],
        timeSlots: { start: '14:30', end: '19:30' },
        slotDurationMinutes: 20,
        rooms: ['Box Accueil Urgences'],
        consultationFee: 15000,
        depositFee: 2000,
        isEmergencyOnCall: true,
        notes: 'Permanence urgences adultes et gardes de fin d’après-midi',
      },
    ],
  },
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat_1',
    fullName: 'Mireille Essomba',
    phone: '+237 677 12 34 56',
    email: 'm.essomba@gmail.com',
    quarter: 'Deïdo',
    dateOfBirth: '1988-06-14',
    emergencyContact: '+237 699 88 77 66',
    preferredLanguage: 'fr',
    hasConsentedDataSharing: true,
    consentDate: '2026-09-12T10:15:00Z',
    bloodGroup: 'O+',
    allergies: ['Pénicilline'],
    medicalHistory: ['Hypertension artérielle modérée depuis 2023'],
  },
  {
    id: 'pat_2',
    fullName: 'Emmanuel Kouam',
    phone: '+237 694 55 43 21',
    email: 'kouam.emmanuel@yahoo.fr',
    quarter: 'Akwa',
    dateOfBirth: '1975-11-23',
    emergencyContact: '+237 671 22 33 44',
    preferredLanguage: 'douala',
    hasConsentedDataSharing: true,
    consentDate: '2026-09-20T14:30:00Z',
    bloodGroup: 'A+',
    allergies: ['Aspirine'],
    medicalHistory: ['Diabète type 2 équilibré sous metformine'],
  },
  {
    id: 'pat_3',
    fullName: 'Carine Mbida',
    phone: '+237 670 99 88 77',
    quarter: 'Bonamoussadi',
    dateOfBirth: '1996-03-02',
    emergencyContact: '+237 690 11 22 33',
    preferredLanguage: 'ewondo',
    hasConsentedDataSharing: true,
    consentDate: '2026-10-01T08:00:00Z',
    bloodGroup: 'B+',
    allergies: ['Aucune'],
    medicalHistory: ['Grossesse 28 SA - premier enfant'],
  },
  {
    id: 'pat_4',
    fullName: 'Bébé Nathan Ndoumbé (3 ans)',
    phone: '+237 698 44 55 66',
    quarter: 'Bali',
    dateOfBirth: '2023-04-10',
    emergencyContact: '+237 698 44 55 66 (Mère)',
    preferredLanguage: 'fr',
    hasConsentedDataSharing: true,
    consentDate: '2026-10-02T07:45:00Z',
    bloodGroup: 'O+',
    allergies: ['Aucune connue'],
    medicalHistory: ['Bronchiolite résolue à 6 mois'],
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'rdv-2026-001',
    patientId: 'pat_1',
    patientName: 'Mireille Essomba',
    patientPhone: '+237 677 12 34 56',
    practitionerId: 'dr_kamdem',
    practitionerName: 'Dr. Jean-Paul Kamdem',
    specialty: 'Cardiologie & Hypertension',
    date: '2026-10-02',
    timeSlot: '09:00',
    type: 'in_person',
    room: 'Cabinet Cardiologie 1',
    reason: 'Suivi tensionnel et palpitations nocturnes',
    triageUrgency: 'orange',
    triageNotes: 'TA élevée à domicile (165/95 mmHg) et essoufflement à l’effort',
    status: 'in_consultation',
    amountTotal: 20000,
    amountPaid: 2000,
    paymentMethod: 'mtn_momo',
    paymentReference: 'MOMO-CM-9821471',
    bookingChannel: 'whatsapp',
    qrTicketCode: 'DS-2026-KAMD-001',
    createdAt: '2026-10-01T14:20:00Z',
    updatedAt: '2026-10-02T08:50:00Z',
    synced: true,
  },
  {
    id: 'rdv-2026-002',
    patientId: 'pat_4',
    patientName: 'Bébé Nathan Ndoumbé',
    patientPhone: '+237 698 44 55 66',
    practitionerId: 'dr_eboa',
    practitionerName: 'Dr. Marc Eboa',
    specialty: 'Pédiatrie & Néonatalogie',
    date: '2026-10-02',
    timeSlot: '09:30',
    type: 'in_person',
    room: 'Salle Pédiatrique Éveil',
    reason: 'Fièvre à 39.2°C depuis hier soir et toux sèche',
    triageUrgency: 'red',
    triageNotes: 'Enfant grognon, pic fébrile 39.2°C, suspicion accès palustre',
    status: 'in_waiting_room',
    amountTotal: 15000,
    amountPaid: 2000,
    paymentMethod: 'orange_money',
    paymentReference: 'OM-DLA-44129',
    bookingChannel: 'whatsapp',
    qrTicketCode: 'DS-2026-EBOA-002',
    createdAt: '2026-10-02T06:15:00Z',
    updatedAt: '2026-10-02T08:30:00Z',
    synced: true,
  },
  {
    id: 'rdv-2026-003',
    patientId: 'pat_3',
    patientName: 'Carine Mbida',
    patientPhone: '+237 670 99 88 77',
    practitionerId: 'dr_ngombock',
    practitionerName: 'Dr. Henriette Ngo Mbock',
    specialty: 'Gynécologie & Obstétrique',
    date: '2026-10-02',
    timeSlot: '10:00',
    type: 'in_person',
    room: 'Salle d’Échographie 4D',
    reason: 'Échographie du 3ème trimestre (28 SA)',
    triageUrgency: 'green',
    status: 'in_waiting_room',
    amountTotal: 18000,
    amountPaid: 18000,
    paymentMethod: 'mtn_momo',
    paymentReference: 'MOMO-CM-1192834',
    bookingChannel: 'pwa',
    qrTicketCode: 'DS-2026-NGOB-003',
    createdAt: '2026-09-28T11:00:00Z',
    updatedAt: '2026-10-02T08:45:00Z',
    synced: true,
  },
  {
    id: 'rdv-2026-004',
    patientId: 'pat_2',
    patientName: 'Emmanuel Kouam',
    patientPhone: '+237 694 55 43 21',
    practitionerId: 'dr_talla',
    practitionerName: 'Dr. Fabrice Talla',
    specialty: 'Médecine Générale & Urgences',
    date: '2026-10-02',
    timeSlot: '10:30',
    type: 'teleconsultation',
    room: 'Téléconsultation HD 1',
    reason: 'Renouvellement traitement antidiabétique et analyse HbA1c',
    triageUrgency: 'green',
    status: 'confirmed',
    amountTotal: 12000,
    amountPaid: 2000,
    paymentMethod: 'orange_money',
    paymentReference: 'OM-DLA-55901',
    bookingChannel: 'whatsapp',
    qrTicketCode: 'DS-2026-TALL-004',
    createdAt: '2026-09-30T16:40:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    synced: true,
  },
];

export const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q-1',
    appointmentId: 'rdv-2026-002',
    patientName: 'Bébé Nathan Ndoumbé',
    patientPhone: '+237 698 44 55 66',
    practitionerId: 'dr_eboa',
    practitionerName: 'Dr. Marc Eboa',
    arrivalTimestamp: '2026-10-02T08:35:00Z',
    triageUrgency: 'red',
    estimatedWaitMinutes: 5,
    column: 'waiting',
    vitalSigns: {
      temperature: 39.2,
      pulseBpm: 128,
      weightKg: 13.5,
    },
  },
  {
    id: 'q-2',
    appointmentId: 'rdv-2026-001',
    patientName: 'Mireille Essomba',
    patientPhone: '+237 677 12 34 56',
    practitionerId: 'dr_kamdem',
    practitionerName: 'Dr. Jean-Paul Kamdem',
    arrivalTimestamp: '2026-10-02T08:45:00Z',
    triageUrgency: 'orange',
    estimatedWaitMinutes: 0,
    column: 'consultation',
    vitalSigns: {
      bloodPressure: '162/96',
      temperature: 36.8,
      weightKg: 74,
      pulseBpm: 88,
    },
    calledAt: '2026-10-02T08:58:00Z',
  },
  {
    id: 'q-3',
    appointmentId: 'rdv-2026-003',
    patientName: 'Carine Mbida',
    patientPhone: '+237 670 99 88 77',
    practitionerId: 'dr_ngombock',
    practitionerName: 'Dr. Henriette Ngo Mbock',
    arrivalTimestamp: '2026-10-02T08:50:00Z',
    triageUrgency: 'green',
    estimatedWaitMinutes: 25,
    column: 'triage',
    vitalSigns: {
      bloodPressure: '118/75',
      temperature: 36.9,
      weightKg: 68,
    },
  },
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stock-1',
    name: 'Gants d’examen latex non poudrés (Boîte de 100)',
    category: 'protection',
    quantityInStock: 18,
    unit: 'boîtes',
    criticalThreshold: 10,
    unitPriceFCFA: 4500,
    supplierName: 'Pharma-Cameroun Akwa',
    lastRestockedDate: '2026-09-22',
    status: 'adequate',
  },
  {
    id: 'stock-2',
    name: 'Tests Rapides Paludisme Ag Pf/Pan (RDT Malaria)',
    category: 'diagnostics',
    quantityInStock: 8,
    unit: 'kits',
    criticalThreshold: 15,
    unitPriceFCFA: 6500,
    supplierName: 'Labo-Santé Littoral',
    lastRestockedDate: '2026-09-10',
    status: 'warning',
  },
  {
    id: 'stock-3',
    name: 'Seringues stériles 5ml 3 pièces avec aiguille',
    category: 'injection',
    quantityInStock: 120,
    unit: 'unités',
    criticalThreshold: 50,
    unitPriceFCFA: 150,
    supplierName: 'Grossiste Médical Bonanjo',
    lastRestockedDate: '2026-09-25',
    status: 'adequate',
  },
  {
    id: 'stock-4',
    name: 'Gel de contact échographie stérile 5L (Bidon)',
    category: 'instruments',
    quantityInStock: 2,
    unit: 'bidons',
    criticalThreshold: 3,
    unitPriceFCFA: 14000,
    supplierName: 'Médico-Tech Douala',
    lastRestockedDate: '2026-08-30',
    status: 'critical',
  },
  {
    id: 'stock-5',
    name: 'Bandelettes de glycémie capillaire (Accu-Chek)',
    category: 'diagnostics',
    quantityInStock: 5,
    unit: 'boîtes de 50',
    criticalThreshold: 8,
    unitPriceFCFA: 9500,
    supplierName: 'Pharma-Cameroun Akwa',
    lastRestockedDate: '2026-09-15',
    status: 'warning',
  },
];

export const INITIAL_INVOICES: SyscohadaInvoice[] = [
  {
    id: 'FACT-DLA-2026-0419',
    appointmentId: 'rdv-2026-001',
    patientName: 'Mireille Essomba',
    date: '2026-10-02',
    consultationFee: 20000,
    additionalActsFee: 5000,
    totalTTC: 25000,
    amountPaid: 2000,
    balanceDue: 23000,
    paymentMethod: 'MTN MoMo (*126#)',
    accountCredit: '7061 (Prestations médicales)',
    accountDebit: '5211 (Trésorerie MTN MoMo)',
    status: 'partial',
  },
  {
    id: 'FACT-DLA-2026-0420',
    appointmentId: 'rdv-2026-003',
    patientName: 'Carine Mbida',
    date: '2026-10-02',
    consultationFee: 18000,
    additionalActsFee: 12000,
    totalTTC: 30000,
    amountPaid: 30000,
    balanceDue: 0,
    paymentMethod: 'MTN MoMo (*126#)',
    accountCredit: '7061 & 7062 (Échographie)',
    accountDebit: '5211 (Trésorerie MTN MoMo)',
    status: 'paid',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-02T08:50:12Z',
    actor: 'Dr. Jean-Paul Kamdem (Cardiologue)',
    action: 'Consultation dossier médical partagé',
    patientId: 'pat_1',
    details: 'Accès autorisé via consentement Loi 2024/017 signé le 12/09/2026',
    ipAddress: '197.149.214.88 (Douala Bonanjo Fiber)',
    encryptionStatus: 'AES-256-GCM Verified',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-02T08:35:45Z',
    actor: 'Infirmière Accueil Triage (Saint-Luc)',
    action: 'Prise de constantes et classement d’urgence',
    patientId: 'pat_4',
    details: 'Attribution du niveau ROUGE (T° 39.2°C) - Alerte prioritaire envoyée au Dr. Eboa',
    ipAddress: '197.149.214.89 (Douala Akwa LAN)',
    encryptionStatus: 'AES-256-GCM Verified',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-02T06:15:22Z',
    actor: 'Système Serveur WhatsApp Gateway',
    action: 'Envoi rappel SMS & WhatsApp automatisé',
    patientId: 'pat_1',
    details: 'Notification de rappel H-24 expédiée avec succès vers +237 677 12 34 56',
    ipAddress: '102.66.192.4 (Datacenter Douala MTN Business)',
    encryptionStatus: 'AES-256-GCM Verified',
  },
];

class DoualaSanteStorage {
  private isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  public getStored<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const data = localStorage.getItem(`ds_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  public setStored<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`ds_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage quota or write error', e);
    }
  }

  public init() {
    const existingPractitioners = this.getStored<Practitioner[]>('practitioners', []);
    const needsMigration = !existingPractitioners.length || !existingPractitioners[0]?.facilitySchedules;

    if (!this.getStored('initialized_v3', false) || needsMigration) {
      this.setStored('facilities', HEALTH_FACILITIES);
      this.setStored('practitioners', INITIAL_PRACTITIONERS);
      this.setStored('patients', INITIAL_PATIENTS);
      this.setStored('appointments', INITIAL_APPOINTMENTS);
      this.setStored('queue', INITIAL_QUEUE);
      this.setStored('stock', INITIAL_STOCK);
      this.setStored('invoices', INITIAL_INVOICES);
      this.setStored('auditLogs', INITIAL_AUDIT_LOGS);
      this.setStored('syncQueue', []);
      this.setStored('initialized_v3', true);
    }
  }

  public getHealthFacilities(): HealthFacility[] {
    return this.getStored<HealthFacility[]>('facilities', HEALTH_FACILITIES);
  }

  public saveHealthFacility(facility: HealthFacility): void {
    const facilities = this.getHealthFacilities();
    const idx = facilities.findIndex((f) => f.id === facility.id);
    if (idx >= 0) {
      facilities[idx] = facility;
    } else {
      facilities.push(facility);
    }
    this.setStored('facilities', facilities);
  }

  public saveHealthFacilities(facilities: HealthFacility[]): void {
    this.setStored('facilities', facilities);
  }

  public getPractitioners(): Practitioner[] {
    return this.getStored<Practitioner[]>('practitioners', INITIAL_PRACTITIONERS);
  }

  public savePractitioners(list: Practitioner[]): void {
    this.setStored('practitioners', list);
  }

  public savePractitioner(practitioner: Practitioner): void {
    const docs = this.getPractitioners();
    const idx = docs.findIndex((d) => d.id === practitioner.id);
    if (idx >= 0) {
      docs[idx] = practitioner;
    } else {
      docs.push(practitioner);
    }
    this.savePractitioners(docs);
  }

  public addDoctorFacilitySchedule(doctorId: string, schedule: FacilitySchedule): void {
    const docs = this.getPractitioners();
    const doc = docs.find((d) => d.id === doctorId);
    if (doc) {
      if (!doc.facilitySchedules) doc.facilitySchedules = [];
      doc.facilitySchedules.push(schedule);
      this.savePractitioners(docs);
      this.addAuditLog(
        doc.name,
        'Nouveau planning formation sanitaire',
        `Ajout du planning à ${schedule.facilityName} (${schedule.facilityQuarter}) : ${schedule.days.join(', ')} de ${schedule.timeSlots.start} à ${schedule.timeSlots.end}`
      );
    }
  }

  public updateDoctorFacilitySchedule(doctorId: string, scheduleId: string, updated: FacilitySchedule): void {
    const docs = this.getPractitioners();
    const doc = docs.find((d) => d.id === doctorId);
    if (doc && doc.facilitySchedules) {
      const idx = doc.facilitySchedules.findIndex((s) => s.id === scheduleId);
      if (idx >= 0) {
        doc.facilitySchedules[idx] = updated;
        this.savePractitioners(docs);
        this.addAuditLog(
          doc.name,
          'Mise à jour planning formation sanitaire',
          `Modification du planning à ${updated.facilityName} (${updated.facilityQuarter})`
        );
      }
    }
  }

  public removeDoctorFacilitySchedule(doctorId: string, scheduleId: string): void {
    const docs = this.getPractitioners();
    const doc = docs.find((d) => d.id === doctorId);
    if (doc && doc.facilitySchedules) {
      doc.facilitySchedules = doc.facilitySchedules.filter((s) => s.id !== scheduleId);
      this.savePractitioners(docs);
      this.addAuditLog(
        doc.name,
        'Suppression créneau formation sanitaire',
        `Créneau supprimé pour le médecin dans la formation sanitaire.`
      );
    }
  }

  public getAppointments(): Appointment[] {
    return this.getStored<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
  }

  public saveAppointment(app: Appointment): void {
    const apps = this.getAppointments();
    const existingIndex = apps.findIndex((a) => a.id === app.id);
    if (existingIndex >= 0) {
      apps[existingIndex] = app;
    } else {
      apps.unshift(app);
    }
    this.setStored('appointments', apps);
    this.queueSyncItem({
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      operation: existingIndex >= 0 ? 'UPDATE' : 'CREATE',
      entity: 'appointment',
      data: app,
      timestamp: Date.now(),
      attempts: 0,
    });
  }

  public saveAppointments(apps: Appointment[]): void {
    this.setStored('appointments', apps);
  }

  public getQueue(): QueueItem[] {
    return this.getStored<QueueItem[]>('queue', INITIAL_QUEUE);
  }

  public saveQueue(queue: QueueItem[]): void {
    this.setStored('queue', queue);
  }

  public getStock(): StockItem[] {
    return this.getStored<StockItem[]>('stock', INITIAL_STOCK);
  }

  public saveStock(stock: StockItem[]): void {
    this.setStored('stock', stock);
  }

  public getInvoices(): SyscohadaInvoice[] {
    return this.getStored<SyscohadaInvoice[]>('invoices', INITIAL_INVOICES);
  }

  public saveInvoice(invoice: SyscohadaInvoice): void {
    const list = this.getInvoices();
    list.unshift(invoice);
    this.setStored('invoices', list);
  }

  public saveInvoices(invoices: SyscohadaInvoice[]): void {
    this.setStored('invoices', invoices);
  }

  public getAuditLogs(): AuditLog[] {
    return this.getStored<AuditLog[]>('auditLogs', INITIAL_AUDIT_LOGS);
  }

  public addAuditLog(actor: string, action: string, details: string, patientId?: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor,
      action,
      patientId,
      details,
      ipAddress: '197.149.' + Math.floor(Math.random() * 200 + 10) + '.42 (Douala ISP)',
      encryptionStatus: 'AES-256-GCM Verified',
    };
    logs.unshift(newLog);
    this.setStored('auditLogs', logs.slice(0, 50));
  }

  public getSyncQueue(): SyncQueueItem[] {
    return this.getStored<SyncQueueItem[]>('syncQueue', []);
  }

  public queueSyncItem(item: SyncQueueItem): void {
    const q = this.getSyncQueue();
    q.push(item);
    this.setStored('syncQueue', q);
  }

  public clearSyncedItems(ids: string[]): void {
    const q = this.getSyncQueue().filter((item) => !ids.includes(item.id));
    this.setStored('syncQueue', q);
  }
}

export const db = new DoualaSanteStorage();
db.init();
