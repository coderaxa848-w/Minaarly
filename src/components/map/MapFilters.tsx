import { useState } from 'react';
import { cn } from '@/lib/utils';

const filters = [
  { id: 'nearMe', label: 'Near Me' },
  { id: 'openNow', label: 'Open Now' },
  { id: 'eventsToday', label: 'Events Today' },
  { id: 'jummah', label: 'Jummah' },
];

export function MapFilters() {
  const [active, setActive] = useState<string[]>(['nearMe']);

  const toggle = (id: string) => {
    setActive(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="flex gap-2 p-3 overflow-x-auto bg-background border-b">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => toggle(filter.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            active.includes(filter.id)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
