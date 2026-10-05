import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  KeyRound,
  Download,
} from 'lucide-react';
import { AuditLog } from '../../types';
import { db } from '../../services/db';

interface RegulatoryComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulatoryComplianceModal: React.FC<RegulatoryComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'consent' | 'audit_logs'>('overview');
  const [patientConsentAgreed, setPatientConsentAgreed] = useState(true);

  if (!isOpen) return null;

  const logs = db.getAuditLogs();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold">Conformité Légale & Sécurité des Données</h2>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-sm">
                  Loi 2024/017
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Souveraineté des données de santé · Chiffrement AES-256 · Consentement explicite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`shrink-0 px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Piliers Légaux & Souveraineté
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`shrink-0 px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'consent'
                ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Formulaire de Consentement
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`shrink-0 px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'audit_logs'
                ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>3. Journal d'Audit</span>
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full tabular-nums">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-700" />
                  <span>Cadre Réglementaire : Loi n° 2024/017 du Cameroun</span>
                </h4>
                <p className="text-teal-900 text-xs">
                  Promulguée en 2024, la loi camerounaise relative à la protection des données à caractère personnel
                  impose des garanties strictes pour les données de santé (données sensibles). DoualaSanté applique l'ensemble des exigences légales dès la conception.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <Server className="w-4 h-4 text-teal-600" />
                  <strong className="text-slate-900 block text-xs">Hébergement Local CEMAC</strong>
                  <p className="text-[11px] text-slate-600">
                    Serveurs résidant au Cameroun (Douala Datacenter CAMTEL / MTN Business) garantissant la souveraineté territoriale.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <KeyRound className="w-4 h-4 text-teal-600" />
                  <strong className="text-slate-900 block text-xs">Chiffrement AES-256 & TLS 1.3</strong>
                  <p className="text-[11px] text-slate-600">
                    Données chiffrées au repos en AES-256-GCM. Toutes les communications transitent sous TLS 1.3 avec clés éphémères.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <FileCheck className="w-4 h-4 text-teal-600" />
                  <strong className="text-slate-900 block text-xs">Droit à l'Oubli & Portabilité</strong>
                  <p className="text-[11px] text-slate-600">
                    Chaque patient peut exporter ou révoquer son consentement de partage inter-praticiens à tout moment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consent' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Consentement Éclairé pour le Dossier Médical Partagé (DMP Douala)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conformément à l’article 14 de la Loi 2024/017, la transmission de vos antécédents médicaux, résultats
                  d’examens et ordonnances entre praticiens (ex. du Cardiologue au Gynécologue) requiert votre accord explicite préalable.
                </p>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 text-[11px]">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={patientConsentAgreed}
                      onChange={(e) => setPatientConsentAgreed(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-slate-800">
                      J’autorise expressément le partage sécurisé de mes données médicales (ordonnances, constantes vitales, antécédents)
                      exclusivement entre les médecins spécialistes accrédités de la clinique à Douala.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Statut du consentement : <strong>{patientConsentAgreed ? 'Actif & Validé' : 'Révoqué'}</strong></span>
                  <button
                    onClick={() => alert('Attestation de consentement Loi 2024/017 exportée.')}
                    className="text-teal-700 font-medium hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger attestation PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit_logs' && (
            <div className="space-y-3">
              <div className="text-slate-600 text-xs">
                Registre inaltérable des accès aux dossiers médicaux conformément à la traçabilité légale :
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Horodatage UTC</th>
                      <th className="py-2 px-3">Intervenant / Acteur</th>
                      <th className="py-2 px-3">Action Effectuée</th>
                      <th className="py-2 px-3">Détail & Chiffrement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{log.actor}</td>
                        <td className="py-2.5 px-3 text-slate-700">{log.action}</td>
                        <td className="py-2.5 px-3">
                          <span className="block text-slate-600 text-[11px]">{log.details}</span>
                          <span className="inline-block text-[10px] text-emerald-700 font-mono">
                            {log.encryptionStatus} · IP: {log.ipAddress}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Audit de conformité certifié pour la République du Cameroun
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
