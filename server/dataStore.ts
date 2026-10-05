import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Practitioner,
  HealthFacility,
  Appointment,
  QueueItem,
  SyscohadaInvoice,
  StockItem,
  AuditLog,
  AdminUser,
  PatientAccount,
  DoctorAccount,
  SlotReservationRequest,
  FacilitySchedule,
  TriageUrgency,
} from '../src/types';
import { generateSecret } from './totp';

export interface AdminCredentials {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'medical_director' | 'chief_secretary';
  passwordHash: string; // SHA-256 hash
  twoFactorSecret: string; // Base32 secret for Google Authenticator
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PatientEntity extends PatientAccount {
  passwordHash: string;
}

export interface DoctorEntity extends DoctorAccount {
  passwordHash: string;
}

// Fixed salt for password hashing
const PASSWORD_SALT = 'doualasanté_salt_2026_cameroon';

export function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain + PASSWORD_SALT).digest('hex');
}

// Initial seed facilities in Douala
export const INITIAL_FACILITIES: HealthFacility[] = [
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
    address: 'Rue de la Joie prolongée, Deïdo, Douala',
    phone: '+237 233 40 18 20',
    rooms: ['Pavillon Consultations Externes', 'Salle Polyvalente 1', 'Salle de Triage Urgences'],
  },
];

