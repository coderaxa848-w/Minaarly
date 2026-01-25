import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

const app = new Hono();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostcodeResult {
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  success: boolean;
  error?: string;
}

interface PostcodesIOResponse {
  status: number;
  result: {
    postcode: string;
    latitude: number;
    longitude: number;
    admin_district: string;
    parish: string;
    region: string;
  } | null;
}

interface BulkPostcodesIOResponse {
  status: number;
  result: Array<{
    query: string;
    result: {
      postcode: string;
      latitude: number;
      longitude: number;
    } | null;
  }>;
}

// Single postcode lookup
async function geocodeSingle(postcode: string): Promise<PostcodeResult> {
  const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
  
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`);
    const data: PostcodesIOResponse = await response.json();
    
    if (data.status === 200 && data.result) {
      return {
        postcode: data.result.postcode,
        latitude: data.result.latitude,
        longitude: data.result.longitude,
        success: true,
      };
    }
    
    return {
      postcode: cleanPostcode,
      latitude: null,
      longitude: null,
      success: false,
      error: 'Postcode not found',
    };
  } catch (error) {
    return {
      postcode: cleanPostcode,
      latitude: null,
      longitude: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Bulk postcode lookup (up to 100 postcodes)
async function geocodeBulk(postcodes: string[]): Promise<PostcodeResult[]> {
  const cleanPostcodes = postcodes.map(p => p.replace(/\s+/g, '').toUpperCase());
  
  try {
    const response = await fetch('https://api.postcodes.io/postcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcodes: cleanPostcodes }),
    });
    
    const data: BulkPostcodesIOResponse = await response.json();
    
    if (data.status === 200 && data.result) {
      return data.result.map((item) => {
        if (item.result) {
          return {
            postcode: item.result.postcode,
            latitude: item.result.latitude,
            longitude: item.result.longitude,
            success: true,
          };
        }
        return {
          postcode: item.query,
          latitude: null,
          longitude: null,
          success: false,
          error: 'Postcode not found',
        };
      });
    }
    
    return cleanPostcodes.map(postcode => ({
      postcode,
      latitude: null,
      longitude: null,
      success: false,
      error: 'Bulk lookup failed',
    }));
  } catch (error) {
    return cleanPostcodes.map(postcode => ({
      postcode,
      latitude: null,
      longitude: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
}

// Handle preflight requests
app.options('*', (c) => {
  return c.json({}, 200, corsHeaders);
});

// Single postcode endpoint
app.get('/single/:postcode', async (c) => {
  const postcode = c.req.param('postcode');
  
  if (!postcode) {
    return c.json({ error: 'Postcode is required' }, 400, corsHeaders);
  }
  
  const result = await geocodeSingle(postcode);
  return c.json(result, 200, corsHeaders);
});

// POST for single postcode
app.post('/single', async (c) => {
  try {
    const body = await c.req.json();
    const { postcode } = body;
    
    if (!postcode) {
      return c.json({ error: 'Postcode is required' }, 400, corsHeaders);
    }
    
    const result = await geocodeSingle(postcode);
    return c.json(result, 200, corsHeaders);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400, corsHeaders);
  }
});

// Bulk postcodes endpoint (POST only, up to 100 postcodes)
app.post('/bulk', async (c) => {
  try {
    const body = await c.req.json();
    const { postcodes } = body;
    
    if (!postcodes || !Array.isArray(postcodes)) {
      return c.json({ error: 'postcodes array is required' }, 400, corsHeaders);
    }
    
    if (postcodes.length > 100) {
      return c.json({ error: 'Maximum 100 postcodes per request' }, 400, corsHeaders);
    }
    
    const results = await geocodeBulk(postcodes);
    return c.json({ results }, 200, corsHeaders);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400, corsHeaders);
  }
});

// Default route handler
app.all('*', (c) => {
  return c.json({
    message: 'Geocode Postcode API',
    endpoints: {
      single: 'GET /single/:postcode or POST /single { postcode: "..." }',
      bulk: 'POST /bulk { postcodes: ["...", "..."] }',
    },
  }, 200, corsHeaders);
});

Deno.serve(app.fetch);
