import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Check } from 'lucide-react';

const DONATION_TIERS = [
  {
    amount: '£5',
    priceId: 'price_1T2b0f8ywTugNijdvrefaf33',
    label: 'Supporter',
    tagline: 'KEEP THE LIGHTS ON',
    description: 'Help cover server costs and keep Minaarly running smoothly for everyone.',
  },
  {
    amount: '£10',
    priceId: 'price_1T2bA78ywTugNijdCOxcIGSQ',
    label: 'Champion',
    tagline: 'POWER NEW FEATURES',
    description: 'Fund development of prayer alerts, event reminders, and community tools.',
    popular: true,
  },
];

const impactItems = [
  { number: '3,300+', label: 'Mosques listed', sublabel: 'across the UK' },
  { number: '100%', label: 'Free forever', sublabel: 'for the community' },
  { number: '0', label: 'Ads or tracking', sublabel: 'privacy first' },
];

export default function Support() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const success = searchParams.get('success') === 'true';

  const handleDonate = async (priceId: string) => {
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-support-payment', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleCustomDonate = async () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount < 1) {
      toast({ title: 'Invalid amount', description: 'Please enter at least £1', variant: 'destructive' });
      return;
    }
    setLoading('custom');
    try {
      const { data, error } = await supabase.functions.invoke('create-support-payment', {
        body: { customAmount: Math.round(amount * 100) }, // Convert to pence
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {success ? (
          /* Success State */
          <div className="container max-w-2xl px-4 py-16 md:py-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6 md:mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center">
                  <Check className="h-10 w-10 md:h-12 md:w-12 text-white" strokeWidth={3} />
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                JazakAllah Khayran
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md mx-auto px-4">
                Your generosity helps us serve the Muslim community across the UK. May Allah reward you abundantly.
              </p>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/'}>
                Back to Minaarly
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative pt-12 md:pt-20 pb-10 md:pb-16 overflow-hidden px-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div className="container max-w-4xl relative">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <span className="inline-block px-3 md:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-4 md:mb-6">
                    Built for the Ummah
                  </span>
                  
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
                    Help us keep Minaarly
                    <span className="block text-primary">free for everyone</span>
                  </h1>
                  
                  <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 px-2">
                    We don't run ads. We don't sell data. We're funded entirely by people like you who believe in making mosque discovery accessible to all.
                  </p>
                </motion.div>

                {/* Impact Numbers */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex justify-center gap-6 md:gap-16 mb-10 md:mb-16"
                >
                  {impactItems.map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-foreground">{item.number}</div>
                      <div className="text-xs md:text-sm font-medium text-foreground/80">{item.label}</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground">{item.sublabel}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Donation Tiers */}
            <section className="pb-16 md:pb-24 px-4">
              <div className="container max-w-3xl">
                {/* Fixed Tiers */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                >
                  {DONATION_TIERS.map((tier, index) => (
                    <motion.div
                      key={tier.priceId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onMouseEnter={() => setHoveredTier(tier.priceId)}
                      onMouseLeave={() => setHoveredTier(null)}
                      className={`
                        relative group
                        bg-white dark:bg-slate-800/50 rounded-2xl md:rounded-3xl p-6 md:p-8
                        border-2 transition-all duration-300
                        ${tier.popular 
                          ? 'border-primary shadow-lg shadow-primary/10' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }
                        ${hoveredTier === tier.priceId ? 'md:scale-[1.02]' : ''}
                      `}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="px-3 md:px-4 py-1 bg-primary text-white text-[10px] md:text-xs font-semibold rounded-full whitespace-nowrap">
                            MOST POPULAR
                          </span>
                        </div>
                      )}

                      {/* Colored accent bar */}
                      <div className={`w-10 md:w-12 h-1 rounded-full mb-4 md:mb-6 ${tier.popular ? 'bg-primary' : 'bg-emerald-500'}`} />

                      <div className="text-[10px] md:text-xs font-semibold tracking-wider text-muted-foreground mb-2">
                        {tier.tagline}
                      </div>

                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl md:text-5xl font-bold text-foreground">{tier.amount}</span>
                        <span className="text-sm text-muted-foreground">one-time</span>
                      </div>

                      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">{tier.label}</h3>
                      
                      <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
                        {tier.description}
                      </p>

                      <Button
                        size="lg"
                        className={`w-full text-sm md:text-base group/btn ${tier.popular ? '' : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'}`}
                        onClick={() => handleDonate(tier.priceId)}
                        disabled={!!loading}
                      >
                        {loading === tier.priceId ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Support with {tier.amount}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Custom Amount Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 md:mt-6"
                >
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-amber-200/50 dark:border-amber-800/30">
                    <div className="w-10 md:w-12 h-1 rounded-full mb-4 md:mb-6 bg-gradient-to-r from-amber-500 to-orange-500" />
                    
                    <div className="text-[10px] md:text-xs font-semibold tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                      CHOOSE YOUR AMOUNT
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Custom Donation</h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-6">
                      Want to give more? Enter any amount you'd like to contribute.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">£</span>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder=""
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-8 h-12 md:h-14 text-lg md:text-xl font-semibold bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800/50 focus:border-amber-500 focus:ring-amber-500"
                        />
                      </div>
                      <Button
                        size="lg"
                        className="h-12 md:h-14 px-6 md:px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white group/btn"
                        onClick={handleCustomDonate}
                        disabled={!!loading || !customAmount}
                      >
                        {loading === 'custom' ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Donate
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Trust badges */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 md:mt-12 text-center"
                >
                  <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 px-4 sm:px-6 py-3 rounded-2xl sm:rounded-full bg-slate-100 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Secure checkout</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <span>Powered by Stripe</span>
                    </div>
                  </div>
                </motion.div>

                {/* Personal note */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-10 md:mt-16 max-w-xl mx-auto"
                >
                  <div className="relative bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-2xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="absolute -top-3 left-4 md:left-8">
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 text-[10px] md:text-xs font-medium text-muted-foreground rounded-full border border-slate-200 dark:border-slate-700">
                        A note from the team
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                      "Minaarly started as a simple idea — help Muslims find mosques easily. Today, we serve thousands of users across the UK. Every contribution, no matter the size, helps us maintain servers, improve features, and keep this service free for the entire community. 
                      <span className="block mt-3 font-medium text-foreground">JazakAllah khayran for being part of this journey.</span>
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
