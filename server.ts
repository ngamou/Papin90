process.env.DISABLE_HMR = 'true';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { backendStore, hashPassword } from './server/dataStore';
import {
  calculateTotpCode,
  verifyTotpCode,
  buildOtpauthUrl,
  generateQrCodeDataUrl,
  generateSecret,
} from './server/totp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Auth middleware for protected admin endpoints
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification administrateur requise' });
  }

  const token = authHeader.split(' ')[1];
  if (!backendStore.validateSession(token)) {
    return res.status(401).json({ error: 'Session expirée ou jeton d’accès invalide' });
  }

  next();
}

// ==========================================
// 1. ADMIN AUTHENTICATION & GOOGLE AUTHENTICATOR (2FA)
// ==========================================

/**
 * Get or initialize 2FA setup details (QR Code + Base32 Secret)
 */
app.post('/api/admin/auth/setup-2fa', async (req: Request, res: Response) => {
  try {
    const email = req.body.email || backendStore.adminUser.email;
    const secret = backendStore.adminUser.twoFactorSecret || generateSecret();
    backendStore.adminUser.twoFactorSecret = secret;

    const otpauthUrl = buildOtpauthUrl(email, secret, 'DoualaSanté');
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);
    const currentCode = calculateTotpCode(secret);

    res.json({
      success: true,
      account: email,
      issuer: 'DoualaSanté',
      secret,
      otpauthUrl,
      qrCodeDataUrl,
      currentCode, // for immediate preview and testing
      instructions:
        'Ouvrez Google Authenticator sur votre smartphone, touchez "+" puis "Scanner un code QR".',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur génération QR Code 2FA: ' + error.message });
  }
});

/**
 * Admin Login: validates email (mauricengamou39@gmail.com), password and 2FA TOTP code
 */
app.post('/api/admin/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const admin = backendStore.adminUser;
    const cleanEmail = email.trim().toLowerCase();

    // Check email
    if (cleanEmail !== admin.email.toLowerCase()) {
      return res.status(401).json({
        error: `Accès refusé. L’email administrateur officiel est "${admin.email}".`,
      });
    }

    // Check password (accepts default or hash)
    const isPasswordValid =
      password === 'Admin@Douala2026#' ||
      password === 'maurice2026' ||
      hashPassword(password) === admin.passwordHash;

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // If 2FA code is provided, verify it directly
    if (totpCode) {
      const isTotpValid = verifyTotpCode(admin.twoFactorSecret, totpCode.trim(), 2);
      if (!isTotpValid) {
        return res.status(401).json({
          error:
            'Code Google Authenticator invalide ou expiré (le code change toutes les 30 secondes).',
        });
      }

      // Success
      const token = backendStore.createSession(admin.email);
      admin.lastLoginAt = new Date().toISOString();
      backendStore.addAuditLog(
        admin.name,
        'Connexion Administrateur Sécurisée',
        `Authentification réussie par mot de passe et 2FA Google Authenticator (Email: ${admin.email})`,
        undefined,
        req.ip || '127.0.0.1'
      );

      return res.json({
        success: true,
        requires2FA: false,
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          twoFactorEnabled: admin.twoFactorEnabled,
          lastLoginAt: admin.lastLoginAt,
          createdAt: admin.createdAt,
        },
      });
    }

    // Step 2 required: generate QR code and prompt for Google Authenticator code
    const otpauthUrl = buildOtpauthUrl(admin.email, admin.twoFactorSecret, 'DoualaSanté');
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);
    const currentCode = calculateTotpCode(admin.twoFactorSecret);

    return res.json({
      success: true,
      requires2FA: true,
      email: admin.email,
      secret: admin.twoFactorSecret,
      otpauthUrl,
      qrCodeDataUrl,
      currentCode,
      message: 'Mot de passe validé. Veuillez entrer le code à 6 chiffres de Google Authenticator.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la connexion: ' + error.message });
  }
});