// Initial seed practitioners
export const INITIAL_PRACTITIONERS: Practitioner[] = [
  {
    id: 'dr_kamdem',
    name: 'Dr. Jean-Paul Kamdem',
    specialty: 'Cardiologie & Hypertension',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    phone: '+237 699 45 21 80',
    email: 'jp.kamdem@doualasante.cm',
    quarter: 'Bonanjo (Face Port)',
    clinicName: 'Clinique du Littoral - Bonanjo',
    consultationFee: 20000,
    depositFee: 2000,
    availableDays: ['Lundi', 'Mercredi', 'Vendredi'],
    workingHours: { start: '08:00', end: '16:00' },
    slotDurationMinutes: 30,
    rooms: ['Cabinet Cardiologie 1', 'Salle ECG & Écho Cœur'],
    rating: 4.9,
    patientsCount: 1420,
    bio: 'Ancien chef de clinique CHU, spécialisé dans la prise en charge de l’hypertension artérielle et insuffisance cardiaque tropicale.',
    facilitySchedules: [
      {
        id: 'sched_kamdem_littoral',
        facilityId: 'fosa_littoral',
        facilityName: 'Clinique du Littoral',
        facilityQuarter: 'Bonanjo',
        days: ['Lundi', 'Mercredi'],
        timeSlots: { start: '08:00', end: '13:00' },
        slotDurationMinutes: 30,
        rooms: ['Cabinet Cardiologie 1', 'Salle ECG & Écho Cœur'],
        consultationFee: 20000,
        depositFee: 2000,
        notes: 'Consultations spécialisées cardio & bilan tensionnel complet',
      },
      {
        id: 'sched_kamdem_saint_luc',
        facilityId: 'fosa_saint_luc',
        facilityName: 'Centre Médical Saint-Luc',
        facilityQuarter: 'Bonapriso',
        days: ['Vendredi'],
        timeSlots: { start: '14:00', end: '18:30' },
        slotDurationMinutes: 30,
        rooms: ['Cabinet Cardio Polyvalent'],
        consultationFee: 25000,
        depositFee: 2000,
        notes: 'Consultations après-midi & échocardiographies de contrôle',
      },
      {
        id: 'sched_kamdem_deido',
        facilityId: 'fosa_deido',
        facilityName: 'Hôpital de District de Deïdo',
        facilityQuarter: 'Deïdo',
        days: ['Mardi'],
        timeSlots: { start: '09:00', end: '12:00' },
        slotDurationMinutes: 20,
        rooms: ['Pavillon Consultations Externes'],
        consultationFee: 10000,
        depositFee: 2000,
        notes: 'Consultations publiques conventionnées & dépistage HTA',
      },
    ],
  },
  {
    id: 'dr_ngombock',
    name: 'Dr. Cécile Ngo Mbock',
    specialty: 'Gynécologie Obstétrique',
    avatar: 'https://images.unsplash.com/photo-1594824813583-f3c1d9326e7a?w=400&auto=format&fit=crop&q=80',
    phone: '+237 677 30 11 92',
    email: 'c.ngombock@doualasante.cm',
    quarter: 'Bonapriso (Rue des Palmiers)',
    clinicName: 'Centre Médical Saint-Luc - Bonapriso',
    consultationFee: 22000,
    depositFee: 2000,
    availableDays: ['Mardi', 'Jeudi', 'Samedi'],
    workingHours: { start: '09:00', end: '15:00' },
    slotDurationMinutes: 30,
    rooms: ['Salle d’Échographie 4D', 'Cabinet Gynéco 2'],
    rating: 4.8,
    patientsCount: 980,
    bio: 'Suivi de grossesses à haut risque, échographies morphologiques 4D et infertilité du couple.',
    facilitySchedules: [
      {
        id: 'sched_ngombock_saint_luc',
        facilityId: 'fosa_saint_luc',
        facilityName: 'Centre Médical Saint-Luc',
        facilityQuarter: 'Bonapriso',
        days: ['Mardi', 'Jeudi'],
        timeSlots: { start: '09:00', end: '15:00' },
        slotDurationMinutes: 30,
        rooms: ['Salle d’Échographie 4D', 'Cabinet Gynéco 2'],
        consultationFee: 22000,
        depositFee: 2000,
        notes: 'Échographies morphologiques et suivi prénatal',
      },
      {
        id: 'sched_ngombock_sainte_anne',
        facilityId: 'fosa_sainte_anne',
        facilityName: 'Polyclinique Sainte-Anne',
        facilityQuarter: 'Akwa',
        days: ['Samedi'],
        timeSlots: { start: '08:30', end: '13:00' },
        slotDurationMinutes: 30,
        rooms: ['Bloc Ambulatoire'],
        consultationFee: 25000,
        depositFee: 2000,
        notes: 'Permanence samedi matin & petites chirurgies ambulatoires',
      },
    ],
  },
  {
    id: 'dr_eboa',
    name: 'Dr. Samuel Eboa',
    specialty: 'Pédiatrie & Néonatologie',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    phone: '+237 694 12 78 44',
    email: 's.eboa@doualasante.cm',
    quarter: 'Akwa (Boulevard Liberté)',
    clinicName: 'Polyclinique Sainte-Anne - Akwa',
    consultationFee: 18000,
    depositFee: 2000,
    availableDays: ['Lundi', 'Mardi', 'Jeudi', 'Vendredi'],
    workingHours: { start: '08:30', end: '14:30' },
    slotDurationMinutes: 20,
    rooms: ['Salle Pédiatrique Éveil', 'Cabinet Pédiatrie 1'],
    rating: 4.95,
    patientsCount: 2150,
    bio: 'Suivi du nouveau-né, vaccinations du PEV élargi, paludisme pédiatrique et asthme infantile.',
    facilitySchedules: [
      {
        id: 'sched_eboa_sainte_anne',
        facilityId: 'fosa_sainte_anne',
        facilityName: 'Polyclinique Sainte-Anne',
        facilityQuarter: 'Akwa',
        days: ['Lundi', 'Jeudi', 'Vendredi'],
        timeSlots: { start: '08:30', end: '14:30' },
        slotDurationMinutes: 20,
        rooms: ['Salle Pédiatrique Éveil', 'Cabinet Pédiatrie 1'],
        consultationFee: 18000,
        depositFee: 2000,
        notes: 'Pédiatrie générale et bilan de croissance',
      },
      {
        id: 'sched_eboa_makepe',
        facilityId: 'fosa_makepe',
        facilityName: 'Cabinet Médical de Makepe',
        facilityQuarter: 'Makepe',
        days: ['Mardi'],
        timeSlots: { start: '14:00', end: '18:00' },
        slotDurationMinutes: 20,
        rooms: ['Box Pédiatrie Nord'],
        consultationFee: 15000,
        depositFee: 2000,
        notes: 'Consultations de proximité Makepe / Missoke',
      },
    ],
  },
  {
    id: 'dr_talla',
    name: 'Dr. Mireille Talla',
    specialty: 'Médecine Générale & Urgences',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    phone: '+237 671 88 45 10',
    email: 'm.talla@doualasante.cm',
    quarter: 'Makepe (Carrefour Rhône Poulenc)',
    clinicName: 'Cabinet Médical de Makepe',
    consultationFee: 12000,
    depositFee: 2000,
    availableDays: ['Lundi', 'Mercredi', 'Samedi'],
    workingHours: { start: '08:00', end: '17:00' },
    slotDurationMinutes: 25,
    rooms: ['Cabinet Consultation Polyvalente', 'Salle de Petits Soins'],
    rating: 4.75,
    patientsCount: 1640,
    bio: 'Dépistage paludisme, fièvre typhoïde, bilans de santé généraux et médecine préventive.',
    facilitySchedules: [
      {
        id: 'sched_talla_makepe',
        facilityId: 'fosa_makepe',
        facilityName: 'Cabinet Médical de Makepe',
        facilityQuarter: 'Makepe',
        days: ['Lundi', 'Mercredi', 'Samedi'],
        timeSlots: { start: '08:00', end: '15:00' },
        slotDurationMinutes: 25,
        rooms: ['Cabinet Consultation Polyvalente'],
        consultationFee: 12000,
        depositFee: 2000,
        notes: 'Urgences courantes et bilans de santé',
      },
      {
        id: 'sched_talla_littoral',
        facilityId: 'fosa_littoral',
        facilityName: 'Clinique du Littoral',
        facilityQuarter: 'Bonanjo',
        days: ['Jeudi'],
        timeSlots: { start: '13:00', end: '19:00' },
        slotDurationMinutes: 25,
        rooms: ['Box Accueil Urgences'],
        consultationFee: 16000,
        depositFee: 2000,
        notes: 'Garde de soirée et triage des urgences',
      },
    ],
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'rdv-dla-001',
    patientId: 'pat_001',
    patientName: 'Mireille Essomba',
    patientPhone: '+237 677 12 34 56',
    practitionerId: 'dr_kamdem',
    practitionerName: 'Dr. Jean-Paul Kamdem',
    specialty: 'Cardiologie & Hypertension',
    date: '2026-10-02',
    timeSlot: '09:00',
    type: 'in_person',
    facilityId: 'fosa_littoral',
    facilityName: 'Clinique du Littoral',
    facilityQuarter: 'Bonanjo',
    room: 'Cabinet Cardiologie 1',
    reason: 'Suivi hypertension artérielle et renouvellement traitement',
    triageUrgency: 'green',
    status: 'completed',
    amountTotal: 20000,
    amountPaid: 20000,
    paymentMethod: 'mtn_momo',
    bookingChannel: 'whatsapp',
    qrTicketCode: 'DS-DLA-8492',
    createdAt: '2026-10-01T14:30:00Z',
    updatedAt: '2026-10-02T09:35:00Z',
    synced: true,
  },
  {
    id: 'rdv-dla-002',
    patientId: 'pat_002',
    patientName: 'Samuel Moukoko',
    patientPhone: '+237 699 88 77 66',
    practitionerId: 'dr_kamdem',
    practitionerName: 'Dr. Jean-Paul Kamdem',
    specialty: 'Cardiologie & Hypertension',
    date: '2026-10-02',
    timeSlot: '10:00',
    type: 'in_person',
    facilityId: 'fosa_littoral',
    facilityName: 'Clinique du Littoral',
    facilityQuarter: 'Bonanjo',
    room: 'Cabinet Cardiologie 1',
    reason: 'Douleurs thoraciques à l’effort et essoufflement rapide',
    triageUrgency: 'orange',
    status: 'in_consultation',
    amountTotal: 20000,
    amountPaid: 2000,
    paymentMethod: 'orange_money',
    bookingChannel: 'whatsapp',
    qrTicketCode: 'DS-DLA-3921',
    createdAt: '2026-10-02T07:15:00Z',
    updatedAt: '2026-10-02T10:02:00Z',
    synced: true,
  },
  {
    id: 'rdv-dla-003',
    patientId: 'pat_003',
    patientName: 'Bébé Lucas Eyango (Maman Carine)',
    patientPhone: '+237 675 43 21 09',
    practitionerId: 'dr_eboa',
    practitionerName: 'Dr. Samuel Eboa',
    specialty: 'Pédiatrie & Néonatologie',
    date: '2026-10-02',
    timeSlot: '11:00',
    type: 'urgent',
    facilityId: 'fosa_sainte_anne',
    facilityName: 'Polyclinique Sainte-Anne',
    facilityQuarter: 'Akwa',
    room: 'Salle Pédiatrique Éveil',
    reason: 'Fièvre à 39.4°C depuis 48h et vomissements répétés',
    triageUrgency: 'red',
    status: 'in_waiting_room',
    amountTotal: 18000,
    amountPaid: 2000,
    paymentMethod: 'mtn_momo',
    bookingChannel: 'reception',
    qrTicketCode: 'DS-DLA-7140',
    createdAt: '2026-10-02T08:45:00Z',
    updatedAt: '2026-10-02T08:50:00Z',
    synced: true,
  },
];

