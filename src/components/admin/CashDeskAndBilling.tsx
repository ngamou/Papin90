import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Download,
  Plus,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Smartphone,
  Banknote,
  Search,
} from 'lucide-react';
import { SyscohadaInvoice, PaymentTransaction } from '../../types';
import { db } from '../../services/db';

export const CashDeskAndBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<SyscohadaInvoice[]>(db.getInvoices());
  const [selectedInvoice, setSelectedInvoice] = useState<SyscohadaInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);

  // New payment form
  const [patientName, setPatientName] = useState('');
  const [feeConsultation, setFeeConsultation] = useState(15000);
  const [feeAdditional, setFeeAdditional] = useState(0);
  const [paymentChannel, setPaymentChannel] = useState<'mtn_momo' | 'orange_money' | 'cash' | 'transfer'>('cash');
  const [amountCollected, setAmountCollected] = useState(15000);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollectedFCFA = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalBalanceDueFCFA = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const totalTTC = feeConsultation + feeAdditional;
    const balance = Math.max(0, totalTTC - amountCollected);

    const accountDebit =
      paymentChannel === 'mtn_momo'
        ? '5211 (Trésorerie MTN MoMo)'
        : paymentChannel === 'orange_money'
        ? '5212 (Trésorerie Orange Money)'
        : paymentChannel === 'cash'
        ? '571 (Caisse principale espèces)'
        : '521 (Banque)';

    const newInv: SyscohadaInvoice = {
      id: `FACT-DLA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      appointmentId: 'rdv_' + Date.now(),
      patientName,
      date: new Date().toISOString().split('T')[0],
      consultationFee: feeConsultation,
      additionalActsFee: feeAdditional,
      totalTTC,
      amountPaid: amountCollected,
      balanceDue: balance,
      paymentMethod:
        paymentChannel === 'mtn_momo'
          ? 'MTN MoMo (*126#)'
          : paymentChannel === 'orange_money'
          ? 'Orange Money (*150#)'
          : paymentChannel === 'cash'
          ? 'Espèces FCFA'
          : 'Virement bancaire',
      accountCredit: '7061 (Prestations de soins)',
      accountDebit,
      status: balance === 0 ? 'paid' : amountCollected > 0 ? 'partial' : 'pending',
    };

    db.saveInvoice(newInv);
    setInvoices(db.getInvoices());
    setShowNewPaymentModal(false);
    setPatientName('');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Caisse Multi-Canaux & Facturation SYSCOHADA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Encaissements MTN MoMo, Orange Money, Espèces · Plan comptable OHADA (7061, 521, 571) · Factures certifiées
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewPaymentModal(true)}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvel Encaissement</span>
          </button>
        </div>
      </div>

      {/* Accounting Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">
            Total Encaissé (Comptes 521 & 571)
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalCollectedFCFA.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">FCFA</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Rapprochement bancaire OHADA à jour
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">
            Soldes Restants Dus (Créances 411)
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
            {totalBalanceDueFCFA.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">FCFA</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Patients avec acompte de 2 000 FCFA à régulariser
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">
            Répartition par Canal à Douala
          </span>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>MoMo: 62%</span>
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>OM: 28%</span>
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Espèces: 10%</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            90% des paiements dématérialisés
          </span>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher facture ou patient..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>
          <span className="text-xs text-slate-500">
            {filteredInvoices.length} facture(s) SYSCOHADA enregistrée(s)
          </span>
        </div>

        {/* Mobile Invoice Cards (< sm) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs">{inv.id}</span>
                  <div className="text-xs font-semibold text-slate-800">{inv.patientName}</div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold rounded border border-slate-200 transition"
                >
                  Bordereau
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500 text-[11px]">{inv.date}</span>
                <span className="text-slate-600 text-[11px]">{inv.paymentMethod}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total TTC</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {inv.totalTTC.toLocaleString()} F
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Payé</span>
                  <span className="font-mono font-bold text-emerald-600 tabular-nums">
                    {inv.amountPaid.toLocaleString()} F
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Solde</span>
                  <span className="font-mono font-bold tabular-nums">
                    {inv.balanceDue > 0 ? (
                      <span className="text-amber-600">{inv.balanceDue.toLocaleString()} F</span>
                    ) : (
                      <span className="text-slate-400">0 F</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop & Tablet Table (>= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">N° Pièce OHADA</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Patient</th>
                <th className="py-2.5 px-4">Imputation Débit / Crédit</th>
                <th className="py-2.5 px-4 text-right">Montant TTC</th>
                <th className="py-2.5 px-4 text-right">Payé</th>
                <th className="py-2.5 px-4 text-right">Solde Dû</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{inv.id}</td>
                  <td className="py-3 px-4 text-slate-600 tabular-nums">{inv.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{inv.patientName}</td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="block text-slate-800">D: {inv.accountDebit}</span>
                    <span className="block text-[11px] text-slate-500">C: {inv.accountCredit}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {inv.totalTTC.toLocaleString()} F
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold tabular-nums">
                    {inv.amountPaid.toLocaleString()} F
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {inv.balanceDue > 0 ? (
                      <span className="text-amber-600">{inv.balanceDue.toLocaleString()} F</span>
                    ) : (
                      <span className="text-slate-400">0 F</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition"
                    >
                      Bordereau
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">
                  Bordereau de Caisse SYSCOHADA (OHADA)
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">{selectedInvoice.id}</h3>
                <p className="text-xs text-slate-500">
                  Clinique Agréée Douala · Émise le {selectedInvoice.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between">
                <div>
                  <span className="text-slate-500 text-[11px]">Patient(e) :</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedInvoice.patientName}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px]">Mode de règlement :</span>
                  <p className="font-semibold text-slate-900">{selectedInvoice.paymentMethod}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-left">Désignation de la prestation</th>
                      <th className="py-2 px-3 text-right">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3">Consultation médicale spécialiste</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {selectedInvoice.consultationFee.toLocaleString()} F
                      </td>
                    </tr>
                    {selectedInvoice.additionalActsFee > 0 && (
                      <tr>
                        <td className="py-2 px-3">Actes complémentaires & consommables</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {selectedInvoice.additionalActsFee.toLocaleString()} F
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold">
                      <td className="py-2 px-3">Total TTC</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {selectedInvoice.totalTTC.toLocaleString()} F
                      </td>
                    </tr>
                    <tr className="text-emerald-700 font-semibold">
                      <td className="py-2 px-3">Acompte / Montant Encaissé</td>
                      <td className="py-2 px-3 text-right font-mono">
                        - {selectedInvoice.amountPaid.toLocaleString()} F
                      </td>
                    </tr>
                    <tr className="text-amber-700 font-bold bg-amber-50/50">
                      <td className="py-2 px-3">Reste à payer</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {selectedInvoice.balanceDue.toLocaleString()} F
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 font-mono text-[11px] text-slate-600">
                <div>Ventilation Comptable OHADA :</div>
                <div className="text-teal-700">Débit : Compte {selectedInvoice.accountDebit}</div>
                <div className="text-slate-800">Crédit : Compte {selectedInvoice.accountCredit}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => alert('Facture OHADA imprimée en format officiel.')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimer Reçu SYSCOHADA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Payment Modal */}
      {showNewPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Enregistrer un Encaissement Caisse</h3>
              <button
                onClick={() => setShowNewPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nom du patient :</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Ex: Samuel Eto'o"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Honoraires Consultation (FCFA) :
                  </label>
                  <input
                    type="number"
                    value={feeConsultation}
                    onChange={(e) => setFeeConsultation(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Actes additionnels (FCFA) :
                  </label>
                  <input
                    type="number"
                    value={feeAdditional}
                    onChange={(e) => setFeeAdditional(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Canal de paiement :</label>
                <select
                  value={paymentChannel}
                  onChange={(e) => setPaymentChannel(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-900"
                >
                  <option value="cash">Espèces en caisse (Compte 571)</option>
                  <option value="mtn_momo">MTN Mobile Money (*126# - Compte 5211)</option>
                  <option value="orange_money">Orange Money (*150# - Compte 5212)</option>
                  <option value="transfer">Virement bancaire (Compte 521)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Montant perçu (FCFA) :</label>
                <input
                  type="number"
                  value={amountCollected}
                  onChange={(e) => setAmountCollected(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPaymentModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded shadow-2xs"
                >
                  Valider la Facture OHADA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
