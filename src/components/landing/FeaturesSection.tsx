import { motion } from 'framer-motion';
import exploreScreen from '@/assets/explore.png';
import fullPreview from '@/assets/full-preview.png';

const features = [
  {
    title: 'Live Prayer Times',
    description: 'Accurate iqamah times updated in real-time by mosque admins.',
    accent: 'bg-amber-500',
  },
  {
    title: 'Community Events',
    description: 'Discover lectures, classes, and gatherings happening near you.',
    accent: 'bg-blue-500',
  },
  {
    title: 'Smart Filters',
    description: 'Filter by facilities, language, and programs to find your perfect fit.',
    accent: 'bg-violet-500',
  },
  {
    title: 'Save Favourites',
    description: 'Bookmark your go-to mosques for quick access anytime.',
    accent: 'bg-rose-500',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="container relative">
        {/* Header */}
        <div className="max-w-2xl mb-14 md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1]"
          >
            Everything you need,
            <br />
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              nothing you don't
            </span>
          </motion.h2>
        </div>

        {/* Bento Grid — asymmetric, modern */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-6xl">
          {/* Large card — Map with actual screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 lg:row-span-2"
          >
            <div className="relative h-full min-h-[420px] rounded-2xl bg-slate-950 overflow-hidden group">
              {/* Screenshot positioned at bottom-right */}
              <div className="absolute bottom-0 right-0 w-[70%] sm:w-[55%] translate-x-[10%] translate-y-[5%]">
                <img
                  src={exploreScreen}
                  alt="Minaarly map view"
                  className="w-full h-auto rounded-t-[1.5rem] shadow-2xl shadow-black/40 transition-transform duration-500 group-hover:translate-y-[-8px]"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10 max-w-[55%]">
                <div className="h-1 w-12 bg-primary rounded-full mb-6" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Interactive Map
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Explore mosques near you with our beautiful, intuitive map. See prayer times, events, and facilities at a glance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 4 smaller feature cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="h-full p-6 rounded-2xl border border-border/60 bg-white dark:bg-slate-900 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
                  <div className={`h-1 w-8 ${feature.accent} rounded-full mb-5`} />
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Wide bottom card — Mosque details with screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-12"
          >
            <div className="relative rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Text */}
                <div className="p-8 sm:p-10 md:p-12">
                  <div className="h-1 w-12 bg-emerald-500 rounded-full mb-6" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Every detail, one tap away
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Full mosque profiles with prayer times, facilities, photos, contact info, and upcoming events. Everything you need to know before you visit.
                  </p>
                  <ul className="space-y-2">
                    {['Prayer & iqamah times', 'Facilities & accessibility', 'Photos & directions', 'Community events'].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-foreground/70">
                        <span className="w-4 h-px bg-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Screenshot */}
                <div className="relative h-64 md:h-auto md:min-h-[320px] overflow-hidden">
                  <img
                    src={fullPreview}
                    alt="Mosque detail view"
                    className="absolute bottom-0 right-0 w-[80%] md:w-[90%] max-w-[280px] md:max-w-none translate-x-[5%] translate-y-[10%] rounded-t-[1.5rem] shadow-2xl shadow-black/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
