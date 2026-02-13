import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MosqueImport {
  name: string;
  city: string;
  address: string;
  postcode: string | null;
  longitude: number | null;
  latitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  capacity: number | null;
  usage_type: string;
  is_multi_faith: boolean;
  madhab: string | null;
  management: string | null;
  social_links: Record<string, string | undefined>;
  contact_page: string | null;
  facilities: string[];
  denomination: string | null;
  established: string | null;
  wudu_facilities: string | null;
  womens_wudu: string | null;
  iftar_facilities: string | null;
  parking_type: string | null;
  parking_availability: string | null;
  wheelchair_prayer_hall: boolean;
  wheelchair_wudu: boolean;
  wheelchair_parking: boolean;
  tarawih_rakah: string | null;
  tarawih_type: string | null;
  qiyamul_layl: string | null;
  muslims_in_britain_data: boolean;
  services: string[];
  description: string | null;
  lineNumber: number;
}

interface ParseError {
  lineNumber: number;
  rawLine: string;
  error: string;
}

// Clean a value - return null for "Unavailable", "not available", "Not Available", empty, etc.
function cleanValue(val: string | undefined): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'unavailable' || trimmed.toLowerCase() === 'not available' || trimmed.toLowerCase() === 'not known') {
    return null;
  }
  return trimmed;
}

function cleanUrl(val: string | undefined): string | null {
  const cleaned = cleanValue(val);
  if (!cleaned) return null;
  const urls = cleaned.split(/\s+|%20+/).filter((u) => u.startsWith('http://') || u.startsWith('https://'));
  return urls.length > 0 ? urls[0].trim() : null;
}

function cleanPhone(val: string | undefined): string | null {
  const cleaned = cleanValue(val);
  if (!cleaned) return null;
  const first = cleaned.split(/[,;]/)[0]?.trim();
  return first && first.length > 0 ? first : null;
}

function cleanEmail(val: string | undefined): string | null {
  const cleaned = cleanValue(val);
  if (!cleaned) return null;
  const first = cleaned.split(',')[0]?.trim();
  return first && first.length > 0 ? first : null;
}

function mapWomens(val: string | undefined): boolean | null {
  const v = cleanValue(val);
  if (!v) return null;
  const lower = v.toLowerCase();
  if (lower === 'separate' || lower === 'shared' || lower === 'w' || lower === 'yes') return true;
  if (lower === 'now' || lower === 'no' || lower === 'may not be') return false;
  return null;
}

function mapUsage(val: string | undefined): string {
  const v = cleanValue(val);
  if (!v) return 'regular';
  if (v === 'J') return 'jummah_only';
  if (v === 'NJ') return 'no_jummah';
  if (v === 'Irreg') return 'irregular';
  return 'regular';
}

function mapMadhab(val: string | undefined): string | null {
  const v = cleanValue(val);
  if (!v) return null;
  const mapping: Record<string, string> = { Deob: 'Deobandi', Brel: 'Barelvi', Salf: 'Salafi', Arab: 'Arab', Maud: 'Maududi' };
  return mapping[v] || v;
}

function parseBool(val: string | undefined): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return v === 'true' || v === 'yes';
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += char; }
  }
  result.push(current);
  return result;
}

function generateBaseSlug(name: string, postcode: string | null): string {
  let slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (postcode) slug += '-' + postcode.toLowerCase().replace(/\s+/g, '');
  return slug;
}

async function getNextAvailableSlug(supabase: any, baseSlug: string, slugSet: Set<string>): Promise<string> {
  const { data } = await supabase.from('mosques').select('slug').like('slug', `${baseSlug}%`);
  if (data) for (const row of data) slugSet.add(row.slug);
  let slug = baseSlug;
  let counter = 1;
  while (slugSet.has(slug)) { counter++; slug = `${baseSlug}-${counter}`; }
  slugSet.add(slug);
  return slug;
}

// CSV v4 columns:
// 0:id, 1:name, 2:Denomination, 3:Established, 4:address, 5:area, 6:postcode,
// 7:lon, 8:lat, 9:capacity, 10:usage, 11:multi, 12:theme, 13:management,
// 14:Wudu Facilities, 15:women, 16:Women's Wudu, 17:Iftar Facilities,
// 18:Parking Type, 19:Parking Availability, 20:Prayer Hall Wheelchair,
// 21:Wudu Area Wheelchair, 22:Parking Area Wheelchair, 23:Tarawih Rakah,
// 24:Tarawih Type, 25:phone, 26:email, 27:website, 28:contact_page,
// 29:facebook, 30:instagram, 31:youtube, 32:twitter, 33:linkedin,
// 34:MuslimsInBritainData, 35:qiyamul_layl, 36:services, 37:description