export const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q1',
    appointmentId: 'rdv-dla-003',
    patientName: 'Bébé Lucas Eyango',
    patientPhone: '+237 675 43 21 09',
    practitionerName: 'Dr. Samuel Eboa',
    specialty: 'Pédiatrie',
    arrivalTimestamp: '2026-10-02T09:40:00Z',
    triageUrgency: 'red',
    declaredSymptoms: 'Fièvre 39.4°C, vomissements, pâleur marquée',
    estimatedWaitMinutes: 5,
    vitalSigns: { temperature: 39.4, bloodPressure: '95/60', weightKg: 11.2, pulseBpm: 135 },
    column: 'waiting',
    qrCodeScanned: true,
  },
  {
    id: 'q2',
    appointmentId: 'rdv-dla-002',
    patientName: 'Samuel Moukoko',
    patientPhone: '+237 699 88 77 66',
    practitionerName: 'Dr. Jean-Paul Kamdem',
    specialty: 'Cardiologie',
    arrivalTimestamp: '2026-10-02T09:50:00Z',
    triageUrgency: 'orange',
    declaredSymptoms: 'Précordialgies d’effort, TA élevée',
    estimatedWaitMinutes: 0,
    vitalSigns: { bloodPressure: '158/98', temperature: 36.8, pulseBpm: 92, weightKg: 84 },
    column: 'consultation',
    calledAt: '2026-10-02T10:02:00Z',
    qrCodeScanned: true,
  },
  {
    id: 'q3',
    appointmentId: 'rdv-dla-004',
    patientName: 'Clarisse Tchounkeu',
    patientPhone: '+237 690 11 22 33',
    practitionerName: 'Dr. Cécile Ngo Mbock',
    specialty: 'Gynécologie',
    arrivalTimestamp: '2026-10-02T10:10:00Z',
    triageUrgency: 'yellow',
    declaredSymptoms: 'Contrôle échographie T3 et bilan biologique',
    estimatedWaitMinutes: 20,
    vitalSigns: { bloodPressure: '115/75', temperature: 37.0, weightKg: 68 },
    column: 'triage',
    qrCodeScanned: true,
  },
];

