import { motion } from 'framer-motion';
import { Smartphone, Bell, MapPin, Clock, Zap, ArrowRight } from 'lucide-react';
import appScreenshot1 from '@/assets/app-screenshot-1.png';
import appScreenshot2 from '@/assets/app-screenshot-2.png';

const appFeatures = [
  { icon: MapPin, text: 'Find mosques instantly', color: 'text-emerald-500' },
  { icon: Clock, text: 'Live prayer time alerts', color: 'text-amber-500' },
  { icon: Bell, text: 'Event notifications', color: 'text-violet-500' },
  { icon: Zap, text: 'Offline access', color: 'text-blue-500' },
];

export function MobileAppSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-slate-950">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-emerald-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Phone mockup with glow */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            {/* Glow behind phones */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
            
            <div className="relative">
              {/* Phone 1 - Main */}
              <motion.div 
                className="relative z-10 w-56 md:w-64"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-500/20 border-2 border-white/10 bg-slate-900">
                  <img
                    src={appScreenshot1}
                    alt="Minaarly app map view"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
              
              {/* Phone 2 - Behind */}
              <motion.div 
                className="absolute top-8 -right-16 md:-right-24 w-52 md:w-60 transform rotate-6"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40 border-2 border-white/10 bg-slate-900">
                  <img
                    src={appScreenshot2}
                    alt="Minaarly app events view"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>

              {/* Floating notification card */}
              <motion.div
                className="absolute -top-4 -left-8 md:-left-16 bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-xl z-20"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-medium">Maghrib in 5 min</div>
                    <div className="text-white/40 text-[10px]">East London Mosque</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
            >
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Coming Soon</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Your deen,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                in your pocket
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
              The Minaarly app brings everything to your fingertips. Find mosques, 
              get prayer alerts, and never miss a community event — even offline.
            </p>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-3 mb-10 max-w-md mx-auto lg:mx-0">
              {appFeatures.map((feature, i) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <feature.icon className={`h-4 w-4 ${feature.color} flex-shrink-0`} />
                  <span className="text-sm text-slate-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <motion.button
                disabled
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-xl font-medium opacity-90 cursor-not-allowed hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-60">Coming Soon</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </motion.button>
              <motion.button
                disabled
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white/10 text-white rounded-xl font-medium border border-white/10 cursor-not-allowed hover:bg-white/15 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-60">Coming Soon</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
