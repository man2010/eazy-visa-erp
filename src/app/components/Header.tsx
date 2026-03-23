import { Bell, Search, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { MockUser } from '../data/mockUsers';

interface HeaderProps {
  user: MockUser;
  onLogout: () => void;
}

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

const getDepartmentLabel = (dept: string) => {
  const labels: Record<string, string> = {
    admin: 'Administration',
    it: 'IT & Systèmes',
    marketing: 'Marketing',
    finance: 'Finance',
    hr: 'Ressources Humaines',
    ticketing: 'Support Client',
    visa: 'Gestion Visa',
    commercial: 'Commercial',
  };
  return labels[dept] || dept;
};

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <motion.header
      className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 flex items-center justify-between shadow-sm"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <motion.span
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 hover:bg-gray-50">
              <div
                className={`w-9 h-9 bg-gradient-to-br ${getDepartmentColor(
                  user.department
                )} rounded-lg flex items-center justify-center text-white shadow-lg`}
              >
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                <Badge
                  className={`mt-2 bg-gradient-to-r ${getDepartmentColor(
                    user.department
                  )} text-white border-0`}
                >
                  {getDepartmentLabel(user.department)}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}