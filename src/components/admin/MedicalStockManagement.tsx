import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, CheckCircle, RefreshCw, ShoppingCart, Truck } from 'lucide-react';
import { StockItem } from '../../types';
import { db } from '../../services/db';

export const MedicalStockManagement: React.FC = () => {
  const [stockList, setStockList] = useState<StockItem[]>(db.getStock());
  const [showRestockModal, setShowRestockModal] = useState<StockItem | null>(null);
  const [restockQty, setRestockQty] = useState(20);

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestockModal) return;

    const updated = stockList.map((item) => {
      if (item.id === showRestockModal.id) {
        const newQty = item.quantityInStock + restockQty;
        return {
          ...item,
          quantityInStock: newQty,
          status: (newQty <= item.criticalThreshold ? 'critical' : newQty <= item.criticalThreshold * 1.5 ? 'warning' : 'adequate') as StockItem['status'],
          lastRestockedDate: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });

    setStockList(updated);
    db.saveStock(updated);
    setShowRestockModal(null);
  };

  const criticalCount = stockList.filter((s) => s.status === 'critical').length;
  const warningCount = stockList.filter((s) => s.status === 'warning').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gestion des Stocks de Consommables Médicaux
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des consommables en clinique à Douala · Alertes automatiques de rupture · Fournisseurs locaux
          </p>
        </div>

        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{criticalCount} rupture(s) critique(s)</span>
            </span>
          )}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">Articles Répertoriés</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {stockList.length} <span className="text-xs font-normal text-slate-500">références</span>
          </div>
          <span className="text-[11px] text-teal-600 mt-1 block">Pharmacopée Douala & Matériel stérile</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">Valeur Totale Immobilisée</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {stockList
              .reduce((acc, s) => acc + s.quantityInStock * s.unitPriceFCFA, 0)
              .toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">FCFA</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Compte OHADA 31 (Matières & fournitures)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500">État de Vigilance</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
            {warningCount + criticalCount} <span className="text-xs font-normal text-slate-500">alertes</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Réapprovisionnement suggéré Akwa / Bonanjo</span>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Mobile Stock Cards (< sm) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {stockList.map((item) => (
            <div key={item.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    {item.category} · {item.supplierName}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider shrink-0 ${
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
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">En Stock</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {item.quantityInStock} {item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Seuil Crit.</span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {item.criticalThreshold} {item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Prix Unit.</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {item.unitPriceFCFA.toLocaleString()} F
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => setShowRestockModal(item)}
                  className="w-full py-1.5 text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold rounded-lg transition flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-600" />
                  <span>Réapprovisionner</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop & Tablet Table (>= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Désignation</th>
                <th className="py-2.5 px-4">Catégorie</th>
                <th className="py-2.5 px-4 text-center">Quantité En Stock</th>
                <th className="py-2.5 px-4 text-center">Seuil Critique</th>
                <th className="py-2.5 px-4 text-right">Prix Unitaire</th>
                <th className="py-2.5 px-4">Fournisseur Partenaire</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-slate-500 uppercase text-[10px]">{item.category}</td>
                  <td className="py-3 px-4 text-center font-bold font-mono tabular-nums text-slate-900">
                    {item.quantityInStock} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500 tabular-nums">
                    {item.criticalThreshold} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {item.unitPriceFCFA.toLocaleString()} F
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.supplierName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${
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
                        ? 'Stock Faible'
                        : 'Adéquat'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setShowRestockModal(item)}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-medium rounded transition flex items-center gap-1 mx-auto"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Réassort</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Réassort Stock : {showRestockModal.name}
              </h3>
              <button
                onClick={() => setShowRestockModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestock} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500">Fournisseur : </span>
                <strong className="text-slate-900">{showRestockModal.supplierName}</strong>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Quantité reçue ({showRestockModal.unit}) :
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono font-bold text-slate-900 text-base"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-50 text-[11px] text-slate-600">
                Coût d'achat total estimé :{' '}
                <strong className="text-slate-900 font-mono">
                  {(restockQty * showRestockModal.unitPriceFCFA).toLocaleString()} FCFA
                </strong>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded shadow-2xs"
                >
                  Valider l'entrée en stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