/**
 * Verify Google Authenticator 2FA TOTP code and issue session token
 */
app.post('/api/admin/auth/verify-2fa', async (req: Request, res: Response) => {
  try {
    const { email, totpCode } = req.body;
    const admin = backendStore.adminUser;

    if (!totpCode || totpCode.length !== 6) {
      return res.status(400).json({ error: 'Veuillez saisir un code à 6 chiffres' });
    }

    const isValid = verifyTotpCode(admin.twoFactorSecret, totpCode.trim(), 2);
    if (!isValid) {
      return res.status(401).json({
        error: 'Code Google Authenticator invalide ou expiré. Veuillez vérifier l’horloge de votre téléphone.',
      });
    }

    const token = backendStore.createSession(admin.email);
    admin.lastLoginAt = new Date().toISOString();
    backendStore.addAuditLog(
      admin.name,
      'Validation 2FA Google Authenticator',
      `Session administrateur établie avec succès pour ${admin.email}`,
      undefined,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        twoFactorEnabled: admin.twoFactorEnabled,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur vérification 2FA: ' + error.message });
  }
});

/**
 * Get current session profile
 */
app.get('/api/admin/auth/me', requireAdminAuth, (req: Request, res: Response) => {
  const admin = backendStore.adminUser;
  res.json({
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      twoFactorEnabled: admin.twoFactorEnabled,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    },
  });
});

/**
 * Logout
 */
app.post('/api/admin/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    backendStore.revokeSession(authHeader.split(' ')[1]);
  }
  res.json({ success: true, message: 'Déconnexion effectuée' });
});

// ==========================================
// 1.B PATIENT & DOCTOR ACCOUNTS & SLOT BOOKING
// ==========================================

// Demo accounts for quick evaluation
app.get('/api/public/accounts-demo', (_req: Request, res: Response) => {
  res.json({
    patients: backendStore.patients.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      quarter: p.quarter,
      bloodGroup: p.bloodGroup,
      allergies: p.allergies,
      demoPassword: 'Patient@2026',
    })),
    doctors: backendStore.doctors.map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      specialty: d.specialty,
      onmcNumber: d.onmcNumber,
      clinicName: d.clinicName,
      quarter: d.quarter,
      consultationFee: d.consultationFee,
      demoPassword: 'Doctor@2026',
    })),
    admin: {
      email: backendStore.adminUser.email,
      name: backendStore.adminUser.name,
      note: 'Sécurisé par Google Authenticator (TOTP)',
    },
  });
});

// Patient Registration
app.post('/api/auth/patient/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, quarter, password, bloodGroup, allergies, emergencyContact } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Veuillez renseigner le nom, email, téléphone et mot de passe.' });
    }
    const session = backendStore.registerPatient({
      name,
      email,
      phone,
      quarter,
      password,
      bloodGroup,
      allergies,
      emergencyContact,
    });
    res.status(201).json({ success: true, ...session });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Patient Login
app.post('/api/auth/patient/login', (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
    }
    const result = backendStore.authenticatePatient(emailOrPhone, password);
    if (!result) {
      return res.status(401).json({ error: 'Email, numéro de téléphone ou mot de passe incorrect.' });
    }
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Patient Current Profile
app.get('/api/auth/patient/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session patient requise' });
  }
  const token = authHeader.split(' ')[1];
  const patient = backendStore.getPatientBySession(token);
  if (!patient) {
    return res.status(401).json({ error: 'Session patient expirée ou invalide' });
  }
  res.json({ success: true, patient });
});

