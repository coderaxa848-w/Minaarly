import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2, Check, ArrowRight, Plane, Home, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const audiences = [
  {
    icon: Home,
    title: 'Community Members',
    subtitle: 'Your daily companion',
    description: 'Stay connected to your local masjid with real-time prayer times, community events, and everything you need.',
    benefits: ['Real-time iqamah times', 'Event notifications', 'Mosque details & facilities'],
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/5 to-teal-500/5',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    accentColor: 'emerald',
  },
  {
    icon: Plane,
    title: 'Travelers & Students',
    subtitle: 'Mosques everywhere you go',
    description: 'New city? New campus? Find mosques instantly with all the details you need to feel at home.',
    benefits: ['Location-based discovery', 'Language filters', 'Accessibility info'],
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/5 to-cyan-500/5',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    accentColor: 'blue',
  },
  {
    icon: Settings,
    title: 'Mosque Admins',
    subtitle: 'Manage with ease',
    description: 'Keep your community informed with an intuitive dashboard for prayer times, events, and announcements.',
    benefits: ['Easy updates', 'Event management', 'Community insights'],
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-500/5 to-purple-500/5',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
    accentColor: 'violet',
  },
];

export function WhoItsForSection() {
  return (
    <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        <motion.div 
          className="absolute top-1/3 right-[10%] w-3 h-3 bg-primary/30 rounded-full"
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-[15%] w-2 h-2 bg-violet-400/40 rounded-full"
          animate={{ y: [0, 10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>
      
      <div className="container relative">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 mb-6"
          >
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">For Everyone</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight"
          >
            One platform,{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">endless possibilities</span>
              <motion.div 
                className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-full blur-sm"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
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
            Whether you're a regular at your local masjid, exploring a new city, or managing a mosque—we've got you covered.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              {/* Card glow effect */}
              <div className={`absolute -inset-0.5 rounded-[28px] bg-gradient-to-br ${audience.gradient} opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />
              
              <div className="relative h-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-black/5 border border-white dark:border-slate-700 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${audience.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Decorative corner orb */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${audience.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl ${audience.iconBg} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <audience.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  {/* Title & subtitle */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {audience.title}
                    </h3>
                    <p className={`text-sm font-medium bg-gradient-to-r ${audience.gradient} bg-clip-text text-transparent`}>
                      {audience.subtitle}
                    </p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {audience.description}
                  </p>
                  
                  {/* Benefits */}
                  <ul className="space-y-3 mb-6">
                    {audience.benefits.map((benefit, i) => (
                      <motion.li 
                        key={benefit} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 + i * 0.05 }}
                      >
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${audience.iconBg}`}>
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm text-foreground/80">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* CTA */}
                  <div className="pt-4 border-t border-border/50">
                    <Link to="/map" className="inline-flex items-center gap-2 text-sm font-medium text-primary group/link">
                      Get started
                      <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Ready to connect with your community?
          </p>
          <Link to="/map">
            <Button size="lg" className="h-14 px-10 text-base font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
              Start Exploring Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
