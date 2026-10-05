import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors whitespace-nowrap"
        title="Installer l’application DoualaSanté en mode PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer l’App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Installer iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Installer sur iPhone / iPad</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                1. Appuyez sur l’icône <strong>Partager</strong> dans Safari.<br />
                2. Faites défiler et touchez <strong>Sur l’écran d’accueil</strong>.<br />
                3. L’application fonctionnera en plein écran même sans connexion Internet à Douala !
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
