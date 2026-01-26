import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedMosque {
  name: string;
  address: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  madhab: string | null;
  facilities: string[];
  lineNumber: number;
  rawLine: string;
}

interface ParseError {
  lineNumber: number;
  rawLine: string;
  error: string;
}

// Parse capacity and flags from format like [250WArabDeob]
function parseCapacityAndFlags(flags: string): { capacity: number | null; madhab: string | null; hasWomen: boolean } {
  let capacity: number | null = null;
  let madhab: string | null = null;
  let hasWomen = false;

  // Extract capacity - number at start, optionally followed by W
  const capacityMatch = flags.match(/^(\d+)/);
  if (capacityMatch) {
    capacity = parseInt(capacityMatch[1], 10);
  }

  // Check for women's facilities (W after number)
  hasWomen = /\d+W/.test(flags);

  // Check for madhab indicators
  if (flags.includes('Deob')) {
    madhab = 'Deobandi';
  } else if (flags.includes('Brel')) {
    madhab = 'Barelvi';
  } else if (flags.includes('Salf')) {
    madhab = 'Salafi';
  } else if (flags.includes('Shia')) {
    madhab = 'Shia';
  }

  return { capacity, madhab, hasWomen };
}

// Parse a single CSV line
function parseCsvLine(line: string, lineNumber: number): ParsedMosque | ParseError {
  try {
    // Match: longitude,latitude,"*[flags]Name. Address. Phone","City,Postcode-ID:N"
    const regex = /^(-?\d+\.?\d*),(-?\d+\.?\d*),"(.+)","(.+)"$/;
    const match = line.match(regex);

    if (!match) {
      return { lineNumber, rawLine: line, error: 'Line does not match expected format' };
    }

    const longitude = parseFloat(match[1]);
    const latitude = parseFloat(match[2]);
    const infoColumn = match[3];
    const locationColumn = match[4];

    // Parse info column: *[flags]Name. Address. Phone
    // Remove leading * if present
    const cleanInfo = infoColumn.startsWith('*') ? infoColumn.substring(1) : infoColumn;

    // Extract flags from brackets
    const flagsMatch = cleanInfo.match(/^\[([^\]]*)\]/);
    const flags = flagsMatch ? flagsMatch[1] : '';
    const afterFlags = flagsMatch ? cleanInfo.substring(flagsMatch[0].length) : cleanInfo;

    // Parse capacity and madhab from flags
    const { madhab, hasWomen } = parseCapacityAndFlags(flags);

    // Split by periods to get name, address, phone
    const parts = afterFlags.split('.');
    const name = parts[0]?.trim() || '';
    const address = parts[1]?.trim() || '';
    const phone = parts[2]?.trim() || null;

    if (!name) {
      return { lineNumber, rawLine: line, error: 'Could not extract mosque name' };
    }

    // Parse location column: City,Postcode-ID:N
    const locationParts = locationColumn.split(',');
    const city = locationParts[0]?.trim() || '';
    
    // Extract postcode before -ID:
    const postcodeSection = locationParts.slice(1).join(',');
    const postcodeMatch = postcodeSection.match(/^([^-]+)/);
    const postcode = postcodeMatch ? postcodeMatch[1].trim() : '';

    if (!city || !postcode) {
      return { lineNumber, rawLine: line, error: 'Could not extract city or postcode' };
    }

    // Build facilities array
    const facilities: string[] = [];
    if (hasWomen) {
      facilities.push('womens_area');
    }

    return {
      name,
      address: address || `${postcode}, ${city}`,
      city,
      postcode,
      latitude,
      longitude,
      phone: phone && phone.length > 0 ? phone : null,
      madhab,
      facilities,
      lineNumber,
      rawLine: line,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown parsing error';
    return { lineNumber, rawLine: line, error: errorMessage };
  }
}

// Check if result is an error
function isParseError(result: ParsedMosque | ParseError): result is ParseError {
  return 'error' in result;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvText, dryRun = false } = await req.json();

    if (!csvText || typeof csvText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'csvText is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Split into lines, skip header if present
    const lines = csvText.split('\n').filter((line: string) => line.trim().length > 0);
    
    // Skip first line if it looks like a header
    const startIndex = lines[0]?.includes('longitude') || lines[0]?.includes('Longitude') ? 1 : 0;

    const parsed: ParsedMosque[] = [];
    const errors: ParseError[] = [];

    // Parse all lines
    for (let i = startIndex; i < lines.length; i++) {
      const result = parseCsvLine(lines[i], i + 1);
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
          totalLines: lines.length - startIndex,
          parsedCount: parsed.length,
          errorCount: errors.length,
          preview: parsed.slice(0, 10),
          errors: errors.slice(0, 20),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execute actual import
    const inserted: string[] = [];
    const insertErrors: { name: string; error: string }[] = [];
    const batchSize = 50;

    // Process in batches
    for (let i = 0; i < parsed.length; i += batchSize) {
      const batch = parsed.slice(i, i + batchSize);
      
      for (const mosque of batch) {
        try {
          // Generate slug using RPC
          const { data: slugData, error: slugError } = await supabase.rpc('generate_slug', {
            name: mosque.name,
            city: mosque.city,
          });

          if (slugError) {
            insertErrors.push({ name: mosque.name, error: `Slug generation failed: ${slugError.message}` });
            continue;
          }

          const slug = slugData || mosque.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

          // Insert mosque
          const { error: insertError } = await supabase.from('mosques').upsert({
            name: mosque.name,
            address: mosque.address,
            city: mosque.city,
            postcode: mosque.postcode,
            latitude: mosque.latitude,
            longitude: mosque.longitude,
            phone: mosque.phone,
            madhab: mosque.madhab,
            facilities: mosque.facilities,
            slug,
            is_verified: false,
          }, {
            onConflict: 'slug',
            ignoreDuplicates: false,
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
        totalLines: lines.length - startIndex,
        parsedCount: parsed.length,
        parseErrors: errors.length,
        insertedCount: inserted.length,
        insertErrorCount: insertErrors.length,
        insertErrors: insertErrors.slice(0, 50),
        parseErrorSamples: errors.slice(0, 10),
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