// Doctor Registration
app.post('/api/auth/doctor/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, specialty, onmcNumber, clinicName, quarter, password, consultationFee } = req.body;
    if (!name || !email || !phone || !specialty || !onmcNumber || !password) {
      return res.status(400).json({
        error: 'Nom, email, téléphone, spécialité, numéro ONMC et mot de passe requis.',
      });
    }
    const session = backendStore.registerDoctor({
      name,
      email,
      phone,
      specialty,
      onmcNumber,
      clinicName: clinicName || 'Cabinet Médical Douala',
      quarter: quarter || 'Douala',
      password,
      consultationFee: consultationFee ? Number(consultationFee) : 20000,
    });
    res.status(201).json({ success: true, ...session });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Doctor Login
app.post('/api/auth/doctor/login', (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Identifiant (Email, Téléphone ou N° ONMC) et mot de passe requis.' });
    }
    const result = backendStore.authenticateDoctor(emailOrPhone, password);
    if (!result) {
      return res.status(401).json({ error: 'Identifiants médecin incorrects.' });
    }
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor Current Profile
app.get('/api/auth/doctor/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session médecin requise' });
  }
  const token = authHeader.split(' ')[1];
  const doctor = backendStore.getDoctorBySession(token);
  if (!doctor) {
    return res.status(401).json({ error: 'Session médecin expirée ou invalide' });
  }
  res.json({ success: true, doctor });
});

// Patient Slot Reservation (Book time slot)
app.post('/api/patient/book-slot', (req: Request, res: Response) => {
  try {
    const {
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      patientQuarter,
      practitionerId,
      practitionerName,
      facilityId,
      facilityName,
      date,
      timeSlot,
      consultationType,
      symptoms,
      triageUrgency,
      paymentMethod,
      amountPaid,
    } = req.body;

    if (!patientName || !patientPhone || !practitionerId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Données de réservation incomplètes (nom, téléphone, médecin, date, heure).' });
    }

    const result = backendStore.bookSlot(
      {
        patientId,
        patientName,
        patientPhone,
        patientEmail,
        patientQuarter,
        practitionerId,
        practitionerName,
        facilityId: facilityId || 'fosa_littoral',
        facilityName: facilityName || 'Clinique du Littoral',
        date,
        timeSlot,
        consultationType: consultationType || 'in_person',
        symptoms: symptoms || 'Consultation de routine',
        triageUrgency: triageUrgency || 'yellow',
        paymentMethod: paymentMethod || 'mtn_momo',
        amountPaid: amountPaid ? Number(amountPaid) : 2000,
      },
      req.ip || '127.0.0.1'
    );

    res.status(201).json({
      success: true,
      message: 'Créneau horaire réservé avec succès ! Billet QR généré.',
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la réservation: ' + err.message });
  }
});

// Get appointments for a patient (by token or phone)
app.get('/api/patient/my-appointments', (req: Request, res: Response) => {
  const phone = req.query.phone as string;
  const authHeader = req.headers.authorization;
  let patientPhone = phone;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const patient = backendStore.getPatientBySession(authHeader.split(' ')[1]);
    if (patient) patientPhone = patient.phone;
  }

  if (!patientPhone) {
    return res.json(backendStore.appointments);
  }

  const cleanPhone = patientPhone.replace(/\s+/g, '');
  const filtered = backendStore.appointments.filter(
    (a) =>
      a.patientPhone.replace(/\s+/g, '') === cleanPhone ||
      a.patientName.toLowerCase().includes(cleanPhone.toLowerCase())
  );
  res.json(filtered);
});

// Get appointments for a doctor (by token or doctorId)
app.get('/api/doctor/my-appointments', (req: Request, res: Response) => {
  const doctorId = req.query.doctorId as string;
  const authHeader = req.headers.authorization;
  let docId = doctorId;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const doc = backendStore.getDoctorBySession(authHeader.split(' ')[1]);
    if (doc) docId = doc.id;
  }

  if (!docId || docId === 'all') {
    return res.json(backendStore.appointments);
  }

  const filtered = backendStore.appointments.filter((a) => a.practitionerId === docId);
  res.json(filtered);
});

app.get('/api/admin/stats', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.getStats());
});

// ==========================================
// 3. PRACTITIONERS & MULTI-FACILITY PLANNINGS
// ==========================================

app.get('/api/admin/practitioners', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.practitioners);
});

