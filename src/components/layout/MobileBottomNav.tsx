import React from 'react';
import {
  MessageCircle,
  Globe,
  Calendar,
  Layers,
  CreditCard,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isAdminAuthenticated?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  isAdminAuthenticated,
}) => {
  const tabs = [
    { id: 'whatsapp', label: 'WhatsApp', shortLabel: 'WA', icon: MessageCircle },
    { id: 'patient_pwa', label: 'Patient', shortLabel: 'Patient', icon: Globe },
    { id: 'agenda', label: 'Agenda', shortLabel: 'Agenda', icon: Calendar },
    { id: 'kanban', label: 'Attente', shortLabel: 'Attente', icon: Layers },
    { id: 'cash_desk', label: 'Caisse', shortLabel: 'Caisse', icon: CreditCard },
    ...(isAdminAuthenticated && currentTab === 'admin'
      ? [{ id: 'admin', label: 'Admin', shortLabel: 'Admin', icon: ShieldCheck }]
      : [{ id: 'analytics', label: 'Stats', shortLabel: 'Stats', icon: BarChart3 }]),
  ];

  return (
    <nav
      aria-label="Navigation mobile et tablette en pied de page"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-6 h-14 sm:h-16 max-w-lg sm:max-w-2xl mx-auto px-1 sm:px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 relative transition-all duration-150 rounded-lg my-1 mx-0.5 sm:mx-1 focus:outline-hidden ${
                isActive
                  ? 'text-teal-700 bg-teal-50/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 sm:w-10 h-0.5 bg-teal-600 rounded-full" />
              )}
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  isActive ? 'scale-110 text-teal-600 stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[9px] sm:text-xs tracking-tight leading-none truncate max-w-full px-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
