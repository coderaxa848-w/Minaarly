import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2, CheckCircle2, Star, Zap, Shield } from 'lucide-react';

const DONATION_TIERS = [
  {
    amount: '£5',
    priceId: 'price_1T2b0f8ywTugNijdvrefaf33',
    label: 'Supporter',
    description: 'Help keep the lights on',
    icon: Heart,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    amount: '£10',
    priceId: 'price_1T2bA78ywTugNijdCOxcIGSQ',
    label: 'Champion',
    description: 'Power new features for the ummah',
    icon: Star,
    color: 'from-teal-500 to-emerald-600',
    popular: true,
  },
];

export default function Support() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
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

  return (
    <Layout>
      <div className="container max-w-3xl py-16">
        {success ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">JazakAllah Khayran! 🌙</h1>
            <p className="text-muted-foreground max-w-md">
              Your support means the world to us. It helps us keep Minaarly running and build better tools for the Muslim community across the UK.
            </p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-teal mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Support Minaarly</h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Minaarly is built with love for the Muslim community. Your support helps us maintain the platform, add new features, and keep it free for everyone.
              </p>
            </div>

            {/* What your support does */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {[
                { icon: Zap, title: 'Keep it Fast', desc: 'Server costs and infrastructure to serve thousands of users' },
                { icon: Star, title: 'New Features', desc: 'Build features like prayer time alerts, event reminders & more' },
                { icon: Shield, title: 'Stay Free', desc: 'Keep Minaarly free for mosques and the community forever' },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-border/50">
                  <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Donation tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {DONATION_TIERS.map((tier) => {
                const Icon = tier.icon;
                return (
                  <Card
                    key={tier.priceId}
                    className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                      tier.popular ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    <CardContent className="pt-8 pb-6 flex flex-col items-center text-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold">{tier.amount}</p>
                        <p className="font-semibold text-foreground mt-1">{tier.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                      </div>
                      <Button
                        className="w-full"
                        variant={tier.popular ? 'default' : 'outline'}
                        onClick={() => handleDonate(tier.priceId)}
                        disabled={!!loading}
                      >
                        {loading === tier.priceId ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                        ) : (
                          `Donate ${tier.amount}`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Secure payments powered by Stripe. No account required.
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