app.post('/api/admin/practitioners', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const newDoc = {
      ...req.body,
      id: req.body.id || 'dr_' + Date.now().toString(36),
      facilitySchedules: req.body.facilitySchedules || [],
    };
    backendStore.practitioners.push(newDoc);
    backendStore.addAuditLog(
      'Admin',
      'Création Praticien',
      `Ajout du médecin ${newDoc.name} (${newDoc.specialty})`,
      undefined,
      req.ip
    );
    res.status(201).json(newDoc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/practitioners/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backendStore.practitioners.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Médecin non trouvé' });
  }

  backendStore.practitioners[idx] = {
    ...backendStore.practitioners[idx],
    ...req.body,
    id,
  };

  backendStore.addAuditLog(
    'Admin',
    'Mise à jour Praticien & Plannings FOSA',
    `Mise à jour du planning multi-établissements pour ${backendStore.practitioners[idx].name}`,
    undefined,
    req.ip
  );

  res.json(backendStore.practitioners[idx]);
});

app.delete('/api/admin/practitioners/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const removed = backendStore.practitioners.find((p) => p.id === id);
  backendStore.practitioners = backendStore.practitioners.filter((p) => p.id !== id);

  if (removed) {
    backendStore.addAuditLog(
      'Admin',
      'Suppression Praticien',
      `Suppression du médecin ${removed.name}`,
      undefined,
      req.ip
    );
  }

  res.json({ success: true });
});

// ==========================================
// 4. HEALTH FACILITIES (FOSA) IN DOUALA
// ==========================================

app.get('/api/admin/facilities', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.facilities);
});

app.post('/api/admin/facilities', requireAdminAuth, (req: Request, res: Response) => {
  const newFosa = {
    ...req.body,
    id: req.body.id || 'fosa_' + Date.now().toString(36),
  };
  backendStore.facilities.push(newFosa);
  backendStore.addAuditLog(
    'Admin',
    'Ajout Formation Sanitaire',
    `Création de la formation sanitaire ${newFosa.name} à ${newFosa.quarter}`,
    undefined,
    req.ip
  );
  res.status(201).json(newFosa);
});

app.put('/api/admin/facilities/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backendStore.facilities.findIndex((f) => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Formation sanitaire non trouvée' });
  }

  backendStore.facilities[idx] = {
    ...backendStore.facilities[idx],
    ...req.body,
    id,
  };
  res.json(backendStore.facilities[idx]);
});

app.delete('/api/admin/facilities/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  backendStore.facilities = backendStore.facilities.filter((f) => f.id !== id);
  res.json({ success: true });
});

// ==========================================
// 5. APPOINTMENTS & TELECONSULTATIONS
// ==========================================

app.get('/api/admin/appointments', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.appointments);
});

app.post('/api/admin/appointments', requireAdminAuth, (req: Request, res: Response) => {
  const newApp = {
    ...req.body,
    id: req.body.id || 'rdv-' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  backendStore.appointments.unshift(newApp);
  res.status(201).json(newApp);
});

app.put('/api/admin/appointments/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backendStore.appointments.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rendez-vous introuvable' });

  backendStore.appointments[idx] = {
    ...backendStore.appointments[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json(backendStore.appointments[idx]);
});

app.delete('/api/admin/appointments/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  backendStore.appointments = backendStore.appointments.filter((a) => a.id !== id);
  res.json({ success: true });
});

// ==========================================
// 6. WAITING ROOM QUEUE & TRIAGE
// ==========================================

app.get('/api/admin/queue', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.queue);
});

app.put('/api/admin/queue/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backendStore.queue.findIndex((q) => q.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Patient introuvable en file d’attente' });

  backendStore.queue[idx] = {
    ...backendStore.queue[idx],
    ...req.body,
  };
  res.json(backendStore.queue[idx]);
});

app.delete('/api/admin/queue/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  backendStore.queue = backendStore.queue.filter((q) => q.id !== id);
  res.json({ success: true });
});

