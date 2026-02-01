import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { MosqueSlidePanel } from '@/components/map/MosqueSlidePanel';
import { MapFilters } from '@/components/map/MapFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, List, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Types for Supabase mosque data
interface SupabaseMosque {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  madhab: string | null;
  facilities: string[] | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_verified: boolean | null;
  background_image_url: string | null;
}

// Transform Supabase mosque to app format
const transformMosque = (m: SupabaseMosque) => ({
  id: m.id,
  name: m.name,
  slug: m.slug,
  address: m.address,
  city: m.city,
  state: '', // UK doesn't use states
  coordinates: { lat: m.latitude!, lng: m.longitude! },
  image: m.background_image_url || '/placeholder.svg',
  description: m.description || '',
  facilities: (m.facilities || []) as any[],
  languages: [],
  madhab: m.madhab || undefined,
  phone: m.phone || undefined,
  website: m.website || undefined,
  email: m.email || undefined,
  isVerified: m.is_verified || false,
  createdAt: '',
  updatedAt: '',
});

// Custom mosque marker icon
const mosqueIcon = new L.DivIcon({
  className: 'custom-mosque-marker',
  html: `<div style="background: hsl(168 84% 32%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Map bounds tracker component
function MapBoundsHandler({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    // Initial bounds
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

function SetViewOnLoad({ center }: { center: [number, number] }) {
  const map = useMap();
  const hasSetInitialView = useRef(false);
  
  useEffect(() => {
    if (!hasSetInitialView.current) {
      map.setView(center, 11);
      hasSetInitialView.current = true;
    }
  }, [center, map]);
  
  return null;
}

const MapPage = () => {
  const [mosques, setMosques] = useState<ReturnType<typeof transformMosque>[]>([]);
  const [selectedMosque, setSelectedMosque] = useState<ReturnType<typeof transformMosque> | null>(null);
  const [showList, setShowList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UK center (London area as default)
  const center: [number, number] = [51.5074, -0.1278];
  
  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  // Track loaded mosque IDs to avoid duplicates
  const loadedIdsRef = useRef<Set<string>>(new Set());

  // Fetch mosques within bounds
  const fetchMosquesInBounds = useCallback(async (bounds: L.LatLngBounds) => {
    try {
      const { data, error: fetchError } = await supabase.rpc('get_mosques_in_bounds', {
        min_lat: bounds.getSouth(),
        max_lat: bounds.getNorth(),
        min_lng: bounds.getWest(),
        max_lng: bounds.getEast(),
        limit_count: 100,
      });

      if (fetchError) throw fetchError;

      if (data) {
        const newMosques = (data as SupabaseMosque[])
          .filter(m => m.latitude && m.longitude)
          .filter(m => !loadedIdsRef.current.has(m.id));
        
        if (newMosques.length > 0) {
          newMosques.forEach(m => loadedIdsRef.current.add(m.id));
          setMosques(prev => [...prev, ...newMosques.map(transformMosque)]);
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching mosques:', err);
      setError('Failed to load mosques');
      setIsLoading(false);
    }
  }, []);

  // Debounced bounds change handler
  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchMosquesInBounds(bounds);
    }, 300);
  }, [fetchMosquesInBounds]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background border-b z-20">
        <Link to="/">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <h1 className="font-semibold text-lg">Explore Mosques</h1>
        <Button variant="ghost" size="sm" onClick={() => setShowList(!showList)}>
          {showList ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </Button>
      </header>

      {/* Filters */}
      <MapFilters />

      {/* Map */}
      <div className="flex-1 relative">
        {isLoading && mosques.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading mosques...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <MapContainer center={center} zoom={11} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SetViewOnLoad center={center} />
          <MapBoundsHandler onBoundsChange={handleBoundsChange} />
          
          {mosques.map((mosque) => (
            <Marker
              key={mosque.id}
              position={[mosque.coordinates.lat, mosque.coordinates.lng]}
              icon={mosqueIcon}
              eventHandlers={{ click: () => setSelectedMosque(mosque) }}
            >
              <Popup>{mosque.name}</Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Mosque List Overlay */}
        {showList && (
          <div className="absolute inset-0 bg-background z-10 overflow-y-auto p-4">
            <h2 className="font-semibold text-lg mb-4">Nearby Mosques ({mosques.length})</h2>
            {isLoading && mosques.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {mosques.map((mosque) => (
                  <button
                    key={mosque.id}
                    onClick={() => { setSelectedMosque(mosque); setShowList(false); }}
                    className="w-full p-4 rounded-xl border bg-card text-left hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium">{mosque.name}</h3>
                    <p className="text-sm text-muted-foreground">{mosque.city}</p>
                    {mosque.madhab && (
                      <p className="text-xs text-primary mt-1">{mosque.madhab}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-up Panel */}
      <MosqueSlidePanel mosque={selectedMosque} onClose={() => setSelectedMosque(null)} />
    </div>
  );
};

export default MapPage;