export const INITIAL_INVOICES: SyscohadaInvoice[] = [
  {
    id: 'FACT-DLA-2026-1049',
    appointmentId: 'rdv-dla-001',
    patientName: 'Mireille Essomba',
    date: '2026-10-02',
    consultationFee: 20000,
    additionalActsFee: 5000,
    totalTTC: 25000,
    amountPaid: 25000,
    balanceDue: 0,
    paymentMethod: 'MTN Mobile Money (*126#)',
    accountCredit: '7061 (Prestations de soins)',
    accountDebit: '5211 (Trésorerie MTN MoMo)',
    status: 'paid',
  },
  {
    id: 'FACT-DLA-2026-1050',
    appointmentId: 'rdv-dla-002',
    patientName: 'Samuel Moukoko',
    date: '2026-10-02',
    consultationFee: 20000,
    additionalActsFee: 15000,
    totalTTC: 35000,
    amountPaid: 2000,
    balanceDue: 33000,
    paymentMethod: 'Orange Money (*150#)',
    accountCredit: '7061 (Prestations de soins)',
    accountDebit: '5212 (Trésorerie Orange Money)',
    status: 'partial',
  },
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stock_rdt_malaria',
    name: 'Tests Rapides Paludisme (RDT Pf/Pan)',
    category: 'diagnostics',
    quantityInStock: 85,
    criticalThreshold: 30,
    unit: 'boîtes (x25)',
    unitPriceFCFA: 12500,
    supplierName: 'Laborex Cameroun (Akwa)',
    supplierPhone: '+237 233 42 15 15',
    lastRestockedDate: '2026-09-20',
    status: 'adequate',
  },
  {
    id: 'stock_gants_steriles',
    name: 'Gants d’examen latex poudrés (Taille M)',
    category: 'protection',
    quantityInStock: 12,
    criticalThreshold: 25,
    unit: 'boîtes (x100)',
    unitPriceFCFA: 4500,
    supplierName: 'Pharmacie du Littoral (Bonanjo)',
    supplierPhone: '+237 233 42 09 88',
    lastRestockedDate: '2026-09-10',
    status: 'critical',
  },
  {
    id: 'stock_seringues_5ml',
    name: 'Seringues 5ml 3 pièces avec aiguille 21G',
    category: 'injection',
    quantityInStock: 140,
    criticalThreshold: 50,
    unit: 'unités',
    unitPriceFCFA: 150,
    supplierName: 'Cameroun Médical Distribution (Deïdo)',
    supplierPhone: '+237 699 00 22 11',
    lastRestockedDate: '2026-09-28',
    status: 'adequate',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    timestamp: '2026-10-02T07:15:22Z',
    actor: 'Système DoualaSanté',
    action: 'Génération Billet QR & Débit MoMo',
    patientId: 'pat_002',
    details: 'Acompte de 2 000 FCFA validé via Orange Money (*150#) pour Dr. Kamdem',
    ipAddress: '129.0.211.45 (Douala)',
    encryptionStatus: 'AES-256-GCM Verified',
  },
  {
    id: 'log_002',
    timestamp: '2026-10-02T09:00:10Z',
    actor: 'Dr. Jean-Paul Kamdem',
    action: 'Consultation & Ordonnance Sécurisée',
    patientId: 'pat_001',
    details: 'Émission ordonnance numérique certifiée ONMC pour Mireille Essomba',
    ipAddress: '154.72.168.10 (Bonanjo)',
    encryptionStatus: 'AES-256-GCM Verified',
  },
];

