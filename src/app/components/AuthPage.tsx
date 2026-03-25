import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Building2, ArrowLeft, AlertCircle } from 'lucide-react';
import { mockUsers, validateLogin, type MockUser } from '../data/mockUsers';

interface AuthPageProps {
  onLogin: (user: MockUser) => void;
  onBack: () => void;
}

export function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = validateLogin(email, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  const handleQuickLogin = (user: MockUser) => {
    setEmail(user.email);
    setPassword(user.password);
    onLogin(user);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Subtle background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#A11C1C]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#A11C1C]/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">

        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-[#A11C1C] transition-colors font-medium"
          whileHover={{ x: -4 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'accueil
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Login Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden">
              {/* Red top accent bar */}
              <div className="h-1.5 w-full bg-[#A11C1C]" />

              <CardHeader className="pt-8">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    className="w-12 h-12 bg-[#A11C1C] rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Building2 className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Connexion</CardTitle>
                    <CardDescription className="text-gray-500">
                      Accédez à votre espace ERP
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleLogin}>
                <CardContent className="space-y-5 pb-8">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-200 focus:ring-2 focus:ring-[#A11C1C]/30 focus:border-[#A11C1C] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-200 focus:ring-2 focus:ring-[#A11C1C]/30 focus:border-[#A11C1C] transition-all"
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      className="w-full bg-[#A11C1C] hover:bg-[#8a1818] text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      Se connecter
                    </Button>
                  </motion.div>

                  <p className="text-center text-sm text-gray-400">
                    Utilisez un compte de démonstration ci-contre →
                  </p>
                </CardContent>
              </form>
            </Card>
          </motion.div>

          {/* ── Demo Accounts ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden h-full">
              {/* Red top accent bar */}
              <div className="h-1.5 w-full bg-[#A11C1C]" />

              <CardHeader className="pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Comptes de démonstration</CardTitle>
                <CardDescription className="text-gray-500">
                  Cliquez sur un profil pour vous connecter instantanément
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {mockUsers.map((user, index) => (
                    <motion.button
                      key={user.email}
                      onClick={() => handleQuickLogin(user)}
                      className="w-full text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="bg-white hover:bg-gray-50 border-2 border-gray-100 hover:border-[#A11C1C]/40 rounded-xl p-4 transition-all shadow-sm hover:shadow-md group">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getDepartmentColor(user.department)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <span className="text-white font-bold text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 truncate group-hover:text-[#A11C1C] transition-colors">
                                {user.name}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getDepartmentColor(user.department)} text-white whitespace-nowrap font-medium shadow-sm`}>
                                {getDepartmentLabel(user.department)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{user.role}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Info Card ── */}
        <motion.div
          className="mt-8 bg-[#A11C1C]/5 border border-[#A11C1C]/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-center text-sm text-gray-600">
            💡 <strong className="text-gray-800">Astuce :</strong> Chaque utilisateur a accès uniquement à son département.
            L'administrateur a accès à tous les modules.
          </p>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #A11C1C55;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A11C1C99;
        }
      `}</style>
    </div>
  );
}