import { motion } from 'framer-motion';
import { MapPin, Search, Calendar } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: 'Open the Map',
    description: 'Launch the interactive map to see mosques in your area.',
  },
  {
    icon: Search,
    title: 'Discover Mosques & Events',
    description: 'Browse detailed mosque profiles, prayer times, and upcoming events.',
  },
  {
    icon: Calendar,
    title: 'Attend & Engage',
    description: 'Join prayers, classes, and community events at your local masjid.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Get connected to your local Muslim community in three simple steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-teal shadow-teal mb-6 relative z-10">
                <step.icon className="h-7 w-7 text-white" />
              </div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center text-sm font-bold text-primary z-20">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