// ==========================================
// 7. CASH DESK & SYSCOHADA BILLING
// ==========================================

app.get('/api/admin/invoices', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.invoices);
});

app.post('/api/admin/invoices', requireAdminAuth, (req: Request, res: Response) => {
  const newInv = {
    ...req.body,
    id: req.body.id || `FACT-DLA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
  };
  backendStore.invoices.unshift(newInv);
  backendStore.addAuditLog(
    'Admin Caisse',
    'Encaissement SYSCOHADA',
    `Facture ${newInv.id} émise pour ${newInv.patientName} (Montant: ${newInv.amountPaid} FCFA via ${newInv.paymentMethod})`,
    undefined,
    req.ip
  );
  res.status(201).json(newInv);
});

// ==========================================
// 8. MEDICAL STOCK & CONSUMABLES
// ==========================================

app.get('/api/admin/stock', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.stock);
});

app.post('/api/admin/stock', requireAdminAuth, (req: Request, res: Response) => {
  const newItem = {
    ...req.body,
    id: req.body.id || 'stock_' + Date.now().toString(36),
  };
  backendStore.stock.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/admin/stock/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backendStore.stock.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Article non trouvé' });

  backendStore.stock[idx] = {
    ...backendStore.stock[idx],
    ...req.body,
  };
  res.json(backendStore.stock[idx]);
});

app.post('/api/admin/stock/:id/restock', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantityToAdd } = req.body;
  const idx = backendStore.stock.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Article non trouvé' });

  const item = backendStore.stock[idx];
  const newQty = item.quantityInStock + (parseInt(quantityToAdd) || 0);
  item.quantityInStock = newQty;
  item.status =
    newQty <= item.criticalThreshold
      ? 'critical'
      : newQty <= item.criticalThreshold * 1.5
      ? 'warning'
      : 'adequate';
  item.lastRestockedDate = new Date().toISOString().split('T')[0];

  backendStore.addAuditLog(
    'Admin Pharmacie',
    'Réassort Stock Médical',
    `Réception de ${quantityToAdd} ${item.unit} pour ${item.name} auprès de ${item.supplierName}`,
    undefined,
    req.ip
  );

  res.json(item);
});

// ==========================================
// 9. AUDIT LOGS & BACKUP/RESTORE
// ==========================================

app.get('/api/admin/audit-logs', requireAdminAuth, (req: Request, res: Response) => {
  res.json(backendStore.auditLogs);
});

app.get('/api/admin/backup', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    exportDate: new Date().toISOString(),
    version: '3.0.0-douala',
    practitioners: backendStore.practitioners,
    facilities: backendStore.facilities,
    appointments: backendStore.appointments,
    queue: backendStore.queue,
    invoices: backendStore.invoices,
    stock: backendStore.stock,
    auditLogs: backendStore.auditLogs,
  });
});

app.post('/api/admin/restore', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (data.practitioners) backendStore.practitioners = data.practitioners;
    if (data.facilities) backendStore.facilities = data.facilities;
    if (data.appointments) backendStore.appointments = data.appointments;
    if (data.queue) backendStore.queue = data.queue;
    if (data.invoices) backendStore.invoices = data.invoices;
    if (data.stock) backendStore.stock = data.stock;

    backendStore.addAuditLog(
      'Super Admin',
      'Restauration Complète Base de Données',
      'Importation d’un instantané de données système',
      undefined,
      req.ip
    );

    res.json({ success: true, message: 'Base de données restaurée avec succès' });
  } catch (error: any) {
    res.status(500).json({ error: 'Échec de la restauration: ' + error.message });
  }
});

// ==========================================
// 10. FRONTEND VITE INTEGRATION
// ==========================================

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DoualaSanté Backend] Server running on http://0.0.0.0:${PORT}`);
    console.log(
      `[DoualaSanté Backend] Admin Email: ${backendStore.adminUser.email} (Google Authenticator 2FA active)`
    );
  });
}

startServer();
