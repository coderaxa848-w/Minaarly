import { Layout } from '@/components/layout';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, Users, Globe, Target, ArrowRight, MapPin, Clock, Calendar, Sparkles, Eye, Rocket, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const timeline = [
  { year: 'The Problem', title: 'Scattered information', desc: 'Muslims across the UK struggled to find accurate prayer times, local events, and mosque details — scattered across outdated websites and word of mouth.' },
  { year: 'The Idea', title: 'One platform for all', desc: 'What if there was a single, beautiful platform that connected every Muslim to their nearest masjid with real-time data?' },
  { year: 'Today', title: 'Minaarly is live', desc: '2,000+ mosques mapped, prayer times updated by admins, community events shared — and a mobile app on the way.' },
  { year: 'Tomorrow', title: 'The vision', desc: 'Every mosque in the UK on one platform. Mosque admins managing their profiles. A thriving, connected ummah.' },
];

const principles = [
  { 
    icon: Eye, 
    title: 'Transparency', 
    desc: 'Open about what we build and why. No hidden agendas.',
    color: 'emerald',
  },
  { 
    icon: Heart, 
    title: 'Community First', 
    desc: 'Every feature starts with "does this help the ummah?"',
    color: 'rose',
  },
  { 
    icon: Globe, 
    title: 'Free Forever', 
    desc: 'Access to mosque info should never cost a penny.',
    color: 'blue',
  },
  { 
    icon: Rocket, 
    title: 'Always Improving', 
    desc: 'We ship fast, listen to feedback, and iterate.',
    color: 'violet',
  },
  { 
    icon: Shield, 
    title: 'Privacy Matters', 
    desc: 'Your data is yours. We don\'t sell or share it.',
    color: 'amber',
  },
  { 
    icon: Users, 
    title: 'Inclusive', 
    desc: 'Built for every Muslim, regardless of background.',
    color: 'teal',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' },
};

const About = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"]
  });
  const lineHeight = useTransform(scrollYProgress, [0, 0.6], ["0%", "100%"]);

  return (
    <Layout>
      {/* Hero - Bold split layout */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-[#fafcfa] dark:bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-emerald-50/80 to-transparent dark:from-emerald-950/20" />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Our Story</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-5xl md:text-6xl lg:text-8xl font-bold text-foreground tracking-tight leading-[1.05] mb-8"
            >
              We're building
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-primary to-teal-500 bg-clip-text text-transparent">
                the ummah's
              </span>
              {' '}platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Minaarly connects Muslims to their local mosques with accurate prayer times, 
              community events, and everything in between — all in one place.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                { value: '2,000+', label: 'Mosques', icon: MapPin },
                { value: '10K+', label: 'Users', icon: Users },
                { value: '24/7', label: 'Live Data', icon: Clock },
                { value: '1000+', label: 'Events', icon: Calendar },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 200 }}
                  className="text-center p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/30"
                >
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline - Our Journey */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-900 relative overflow-hidden" ref={timelineRef}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
            >
              How we got here
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              From a simple idea to a platform serving thousands
            </motion.p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-emerald-100 dark:bg-emerald-900/30 md:-translate-x-px">
              <motion.div 
                className="w-full bg-gradient-to-b from-primary to-teal-400"
                style={{ height: lineHeight }}
              />
            </div>

            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`relative flex items-start gap-8 mb-16 last:mb-0 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-slate-900 -translate-x-1/2 z-10 shadow-lg shadow-primary/30" />

                {/* Content */}
                <div className={`flex-1 ml-16 md:ml-0 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2 px-3 py-1 rounded-full bg-primary/10">
                    {item.year}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles - Clean grid */}
      <section className="py-24 md:py-32 bg-[#fafcfa] dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
            >
              What we stand for
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              Six principles that guide every decision we make
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {principles.map((item, i) => {
              const colors = colorMap[item.color];
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group"
                >
                  <div className={`h-full p-6 rounded-2xl bg-white dark:bg-slate-900 border ${colors.border} hover:shadow-lg hover:shadow-black/5 transition-all duration-300`}>
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                      <item.icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission statement - full width bold */}
      <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
            >
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Our Mission</span>
            </motion.div>

            <motion.blockquote
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] mb-10"
            >
              "To make every Muslim feel{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                connected
              </span>
              {' '}to their local masjid, no matter where they are."
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/map">
                <Button size="lg" className="h-14 px-8 text-base font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
                  Explore the Map
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium border-2 border-white/20 text-white hover:bg-white/10">
                  Get in Touch
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
