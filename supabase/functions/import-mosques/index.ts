import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MosqueImport {
  name: string;
  city: string;
  address: string;
  postcode: string | null;
  longitude: number;
  latitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  capacity: number | null;
  has_womens_section: boolean | null;
  usage_type: 'regular' | 'jummah_only' | 'no_jummah' | 'irregular' | 'community_center';
  is_multi_faith: boolean;
  madhab: string | null;
  management: string | null;
  social_links: Record<string, string | undefined>;
  contact_page: string | null;
  facilities: string[];
  lineNumber: number;
}

interface ParseError {
  lineNumber: number;
  rawLine: string;
  error: string;
}

// Clean a value - return null for "Unavailable", "not available", empty, etc.
function cleanValue(val: string | undefined): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'unavailable' ||
    trimmed.toLowerCase() === 'not available' ||
    trimmed.toLowerCase() === 'not known'
  ) {
    return null;
  }
  return trimmed;
}

// Clean a URL - only accept valid http/https URLs, handle multiple URLs
function cleanUrl(val: string | undefined): string | null {
  const cleaned = cleanValue(val);
  if (!cleaned) return null;

  // Handle multiple URLs separated by space or %20
  const urls = cleaned.split(/\s+|%20+/).filter((u) => u.startsWith('http://') || u.startsWith('https://'));
  if (urls.length > 0) {
    return urls[0].trim();
  }
  return null;
}

// Map usage code to database value
function mapUsage(val: string | undefined): 'regular' | 'jummah_only' | 'no_jummah' | 'irregular' | 'community_center' {
  const v = cleanValue(val);
  if (!v) return 'regular';
  if (v === 'J') return 'jummah_only';
  if (v === 'NJ') return 'no_jummah';
  if (v === 'Irreg') return 'irregular';
  return 'regular';
}

// Map women code to boolean
function mapWomens(val: string | undefined): boolean | null {
  const v = cleanValue(val);
  if (!v) return null;
  if (v === 'W') return true;
  if (v === 'NoW') return false;
  return null;
}

// Map theme/madhab abbreviation to full name
function mapMadhab(val: string | undefined): string | null {
  const v = cleanValue(val);
  if (!v) return null;
  const mapping: Record<string, string> = {
    Deob: 'Deobandi',
    Brel: 'Barelvi',
    Salf: 'Salafi',
    Arab: 'Arab',
    Maud: 'Maududi',
  };
  return mapping[v] || v;
}

// Get first phone from comma/semicolon separated list
function cleanPhone(val: string | undefined): string | null {
  const cleaned = cleanValue(val);
  if (!cleaned) return null;
  const phones = cleaned.split(/[,;]/);
  const first = phones[0]?.trim();
  return first && first.length > 0 ? first : null;
}

// Get first email from comma separated list
function cleanEmail(val: string | undefined): string | null {
  const cleaned = cleanValue(val);
  if (!cleaned) return null;
  const emails = cleaned.split(',');
  const first = emails[0]?.trim();
  return first && first.length > 0 ? first : null;
}

// Parse a CSV line handling quoted values with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Generate slug from name + postcode with collision suffix handling
function generateBaseSlug(name: string, postcode: string | null): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (postcode) {
    const cleanPostcode = postcode.toLowerCase().replace(/\s+/g, '');
    slug += '-' + cleanPostcode;
  }

  return slug;
}

