export type Language = 'fr' | 'en' | 'douala' | 'ewondo' | 'bassa';

export type TriageUrgency = 'red' | 'orange' | 'yellow' | 'green';

export interface HealthFacility {
  id: string;
  name: string;
  type: 'clinique_privee' | 'polyclinique' | 'hopital_district' | 'cabinet_medical';
  quarter: string; // e.g. "Bonanjo", "Akwa", "Bonapriso", "Makepe", "Deïdo"
  address: string;
  phone: string;
  rooms: string[];
}

export interface FacilitySchedule {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityQuarter: string;
  days: string[]; // e.g. ['Lundi', 'Mercredi']
  timeSlots: { start: string; end: string }; // e.g. { start: '08:00', end: '13:00' }
  slotDurationMinutes: number;
  rooms: string[];
  consultationFee: number; // fee may vary by clinic in Douala
  depositFee: number;
  isEmergencyOnCall?: boolean;
  notes?: string;
}

export interface Practitioner {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  phone: string;
  email: string;
  quarter: string; // primary base
  clinicName: string; // primary clinic
  consultationFee: number; // in FCFA
  depositFee: number; // e.g. 2000 FCFA
  availableDays: string[];
  workingHours: { start: string; end: string };
  slotDurationMinutes: number;
  rooms: string[];
  rating: number;
  patientsCount: number;
  bio: string;
  facilitySchedules: FacilitySchedule[]; // Multiple planning schedules across health facilities
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string; // e.g. "+237 670 00 00 00"
  email?: string;
  quarter: string;
  dateOfBirth: string;
  emergencyContact: string;
  preferredLanguage: Language;
  hasConsentedDataSharing: boolean; // Loi 2024/017
  consentDate?: string;
  medicalHistory?: string[];
  allergies?: string[];
  bloodGroup?: string;
}

export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_waiting_room'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type ConsultationType = 'in_person' | 'teleconsultation' | 'urgent';

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  practitionerId: string;
  practitionerName: string;
  specialty?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  type?: ConsultationType;
  consultationType?: ConsultationType;
  facilityId?: string;
  facilityName?: string;
  facilityQuarter?: string;
  room?: string;
  reason?: string;
  symptoms?: string;
  triageUrgency: TriageUrgency;
  triageNotes?: string;
  status: AppointmentStatus;
  amountTotal: number; // in FCFA
  amountPaid: number; // e.g. 2000 or full
  paymentMethod?: 'mtn_momo' | 'orange_money' | 'cash' | 'transfer';
  paymentReference?: string;
  bookingChannel: 'whatsapp' | 'pwa' | 'reception';
  qrTicketCode: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface QueueItem {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  practitionerId?: string;
  practitionerName: string;
  specialty?: string;
  arrivalTimestamp: string;
  triageUrgency: TriageUrgency;
  declaredSymptoms?: string;
  estimatedWaitMinutes: number;
  column: 'waiting' | 'triage' | 'consultation' | 'post_consultation' | 'discharged';
  qrCodeScanned?: boolean;
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: number;
    weightKg?: number;
    pulseBpm?: number;
  };
  calledAt?: string;
}

export interface PaymentTransaction {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  amount: number; // FCFA
  paymentType: 'deposit' | 'full' | 'balance' | 'refund';
  provider: 'mtn_momo' | 'orange_money' | 'cash';
  providerTxId: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  syscohadaAccount: '7061' | '7062' | '5211' | '5212' | '571';
  timestamp: string;
  feeCommission: number; // 1%
}

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  practitionerName: string;
  clinicName: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  verificationQr: string;
  doctorSignatureHash: string;
  sentViaWhatsApp: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'protection' | 'injection' | 'hygiene' | 'diagnostics' | 'instruments' | string;
  quantityInStock: number;
  unit: string;
  criticalThreshold: number;
  unitPriceFCFA: number;
  supplierName: string;
  supplierPhone?: string;
  lastRestockedDate: string;
  status: 'adequate' | 'warning' | 'critical';
}

export interface SyscohadaInvoice {
  id: string; // e.g. FACT-DLA-2026-0042
  appointmentId: string;
  patientName: string;
  date: string;
  consultationFee: number;
  additionalActsFee: number;
  totalTTC: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string;
  accountCredit: string; // 7061
  accountDebit: string; // 521 (MoMo) or 571 (Caisse)
  status: 'paid' | 'partial' | 'pending';
}

export interface SyncQueueItem {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'appointment' | 'queue' | 'patient' | 'payment' | 'prescription' | 'stock';
  data: any;
  timestamp: number;
  attempts: number;
}

export interface WhatsAppNotificationQueueItem {
  id: string;
  recipientPhone: string;
  recipientName: string;
  type: 'booking_confirmation' | 'reminder_24h' | 'reminder_2h' | 'queue_call' | 'prescription';
  language: Language;
  messageContent: string;
  status: 'pending' | 'sent' | 'failed';
  scheduledTime: string;
  sentAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  patientId?: string;
  details: string;
  ipAddress: string;
  encryptionStatus: 'AES-256-GCM Verified';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'medical_director' | 'chief_secretary';
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminAuthSession {
  token: string;
  user: AdminUser;
  expiresAt: string;
}

export interface TwoFactorSetupData {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  account: string;
  issuer: string;
  currentCode?: string; // helpful for instant preview/testing
}

// Patient Account
export interface PatientAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  quarter: string; // Douala: Bonanjo, Akwa, Bonapriso, Makepe, Deïdo, Bépanda, etc.
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PatientAuthSession {
  token: string;
  patient: PatientAccount;
  expiresAt: string;
}

// Doctor Account
export interface DoctorAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  onmcNumber: string; // N° Ordre National des Médecins du Cameroun
  clinicName: string;
  quarter: string;
  consultationFee: number;
  depositFee: number;
  workingHours: { start: string; end: string };
  slotDurationMinutes: number;
  availableDays: string[];
  facilitySchedules: FacilitySchedule[];
  bio: string;
  rating: number;
  patientsCount: number;
  createdAt: string;
  lastLoginAt?: string;
  status: 'active' | 'pending_approval';
}

export interface DoctorAuthSession {
  token: string;
  doctor: DoctorAccount;
  expiresAt: string;
}

// Slot Reservation payload
export interface SlotReservationRequest {
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientQuarter?: string;
  practitionerId: string;
  practitionerName: string;
  facilityId: string;
  facilityName: string;
  date: string;
  timeSlot: string;
  consultationType: 'in_person' | 'teleconsultation';
  symptoms: string;
  triageUrgency: TriageUrgency;
  paymentMethod: 'mtn_momo' | 'orange_money' | 'cash';
  amountPaid: number; // 2,000 FCFA deposit
}

