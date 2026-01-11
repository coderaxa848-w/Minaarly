import { motion } from 'framer-motion';
import { Map, Clock, Calendar, Filter, Users, Bell, Compass, Sparkles, Globe, Heart } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-600">Powerful Features</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight"
          >
            Built for the{' '}
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              ummah
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
          >
            Every feature designed with one goal: bringing you closer to your community and your deen.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {/* Large feature - Interactive Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 lg:col-span-2 lg:row-span-2 group"
          >
            <div className="relative h-full min-h-[400px] p-8 rounded-3xl bg-gradient-to-br from-primary to-teal-600 overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }} />
              </div>
              
              {/* Floating map pins */}
              <motion.div 
                className="absolute top-20 right-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Map className="h-5 w-5 text-white" />
              </motion.div>
              <motion.div 
                className="absolute bottom-32 right-12 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              >
                <Compass className="h-4 w-4 text-white" />
              </motion.div>
              
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Interactive Map
                </h3>
                <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                  Explore mosques near you with our beautiful, intuitive map. See prayer times, events, and facilities at a glance.
                </p>
              </div>
              
              {/* Decorative gradient orb */}
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Prayer Times */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group"
          >
            <div className="relative h-full min-h-[200px] p-6 rounded-3xl bg-white dark:bg-slate-800 border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Live Prayer Times</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Accurate iqamah times updated in real-time by mosque admins.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Events */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="group"
          >
            <div className="relative h-full min-h-[200px] p-6 rounded-3xl bg-white dark:bg-slate-800 border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Community Events</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Discover lectures, classes, and gatherings happening near you.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Smart Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group"
          >
            <div className="relative h-full min-h-[200px] p-6 rounded-3xl bg-white dark:bg-slate-800 border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors"
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Smart Filters</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Filter by facilities, language, and programs to find your perfect fit.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="group"
          >
            <div className="relative h-full min-h-[200px] p-6 rounded-3xl bg-white dark:bg-slate-800 border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 overflow-hidden">
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors"
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Notifications</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Get timely reminders for events and prayer time updates.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Wide feature - Community */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 group"
          >
            <div className="relative h-full min-h-[180px] p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
              {/* Animated dots */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }} />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-500 border-2 border-slate-900 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                    >
                      <Users className="h-5 w-5 text-white" />
                    </motion.div>
                  ))}
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-white/10 border-2 border-slate-900 flex items-center justify-center text-white text-sm font-bold"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    +10K
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    Join the Community
                    <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Connect with thousands of Muslims in your area. Build meaningful relationships and strengthen your local ummah.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
