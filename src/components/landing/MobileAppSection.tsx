import { motion } from 'framer-motion';
import appScreenshot1 from '@/assets/app-screenshot-1.png';
import appScreenshot2 from '@/assets/app-screenshot-2.png';

export function MobileAppSection() {
  return (
    <section className="py-16 md:py-24 gradient-teal-subtle overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              Coming Soon
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Minaarly Mobile App
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Take Minaarly with you wherever you go. Our mobile app brings all
              the features you love to your pocket — find mosques, check prayer
              times, and discover events on the go.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                disabled
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl opacity-70 cursor-not-allowed"
              >
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Coming Soon on</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </button>
              <button
                disabled
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background rounded-xl opacity-70 cursor-not-allowed"
              >
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Coming Soon on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* App Screenshots */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Phone 1 */}
              <div className="relative z-10 w-56 md:w-64">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-foreground/10 bg-foreground/5">
                  <img
                    src={appScreenshot1}
                    alt="Minaarly app map view"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              {/* Phone 2 */}
              <div className="absolute top-8 -right-16 md:-right-20 w-56 md:w-64 transform rotate-6">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-foreground/10 bg-foreground/5">
                  <img
                    src={appScreenshot2}
                    alt="Minaarly app events view"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
