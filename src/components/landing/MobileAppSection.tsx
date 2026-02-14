import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Smartphone, MapPin, Clock, Zap, Calendar } from 'lucide-react';
import exploreScreen from '@/assets/explore.png';
import mosqueDetailScreen from '@/assets/full-preview.png';
import eventScreen from '@/assets/event-screen.png';
import semiPreview from '@/assets/semi-preview.png';
import miniPreview from '@/assets/mini-preview.png';
import splashScreen from '@/assets/splash.png';

const appFeatures = [
  { icon: MapPin, text: 'Search 3,000+ mosques', color: 'text-emerald-500' },
  { icon: Clock, text: 'Live prayer & iqamah times', color: 'text-amber-500' },
  { icon: Calendar, text: 'Event & salah reminders', color: 'text-violet-500' },
  { icon: Zap, text: 'Save your favourite mosques', color: 'text-blue-500' },
];

const phoneScreens = [
  { src: splashScreen, alt: 'Minaarly splash screen', label: 'Welcome' },
  { src: exploreScreen, alt: 'Minaarly explore map', label: 'Explore' },
  { src: miniPreview, alt: 'Minaarly mosque card', label: 'Discover' },
  { src: semiPreview, alt: 'Minaarly mosque preview', label: 'Preview' },
  { src: mosqueDetailScreen, alt: 'Minaarly mosque details', label: 'Details' },
  { src: eventScreen, alt: 'Minaarly events', label: 'Events' },
];

function MobileCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="md:hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {phoneScreens.map((screen, i) => {
            const isActive = i === selectedIndex;
            return (
              <div
                key={screen.label}
                className="flex-[0_0_65%] min-w-0 px-3 transition-all duration-300"
              >
                <div
                  className={`rounded-[2rem] overflow-hidden border-2 bg-slate-900 transition-all duration-300 ${
                    isActive
                      ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20 scale-100 opacity-100'
                      : 'border-white/10 shadow-xl shadow-black/30 scale-90 opacity-50'
                  }`}
                >
                  <img src={screen.src} alt={screen.alt} className="w-full h-auto" />
                </div>
                <p className={`text-center text-sm mt-4 font-medium transition-colors duration-300 ${
                  isActive ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                  {screen.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {phoneScreens.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? 'w-8 h-2.5 bg-emerald-500'
                : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function DesktopMarquee() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="hidden md:block relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); setHoveredIndex(null); }}
    >
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <div className="overflow-hidden">
        <div
          className="flex gap-6 will-change-transform"
          style={{
            animation: `marquee 30s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {[...phoneScreens, ...phoneScreens].map((screen, i) => {
            const realIndex = i % phoneScreens.length;
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={`${screen.label}-${i}`}
                className="flex-shrink-0 cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`w-48 lg:w-56 rounded-[2rem] overflow-hidden border-2 bg-slate-900 transition-all duration-300 will-change-transform ${
                    isHovered
                      ? 'border-emerald-500/60 shadow-2xl shadow-emerald-500/30 scale-105 -translate-y-4'
                      : hoveredIndex !== null
                        ? 'border-white/5 shadow-lg shadow-black/20 scale-95 opacity-60'
                        : 'border-white/10 shadow-xl shadow-black/30'
                  }`}
                >
                  <img src={screen.src} alt={screen.alt} className="w-full h-auto" />
                </div>
                <p className={`text-center text-xs mt-3 font-medium transition-all duration-300 ${
                  isHovered ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {screen.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export function MobileAppSection() {
  return (
    <section id="get-the-app" className="py-20 md:py-32 relative overflow-hidden bg-slate-950">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-emerald-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container relative">
        {/* Text content */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Coming Soon</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]">
            The best way to{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              find your mosque
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
            Minaarly puts 2,000+ UK mosques in your pocket. Search by location,
            check live prayer times, discover events, and save your favourites.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            {appFeatures.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/5"
              >
                <feature.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${feature.color} flex-shrink-0`} />
                <span className="text-xs sm:text-sm text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              disabled
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-xl font-medium opacity-90 cursor-not-allowed hover:opacity-100 transition-opacity"
            >
              <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider opacity-60">Coming Soon</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </button>
            <button
              disabled
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white/10 text-white rounded-xl font-medium border border-white/10 cursor-not-allowed hover:bg-white/15 transition-colors"
            >
              <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider opacity-60">Coming Soon</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        {/* Phone showcase */}
        <MobileCarousel />
        <DesktopMarquee />
      </div>
    </section>
  );
}
