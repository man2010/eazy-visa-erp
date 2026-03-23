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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          whileHover={{ x: -5 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'accueil
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Building2 className="w-7 h-7" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl">Connexion</CardTitle>
                    <CardDescription className="text-gray-300">
                      Accédez à votre espace ERP
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-200"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-200">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Se connecter
                  </Button>

                  <div className="text-center text-sm text-gray-400">
                    <p>Utilisez un compte de démonstration ci-contre →</p>
                  </div>
                </CardContent>
              </form>
            </Card>
          </motion.div>

          {/* Demo Accounts */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white h-full">
              <CardHeader>
                <CardTitle className="text-2xl">Comptes de démonstration</CardTitle>
                <CardDescription className="text-gray-300">
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
                      <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-lg p-4 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getDepartmentColor(user.department)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className="text-xl">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="truncate">{user.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getDepartmentColor(user.department)} whitespace-nowrap`}>
                                {getDepartmentLabel(user.department)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 truncate">{user.role}</p>
                            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
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

        {/* Info Card */}
        <motion.div
          className="mt-8 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-center text-sm text-gray-300">
            💡 <strong>Astuce :</strong> Chaque utilisateur a accès uniquement à son département. 
            L'administrateur a accès à tous les modules.
          </p>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
