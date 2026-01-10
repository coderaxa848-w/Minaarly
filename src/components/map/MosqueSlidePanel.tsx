import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, ChevronRight, Accessibility, Car, Droplets } from 'lucide-react';
import { Mosque } from '@/lib/types';
import { mockIqamahTimes, mockEvents, facilityLabels } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface MosqueSlidePanelProps {
  mosque: Mosque | null;
  onClose: () => void;
}

const facilityIcons: Record<string, React.ReactNode> = {
  wheelchair: <Accessibility className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  wudu: <Droplets className="h-4 w-4" />,
};

export function MosqueSlidePanel({ mosque, onClose }: MosqueSlidePanelProps) {
  if (!mosque) return null;

  const iqamah = mockIqamahTimes.find(t => t.mosqueId === mosque.id);
  const events = mockEvents.filter(e => e.mosqueId === mosque.id).slice(0, 2);

  return (
    <AnimatePresence>
      {mosque && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl z-30 max-h-[70vh] overflow-hidden"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>

          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(70vh-40px)]">
            {/* Mosque Image */}
            <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
              <img src={mosque.image} alt={mosque.name} className="w-full h-full object-cover" />
            </div>

            {/* Mosque Info */}
            <h2 className="text-xl font-bold mb-1">{mosque.name}</h2>
            <p className="text-muted-foreground flex items-center gap-1 mb-3">
              <MapPin className="h-4 w-4" /> {mosque.city}, {mosque.state} • 2.4 mi
            </p>

            {/* Facilities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {mosque.facilities.slice(0, 4).map(f => (
                <Badge key={f} variant="secondary" className="gap-1">
                  {facilityIcons[f]} {facilityLabels[f]?.split(' ')[0]}
                </Badge>
              ))}
            </div>

            {/* Next Prayer */}
            {iqamah && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Iqamah</p>
                  <p className="font-semibold text-primary">Dhuhr at {iqamah.dhuhr}</p>
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {events.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Upcoming Events</h3>
                {events.map(event => (
                  <div key={event.id} className="p-3 rounded-xl border mb-2">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date} at {event.time}</p>
                  </div>
                ))}
              </div>
            )}

            {/* View Full Details */}
            <Link to={`/mosque/${mosque.id}`}>
              <Button className="w-full gradient-teal">
                View Full Details <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
