import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Navigation, Clock, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const prayerTimes = [
  { name: 'Asr', time: '4:32 PM' },
  { name: 'Maghrib', time: '6:45 PM' },
  { name: 'Isha', time: '8:15 PM' },
  { name: 'Fajr', time: '5:30 AM' },
  { name: 'Dhuhr', time: '1:15 PM' },
];

const upcomingEvents = [
  'Quran Circle',
  'Tafsir Class',
  'Youth Halaqa',
  'Sisters Study',
  'Jummah Khutbah',
];

export function HeroSection() {
  const [prayerIndex, setPrayerIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    const prayerInterval = setInterval(() => {
      setPrayerIndex((prev) => (prev + 1) % prayerTimes.length);
    }, 3000);

    const eventInterval = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % upcomingEvents.length);
    }, 4000);

    return () => {
      clearInterval(prayerInterval);
      clearInterval(eventInterval);
    };
  }, []);
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-teal-300/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-200/30 to-cyan-200/20 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-teal-100/20 to-transparent blur-3xl"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating mosque-inspired geometric shapes */}
      <motion.div 
        className="absolute top-20 right-[15%] w-4 h-4 border-2 border-primary/30 rotate-45"
        animate={{ y: [0, -30, 0], rotate: [45, 90, 45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/3 left-[10%] w-3 h-3 bg-primary/20 rounded-full"
        animate={{ y: [0, -20, 0], scale: [1, 1.5, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-[25%] w-6 h-6 border border-emerald-400/30 rounded-full"
        animate={{ y: [0, -25, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="absolute top-1/2 right-[8%] w-2 h-8 bg-gradient-to-b from-primary/20 to-transparent rounded-full"
        animate={{ scaleY: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Star className="h-4 w-4 fill-primary" />
                Trusted by 10,000+ Muslims
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]"
            >
              Your masjid,
              <br />
              <span className="relative">
                <span className="text-primary">one tap away</span>
                <motion.svg 
                  className="absolute -bottom-2 left-0 w-full" 
                  viewBox="0 0 300 12" 
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <motion.path 
                    d="M2 8C50 2 100 2 150 6C200 10 250 8 298 4" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    className="text-primary/40"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
            >
              Discover mosques, get accurate prayer times, and never miss a community event. 
              The simplest way to stay connected to your deen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to="/map">
                <Button size="lg" className="h-14 px-8 text-base font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                  <Navigation className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Find Mosques Near Me
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium border-2 hover:bg-primary/5 group" asChild>
                <a href="#how-it-works">
                  Watch Demo
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </a>
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-8"
            >
              {[
                { value: '500+', label: 'Mosques', icon: MapPin },
                { value: '24/7', label: 'Live Times', icon: Clock },
                { value: '1000+', label: 'Events', icon: Calendar },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right side - Interactive visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Outer ring */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle ring */}
              <motion.div 
                className="absolute inset-8 rounded-full border border-primary/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner glow */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/20 to-teal-400/20 blur-2xl" />
              
              {/* Center content */}
              <div className="absolute inset-20 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl shadow-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                  </motion.div>
                  <div className="text-2xl font-bold text-foreground">Explore</div>
                  <div className="text-sm text-muted-foreground">Your Community</div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div 
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-primary/10 p-4 border border-primary/10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-[100px]">
                    <div className="text-xs text-muted-foreground">Next Prayer</div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={prayerIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="font-semibold text-foreground"
                      >
                        {prayerTimes[prayerIndex].name} • {prayerTimes[prayerIndex].time}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute top-1/4 -right-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-primary/10 p-4 border border-primary/10"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-[100px]">
                    <div className="text-xs text-muted-foreground">Upcoming</div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={eventIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="font-semibold text-foreground"
                      >
                        {upcomingEvents[eventIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-1/4 -left-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-primary/10 p-4 border border-primary/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Nearby</div>
                    <div className="font-semibold text-foreground">3 Mosques</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-white dark:fill-slate-900"/>
        </svg>
      </div>
    </section>
  );
}