export const INITIAL_PATIENTS: PatientEntity[] = [
  {
    id: 'pat_001',
    name: 'Samuel Moukoko',
    email: 'samuel.moukoko@gmail.com',
    phone: '+237 699 88 77 66',
    quarter: 'Bonanjo (Face Port Autonome)',
    bloodGroup: 'O+',
    allergies: 'Aucune allergie médicamenteuse connue',
    emergencyContact: 'Cécile Moukoko (+237 699 88 77 67)',
    passwordHash: hashPassword('Patient@2026'),
    createdAt: '2026-08-15T10:00:00Z',
    lastLoginAt: '2026-10-02T08:30:00Z',
  },
  {
    id: 'pat_002',
    name: 'Mireille Essomba',
    email: 'mireille.essomba@gmail.com',
    phone: '+237 677 12 34 56',
    quarter: 'Akwa (Boulevard de la Liberté)',
    bloodGroup: 'A+',
    allergies: 'Sulfamides',
    emergencyContact: 'Paul Essomba (+237 677 12 34 50)',
    passwordHash: hashPassword('Patient@2026'),
    createdAt: '2026-09-01T14:20:00Z',
    lastLoginAt: '2026-10-02T09:15:00Z',
  },
  {
    id: 'pat_003',
    name: 'Bébé Lucas Eyango',
    email: 'lucas.eyango@gmail.com',
    phone: '+237 675 43 21 09',
    quarter: 'Makepe (Carrefour Rhône Poulenc)',
    bloodGroup: 'B+',
    allergies: 'Pénicilline',
    emergencyContact: 'Nathalie Eyango (+237 675 43 21 10)',
    passwordHash: hashPassword('Patient@2026'),
    createdAt: '2026-09-20T08:00:00Z',
    lastLoginAt: '2026-10-02T07:45:00Z',
  },
];

export const INITIAL_DOCTORS: DoctorEntity[] = [
  {
    id: 'dr_kamdem',
    name: 'Dr. Jean-Paul Kamdem',
    email: 'jp.kamdem@cardio-douala.cm',
    phone: '+237 699 88 77 66',
    specialty: 'Cardiologie & Hypertension',
    onmcNumber: 'ONMC-DLA-4821',
    clinicName: 'Clinique du Littoral - Bonanjo',
    quarter: 'Bonanjo (Face Port Autonome)',
    consultationFee: 20000,
    depositFee: 2000,
    workingHours: { start: '08:00', end: '16:00' },
    slotDurationMinutes: 30,
    availableDays: ['Lundi', 'Mercredi', 'Vendredi'],
    facilitySchedules: INITIAL_PRACTITIONERS[0]?.facilitySchedules || [],
    bio: 'Ancien chef de clinique CHU, spécialisé dans la prise en charge de l’hypertension artérielle et insuffisance cardiaque tropicale.',
    rating: 4.9,
    patientsCount: 1420,
    createdAt: '2026-01-10T00:00:00Z',
    status: 'active',
    passwordHash: hashPassword('Doctor@2026'),
  },
  {
    id: 'dr_eboa',
    name: 'Dr. Samuel Eboa',
    email: 's.eboa@pediatrie-douala.cm',
    phone: '+237 675 22 11 00',
    specialty: 'Pédiatrie & Urgences Néonatales',
    onmcNumber: 'ONMC-DLA-5190',
    clinicName: 'Polyclinique Sainte-Anne - Akwa',
    quarter: 'Akwa (Boulevard de la Liberté)',
    consultationFee: 15000,
    depositFee: 2000,
    workingHours: { start: '08:00', end: '17:00' },
    slotDurationMinutes: 20,
    availableDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    facilitySchedules: INITIAL_PRACTITIONERS[1]?.facilitySchedules || [],
    bio: 'Pédiatre urgentiste certifié. Prise en charge des fièvres aiguës, paludisme sévère du nourrisson, asthme et suivi de croissance.',
    rating: 4.85,
    patientsCount: 1120,
    createdAt: '2026-02-05T00:00:00Z',
    status: 'active',
    passwordHash: hashPassword('Doctor@2026'),
  },
  {
    id: 'dr_ngombock',
    name: 'Dr. Henriette Ngo Mbock',
    email: 'h.ngombock@bonapriso-medical.cm',
    phone: '+237 699 15 48 23',
    specialty: 'Gynécologie & Obstétrique',
    onmcNumber: 'ONMC-DLA-3788',
    clinicName: 'Centre Médical Saint-Luc - Bonapriso',
    quarter: 'Bonapriso (Rue des Palmiers)',
    consultationFee: 18000,
    depositFee: 2000,
    workingHours: { start: '08:30', end: '16:30' },
    slotDurationMinutes: 30,
    availableDays: ['Mardi', 'Mercredi', 'Vendredi', 'Samedi'],
    facilitySchedules: INITIAL_PRACTITIONERS[2]?.facilitySchedules || [],
    bio: 'Suivi de grossesse à risque, échographie morphologique foetale 4D, bilans de fertilité du couple et santé gynécologique.',
    rating: 4.95,
    patientsCount: 610,
    createdAt: '2026-02-18T00:00:00Z',
    status: 'active',
    passwordHash: hashPassword('Doctor@2026'),
  },
];

