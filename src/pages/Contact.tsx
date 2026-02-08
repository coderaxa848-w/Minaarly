import { Layout } from '@/components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Send, MessageCircle, ArrowRight, Clock, ChevronDown, Building2, HelpCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const faqs = [
  { q: 'How do I add my mosque to Minaarly?', a: 'Your mosque is likely already on our platform! If not, contact us and we\'ll add it within 24 hours. Mosque admins can then claim their mosque to manage it.' },
  { q: 'Is Minaarly free to use?', a: 'Yes, completely free — for users and mosques. We believe access to mosque information should never cost a penny.' },
  { q: 'How accurate are prayer times?', a: 'Prayer times are updated directly by mosque administrators. We also cross-reference with calculation methods to ensure accuracy.' },
  { q: 'Can I manage my mosque\'s profile?', a: 'Yes! Claim your mosque through our platform, and once approved, you\'ll have full access to update prayer times, events, and mosque details.' },
  { q: 'Is there a mobile app?', a: 'Our mobile app is currently in development and will be available on both iOS and Android soon. Stay tuned!' },
];

const topics = [
  { icon: Building2, label: 'Mosque Inquiry', value: 'mosque' },
  { icon: HelpCircle, label: 'General Question', value: 'general' },
  { icon: Users, label: 'Partnership', value: 'partnership' },
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: 'Message sent!', description: 'We\'ll get back to you within 24 hours, in shaa Allah.' });
    setIsSubmitting(false);
    setSelectedTopic(null);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      {/* Hero - Minimal and bold */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#fafcfa] dark:bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-emerald-50/60 to-transparent dark:from-emerald-950/20" />
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Contact Us</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.05] mb-6"
            >
              Let's{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-primary to-teal-500 bg-clip-text text-transparent">
                talk
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
            >
              Have a question, want to add your mosque, or just want to say salaam? 
              We'd love to hear from you.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main content - Form + Info side by side */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900 relative">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 max-w-6xl mx-auto">
            
            {/* Left - Contact Form (3 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="p-8 md:p-10 rounded-3xl bg-[#fafcfa] dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30">
                <h2 className="text-2xl font-bold text-foreground mb-2">Send us a message</h2>
                <p className="text-muted-foreground text-sm mb-8">We typically respond within 24 hours</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Topic selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">What's this about?</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {topics.map((topic) => (
                        <button
                          key={topic.value}
                          type="button"
                          onClick={() => setSelectedTopic(topic.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedTopic === topic.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-transparent bg-white dark:bg-slate-900 text-muted-foreground hover:border-emerald-200 dark:hover:border-emerald-800'
                          }`}
                        >
                          <topic.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{topic.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <Input 
                        id="name" 
                        required 
                        placeholder="Your name" 
                        className="h-12 rounded-xl bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        placeholder="your@email.com" 
                        className="h-12 rounded-xl bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="How can we help?" 
                      className="h-12 rounded-xl bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                    <Textarea 
                      id="message" 
                      required 
                      placeholder="Tell us what's on your mind..." 
                      rows={5} 
                      className="rounded-xl bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-13 text-base font-semibold gradient-teal shadow-teal hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.005] transition-all duration-300 rounded-xl" 
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
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Right - Contact info + quick links (2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact cards */}
              <div className="space-y-3">
                <motion.a
                  href="mailto:hello@minaarly.com"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-[#fafcfa] dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email us</div>
                    <div className="font-semibold text-foreground">hello@minaarly.com</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>

                <motion.div
                  className="flex items-center gap-4 p-5 rounded-2xl bg-[#fafcfa] dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Response time</div>
                    <div className="font-semibold text-foreground">Within 24 hours</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-5 rounded-2xl bg-[#fafcfa] dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Based in</div>
                    <div className="font-semibold text-foreground">United Kingdom</div>
                  </div>
                </motion.div>
              </div>

              {/* Mosque admin CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '20px 20px'
                }} />
                <div className="relative z-10">
                  <Building2 className="h-8 w-8 mb-3 opacity-80" />
                  <h3 className="text-lg font-bold mb-2">Are you a mosque admin?</h3>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    Claim your mosque on Minaarly to manage prayer times, events, and connect with your community.
                  </p>
                  <Button size="sm" className="bg-white text-emerald-700 hover:bg-white/90 font-semibold" asChild>
                    <a href="/map">
                      Find Your Mosque
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Accordion style */}
      <section className="py-16 md:py-24 bg-[#fafcfa] dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="container relative">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Send us a message above.
              </p>
            </motion.div>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                      openFaq === i 
                        ? 'bg-white dark:bg-slate-900 border-primary/20 shadow-lg shadow-primary/5' 
                        : 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-semibold text-foreground text-left">{faq.q}</h4>
                      <motion.div
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-muted-foreground text-sm leading-relaxed mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