// Parse a single CSV line into MosqueImport
function parseCsvLine(line: string, lineNumber: number): MosqueImport | ParseError {
  try {
    const values = parseCSVLine(line);

    // CSV columns: id(0), name(1), mosque_area(2), address(3), postcode(4), lon(5), lat(6),
    // phone(7), capacity(8), women(9), usage(10), multi(11), theme(12), management(13),
    // website(14), email(15), phone_enhanced(16), website_enhanced(17), facebook(18),
    // instagram(19), youtube(20), twitter(21), linkedin(22), contact_page(23)

    const name = cleanValue(values[1]);
    if (!name) {
      return { lineNumber, rawLine: line, error: 'Missing mosque name' };
    }

    const longitude = parseFloat(values[5]);
    const latitude = parseFloat(values[6]);

    if (isNaN(longitude) || isNaN(latitude)) {
      return { lineNumber, rawLine: line, error: 'Invalid coordinates' };
    }

    const hasWomens = mapWomens(values[9]);
    const facilities: string[] = hasWomens === true ? ['womens_area'] : [];

    // Build social links object, only including non-null values
    const socialLinks: Record<string, string | undefined> = {};
    const facebook = cleanUrl(values[18]);
    const instagram = cleanUrl(values[19]);
    const youtube = cleanUrl(values[20]);
    const twitter = cleanUrl(values[21]);
    const linkedin = cleanUrl(values[22]);

    if (facebook) socialLinks.facebook = facebook;
    if (instagram) socialLinks.instagram = instagram;
    if (youtube) socialLinks.youtube = youtube;
    if (twitter) socialLinks.twitter = twitter;
    if (linkedin) socialLinks.linkedin = linkedin;

    return {
      name,
      city: cleanValue(values[2]) || '',
      address: cleanValue(values[3]) || '',
      postcode: cleanValue(values[4]),
      longitude,
      latitude,
      phone: cleanPhone(values[7]),
      capacity: values[8] ? parseInt(values[8], 10) || null : null,
      has_womens_section: hasWomens,
      usage_type: mapUsage(values[10]),
      is_multi_faith: values[11] === 'True',
      madhab: mapMadhab(values[12]),
      management: cleanValue(values[13]),
      website: cleanUrl(values[14]),
      email: cleanEmail(values[15]),
      social_links: socialLinks,
      contact_page: cleanUrl(values[23]),
      facilities,
      lineNumber,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown parsing error';
    return { lineNumber, rawLine: line, error: errorMessage };
  }
}

function isParseError(result: MosqueImport | ParseError): result is ParseError {
  return 'error' in result;
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
      return new Response(
        JSON.stringify({ error: 'csvText is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Split into lines, skip header
    const allLines = csvText.split('\n').filter((line: string) => line.trim().length > 0);

    // Skip header row
    const headerOffset = 1;

    // Apply startLine and maxLines for chunked imports
    const startIndex = headerOffset + startLine;
    const endIndex = Math.min(startIndex + maxLines, allLines.length);
    const lines = allLines.slice(startIndex, endIndex);

    const parsed: MosqueImport[] = [];
    const errors: ParseError[] = [];

    // Parse all lines in this chunk
    for (let i = 0; i < lines.length; i++) {
      const actualLineNumber = startIndex + i + 1;
      const result = parseCsvLine(lines[i], actualLineNumber);
      if (isParseError(result)) {
        errors.push(result);
      } else {
        parsed.push(result);
      }
    }

    // If dry run, return parsed data without inserting
    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          totalLines: allLines.length - headerOffset,
          processedRange: { start: startLine, end: startLine + lines.length },
          parsedCount: parsed.length,
          errorCount: errors.length,
          preview: parsed.slice(0, 10),
          errors: errors.slice(0, 20),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing slugs to handle collisions
    const { data: existingSlugs } = await supabase
      .from('mosques')
      .select('slug');

    const slugSet = new Set((existingSlugs || []).map((m: { slug: string }) => m.slug));

    // Insert mosques
    const inserted: string[] = [];
    const insertErrors: { name: string; error: string }[] = [];
    const batchSize = 50;

    for (let i = 0; i < parsed.length; i += batchSize) {
      const batch = parsed.slice(i, i + batchSize);

      for (const mosque of batch) {
        try {
          // Generate unique slug with collision handling
          let slug = generateBaseSlug(mosque.name, mosque.postcode);
          let counter = 1;

          while (slugSet.has(slug)) {
            counter++;
            slug = generateBaseSlug(mosque.name, mosque.postcode) + '-' + counter;
          }
          slugSet.add(slug);

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
            has_womens_section: mosque.has_womens_section,
            usage_type: mosque.usage_type,
            is_multi_faith: mosque.is_multi_faith,
            management: mosque.management,
            social_links: Object.keys(mosque.social_links).length > 0 ? mosque.social_links : {},
            contact_page: mosque.contact_page,
            slug,
            is_verified: false,
          });

          if (insertError) {
            insertErrors.push({ name: mosque.name, error: insertError.message });
          } else {
            inserted.push(mosque.name);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          insertErrors.push({ name: mosque.name, error: errorMessage });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dryRun: false,
        totalLines: allLines.length - headerOffset,
        processedRange: { start: startLine, end: startLine + lines.length },
        parsedCount: parsed.length,
        parseErrors: errors.length,
        insertedCount: inserted.length,
        insertErrorCount: insertErrors.length,
        insertErrors: insertErrors.slice(0, 50),
        parseErrorSamples: errors.slice(0, 10),
        hasMore: endIndex < allLines.length,
        nextStartLine: startLine + lines.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Import error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