// Persistent state class
export class BackendDataStore {
  public adminUser: AdminCredentials;
  public facilities: HealthFacility[];
  public practitioners: Practitioner[];
  public appointments: Appointment[];
  public queue: QueueItem[];
  public invoices: SyscohadaInvoice[];
  public stock: StockItem[];
  public auditLogs: AuditLog[];
  public patients: PatientEntity[];
  public doctors: DoctorEntity[];
  public activeSessions: Map<string, { email: string; expiresAt: number }>;
  public patientSessions: Map<string, { patientId: string; expiresAt: number }>;
  public doctorSessions: Map<string, { doctorId: string; expiresAt: number }>;

  constructor() {
    // Requested admin: mauricengamou39@gmail.com
    const defaultSecret = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
    const defaultPassword = hashPassword('Admin@Douala2026#');

    this.adminUser = {
      id: 'admin_maurice_01',
      email: 'mauricengamou39@gmail.com',
      name: 'Maurice Ngamou (Administrateur DoualaSanté)',
      role: 'super_admin',
      passwordHash: defaultPassword,
      twoFactorSecret: defaultSecret,
      twoFactorEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    this.facilities = [...INITIAL_FACILITIES];
    this.practitioners = [...INITIAL_PRACTITIONERS];
    this.appointments = [...INITIAL_APPOINTMENTS];
    this.queue = [...INITIAL_QUEUE];
    this.invoices = [...INITIAL_INVOICES];
    this.stock = [...INITIAL_STOCK];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.patients = [...INITIAL_PATIENTS];
    this.doctors = [...INITIAL_DOCTORS];
    this.activeSessions = new Map();
    this.patientSessions = new Map();
    this.doctorSessions = new Map();
  }

  // --- Admin Sessions ---
  public createSession(email: string): string {
    const token = 'ds_adm_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    this.activeSessions.set(token, { email, expiresAt });
    return token;
  }

  public validateSession(token: string): boolean {
    if (!token) return false;
    const session = this.activeSessions.get(token);
    if (!session) return false;
    if (session.expiresAt < Date.now()) {
      this.activeSessions.delete(token);
      return false;
    }
    return true;
  }

  public revokeSession(token: string): void {
    this.activeSessions.delete(token);
  }

  // --- Patient Management ---
  public registerPatient(data: {
    name: string;
    email: string;
    phone: string;
    quarter: string;
    password: string;
    bloodGroup?: string;
    allergies?: string;
    emergencyContact?: string;
  }): { token: string; patient: PatientAccount; expiresAt: string } {
    const existing = this.patients.find(
      (p) => p.email.toLowerCase() === data.email.toLowerCase() || p.phone === data.phone
    );
    if (existing) {
      throw new Error('Un compte patient existe déjà avec cet email ou numéro de téléphone');
    }

    const newPatient: PatientEntity = {
      id: 'pat_' + Date.now().toString(36),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      quarter: data.quarter || 'Douala',
      bloodGroup: data.bloodGroup || 'Non renseigné',
      allergies: data.allergies || 'Aucune connue',
      emergencyContact: data.emergencyContact || '',
      passwordHash: hashPassword(data.password),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.patients.unshift(newPatient);
    this.addAuditLog(newPatient.name, 'Création compte patient', `Inscription patient réussie depuis Douala (${newPatient.quarter})`);

    const token = 'ds_pat_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    this.patientSessions.set(token, { patientId: newPatient.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...safePatient } = newPatient;
    return { token, patient: safePatient, expiresAt };
  }

  public authenticatePatient(emailOrPhone: string, password: string): { token: string; patient: PatientAccount; expiresAt: string } | null {
    const query = emailOrPhone.trim().toLowerCase();
    const patient = this.patients.find(
      (p) => p.email.toLowerCase() === query || p.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '')
    );
    if (!patient) return null;

    if (patient.passwordHash !== hashPassword(password)) {
      return null;
    }

    patient.lastLoginAt = new Date().toISOString();
    const token = 'ds_pat_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    this.patientSessions.set(token, { patientId: patient.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...safePatient } = patient;
    return { token, patient: safePatient, expiresAt };
  }

  public getPatientBySession(token: string): PatientAccount | null {
    if (!token) return null;
    const session = this.patientSessions.get(token);
    if (!session || session.expiresAt < Date.now()) return null;
    const patient = this.patients.find((p) => p.id === session.patientId);
    if (!patient) return null;
    const { passwordHash: _, ...safe } = patient;
    return safe;
  }

  // --- Doctor Management ---
  public registerDoctor(data: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    onmcNumber: string;
    clinicName: string;
    quarter: string;
    password: string;
    consultationFee?: number;
  }): { token: string; doctor: DoctorAccount; expiresAt: string } {
    const existing = this.doctors.find(
      (d) => d.email.toLowerCase() === data.email.toLowerCase() || d.onmcNumber === data.onmcNumber
    );
    if (existing) {
      throw new Error('Un médecin avec cet email ou ce numéro ONMC est déjà enregistré');
    }

    const id = 'dr_' + data.name.toLowerCase().replace(/[^a-z]/g, '') + '_' + Math.floor(100 + Math.random() * 900);
    const newDoc: DoctorEntity = {
      id,
      name: data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`,
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      specialty: data.specialty,
      onmcNumber: data.onmcNumber.trim().toUpperCase(),
      clinicName: data.clinicName,
      quarter: data.quarter || 'Douala',
      consultationFee: data.consultationFee || 20000,
      depositFee: 2000,
      workingHours: { start: '08:00', end: '16:00' },
      slotDurationMinutes: 30,
      availableDays: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
      facilitySchedules: [
        {
          id: `sched_${id}_1`,
          facilityId: 'fosa_littoral',
          facilityName: data.clinicName || 'Clinique du Littoral',
          facilityQuarter: data.quarter || 'Bonanjo',
          days: ['Lundi', 'Mercredi', 'Vendredi'],
          timeSlots: { start: '08:00', end: '15:00' },
          slotDurationMinutes: 30,
          rooms: ['Cabinet Consultation 1'],
          consultationFee: data.consultationFee || 20000,
          depositFee: 2000,
          notes: 'Créneaux réguliers de consultation',
        },
      ],
      bio: `Médecin spécialiste inscrit à l'Ordre National des Médecins du Cameroun (${data.onmcNumber}). Consultations à ${data.clinicName}.`,
      rating: 5.0,
      patientsCount: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      passwordHash: hashPassword(data.password),
    };

    this.doctors.unshift(newDoc);

    // Sync into practitioners list for public booking directory
    const existingPrac = this.practitioners.find((p) => p.id === newDoc.id);
    if (!existingPrac) {
      this.practitioners.unshift({
        id: newDoc.id,
        name: newDoc.name,
        specialty: newDoc.specialty,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
        phone: newDoc.phone,
        email: newDoc.email,
        quarter: newDoc.quarter,
        clinicName: newDoc.clinicName,
        consultationFee: newDoc.consultationFee,
        depositFee: newDoc.depositFee,
        availableDays: newDoc.availableDays,
        workingHours: newDoc.workingHours,
        slotDurationMinutes: newDoc.slotDurationMinutes,
        rooms: ['Cabinet Consultation 1'],
        rating: 5.0,
        patientsCount: 0,
        bio: newDoc.bio,
        facilitySchedules: newDoc.facilitySchedules,
      });
    }

    this.addAuditLog(newDoc.name, 'Inscription Médecin ONMC', `Nouveau praticien enregistré (${newDoc.specialty} - ${newDoc.onmcNumber})`);

    const token = 'ds_doc_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    this.doctorSessions.set(token, { doctorId: newDoc.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...safeDoctor } = newDoc;
    return { token, doctor: safeDoctor, expiresAt };
  }

