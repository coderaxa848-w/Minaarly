import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Search, Calendar, Sparkles, MousePointer2, Zap } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  {
    number: '01',
    icon: MapPin,
    title: 'Open the Map',
    description: 'Launch our interactive map to instantly see mosques in your area with real-time data.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  },
  {
    number: '02',
    icon: Search,
    title: 'Discover & Explore',
    description: 'Browse detailed profiles with prayer times, facilities, and upcoming community events.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  {
    number: '03',
    icon: Calendar,
    title: 'Connect & Engage',
    description: 'Join prayers, attend classes, and become an active part of your local masjid community.',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
  },
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const lineHeight = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white dark:bg-slate-900 relative overflow-hidden" ref={containerRef}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <motion.div 
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary/40 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-emerald-400/30 rounded-full"
          animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>
      
      <div className="container relative">
        {/* Header with animated badge */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 mb-6"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Super Simple</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight"
          >
            Get started in{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">seconds</span>
              <motion.span 
                className="absolute inset-0 bg-primary/10 rounded-lg -z-0"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
          >
            No sign-up required. Just open, explore, and connect with your community.
          </motion.p>
        </div>

        {/* Steps with animated timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical timeline line - desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2">
            <motion.div 
              className="w-full bg-gradient-to-b from-primary via-emerald-500 to-violet-500"
              style={{ height: lineHeight }}
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex items-center gap-8 mb-16 last:mb-0 ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Content card */}
              <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                <motion.div 
                  className="relative p-8 rounded-3xl bg-white dark:bg-slate-800 border border-border/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group"
                  whileHover={{ y: -5 }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Step number badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${step.bgColor} mb-4`}>
                    <span className={`text-xs font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      STEP {step.number}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {step.description}
                  </p>

                  {/* Decorative corner */}
                  <div className={`absolute ${index % 2 === 0 ? 'right-4' : 'left-4'} top-4 w-20 h-20 bg-gradient-to-br ${step.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                </motion.div>
              </div>

              {/* Center icon */}
              <div className="hidden lg:flex items-center justify-center relative z-10">
                <motion.div 
                  className={`w-16 h-16 rounded-2xl ${step.iconBg} shadow-lg flex items-center justify-center`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <step.icon className="h-7 w-7 text-white" />
                </motion.div>
              </div>

              {/* Empty space for alternating layout */}
              <div className="hidden lg:block flex-1" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <MousePointer2 className="h-4 w-4" />
            <span className="text-sm">Ready to explore? Scroll down to see features</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
