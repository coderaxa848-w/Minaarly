import { Layout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Heart, Users, Globe, Target, Sparkles, ArrowRight, Star, Zap, Shield, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const values = [
  { 
    icon: Target, 
    title: 'Our Mission', 
    desc: 'To strengthen the connection between Muslims and their local masjids through technology.',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  },
  { 
    icon: Heart, 
    title: 'Community First', 
    desc: 'Built by the community, for the community. Every feature is designed with your needs in mind.',
    gradient: 'from-rose-500 to-pink-500',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
  },
  { 
    icon: Globe, 
    title: 'Accessible', 
    desc: 'Free to use for everyone. We believe in removing barriers to community connection.',
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  { 
    icon: Users, 
    title: 'Growing Together', 
    desc: 'As more mosques join, the platform becomes more valuable for everyone.',
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
  },
];

const stats = [
  { value: '500+', label: 'Mosques Listed', icon: Compass },
  { value: '10K+', label: 'Active Users', icon: Users },
  { value: '1000+', label: 'Events Shared', icon: Star },
  { value: '99.9%', label: 'Uptime', icon: Zap },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/15 to-teal-300/15 blur-3xl"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-emerald-200/20 to-cyan-200/15 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, -45, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating elements */}
        <motion.div 
          className="absolute top-20 right-[20%] w-3 h-3 bg-primary/30 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-[15%] w-2 h-2 bg-emerald-400/40 rounded-full"
          animate={{ y: [0, 15, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Story</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 tracking-tight leading-[1.1]"
            >
              Connecting the{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">ummah</span>
                <motion.svg 
                  className="absolute -bottom-2 left-0 w-full" 
                  viewBox="0 0 200 12" 
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <motion.path 
                    d="M2 8C40 2 80 2 100 6C120 10 160 8 198 4" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    className="text-primary/40"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </motion.svg>
              </span>
              , one masjid at a time
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Minaarly was born from a simple observation: finding accurate prayer times, 
              discovering local Islamic events, and connecting with nearby mosques shouldn't be difficult.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/map">
                <Button size="lg" className="h-14 px-8 text-base font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
                  Explore the Map
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium border-2 hover:bg-primary/5">
                  Get in Touch
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-white dark:fill-slate-900"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900 relative">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="h-7 w-7 text-primary" />
                </motion.div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 mb-6"
            >
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Values</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            >
              What drives us{' '}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">forward</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Every decision we make is guided by these core principles
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 rounded-[28px] bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />
                
                <div className="relative h-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-black/5 border border-white dark:border-slate-700 overflow-hidden">
                  {/* Decorative orb */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${item.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
                  
                  <div className="relative z-10 flex items-start gap-6">
                    <motion.div 
                      className={`flex-shrink-0 w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <item.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            >
              Ready to connect with your{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">community</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 mb-10"
            >
              Join thousands of Muslims already using Minaarly to stay connected with their local masjid.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/map">
                <Button size="lg" className="h-16 px-12 text-lg font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
                  Start Exploring
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
