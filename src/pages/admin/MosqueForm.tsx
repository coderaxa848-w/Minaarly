import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const FACILITIES = [
  'parking', 'wheelchair_access', 'wudu_facilities', 'womens_area',
  'funeral_services', 'marriage_services', 'quran_classes', 'islamic_school',
  'library', 'community_hall', 'youth_activities', 'sisters_circle'
];

const LANGUAGES = ['English', 'Arabic', 'Urdu', 'Bengali', 'Somali', 'Turkish', 'Gujarati', 'Punjabi'];

const MADHABS = ['Hanafi', 'Shafi', 'Maliki', 'Hanbali', 'Salafi', 'Deobandi', 'Barelvi', 'Other'];

const SERVICES = [
  { code: 'nikkah', label: 'Nikkah (Islamic Marriage)' },
  { code: 'hall_booking', label: 'Hall/Venue Booking' },
  { code: 'immigration_advice', label: 'Immigration Advice' },
  { code: 'counselling', label: 'Counselling Services' },
  { code: 'funeral', label: 'Funeral Services' },
  { code: 'zakat_collection', label: 'Zakat Collection' },
  { code: 'food_bank', label: 'Food Bank' },
];

interface FormData {
  name: string;
  address: string;
  city: string;
  county: string;
  postcode: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  madhab: string;
  facilities: string[];
  languages: string[];
  services: string[];
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean;
}

export default function MosqueForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    county: '',
    postcode: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    madhab: '',
    facilities: [],
    languages: [],
    services: [],
    latitude: null,
    longitude: null,
    is_verified: false,
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchMosque(id);
    }
  }, [id, isEditing]);

  async function fetchMosque(mosqueId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mosques')
        .select('*')
        .eq('id', mosqueId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: 'Error', description: 'Mosque not found', variant: 'destructive' });
        navigate('/admin/mosques');
        return;
      }

      setFormData({
        name: data.name,
        address: data.address,
        city: data.city,
        county: data.county || '',
        postcode: data.postcode,
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        madhab: data.madhab || '',
        facilities: data.facilities || [],
        languages: data.languages || [],
        services: (data as any).services || [],
        latitude: data.latitude,
        longitude: data.longitude,
        is_verified: data.is_verified || false,
      });
    } catch (error) {
      console.error('Error fetching mosque:', error);
      toast({ title: 'Error', description: 'Failed to load mosque', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function geocodePostcode() {
    if (!formData.postcode) return;

    setGeocoding(true);
    try {
      const response = await supabase.functions.invoke('geocode-postcode', {
        body: { postcode: formData.postcode },
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
        }));
        toast({ title: 'Success', description: 'Location geocoded successfully' });
      } else {
        toast({ title: 'Warning', description: data.error || 'Could not geocode postcode', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({ title: 'Error', description: 'Failed to geocode postcode', variant: 'destructive' });
    } finally {
      setGeocoding(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug for new mosques
      let slug = '';
      if (!isEditing) {
        const { data: slugData } = await supabase.rpc('generate_slug', {
          name: formData.name,
          city: formData.city,
        });
        slug = slugData || formData.name.toLowerCase().replace(/\s+/g, '-');
      }

      const baseMosqueData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        county: formData.county || null,
        postcode: formData.postcode,
        description: formData.description || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        madhab: formData.madhab || null,
        facilities: formData.facilities,
        languages: formData.languages,
        services: formData.services,
        latitude: formData.latitude,
        longitude: formData.longitude,
        is_verified: formData.is_verified,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('mosques')
          .update(baseMosqueData)
          .eq('id', id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Mosque updated successfully' });
      } else {
        const { error } = await supabase
          .from('mosques')
          .insert([{ ...baseMosqueData, slug }]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Mosque created successfully' });
      }

      navigate('/admin/mosques');
    } catch (error: any) {
      console.error('Error saving mosque:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save mosque',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleArrayItem(array: string[], item: string): string[] {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  }

  if (loading && isEditing) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/mosques')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Edit Mosque' : 'Add New Mosque'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update mosque details' : 'Create a new mosque entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Primary mosque details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="madhab">Madhab / Denomination</Label>
                <Select
                  value={formData.madhab}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, madhab: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select madhab" />
                  </SelectTrigger>
                  <SelectContent>
                    {MADHABS.map((m) => (
                      <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Address and coordinates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <div className="flex gap-2">
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={geocodePostcode}
                    disabled={geocoding || !formData.postcode}
                  >
                    {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : null }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : null }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
            <CardDescription>Select available facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FACILITIES.map((facility) => (
                <label
                  key={facility}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.facilities.includes(facility)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      facilities: toggleArrayItem(prev.facilities, facility)
                    }))}
                    className="sr-only"
                  />
                  <span className="text-sm capitalize">{facility.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Languages spoken at this mosque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <label
                  key={language}
                  className={`px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                    formData.languages.includes(language)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      languages: toggleArrayItem(prev.languages, language)
                    }))}
                    className="sr-only"
                  />
                  {language}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
            <CardDescription>Select services this mosque provides (or add custom)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES.map((service) => (
                <label
                  key={service.code}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.services.includes(service.code)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service.code)}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      services: toggleArrayItem(prev.services, service.code)
                    }))}
                    className="sr-only"
                  />
                  <span className="text-sm">{service.label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-service">Add Custom Service</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-service"
                  placeholder="e.g., Hifz Program"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const value = input.value.trim();
                      if (value && !formData.services.includes(value)) {
                        setFormData(prev => ({
                          ...prev,
                          services: [...prev.services, value]
                        }));
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
              {formData.services.filter(s => !SERVICES.find(srv => srv.code === s)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.services.filter(s => !SERVICES.find(srv => srv.code === s)).map((custom) => (
                    <span
                      key={custom}
                      className="px-3 py-1 rounded-full bg-secondary text-sm flex items-center gap-2"
                    >
                      {custom}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          services: prev.services.filter(s => s !== custom)
                        }))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verified</p>
                <p className="text-sm text-muted-foreground">Mark this mosque as verified</p>
              </div>
              <Switch
                checked={formData.is_verified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_verified: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/mosques')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gradient-teal">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Mosque' : 'Create Mosque'}
          </Button>
        </div>
      </form>
    </div>
  );
}