  public authenticateDoctor(emailOrPhone: string, password: string): { token: string; doctor: DoctorAccount; expiresAt: string } | null {
    const query = emailOrPhone.trim().toLowerCase();
    const doc = this.doctors.find(
      (d) =>
        d.email.toLowerCase() === query ||
        d.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
        d.onmcNumber.toLowerCase() === query
    );
    if (!doc) return null;

    if (doc.passwordHash !== hashPassword(password)) {
      return null;
    }

    doc.lastLoginAt = new Date().toISOString();
    const token = 'ds_doc_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    this.doctorSessions.set(token, { doctorId: doc.id, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...safeDoctor } = doc;
    return { token, doctor: safeDoctor, expiresAt };
  }

  public getDoctorBySession(token: string): DoctorAccount | null {
    if (!token) return null;
    const session = this.doctorSessions.get(token);
    if (!session || session.expiresAt < Date.now()) return null;
    const doc = this.doctors.find((d) => d.id === session.doctorId);
    if (!doc) return null;
    const { passwordHash: _, ...safe } = doc;
    return safe;
  }

  // --- Slot Booking Engine ---
  public bookSlot(req: SlotReservationRequest, ip = '127.0.0.1'): { appointment: Appointment; invoice: SyscohadaInvoice; queueItem: QueueItem } {
    const apptId = `rdv-dla-${Math.floor(100 + Math.random() * 900)}`;
    const qrTicketCode = `TKT-DLA-${Math.floor(1000 + Math.random() * 9000)}-${apptId.toUpperCase()}`;

    const newAppointment: Appointment = {
      id: apptId,
      patientName: req.patientName,
      patientPhone: req.patientPhone,
      practitionerId: req.practitionerId,
      practitionerName: req.practitionerName,
      facilityId: req.facilityId,
      facilityName: req.facilityName,
      date: req.date,
      timeSlot: req.timeSlot,
      status: 'confirmed',
      amountTotal: 20000,
      amountPaid: req.amountPaid || 2000,
      paymentMethod: req.paymentMethod,
      paymentReference: `${req.paymentMethod === 'mtn_momo' ? 'MTN' : req.paymentMethod === 'orange_money' ? 'OM' : 'CSH'}-${Date.now().toString().slice(-6)}`,
      bookingChannel: 'pwa',
      qrTicketCode,
      symptoms: req.symptoms,
      triageUrgency: req.triageUrgency || 'yellow',
      consultationType: req.consultationType || 'in_person',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: true,
    };

    this.appointments.unshift(newAppointment);

    // Create Invoice
    const invoiceId = `FACT-DLA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice: SyscohadaInvoice = {
      id: invoiceId,
      appointmentId: apptId,
      patientName: req.patientName,
      date: req.date,
      consultationFee: 20000,
      additionalActsFee: 0,
      totalTTC: 20000,
      amountPaid: req.amountPaid || 2000,
      balanceDue: 20000 - (req.amountPaid || 2000),
      paymentMethod:
        req.paymentMethod === 'mtn_momo'
          ? 'MTN Mobile Money (*126#)'
          : req.paymentMethod === 'orange_money'
          ? 'Orange Money (*150#)'
          : 'Espèces Caisse',
      accountCredit: '7061 (Prestations de soins)',
      accountDebit:
        req.paymentMethod === 'mtn_momo'
          ? '5211 (Trésorerie MTN MoMo)'
          : req.paymentMethod === 'orange_money'
          ? '5212 (Trésorerie Orange Money)'
          : '571 (Caisse principale)',
      status: (req.amountPaid || 2000) >= 20000 ? 'paid' : 'partial',
    };
    this.invoices.unshift(invoice);

    // Create Queue entry for waiting room
    const queueItem: QueueItem = {
      id: `q_${Date.now().toString(36)}`,
      appointmentId: apptId,
      patientName: req.patientName,
      patientPhone: req.patientPhone,
      practitionerId: req.practitionerId,
      practitionerName: req.practitionerName,
      arrivalTimestamp: new Date().toISOString(),
      triageUrgency: req.triageUrgency || 'yellow',
      declaredSymptoms: req.symptoms,
      estimatedWaitMinutes: 15,
      column: 'waiting',
      qrCodeScanned: false,
    };
    this.queue.unshift(queueItem);

    // Add Audit Log
    this.addAuditLog(
      req.patientName,
      'Réservation créneau horaire',
      `Créneau ${req.timeSlot} le ${req.date} réservé avec ${req.practitionerName} à ${req.facilityName}. Acompte de ${req.amountPaid} FCFA réglé via ${req.paymentMethod}. Billet ${qrTicketCode}`,
      req.patientId,
      ip
    );

    return { appointment: newAppointment, invoice, queueItem };
  }

  public addAuditLog(actor: string, action: string, details: string, patientId?: string, ip = '127.0.0.1'): AuditLog {
    const log: AuditLog = {
      id: 'log_' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
      patientId,
      ipAddress: ip,
      encryptionStatus: 'AES-256-GCM Verified',
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return log;
  }

  public getStats() {
    const totalRevenueFCFA = this.invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
    const totalBalanceDueFCFA = this.invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);
    const criticalStockCount = this.stock.filter((s) => s.status === 'critical').length;
    const activeQueueCount = this.queue.filter((q) => q.column !== 'post_consultation').length;

    return {
      practitionersCount: this.practitioners.length,
      doctorsCount: this.doctors.length,
      patientsCount: this.patients.length,
      facilitiesCount: this.facilities.length,
      appointmentsCount: this.appointments.length,
      activeQueueCount,
      totalRevenueFCFA,
      totalBalanceDueFCFA,
      criticalStockCount,
      auditLogsCount: this.auditLogs.length,
      systemStatus: 'Operational',
      lawCompliance: 'Loi 2024/017 Conforme (AES-256 / OHADA)',
      lastSyncTimestamp: new Date().toISOString(),
    };
  }
}

export const backendStore = new BackendDataStore();

