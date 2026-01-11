import { Layout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Phone, Send, MessageCircle, Sparkles, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const contactMethods = [
  { 
    icon: Mail, 
    label: 'Email Us', 
    value: 'hello@minaarly.com',
    description: 'We typically respond within 24 hours',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  },
  { 
    icon: Phone, 
    label: 'Call Us', 
    value: '(555) 123-4567',
    description: 'Mon-Fri, 9am-5pm CST',
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  { 
    icon: MapPin, 
    label: 'Visit Us', 
    value: 'Dallas, TX',
    description: 'Come say salaam!',
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
  },
];

const faqs = [
  { q: 'How do I add my mosque?', a: 'Contact us and we\'ll help you get set up within 24 hours.' },
  { q: 'Is Minaarly free to use?', a: 'Yes! Minaarly is completely free for both users and mosques.' },
  { q: 'How accurate are prayer times?', a: 'Prayer times are updated directly by mosque administrators for maximum accuracy.' },
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: 'Message sent!', description: 'We\'ll get back to you soon.' });
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/15 to-teal-300/15 blur-3xl"
            animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-200/20 to-cyan-200/15 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, 45, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating elements */}
        <motion.div 
          className="absolute top-20 left-[20%] w-3 h-3 bg-primary/30 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-[15%] w-2 h-2 bg-violet-400/40 rounded-full"
          animate={{ y: [0, 15, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Get in Touch</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]"
            >
              We'd love to{' '}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                hear from you
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Have a question, suggestion, or just want to say salaam? We're here to help.
            </motion.p>
          </div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-white dark:fill-slate-900"/>
          </svg>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {contactMethods.map((method, i) => (
              <motion.div
                key={method.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 rounded-[24px] bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />
                
                <div className="relative h-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg shadow-black/5 border border-border/50 text-center overflow-hidden">
                  <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${method.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${method.iconBg} mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <method.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{method.label}</h3>
                    <p className="text-primary font-medium mb-2">{method.value}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Send className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Send a Message</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Drop us a line
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input 
                      id="name" 
                      required 
                      placeholder="Your name" 
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      placeholder="your@email.com" 
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="How can we help?" 
                    className="h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                  <Textarea 
                    id="message" 
                    required 
                    placeholder="Tell us more..." 
                    rows={6} 
                    className="rounded-xl border-border/50 focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-medium text-violet-600">Quick Answers</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently asked
              </h2>
              <p className="text-muted-foreground mb-8">
                Find quick answers to common questions below.
              </p>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={faq.q}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="group"
                  >
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Response time badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Fast Response Time</h4>
                    <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
