import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const audiences = [
  {
    title: 'Community Members',
    tagline: 'Your daily companion',
    description: 'Stay connected to your local masjid with real-time prayer times, community events, and everything you need.',
    benefits: ['Real-time iqamah times', 'Event notifications', 'Mosque details & facilities'],
    accentColor: 'bg-emerald-500',
    tagColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  {
    title: 'Travelers & Students',
    tagline: 'Mosques everywhere you go',
    description: 'New city? New campus? Find mosques instantly with all the details you need to feel at home.',
    benefits: ['Location-based discovery', 'Language filters', 'Accessibility info'],
    accentColor: 'bg-blue-500',
    tagColor: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  {
    title: 'Mosque Admins',
    tagline: 'Manage with ease',
    description: 'Keep your community informed with an intuitive dashboard for prayer times, events, and announcements.',
    benefits: ['Easy updates', 'Event management', 'Community insights'],
    accentColor: 'bg-violet-500',
    tagColor: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
];

export function WhoItsForSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
      <div className="container relative">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4"
          >
            Built for everyone
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4"
          >
            Who is Minaarly for?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto"
          >
            Whether you're a regular at your local masjid, exploring a new city, or managing a mosque.
          </motion.p>
        </div>

        {/* Bento-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-14">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group"
            >
              <div className={`relative h-full rounded-2xl border border-border/60 bg-white dark:bg-slate-900 transition-all duration-300 ${audience.hoverBorder} hover:shadow-lg hover:-translate-y-1 overflow-hidden`}>
                {/* Top accent bar */}
                <div className={`h-1 ${audience.accentColor}`} />

                <div className="p-7 sm:p-8">
                  {/* Tagline */}
                  <p className={`text-xs font-semibold uppercase tracking-wider ${audience.tagColor} mb-3`}>
                    {audience.tagline}
                  </p>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                    {audience.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {audience.description}
                  </p>

                  {/* Benefits — clean dashes */}
                  <ul className="space-y-2">
                    {audience.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3 text-sm text-foreground/70">
                        <span className={`w-4 h-px ${audience.accentColor} flex-shrink-0`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/map">
            <Button size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
              Start Exploring Now
              <svg className="h-4 w-4 ml-2" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