function parseCsvLine(line: string, lineNumber: number): MosqueImport | ParseError {
  try {
    const v = parseCSVLine(line);

    const name = cleanValue(v[1]);
    if (!name) return { lineNumber, rawLine: line, error: 'Missing mosque name' };

    // Shia exclusion filter
    const denomination = cleanValue(v[2]);
    if (denomination && denomination.toLowerCase() === 'shia') {
      return { lineNumber, rawLine: line, error: 'Shia mosque excluded per policy' };
    }

    const lon = parseFloat(v[7]);
    const lat = parseFloat(v[8]);
    const hasCoords = !isNaN(lon) && !isNaN(lat) && lon !== 0 && lat !== 0;

    const hasWomens = mapWomens(v[15]);
    const facilities: string[] = [];
    if (hasWomens === true) facilities.push('womens_area');
    if (parseBool(v[20])) facilities.push('wheelchair');
    if (cleanValue(v[14])) facilities.push('wudu');
    if (cleanValue(v[18]) && cleanValue(v[18])!.toLowerCase() !== 'not available') facilities.push('parking');

    const socialLinks: Record<string, string | undefined> = {};
    const fb = cleanUrl(v[29]); if (fb) socialLinks.facebook = fb;
    const ig = cleanUrl(v[30]); if (ig) socialLinks.instagram = ig;
    const yt = cleanUrl(v[31]); if (yt) socialLinks.youtube = yt;
    const tw = cleanUrl(v[32]); if (tw) socialLinks.twitter = tw;
    const li = cleanUrl(v[33]); if (li) socialLinks.linkedin = li;

    // Parse services from comma-separated field
    const servicesRaw = cleanValue(v[36]);
    const services: string[] = servicesRaw ? servicesRaw.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

    return {
      name,
      city: cleanValue(v[5]) || '',
      address: cleanValue(v[4]) || '',
      postcode: cleanValue(v[6]),
      longitude: hasCoords ? lon : null,
      latitude: hasCoords ? lat : null,
      phone: cleanPhone(v[25]),
      capacity: v[9] ? parseInt(v[9], 10) || null : null,
      usage_type: mapUsage(v[10]),
      is_multi_faith: v[11] === 'True',
      madhab: mapMadhab(v[12]),
      management: cleanValue(v[13]),
      website: cleanUrl(v[27]),
      email: cleanEmail(v[26]),
      social_links: socialLinks,
      contact_page: cleanUrl(v[28]),
      facilities,
      denomination,
      established: cleanValue(v[3]),
      wudu_facilities: cleanValue(v[14]),
      womens_wudu: cleanValue(v[16]),
      iftar_facilities: cleanValue(v[17]),
      parking_type: cleanValue(v[18]),
      parking_availability: cleanValue(v[19]),
      wheelchair_prayer_hall: parseBool(v[20]),
      wheelchair_wudu: parseBool(v[21]),
      wheelchair_parking: parseBool(v[22]),
      tarawih_rakah: cleanValue(v[23]),
      tarawih_type: cleanValue(v[24]),
      qiyamul_layl: cleanValue(v[35]),
      muslims_in_britain_data: v[34] === 'True',
      services,
      description: cleanValue(v[37]),
      lineNumber,
    };
  } catch (err) {
    return { lineNumber, rawLine: line, error: err instanceof Error ? err.message : 'Unknown parsing error' };
  }
}

function isParseError(result: MosqueImport | ParseError): result is ParseError {
  return 'error' in result;
}

