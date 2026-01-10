import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-teal p-8 md:p-12 lg:p-16 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Explore?
            </h2>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Find mosques near you, discover upcoming events, and connect with
              your local Muslim community today.
            </p>
            <Link to="/map">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-xl"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Explore Mosques Near You
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
