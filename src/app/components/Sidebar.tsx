import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Laptop,
  TrendingUp,
  DollarSign,
  Users,
  Ticket,
  Plane,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCog,
  FileCheck2
} from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import type { MockUser } from '../data/mockUsers';

interface SidebarProps {
  user: MockUser;
  activeModule: string;
  onModuleChange: (module: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

const allModules = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, departments: ['admin', 'it', 'marketing', 'finance', 'hr', 'ticketing', 'visa', 'commercial'] },
  { id: 'finance', label: 'Finance', icon: DollarSign, departments: ['admin', 'finance'] },
  { id: 'hr', label: 'Ressources Humaines', icon: UserCog, departments: ['admin', 'hr'] },
  { id: 'billetterie', label: 'Billetterie Aérienne', icon: Plane, departments: ['admin', 'ticketing', 'commercial'] },
  { id: 'ticketing', label: 'Support & SAV', icon: Ticket, departments: ['admin', 'ticketing'] },
  { id: 'commercial', label: 'Commercial', icon: ShoppingCart, departments: ['admin', 'commercial'] },
  { id: 'visa', label: 'Accompagnement Visa', icon: FileCheck2, departments: ['admin', 'visa'] },
];

export function Sidebar({ user, activeModule, onModuleChange, collapsed, onToggleCollapse, onLogout }: SidebarProps) {
  const availableModules = allModules.filter(module =>
    module.departments.includes(user.department)
  );

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      admin: 'from-purple-500 to-pink-500',
      it: 'from-blue-500 to-cyan-500',
      marketing: 'from-orange-500 to-red-500',
      finance: 'from-green-500 to-emerald-500',
      hr: 'from-yellow-500 to-orange-500',
      ticketing: 'from-indigo-500 to-purple-500',
      visa: 'from-pink-500 to-rose-500',
      commercial: 'from-teal-500 to-green-500',
    };
    return colors[dept] || 'from-gray-500 to-gray-600';
  };

  return (
    <motion.div
      className={cn(
        "h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col border-r border-white/10",
        collapsed ? "w-20" : "w-72"
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${getDepartmentColor(user.department)} rounded-xl flex items-center justify-center shadow-lg`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm">Enterprise ERP</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hover:bg-white/10 text-white"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <motion.div
          className="p-4 border-b border-white/10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getDepartmentColor(user.department)} rounded-xl flex items-center justify-center text-lg shadow-lg`}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {availableModules.map((module, index) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;

            return (
              <motion.button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
                title={collapsed ? module.label : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                    layoutId="activeModule"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                {!collapsed && (
                  <span className="relative z-10">{module.label}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={() => onModuleChange('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeModule === 'settings'
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "text-gray-300 hover:bg-white/10 hover:text-white"
          )}
          title={collapsed ? "Paramètres" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Paramètres</span>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </motion.div>
  );
}
