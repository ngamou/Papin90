import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  Calendar,
  Layers,
  CreditCard,
  Package,
  FileCheck,
  Plus,
  Trash2,
  Edit2,
  Search,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  QrCode,
  Download,
  Upload,
  Lock,
  Smartphone,
  BarChart3,
  Check,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import {
  AdminUser,
  Practitioner,
  HealthFacility,
  Appointment,
  QueueItem,
  SyscohadaInvoice,
  StockItem,
  AuditLog,
  TriageUrgency,
} from '../../types';

interface AdminPortalViewProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onOpen2FASettings: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  adminUser,
  onLogout,
  onOpen2FASettings,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'practitioners' | 'facilities' | 'appointments' | 'queue' | 'caisse' | 'stock' | 'audit'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [invoices, setInvoices] = useState<SyscohadaInvoice[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals inside Admin Console
  const [editingPractitioner, setEditingPractitioner] = useState<Practitioner | null>(null);
  const [editingFacility, setEditingFacility] = useState<HealthFacility | null>(null);
  const [restockingItem, setRestockingItem] = useState<StockItem | null>(null);
  const [restockQty, setRestockQty] = useState(25);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    const [st, pr, fa, ap, qu, inv, sk, logs] = await Promise.all([
      adminApi.getStats(),
      adminApi.getPractitioners(),
      adminApi.getFacilities(),
      adminApi.getAppointments(),
      adminApi.getQueue(),
      adminApi.getInvoices(),
      adminApi.getStock(),
      adminApi.getAuditLogs(),
    ]);

    setStats(st);
    setPractitioners(pr);
    setFacilities(fa);
    setAppointments(ap);
    setQueue(qu);
    setInvoices(inv);
    setStock(sk);
    setAuditLogs(logs);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // CRUD Handlers
  const handleDeletePractitioner = async (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression du Dr. ${name} ?`)) {
      await adminApi.deletePractitioner(id);
      setPractitioners((prev) => prev.filter((p) => p.id !== id));
      showToast(`Praticien ${name} supprimé avec succès`);
    }
  };

  const handleSavePractitioner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPractitioner) return;
    const saved = await adminApi.savePractitioner(editingPractitioner);
    setPractitioners((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setEditingPractitioner(null);
    showToast('Fiche praticien et plannings multi-établissements mis à jour');
  };

  const handleDeleteFacility = async (id: string, name: string) => {
    if (confirm(`Supprimer la formation sanitaire "${name}" ?`)) {
      await adminApi.deleteFacility(id);
      setFacilities((prev) => prev.filter((f) => f.id !== id));
      showToast(`Formation sanitaire ${name} supprimée`);
    }
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    const saved = await adminApi.saveFacility(editingFacility);
    setFacilities((prev) => {
      const idx = prev.findIndex((f) => f.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setEditingFacility(null);
    showToast('Formation sanitaire enregistrée');
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingItem) return;
    const updated = await adminApi.restockItem(restockingItem.id, restockQty);
    if (updated) {
      setStock((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast(`Réassort de ${restockQty} ${updated.unit} enregistré pour ${updated.name}`);
    }
    setRestockingItem(null);
  };

  const handleBackupExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      admin: adminUser.email,
      practitioners,
      facilities,
      appointments,
      queue,
      invoices,
      stock,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doualasante_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Sauvegarde globale téléchargée avec succès (JSON)');
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-teal-500/50 flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Admin Profile & 2FA Badge */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            DS
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                Console d’Administration Centrale
              </h1>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-md font-semibold">
                Super Admin
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Google Authenticator 2FA Actif</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connecté en tant que <strong className="text-slate-200">{adminUser.email}</strong> · Session sécurisée (Loi 2024/017 Cameroun)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={onOpen2FASettings}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            title="Afficher le QR Code Google Authenticator"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-400" />
            <span>QR Code 2FA</span>
          </button>

          <button
            onClick={loadAllData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Rafraîchir les données backend"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 border-b border-slate-200 whitespace-nowrap text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Vue 360° Plateforme</span>
        </button>

        <button
          onClick={() => setActiveTab('practitioners')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'practitioners'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Médecins & Plannings FOSA ({practitioners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'facilities'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Formations Sanitaires ({facilities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Rendez-vous ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Salle d'Attente & Tri ({queue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('caisse')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'caisse'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Caisse SYSCOHADA ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Stocks & Réassort ({stock.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-teal-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Audit & Sauvegardes</span>
        </button>
      </div>

      {/* ==========================================
          TAB 1: VUE 360° PLATEFORME
          ========================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Praticiens Enregistrés</span>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {practitioners.length}
              </div>
              <span className="text-[11px] text-teal-600 mt-1 block">
                {practitioners.reduce((acc, p) => acc + (p.facilitySchedules?.length || 1), 0)} plannings FOSA actifs
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Recettes Encaissées</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                {(stats?.totalRevenueFCFA || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">FCFA</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                OHADA Comptes 521 (MoMo/OM) & 571 (Caisse)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Patients en File d'Attente</span>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {queue.filter((q) => q.column !== 'post_consultation').length}
              </div>
              <span className="text-[11px] text-teal-600 mt-1 block">
                Tri intelligent actif (Rouge/Orange/Jaune/Vert)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Alertes Rupture Stock</span>
              <div className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
                {stock.filter((s) => s.status === 'critical').length}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Réapprovisionnement suggéré Akwa / Bonanjo
              </span>
            </div>
          </div>

          {/* Quick Actions & Security Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Sécurité & Gouvernance Administrative</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Administrateur Titulaire :</span>
                  <span className="font-mono font-bold text-slate-900">{adminUser.email}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Double Authentification (2FA) :</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Google Authenticator (RFC 6238)</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Conformité Réglementaire :</span>
                  <span className="text-teal-700 font-semibold">Loi n° 2024/017 du Cameroun</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Formations Sanitaires Agréées à Douala</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                {facilities.map((f) => (
                  <div
                    key={f.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900">{f.name}</strong>
                      <span className="text-slate-500 text-[11px] block">{f.quarter} · {f.phone}</span>
                    </div>
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium border border-teal-200">
                      {f.rooms.length} salles
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: GESTION DES PRATICIENS & PLANNINGS FOSA
          ========================================== */}
      {activeTab === 'practitioners' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Praticiens & Plannings par Formation Sanitaire
              </h2>
              <p className="text-xs text-slate-500">
                Attribuez à chaque médecin des créneaux, horaires, honoraires et salles distincts selon la clinique
              </p>
            </div>
            <button
              onClick={() =>
                setEditingPractitioner({
                  id: 'dr_' + Date.now().toString(36),
                  name: 'Dr. Nouveau Médecin',
                  specialty: 'Médecine Spécialisée',
                  avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
                  phone: '+237 6',
                  email: 'medecin@doualasante.cm',
                  quarter: 'Bonanjo',
                  clinicName: 'Clinique du Littoral',
                  consultationFee: 20000,
                  depositFee: 2000,
                  availableDays: ['Lundi', 'Mercredi'],
                  workingHours: { start: '08:00', end: '15:00' },
                  slotDurationMinutes: 30,
                  rooms: ['Cabinet 1'],
                  rating: 5.0,
                  patientsCount: 0,
                  bio: '',
                  facilitySchedules: [
                    {
                      id: 'sched_' + Date.now(),
                      facilityId: facilities[0]?.id || 'fosa_littoral',
                      facilityName: facilities[0]?.name || 'Clinique du Littoral',
                      facilityQuarter: facilities[0]?.quarter || 'Bonanjo',
                      days: ['Lundi', 'Mercredi'],
                      timeSlots: { start: '08:30', end: '13:00' },
                      slotDurationMinutes: 30,
                      rooms: ['Cabinet 1'],
                      consultationFee: 20000,
                      depositFee: 2000,
                    },
                  ],
                })
              }
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Praticien</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practitioners.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                      <p className="text-xs text-teal-600 font-medium">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{doc.phone} · {doc.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingPractitioner(doc)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                      title="Modifier praticien et plannings"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePractitioner(doc.id, doc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Supprimer praticien"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Multi-Facility Planning Schedules Section */}
                <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Formations Sanitaires & Horaires ({doc.facilitySchedules?.length || 0}) :
                  </span>
                  <div className="space-y-1.5">
                    {doc.facilitySchedules?.map((sched) => (
                      <div
                        key={sched.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{sched.facilityName}</span>
                            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 rounded">
                              {sched.facilityQuarter}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {sched.days.join(', ')} · {sched.timeSlots.start} - {sched.timeSlots.end} (Salle: {sched.rooms.join(', ')})
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {sched.consultationFee.toLocaleString()} F
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: FORMATIONS SANITAIRES (FOSA)
          ========================================== */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Formations Sanitaires Référencées à Douala
              </h2>
              <p className="text-xs text-slate-500">
                Cliniques, polycliniques, hôpitaux et cabinets médicaux conventionnés
              </p>
            </div>
            <button
              onClick={() =>
                setEditingFacility({
                  id: 'fosa_' + Date.now().toString(36),
                  name: 'Nouvelle Formation Sanitaire',
                  type: 'clinique_privee',
                  quarter: 'Akwa',
                  address: 'Douala',
                  phone: '+237 233 ',
                  rooms: ['Cabinet 1', 'Cabinet 2'],
                })
              }
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une Formation Sanitaire</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((fosa) => (
              <div
                key={fosa.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{fosa.name}</h3>
                      <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-sm font-semibold">
                        {fosa.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingFacility(fosa)}
                        className="p-1 text-slate-500 hover:text-teal-700"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFacility(fosa.id, fosa.name)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{fosa.address} ({fosa.quarter})</span>
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-1">Tél : {fosa.phone}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 block mb-1">Salles répertoriées :</span>
                    <div className="flex flex-wrap gap-1">
                      {fosa.rooms.map((r, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: GESTION DES RENDEZ-VOUS
          ========================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Rendez-vous & Téléconsultations ({appointments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Supervision des créneaux, statuts de paiement et billets QR
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher patient, médecin, billet..."
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Billet QR</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Médecin</th>
                    <th className="py-2.5 px-4">Établissement (FOSA)</th>
                    <th className="py-2.5 px-4">Date & Heure</th>
                    <th className="py-2.5 px-4">Statut</th>
                    <th className="py-2.5 px-4 text-right">Montant</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments
                    .filter(
                      (a) =>
                        a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.practitionerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.qrTicketCode?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-teal-700">
                          {app.qrTicketCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>{app.patientName}</div>
                          <span className="text-[11px] text-slate-500 font-mono">{app.patientPhone}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-800">
                          <div>{app.practitionerName}</div>
                          <span className="text-[10px] text-teal-600">{app.specialty}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {app.facilityName || 'Clinique du Littoral'} ({app.facilityQuarter || 'Bonanjo'})
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {app.date} à {app.timeSlot}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase ${
                              app.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : app.status === 'in_consultation'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : app.status === 'completed'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          {app.amountTotal.toLocaleString()} F
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={async () => {
                              const newStatus = app.status === 'completed' ? 'confirmed' : 'completed';
                              await adminApi.saveAppointment({ ...app, status: newStatus });
                              setAppointments((prev) =>
                                prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
                              );
                              showToast(`Statut du RDV ${app.qrTicketCode} mis à jour`);
                            }}
                            className="text-[11px] text-teal-700 hover:underline font-medium"
                          >
                            Basculer Statut
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: GESTION FILE D'ATTENTE & TRIAGE
          ========================================== */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                File d'Attente & Triage d'Urgence ({queue.length})
              </h2>
              <p className="text-xs text-slate-500">
                Ordre de passage priorisé selon la gravité vitale (Rouge, Orange, Jaune, Vert)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['waiting', 'triage', 'consultation', 'post_consultation'] as const).map(
              (col) => {
                const colItems = queue.filter((q) => q.column === col);
                const colTitles: Record<string, string> = {
                  waiting: '1. En Attente Accueil',
                  triage: '2. Triage & Constantes',
                  consultation: '3. En Consultation',
                  post_consultation: '4. Soins & Sortie',
                  discharged: '5. Sortie / Clôturé',
                };

                return (
                  <div key={col} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-xs text-slate-800">{colTitles[col]}</span>
                      <span className="text-xs bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-mono font-bold">
                        {colItems.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {colItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <strong className="text-xs text-slate-900 block">{item.patientName}</strong>
                              <span className="text-[11px] text-teal-600">{item.practitionerName}</span>
                            </div>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
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

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            {col !== 'post_consultation' ? (
                              <button
                                onClick={async () => {
                                  const nextCol: Record<string, QueueItem['column']> = {
                                    waiting: 'triage',
                                    triage: 'consultation',
                                    consultation: 'post_consultation',
                                  };
                                  const target = nextCol[col];
                                  await adminApi.updateQueueItem(item.id, { column: target });
                                  setQueue((prev) =>
                                    prev.map((q) => (q.id === item.id ? { ...q, column: target } : q))
                                  );
                                  showToast(`Patient ${item.patientName} avancé vers ${target}`);
                                }}
                                className="text-[11px] font-semibold text-teal-700 hover:underline"
                              >
                                Avancer étape →
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await adminApi.deleteQueueItem(item.id);
                                  setQueue((prev) => prev.filter((q) => q.id !== item.id));
                                  showToast(`Dossier clôturé`);
                                }}
                                className="text-[11px] text-slate-500 hover:text-slate-900 font-medium"
                              >
                                Clôturer dossier
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 6: CAISSE SYSCOHADA
          ========================================== */}
      {activeTab === 'caisse' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Caisse Multi-Canaux & Écritures SYSCOHADA ({invoices.length})
              </h2>
              <p className="text-xs text-slate-500">
                Imputations comptables conformes OHADA (Comptes 7061, 521, 571)
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Pièce Comptable</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Imputation Débit / Crédit</th>
                    <th className="py-2.5 px-4">Mode Règlement</th>
                    <th className="py-2.5 px-4 text-right">Total TTC</th>
                    <th className="py-2.5 px-4 text-right">Encaissé</th>
                    <th className="py-2.5 px-4 text-right">Solde Dû</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.id}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{inv.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.patientName}</td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        <div>D: {inv.accountDebit}</div>
                        <div>C: {inv.accountCredit}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{inv.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        {inv.totalTTC.toLocaleString()} F
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                        {inv.amountPaid.toLocaleString()} F
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                        {inv.balanceDue > 0 ? (
                          <span className="text-amber-600">{inv.balanceDue.toLocaleString()} F</span>
                        ) : (
                          <span className="text-slate-400">0 F</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 7: STOCKS MÉDICAUX & RÉASSORT
          ========================================== */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Consommables Médicaux & Réapprovisionnements ({stock.length})
              </h2>
              <p className="text-xs text-slate-500">
                Gestion des réactifs, gants stériles et seringues à Douala
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Désignation</th>
                    <th className="py-2.5 px-4">Catégorie</th>
                    <th className="py-2.5 px-4 text-center">En Stock</th>
                    <th className="py-2.5 px-4 text-center">Seuil Critique</th>
                    <th className="py-2.5 px-4 text-right">Prix Unitaire</th>
                    <th className="py-2.5 px-4">Fournisseur</th>
                    <th className="py-2.5 px-4">Statut</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stock.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{item.category}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {item.quantityInStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {item.criticalThreshold} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        {item.unitPriceFCFA.toLocaleString()} F
                      </td>
                      <td className="py-3 px-4 text-slate-700">{item.supplierName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase ${
                            item.status === 'critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : item.status === 'warning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.status === 'critical'
                            ? 'Rupture !'
                            : item.status === 'warning'
                            ? 'Faible'
                            : 'Adéquat'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setRestockingItem(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 font-semibold text-slate-700 rounded transition"
                        >
                          Réassort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 8: AUDIT TRAIL & SAUVEGARDES
          ========================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Journal d'Audit Trail & Sauvegardes Système
              </h2>
              <p className="text-xs text-slate-500">
                Traçabilité certifiée Loi n° 2024/017 & Sauvegarde globale de la plateforme
              </p>
            </div>
            <button
              onClick={handleBackupExport}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Sauvegarde Complète (JSON)</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Horodatage</th>
                    <th className="py-2.5 px-4">Acteur</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Détails & Chiffrement</th>
                    <th className="py-2.5 px-4">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.actor}</td>
                      <td className="py-3 px-4 font-semibold text-teal-800">{log.action}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{log.details}</div>
                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                          {log.encryptionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT PRACTITIONER & MULTI-FOSA SCHEDULES
          ========================================== */}
      {editingPractitioner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Édition Praticien & Plannings Multi-Établissements
              </h3>
              <button
                onClick={() => setEditingPractitioner(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePractitioner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nom complet :</label>
                  <input
                    type="text"
                    required
                    value={editingPractitioner.name}
                    onChange={(e) =>
                      setEditingPractitioner({ ...editingPractitioner, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Spécialité médicale :</label>
                  <input
                    type="text"
                    required
                    value={editingPractitioner.specialty}
                    onChange={(e) =>
                      setEditingPractitioner({ ...editingPractitioner, specialty: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Téléphone Douala :</label>
                  <input
                    type="text"
                    value={editingPractitioner.phone}
                    onChange={(e) =>
                      setEditingPractitioner({ ...editingPractitioner, phone: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email professionnel :</label>
                  <input
                    type="email"
                    value={editingPractitioner.email}
                    onChange={(e) =>
                      setEditingPractitioner({ ...editingPractitioner, email: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Plannings per Facility */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Plannings dans les formations sanitaires (FOSA) :
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newSched = {
                        id: 'sched_' + Date.now(),
                        facilityId: facilities[0]?.id || 'fosa_littoral',
                        facilityName: facilities[0]?.name || 'Clinique du Littoral',
                        facilityQuarter: facilities[0]?.quarter || 'Bonanjo',
                        days: ['Lundi'],
                        timeSlots: { start: '08:00', end: '13:00' },
                        slotDurationMinutes: 30,
                        rooms: ['Cabinet 1'],
                        consultationFee: editingPractitioner.consultationFee || 20000,
                        depositFee: 2000,
                      };
                      setEditingPractitioner({
                        ...editingPractitioner,
                        facilitySchedules: [...(editingPractitioner.facilitySchedules || []), newSched],
                      });
                    }}
                    className="px-2.5 py-1 bg-teal-50 text-teal-700 font-semibold rounded border border-teal-200 text-[11px]"
                  >
                    + Ajouter une Clinique
                  </button>
                </div>

                <div className="space-y-2">
                  {editingPractitioner.facilitySchedules?.map((sched, idx) => (
                    <div
                      key={sched.id || idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <select
                          value={sched.facilityId}
                          onChange={(e) => {
                            const f = facilities.find((item) => item.id === e.target.value);
                            const updatedSchedules = [...editingPractitioner.facilitySchedules];
                            updatedSchedules[idx] = {
                              ...sched,
                              facilityId: e.target.value,
                              facilityName: f?.name || sched.facilityName,
                              facilityQuarter: f?.quarter || sched.facilityQuarter,
                            };
                            setEditingPractitioner({
                              ...editingPractitioner,
                              facilitySchedules: updatedSchedules,
                            });
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-900"
                        >
                          {facilities.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.quarter})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const updatedSchedules = editingPractitioner.facilitySchedules.filter(
                              (_, i) => i !== idx
                            );
                            setEditingPractitioner({
                              ...editingPractitioner,
                              facilitySchedules: updatedSchedules,
                            });
                          }}
                          className="text-rose-600 hover:text-rose-800 text-xs"
                        >
                          Supprimer
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Jours :</label>
                          <input
                            type="text"
                            value={sched.days.join(', ')}
                            onChange={(e) => {
                              const updatedSchedules = [...editingPractitioner.facilitySchedules];
                              updatedSchedules[idx] = {
                                ...sched,
                                days: e.target.value.split(',').map((d) => d.trim()),
                              };
                              setEditingPractitioner({
                                ...editingPractitioner,
                                facilitySchedules: updatedSchedules,
                              });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Horaires :</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={sched.timeSlots.start}
                              onChange={(e) => {
                                const updatedSchedules = [...editingPractitioner.facilitySchedules];
                                updatedSchedules[idx] = {
                                  ...sched,
                                  timeSlots: { ...sched.timeSlots, start: e.target.value },
                                };
                                setEditingPractitioner({
                                  ...editingPractitioner,
                                  facilitySchedules: updatedSchedules,
                                });
                              }}
                              className="w-full px-1 py-1 bg-white border border-slate-200 rounded font-mono"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={sched.timeSlots.end}
                              onChange={(e) => {
                                const updatedSchedules = [...editingPractitioner.facilitySchedules];
                                updatedSchedules[idx] = {
                                  ...sched,
                                  timeSlots: { ...sched.timeSlots, end: e.target.value },
                                };
                                setEditingPractitioner({
                                  ...editingPractitioner,
                                  facilitySchedules: updatedSchedules,
                                });
                              }}
                              className="w-full px-1 py-1 bg-white border border-slate-200 rounded font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Tarif (FCFA) :</label>
                          <input
                            type="number"
                            value={sched.consultationFee}
                            onChange={(e) => {
                              const updatedSchedules = [...editingPractitioner.facilitySchedules];
                              updatedSchedules[idx] = {
                                ...sched,
                                consultationFee: parseInt(e.target.value) || 0,
                              };
                              setEditingPractitioner({
                                ...editingPractitioner,
                                facilitySchedules: updatedSchedules,
                              });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPractitioner(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded shadow-2xs"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT FACILITY
          ========================================== */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Formation Sanitaire (FOSA)
              </h3>
              <button
                onClick={() => setEditingFacility(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom de l'établissement :</label>
                <input
                  type="text"
                  required
                  value={editingFacility.name}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Type d'établissement :</label>
                <select
                  value={editingFacility.type}
                  onChange={(e) => setEditingFacility({ ...editingFacility, type: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900"
                >
                  <option value="clinique_privee">Clinique Privée</option>
                  <option value="polyclinique">Polyclinique</option>
                  <option value="hopital_district">Hôpital de District</option>
                  <option value="cabinet_medical">Cabinet Médical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quartier à Douala :</label>
                <input
                  type="text"
                  value={editingFacility.quarter}
                  onChange={(e) => setEditingFacility({ ...editingFacility, quarter: e.target.value })}
                  placeholder="Ex: Bonanjo, Akwa, Bonapriso, Makepe, Deïdo"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adresse complète :</label>
                <input
                  type="text"
                  value={editingFacility.address}
                  onChange={(e) => setEditingFacility({ ...editingFacility, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Téléphone :</label>
                <input
                  type="text"
                  value={editingFacility.phone}
                  onChange={(e) => setEditingFacility({ ...editingFacility, phone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Salles de consultation (séparées par des virgules) :
                </label>
                <input
                  type="text"
                  value={editingFacility.rooms.join(', ')}
                  onChange={(e) =>
                    setEditingFacility({
                      ...editingFacility,
                      rooms: e.target.value.split(',').map((r) => r.trim()),
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded shadow-2xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: RESTOCK ITEM
          ========================================== */}
      {restockingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Réassort : {restockingItem.name}
              </h3>
              <button
                onClick={() => setRestockingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div className="text-slate-600">
                Fournisseur : <strong>{restockingItem.supplierName}</strong>
                {restockingItem.supplierPhone ? ` (${restockingItem.supplierPhone})` : ''}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quantité à réceptionner ({restockingItem.unit}) :
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold font-mono text-base"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockingItem(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded shadow-2xs"
                >
                  Valider la Réception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