// Geocode postcodes missing coordinates via postcodes.io
async function geocodeMissing(mosques: MosqueImport[]): Promise<void> {
  const needGeocode = mosques.filter(m => m.latitude === null && m.postcode);
  if (needGeocode.length === 0) return;

  // Batch in groups of 100
  for (let i = 0; i < needGeocode.length; i += 100) {
    const batch = needGeocode.slice(i, i + 100);
    const postcodes = batch.map(m => m.postcode!.replace(/\s+/g, '').toUpperCase());

    try {
      const res = await fetch('https://api.postcodes.io/postcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcodes }),
      });
      const data = await res.json();
      if (data.status === 200 && data.result) {
        for (let j = 0; j < data.result.length; j++) {
          const r = data.result[j];
          if (r.result) {
            batch[j].latitude = r.result.latitude;
            batch[j].longitude = r.result.longitude;
          }
        }
      }
    } catch (_) { /* geocoding is best-effort */ }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvText, dryRun = false, startLine = 0, maxLines = 500 } = await req.json();

    if (!csvText || typeof csvText !== 'string') {
      return new Response(JSON.stringify({ error: 'csvText is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const allLines = csvText.split('\n').filter((line: string) => line.trim().length > 0);
    const headerOffset = 1;
    const startIndex = headerOffset + startLine;
    const endIndex = Math.min(startIndex + maxLines, allLines.length);
    const lines = allLines.slice(startIndex, endIndex);

    const parsed: MosqueImport[] = [];
    const errors: ParseError[] = [];

    for (let i = 0; i < lines.length; i++) {
      const result = parseCsvLine(lines[i], startIndex + i + 1);
      if (isParseError(result)) errors.push(result);
      else parsed.push(result);
    }

    // Geocode missing coordinates
    await geocodeMissing(parsed);

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true, dryRun: true,
        totalLines: allLines.length - headerOffset,
        processedRange: { start: startLine, end: startLine + lines.length },
        parsedCount: parsed.length, errorCount: errors.length,
        preview: parsed.slice(0, 10), errors: errors.slice(0, 20),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get existing slugs
    const { data: existingSlugs } = await supabase.from('mosques').select('slug');
    const slugSet = new Set((existingSlugs || []).map((m: { slug: string }) => m.slug));

    const inserted: string[] = [];
    const insertErrors: { name: string; error: string }[] = [];

    for (const mosque of parsed) {
      if (mosque.latitude === null || mosque.longitude === null) {
        insertErrors.push({ name: mosque.name, error: 'Missing coordinates after geocoding' });
        continue;
      }

      try {
        const baseSlug = generateBaseSlug(mosque.name, mosque.postcode);
        const slug = await getNextAvailableSlug(supabase, baseSlug, slugSet);

        const { error: insertError } = await supabase.from('mosques').insert({
          name: mosque.name,
          address: mosque.address || `${mosque.postcode || ''}, ${mosque.city}`.trim(),
          city: mosque.city,
          postcode: mosque.postcode || '',
          latitude: mosque.latitude,
          longitude: mosque.longitude,
          phone: mosque.phone,
          email: mosque.email,
          website: mosque.website,
          madhab: mosque.madhab,
          facilities: mosque.facilities,
          capacity: mosque.capacity,
          usage_type: mosque.usage_type,
          is_multi_faith: mosque.is_multi_faith,
          management: mosque.management,
          social_links: Object.keys(mosque.social_links).length > 0 ? mosque.social_links : {},
          contact_page: mosque.contact_page,
          denomination: mosque.denomination,
          established: mosque.established,
          wudu_facilities: mosque.wudu_facilities,
          womens_wudu: mosque.womens_wudu,
          iftar_facilities: mosque.iftar_facilities,
          parking_type: mosque.parking_type,
          parking_availability: mosque.parking_availability,
          wheelchair_prayer_hall: mosque.wheelchair_prayer_hall,
          wheelchair_wudu: mosque.wheelchair_wudu,
          wheelchair_parking: mosque.wheelchair_parking,
          tarawih_rakah: mosque.tarawih_rakah,
          tarawih_type: mosque.tarawih_type,
          qiyamul_layl: mosque.qiyamul_layl,
          muslims_in_britain_data: mosque.muslims_in_britain_data,
          services: mosque.services,
          description: mosque.description,
          slug,
          is_verified: false,
        });

        if (insertError) insertErrors.push({ name: mosque.name, error: insertError.message });
        else inserted.push(mosque.name);
      } catch (err) {
        insertErrors.push({ name: mosque.name, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    return new Response(JSON.stringify({
      success: true, dryRun: false,
      totalLines: allLines.length - headerOffset,
      processedRange: { start: startLine, end: startLine + lines.length },
      parsedCount: parsed.length, parseErrors: errors.length,
      insertedCount: inserted.length, insertErrorCount: insertErrors.length,
      insertErrors: insertErrors.slice(0, 50),
      parseErrorSamples: errors.slice(0, 10),
      hasMore: endIndex < allLines.length,
      nextStartLine: startLine + lines.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Import error:', err instanceof Error ? err.message : 'Unknown error');
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
