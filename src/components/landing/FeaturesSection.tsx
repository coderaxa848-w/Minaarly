import { motion } from 'framer-motion';
import { Map, Clock, Calendar, Filter, Users, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Map,
    title: 'Map-Based Discovery',
    description: 'Find mosques near you with an intuitive, interactive map interface.',
  },
  {
    icon: Clock,
    title: 'Accurate Iqamah Times',
    description: 'Get up-to-date prayer times for each mosque, updated by mosque admins.',
  },
  {
    icon: Calendar,
    title: 'Event Listings',
    description: 'Stay informed about lectures, classes, community gatherings, and more.',
  },
  {
    icon: Filter,
    title: 'Smart Filters',
    description: 'Filter by facilities, language, youth programs, and more to find the perfect fit.',
  },
  {
    icon: Users,
    title: 'Community Connection',
    description: 'Connect with your local Muslim community and never miss an event.',
  },
  {
    icon: Bell,
    title: 'Event Reminders',
    description: 'Get notified about upcoming events and prayer time changes.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 gradient-teal-subtle">
      <div className="container">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Minaarly brings the Muslim community together with powerful features
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
