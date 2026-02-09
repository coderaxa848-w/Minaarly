import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Calendar, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
const rotatingWords = ['masjid', 'community', 'salah', 'ummah'];

const liveFeed = [
  { type: 'prayer', text: 'Maghrib in 12 min', location: 'East London Mosque' },
  { type: 'event', text: 'Quran Circle tonight', location: 'Birmingham Central' },
  { type: 'prayer', text: 'Isha at 9:45 PM', location: 'Manchester Islamic' },
  { type: 'event', text: 'Youth Halaqa tomorrow', location: 'Leeds Grand Mosque' },
  { type: 'prayer', text: 'Fajr at 5:30 AM', location: 'Aberdeen Mosque' },
];

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [feedIndex, setFeedIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const constraintsRef = useRef(null);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    const feedInterval = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % liveFeed.length);
    }, 3500);
    return () => {
      clearInterval(wordInterval);
      clearInterval(feedInterval);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#fafcfa] dark:bg-slate-950">
      {/* Massive gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[70%] h-[80%] bg-gradient-to-bl from-emerald-100/80 via-teal-50/40 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 rounded-bl-[40%]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] bg-gradient-to-tr from-emerald-50/60 to-transparent dark:from-emerald-950/20" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Animated accent lines */}
      <motion.div 
        className="absolute top-[20%] right-[10%] w-px h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
        animate={{ y: [0, 40, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[40%] right-[20%] w-px h-24 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent"
        animate={{ y: [0, -30, 0], opacity: [0, 0.8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-[30%] left-[5%] w-24 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        animate={{ x: [0, 30, 0], opacity: [0, 0.6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Top bar - live feed */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-800/30 shadow-lg shadow-emerald-500/5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={feedIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm font-medium text-foreground"
                >
                  <span className="text-primary">{liveFeed[feedIndex].text}</span>
                  <span className="text-muted-foreground"> — {liveFeed[feedIndex].location}</span>
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Main headline - centered, massive */}
          <div className="text-center mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.05] mb-2"
            >
              Your{' '}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 30, rotateX: -40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -30, rotateX: 40 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block bg-gradient-to-r from-emerald-600 via-primary to-teal-500 bg-clip-text text-transparent"
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
                <motion.div 
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-teal-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  style={{ originX: 0 }}
                />
              </span>
              ,
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.05]"
            >
              one tap away
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Find mosques, prayer times, and community events across the UK. 
            The simplest way to stay connected to your deen.
          </motion.p>

          {/* Search-style CTA - the wow factor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <motion.div 
                className="relative flex items-center gap-3 p-2 pl-6 rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-300 shadow-xl shadow-black/5 border-emerald-200/60 dark:border-emerald-800/30"
              >
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 py-3">
                  <span className="text-muted-foreground text-base">Download our app to find mosques near you</span>
                </div>
                <Button size="lg" className="h-12 px-6 gradient-teal shadow-teal rounded-xl font-semibold">
                  Get the App
                </Button>
              </motion.div>
          </motion.div>

          {/* Stats - horizontal pill style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {[
              { value: '2,000+', label: 'Mosques', icon: MapPin },
              { value: '24/7', label: 'Live Prayer Times', icon: Clock },
              { value: '1000+', label: 'Community Events', icon: Calendar },
              { value: '10K+', label: 'Muslims Trust Us', icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + i * 0.08, type: "spring", stiffness: 200 }}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/30 hover:border-primary/30 transition-colors"
              >
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Interactive cards row - the visual showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            ref={constraintsRef}
          >
            {/* Card 1 - Map Preview */}
            <motion.div 
              className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-6 h-48 cursor-pointer"
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }} />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-[60px]" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white/70 text-sm mb-1">Interactive</div>
                  <div className="text-white text-xl font-bold">Mosque Map</div>
                </div>
              </div>
              <motion.div 
                className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Card 2 - Prayer Times */}
            <motion.div 
              className="relative group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 p-6 h-48 cursor-pointer"
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={feedIndex % 3}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="text-2xl font-bold text-foreground"
                      >
                        {['Maghrib', 'Isha', 'Fajr'][feedIndex % 3]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-muted-foreground text-sm">in 12 min</span>
                  </div>
                  <div className="text-muted-foreground text-sm">Live prayer times</div>
                </div>
              </div>
            </motion.div>

            {/* Card 3 - Events */}
            <motion.div 
              className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 p-6 h-48 cursor-pointer"
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-violet-500/20 rounded-full blur-xl" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-white/60 text-xs uppercase tracking-wider">This week</span>
                  </div>
                  <div className="text-white text-xl font-bold">Community Events</div>
                  <div className="text-white/50 text-sm">Halaqas, classes & more</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
