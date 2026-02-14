import { motion } from 'framer-motion';
import { Smartphone, Bell, MapPin, Clock, Zap, Calendar } from 'lucide-react';
import exploreScreen from '@/assets/explore.png';
import mosqueDetailScreen from '@/assets/full-preview.png';
import eventScreen from '@/assets/event-screen.png';
import semiPreview from '@/assets/semi-preview.png';
import miniPreview from '@/assets/mini-preview.png';
import splashScreen from '@/assets/splash.png';

const appFeatures = [
  { icon: MapPin, text: 'Search 2,000+ mosques', color: 'text-emerald-500' },
  { icon: Clock, text: 'Live prayer & iqamah times', color: 'text-amber-500' },
  { icon: Calendar, text: 'Event & salah reminders', color: 'text-violet-500' },
  { icon: Zap, text: 'Save your favourite mosques', color: 'text-blue-500' },
];

const phoneScreens = [
  { src: splashScreen, alt: 'Minaarly splash screen', label: 'Welcome' },
  { src: exploreScreen, alt: 'Minaarly explore map', label: 'Explore' },
  { src: miniPreview, alt: 'Minaarly mosque card', label: 'Discover' },
  { src: semiPreview, alt: 'Minaarly mosque preview', label: 'Preview' },
  { src: mosqueDetailScreen, alt: 'Minaarly mosque details', label: 'Details' },
  { src: eventScreen, alt: 'Minaarly events', label: 'Events' },
];

export function MobileAppSection() {
  return (
    <section id="get-the-app" className="py-24 md:py-36 relative overflow-hidden bg-slate-950">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-emerald-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container relative">
        {/* Top - Text content centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
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
            The best way to{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              find your mosque
            </span>
          </h2>

          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Minaarly puts 2,000+ UK mosques in your pocket. Search by location,
            check live prayer times, discover events, and save your favourites.
          </p>

          {/* Feature pills - horizontal row */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {appFeatures.map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/5"
              >
                <feature.icon className={`h-4 w-4 ${feature.color} flex-shrink-0`} />
                <span className="text-sm text-slate-300">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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

        {/* Bottom - Phone showcase: 6 phones in a row */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative"
        >
          {/* Glow behind phones */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px]" />

          <div className="flex justify-center items-end gap-2 sm:gap-3 md:gap-5 lg:gap-6 relative px-4 overflow-hidden">
            {phoneScreens.map((screen, i) => {
              const isCenter = i === 2 || i === 3;
              const isEdge = i === 0 || i === 5;
              const rotation = i === 0 ? -8 : i === 1 ? -4 : i === 2 ? -1 : i === 3 ? 1 : i === 4 ? 4 : 8;
              const yOffset = isCenter ? 0 : isEdge ? 24 : 12;
              const scale = isCenter ? 1 : isEdge ? 0.85 : 0.92;
              const zIndex = isCenter ? 20 : isEdge ? 5 : 10;
              const opacity = isCenter ? 1 : isEdge ? 0.7 : 0.85;

              return (
                <motion.div
                  key={screen.label}
                  initial={{ opacity: 0, y: 80, rotate: rotation, scale }}
                  whileInView={{ opacity, y: yOffset, rotate: rotation, scale }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 * i }}
                  whileHover={{ y: yOffset - 12, scale: scale + 0.03, opacity: 1 }}
                  className="flex-shrink-0 cursor-pointer will-change-transform"
                  style={{ zIndex }}
                >
                  <div className="w-[4.5rem] sm:w-28 md:w-40 lg:w-48 rounded-xl sm:rounded-2xl md:rounded-[1.8rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10 sm:border-2 bg-slate-900">
                    <img
                      src={screen.src}
                      alt={screen.alt}
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-center text-[9px] sm:text-xs text-slate-500 mt-2 sm:mt-3 font-medium">{screen.label}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
