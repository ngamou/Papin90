/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PatientAccount,
  PatientAuthSession,
  DoctorAccount,
  DoctorAuthSession,
  SlotReservationRequest,
  Appointment,
  SyscohadaInvoice,
  QueueItem,
} from '../types';
import { db } from './db';
import { syncEngine } from './syncEngine';

const PATIENT_SESSION_KEY = 'doualasante_patient_session';
const DOCTOR_SESSION_KEY = 'doualasante_doctor_session';

type AuthListener = () => void;

class AccountService {
  private listeners: Set<AuthListener> = new Set();

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // ==========================================
  // PATIENT METHODS
  // ==========================================

  public getPatientSession(): PatientAuthSession | null {
    try {
      const raw = localStorage.getItem(PATIENT_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public getActivePatient(): PatientAccount | null {
    return this.getPatientSession()?.patient || null;
  }

  public setPatientSession(session: PatientAuthSession | null): void {
    if (session) {
      localStorage.setItem(PATIENT_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(PATIENT_SESSION_KEY);
    }
    this.notify();
  }

  public async registerPatient(data: {
    name: string;
    email: string;
    phone: string;
    quarter: string;
    password: string;
    bloodGroup?: string;
    allergies?: string;
    emergencyContact?: string;
  }): Promise<{ success: boolean; session?: PatientAuthSession; error?: string }> {
    try {
      const res = await fetch('/api/auth/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Erreur lors de l’inscription' };
      }
      const session: PatientAuthSession = {
        token: json.token,
        patient: json.patient,
        expiresAt: json.expiresAt,
      };
      this.setPatientSession(session);
      return { success: true, session };
    } catch (err: any) {
      // Offline fallback: create local patient session
      const offlinePatient: PatientAccount = {
        id: 'pat_off_' + Date.now().toString(36),
        name: data.name,
        email: data.email,
        phone: data.phone,
        quarter: data.quarter || 'Douala',
        bloodGroup: data.bloodGroup || 'Non renseigné',
        allergies: data.allergies || 'Aucune',
        emergencyContact: data.emergencyContact || '',
        createdAt: new Date().toISOString(),
      };
      const session: PatientAuthSession = {
        token: 'ds_offline_pat_' + Date.now(),
        patient: offlinePatient,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      this.setPatientSession(session);
      return { success: true, session };
    }
  }

  public async loginPatient(
    emailOrPhone: string,
    password: string
  ): Promise<{ success: boolean; session?: PatientAuthSession; error?: string }> {
    try {
      const res = await fetch('/api/auth/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Identifiants invalides' };
      }
      const session: PatientAuthSession = {
        token: json.token,
        patient: json.patient,
        expiresAt: json.expiresAt,
      };
      this.setPatientSession(session);
      return { success: true, session };
    } catch {
      // Local fallback for demo patients
      const demoPatients = [
        {
          id: 'pat_001',
          name: 'Samuel Moukoko',
          email: 'samuel.moukoko@gmail.com',
          phone: '+237 699 88 77 66',
          quarter: 'Bonanjo (Face Port Autonome)',
          bloodGroup: 'O+',
          allergies: 'Aucune allergie médicamenteuse connue',
          emergencyContact: 'Cécile Moukoko (+237 699 88 77 67)',
          createdAt: '2026-08-15T10:00:00Z',
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
          createdAt: '2026-09-01T14:20:00Z',
        },
      ];
      const found = demoPatients.find(
        (p) =>
          p.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          p.phone.replace(/\s+/g, '') === emailOrPhone.replace(/\s+/g, '')
      );
      if (found) {
        const session: PatientAuthSession = {
          token: 'ds_pat_mock_' + found.id,
          patient: found,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        };
        this.setPatientSession(session);
        return { success: true, session };
      }
      return { success: false, error: 'Identifiants patient introuvables (mode hors-ligne)' };
    }
  }

  public logoutPatient(): void {
    this.setPatientSession(null);
  }

  // ==========================================
  // DOCTOR METHODS
  // ==========================================

  public getDoctorSession(): DoctorAuthSession | null {
    try {
      const raw = localStorage.getItem(DOCTOR_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public getActiveDoctor(): DoctorAccount | null {
    return this.getDoctorSession()?.doctor || null;
  }

  public setDoctorSession(session: DoctorAuthSession | null): void {
    if (session) {
      localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(DOCTOR_SESSION_KEY);
    }
    this.notify();
  }

  public async registerDoctor(data: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    onmcNumber: string;
    clinicName: string;
    quarter: string;
    password: string;
    consultationFee?: number;
  }): Promise<{ success: boolean; session?: DoctorAuthSession; error?: string }> {
    try {
      const res = await fetch('/api/auth/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Erreur lors de l’inscription du médecin' };
      }
      const session: DoctorAuthSession = {
        token: json.token,
        doctor: json.doctor,
        expiresAt: json.expiresAt,
      };
      this.setDoctorSession(session);
      return { success: true, session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur réseau' };
    }
  }

  public async loginDoctor(
    emailOrPhone: string,
    password: string
  ): Promise<{ success: boolean; session?: DoctorAuthSession; error?: string }> {
    try {
      const res = await fetch('/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Identifiants médecin invalides' };
      }
      const session: DoctorAuthSession = {
        token: json.token,
        doctor: json.doctor,
        expiresAt: json.expiresAt,
      };
      this.setDoctorSession(session);
      return { success: true, session };
    } catch {
      // Local fallback for default pre-configured doctors
      const docs = db.getPractitioners();
      const doc = docs[0];
      if (doc) {
        const doctorAccount: DoctorAccount = {
          id: doc.id,
          name: doc.name,
          email: doc.email || 'jp.kamdem@cardio-douala.cm',
          phone: doc.phone,
          specialty: doc.specialty,
          onmcNumber: 'ONMC-DLA-4821',
          clinicName: doc.clinicName,
          quarter: doc.quarter,
          consultationFee: doc.consultationFee,
          depositFee: doc.depositFee,
          workingHours: doc.workingHours,
          slotDurationMinutes: doc.slotDurationMinutes,
          availableDays: doc.availableDays,
          facilitySchedules: doc.facilitySchedules || [],
          bio: doc.bio,
          rating: doc.rating,
          patientsCount: doc.patientsCount,
          createdAt: '2026-01-01T00:00:00Z',
          status: 'active',
        };
        const session: DoctorAuthSession = {
          token: 'ds_doc_offline_' + doc.id,
          doctor: doctorAccount,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        };
        this.setDoctorSession(session);
        return { success: true, session };
      }
      return { success: false, error: 'Identifiants médecin incorrects (hors-ligne)' };
    }
  }

  public logoutDoctor(): void {
    this.setDoctorSession(null);
  }

  // ==========================================
  // SLOT RESERVATION ENGINE
  // ==========================================

  public async bookSlot(req: SlotReservationRequest): Promise<{
    success: boolean;
    appointment?: Appointment;
    invoice?: SyscohadaInvoice;
    queueItem?: QueueItem;
    error?: string;
  }> {
    try {
      const patientSession = this.getPatientSession();
      const res = await fetch('/api/patient/book-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(patientSession ? { Authorization: `Bearer ${patientSession.token}` } : {}),
        },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erreur lors de la réservation' };
      }

      // Sync into client local db as well for offline-first resilience
      if (data.appointment) db.saveAppointment(data.appointment);
      if (data.invoice) db.saveInvoice(data.invoice);
      if (data.queueItem) {
        const q = db.getQueue();
        q.unshift(data.queueItem);
        db.saveQueue(q);
      }

      // Schedule instant WhatsApp push simulation
      syncEngine.queueAsyncWhatsAppNotification({
        recipientPhone: req.patientPhone,
        recipientName: req.patientName,
        type: 'booking_confirmation',
        language: 'fr',
        scheduledTime: new Date().toISOString(),
        messageContent: `✅ Confirmation RDV DoualaSanté : Votre créneau avec ${req.practitionerName} est validé pour le ${req.date} à ${req.timeSlot} à ${req.facilityName}. Acompte de 2 000 FCFA reçu via ${req.paymentMethod.toUpperCase()}. Billet QR: ${data.appointment?.qrTicketCode}`,
      });

      return {
        success: true,
        appointment: data.appointment,
        invoice: data.invoice,
        queueItem: data.queueItem,
      };
    } catch {
      // Offline fallback: save locally in browser indexed db
      const apptId = `rdv-dla-off-${Date.now().toString().slice(-4)}`;
      const qrTicketCode = `TKT-DLA-OFF-${apptId.toUpperCase()}`;

      const appointment: Appointment = {
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
        paymentReference: `OFFLINE-PAY-${Date.now().toString().slice(-6)}`,
        bookingChannel: 'pwa',
        qrTicketCode,
        symptoms: req.symptoms,
        triageUrgency: req.triageUrgency || 'yellow',
        consultationType: req.consultationType || 'in_person',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      };

      db.saveAppointment(appointment);

      const invoice: SyscohadaInvoice = {
        id: `FACT-DLA-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
        appointmentId: apptId,
        patientName: req.patientName,
        date: req.date,
        consultationFee: 20000,
        additionalActsFee: 0,
        totalTTC: 20000,
        amountPaid: req.amountPaid || 2000,
        balanceDue: 18000,
        paymentMethod: req.paymentMethod,
        accountCredit: '7061',
        accountDebit: '5211',
        status: 'partial',
      };
      db.saveInvoice(invoice);

      return {
        success: true,
        appointment,
        invoice,
      };
    }
  }

  public async getDemoAccounts() {
    try {
      const res = await fetch('/api/public/accounts-demo');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      patients: [
        {
          id: 'pat_001',
          name: 'Samuel Moukoko',
          email: 'samuel.moukoko@gmail.com',
          phone: '+237 699 88 77 66',
          quarter: 'Bonanjo (Face Port Autonome)',
          bloodGroup: 'O+',
          allergies: 'Aucune allergie médicamenteuse',
          demoPassword: 'Patient@2026',
        },
        {
          id: 'pat_002',
          name: 'Mireille Essomba',
          email: 'mireille.essomba@gmail.com',
          phone: '+237 677 12 34 56',
          quarter: 'Akwa (Boulevard de la Liberté)',
          bloodGroup: 'A+',
          allergies: 'Sulfamides',
          demoPassword: 'Patient@2026',
        },
      ],
      doctors: [
        {
          id: 'dr_kamdem',
          name: 'Dr. Jean-Paul Kamdem',
          email: 'jp.kamdem@cardio-douala.cm',
          phone: '+237 699 88 77 66',
          specialty: 'Cardiologie & Hypertension',
          onmcNumber: 'ONMC-DLA-4821',
          clinicName: 'Clinique du Littoral - Bonanjo',
          quarter: 'Bonanjo',
          consultationFee: 20000,
          demoPassword: 'Doctor@2026',
        },
        {
          id: 'dr_eboa',
          name: 'Dr. Samuel Eboa',
          email: 's.eboa@pediatrie-douala.cm',
          phone: '+237 675 22 11 00',
          specialty: 'Pédiatrie & Urgences Néonatales',
          onmcNumber: 'ONMC-DLA-5190',
          clinicName: 'Polyclinique Sainte-Anne - Akwa',
          quarter: 'Akwa',
          consultationFee: 15000,
          demoPassword: 'Doctor@2026',
        },
      ],
    };
  }
}

export const accountService = new AccountService();
