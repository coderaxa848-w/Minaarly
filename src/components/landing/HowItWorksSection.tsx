import { motion } from 'framer-motion';
import { useState } from 'react';
import exploreScreen from '@/assets/explore.png';
import semiPreview from '@/assets/semi-preview.png';
import eventScreen from '@/assets/event-screen.png';

const steps = [
  {
    number: '1',
    title: 'Find',
    headline: 'Open the map & find mosques near you',
    description: 'Instantly see every mosque in your area on an interactive map. No sign-up, no fuss.',
    image: exploreScreen,
  },
  {
    number: '2',
    title: 'Explore',
    headline: 'Tap a mosque to see everything',
    description: 'Prayer times, iqamah schedules, facilities, photos, and community events — all in one place.',
    image: semiPreview,
  },
  {
    number: '3',
    title: 'Connect',
    headline: 'Join events & stay in the loop',
    description: 'Discover halaqas, classes, and community gatherings. Save your favourites for quick access.',
    image: eventScreen,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="container relative">
        {/* Header — left-aligned on desktop for a modern feel */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
          >
            Three taps to your
            <br />
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              local community
            </span>
          </motion.h2>
        </div>

        {/* Desktop: side-by-side — clickable steps on left, phone preview on right */}
        <div className="hidden md:grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl">
          {/* Left — step selector */}
          <div className="space-y-2">
            {steps.map((step, i) => (
              <motion.button
                key={step.number}
                onClick={() => setActiveStep(i)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${
                  activeStep === i
                    ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-lg shadow-primary/5'
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-5">
                  {/* Big number */}
                  <span className={`text-4xl lg:text-5xl font-black leading-none transition-colors duration-300 ${
                    activeStep === i ? 'text-primary' : 'text-slate-200 dark:text-slate-800 group-hover:text-slate-300 dark:group-hover:text-slate-700'
                  }`}>
                    {step.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg lg:text-xl font-bold mb-1.5 transition-colors duration-300 ${
                      activeStep === i ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    }`}>
                      {step.headline}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-all duration-300 ${
                      activeStep === i ? 'text-muted-foreground max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right — phone preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/15 rounded-full blur-[100px]" />

            <div className="relative w-56 lg:w-64">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={false}
                  animate={{
                    opacity: activeStep === i ? 1 : 0,
                    scale: activeStep === i ? 1 : 0.95,
                    y: activeStep === i ? 0 : 20,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`${i === 0 ? 'relative' : 'absolute inset-0'}`}
                  style={{ pointerEvents: activeStep === i ? 'auto' : 'none' }}
                >
                  <div className="rounded-[2.5rem] overflow-hidden border-[3px] border-slate-200 dark:border-slate-700 shadow-2xl shadow-black/10 dark:shadow-black/40 bg-slate-100 dark:bg-slate-800">
                    <img src={step.image} alt={step.headline} className="w-full h-auto" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mobile: stacked cards with inline screenshots */}
        <div className="md:hidden space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl font-black text-primary leading-none">{step.number}</span>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{step.headline}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
              <div className="w-48 mx-auto rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xl">
                <img src={step.image} alt={step.headline} className="w-full h-auto" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
