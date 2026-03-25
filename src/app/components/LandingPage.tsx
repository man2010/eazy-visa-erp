import { motion } from 'motion/react';
import { Button } from './ui/button';
import { 
  Building2, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Zap,
      title: 'Performance Optimale',
      description: 'Interface ultra-rapide et réactive pour une productivité maximale',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Sécurité Avancée',
      description: 'Données chiffrées et conformité totale aux normes RGPD',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Puissants',
      description: 'Tableaux de bord en temps réel et rapports personnalisables',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Travaillez en équipe avec des outils de communication intégrés',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Automatisation',
      description: 'Automatisez vos processus et gagnez un temps précieux',
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: Globe,
      title: 'Multi-Départements',
      description: 'Solution complète pour tous vos départements en un seul endroit',
      color: 'from-indigo-500 to-purple-500'
    },
  ];

  const stats = [
    { value: '10K+', label: 'Entreprises' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
    { value: '50+', label: 'Pays' },
  ];

  const departments = [
    'IT & Systèmes',
    'Marketing',
    'Finance',
    'Ressources Humaines',
    'Support Client',
    'Gestion Visa',
    'Commercial & CRM',
    'Administration'
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">

      {/* ── Navigation ── */}
      <motion.nav
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 bg-[#A11C1C] rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08, rotate: 4 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-gray-900">Eazy-Visa ERP</span>
          </div>
          <Button
            onClick={onGetStarted}
            className="bg-[#A11C1C] text-white hover:bg-[#8a1818] shadow-md px-6"
          >
            Se connecter
          </Button>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-white text-white">
        {/* Background overlay texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #A11C1C 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #A11C1C 0%, transparent 40%)`
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Nouvelle version 2.0 disponible</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl text-gray-600 font-bold mb-6 leading-tight"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Eazy-Visa ERP 
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transformez votre entreprise avec la solution ERP la plus puissante et intuitive du marché
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-[#A11C1C] hover:bg-[#8a1818] text-white px-8 py-6 text-lg shadow-xl group"
            >
              Commencer maintenant
              <motion.div
                className="inline-block ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-gray-600 hover:bg-white/10 px-8 py-6 text-lg"
            >
              Voir la démo
            </Button>
          </motion.div>
        </div>

        {/* ── Stats band ── 
        <div className="relative bg-[#A11C1C]">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center text-white"
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-1">{stat.value}</div>
                  <div className="text-red-200 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        */}
      </section>
      

      {/* ── Features Section ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Fonctionnalités Exceptionnelles</h2>
            <p className="text-xl text-gray-500">Tout ce dont vous avez besoin pour gérer votre entreprise</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-gray-100"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Departments Section ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Tous vos Départements Unifiés</h2>
            <p className="text-xl text-gray-500">Une solution complète pour toute votre organisation</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map((dept, index) => (
              <motion.div
                key={index}
                className="bg-white border-2 border-gray-100 hover:border-[#A11C1C] rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all cursor-pointer group"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.04 }}
              >
                <CheckCircle className="w-5 h-5 text-[#A11C1C] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">{dept}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 bg-gradient-to-br from-white to-white text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="relative overflow-hidden bg-[#A11C1C] rounded-3xl p-12 text-center shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 0%, white 0%, transparent 60%)`
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Prêt à transformer votre entreprise ?</h2>
              <p className="text-xl text-red-100 mb-8">Rejoignez des milliers d'entreprises qui nous font confiance</p>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-white text-[#A11C1C] hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-5 h-5 text-[#A11C1C]" />
              <span>© 2024 Enterprise ERP. Tous droits réservés.</span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-[#A11C1C] transition-colors text-sm">Confidentialité</a>
              <a href="#" className="hover:text-[#A11C1C] transition-colors text-sm">Conditions</a>
              <a href="#" className="hover:text-[#A11C1C] transition-colors text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}