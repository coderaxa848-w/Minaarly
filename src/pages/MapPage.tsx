import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockMosques, mockIqamahTimes } from '@/lib/mockData';
import { Mosque } from '@/lib/types';
import { MosqueSlidePanel } from '@/components/map/MosqueSlidePanel';
import { MapFilters } from '@/components/map/MapFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, List, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom mosque marker icon
const mosqueIcon = new L.DivIcon({
  className: 'custom-mosque-marker',
  html: `<div style="background: hsl(168 84% 32%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function SetViewOnLoad({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 11); }, [center, map]);
  return null;
}

const MapPage = () => {
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [showList, setShowList] = useState(false);
  const center: [number, number] = [32.9, -96.8]; // Dallas area

  const getIqamahTimes = (mosqueId: string) => mockIqamahTimes.find(t => t.mosqueId === mosqueId);

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
        <MapContainer center={center} zoom={11} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SetViewOnLoad center={center} />
          {mockMosques.map((mosque) => (
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
            <h2 className="font-semibold text-lg mb-4">Nearby Mosques ({mockMosques.length})</h2>
            <div className="space-y-3">
              {mockMosques.map((mosque) => (
                <button
                  key={mosque.id}
                  onClick={() => { setSelectedMosque(mosque); setShowList(false); }}
                  className="w-full p-4 rounded-xl border bg-card text-left hover:border-primary transition-colors"
                >
                  <h3 className="font-medium">{mosque.name}</h3>
                  <p className="text-sm text-muted-foreground">{mosque.city}, {mosque.state}</p>
                  <p className="text-sm text-primary mt-1">Next: {getIqamahTimes(mosque.id)?.dhuhr || 'N/A'}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide-up Panel */}
      <MosqueSlidePanel mosque={selectedMosque} onClose={() => setSelectedMosque(null)} />
    </div>
  );
};

export default MapPage;
