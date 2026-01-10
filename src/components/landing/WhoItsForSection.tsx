import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2 } from 'lucide-react';

const audiences = [
  {
    icon: Users,
    title: 'Community Members',
    description: 'Find your local masjid, discover events, and stay connected with your community.',
    benefits: ['Accurate prayer times', 'Community events', 'Easy navigation'],
  },
  {
    icon: GraduationCap,
    title: 'Students & Travelers',
    description: 'Whether you\'re new to an area or traveling, find a mosque near you instantly.',
    benefits: ['Nearby mosques', 'Facility filters', 'Language options'],
  },
  {
    icon: Building2,
    title: 'Mosque Admins',
    description: 'Manage your mosque\'s presence, update times, and promote your events.',
    benefits: ['Easy updates', 'Event promotion', 'Community reach'],
  },
];

export function WhoItsForSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Who It's For
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Minaarly serves everyone in the Muslim community
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl gradient-teal shadow-teal mb-6 group-hover:scale-110 transition-transform">
                <audience.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {audience.title}
              </h3>
              <p className="text-muted-foreground mb-4">{audience.description}</p>
              <ul className="space-y-2">
                {audience.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
