import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildPrompt(madhab_preference: string | null, mode: string): string {
  return `You are an expert at reading Islamic prayer timetables from images and PDFs.

Extract ALL prayer times from this timetable image. For each day shown, extract:
- Date (normalise to YYYY-MM-DD format)
- Day of the week (lowercase: monday, tuesday, etc.)
- All 6 prayer times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
- For each prayer, extract both Adhan (start) time and Iqamah (congregation) time where shown
- Jumuah (Friday prayer) time if shown for that day
- All times must be in 24-hour HH:MM format

${madhab_preference ? `This mosque follows the ${madhab_preference} madhab. If there are two Asr times shown, use the ${madhab_preference === "hanafi" ? "later (Hanafi)" : "earlier (Shafi'i)"} Asr time.` : "If there are two Asr times (Hanafi/Shafi), extract both and note in warnings."}

Special instructions:
- If this is a Ramadan timetable, also look for Suhoor/Sehri end time and Iftar time
- Look for any special dates mentioned (Eid, Laylatul Qadr, etc.) and include them
- If a time is missing or unreadable, set it to null and add a warning
- If you cannot determine the month or year, make your best guess based on context and add a warning
- Normalise all dates to YYYY-MM-DD format
- Normalise all times to HH:MM 24-hour format
- The timetable typically shows one calendar month

${mode === "bulk" ? "This may contain multiple months. Extract ALL months found." : "Extract the single month shown."}

IMPORTANT: Call the extract_prayer_times function with your results.`;
}

// Gemini-native functionDeclarations format
const extractionTool = {
  name: "extract_prayer_times",
  description: "Submit the extracted prayer timetable data",
  parameters: {
    type: "OBJECT",
    properties: {
      month: {
        type: "STRING",
        description: "Month name e.g. January, February, Ramadan",
      },
      year: { type: "INTEGER", description: "Year e.g. 2026" },
      monthly_times: {
        type: "OBJECT",
        properties: {
          days: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                date: {
                  type: "STRING",
                  description: "Date in YYYY-MM-DD format",
                },
                day: {
                  type: "STRING",
                  description: "Day of week lowercase",
                },
                prayers: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      prayer: {
                        type: "STRING",
                        enum: [
                          "fajr",
                          "sunrise",
                          "dhuhr",
                          "asr",
                          "maghrib",
                          "isha",
                        ],
                      },
                      adhan: {
                        type: "STRING",
                        description: "Adhan time HH:MM or empty string if not shown",
                      },
                      iqamah: {
                        type: "STRING",
                        description: "Iqamah time HH:MM or empty string if not shown",
                      },
                    },
                    required: ["prayer", "adhan", "iqamah"],
                  },
                },
                jumuah: {
                  type: "STRING",
                  description: "Jumuah time HH:MM if Friday, else empty string",
                },
              },
              required: ["date", "day", "prayers"],
            },
          },
        },
        required: ["days"],
      },
      special_dates: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            date: { type: "STRING" },
            name: { type: "STRING" },
            notes: { type: "STRING" },
          },
        },
      },
      warnings: {
        type: "ARRAY",
        items: { type: "STRING" },
        description:
          "Any warnings about missing data, unreadable times, or assumptions made",
      },
    },
    required: ["month", "year", "monthly_times", "warnings"],
  },
};

function validateTime(time: string | null): boolean {
  if (!time) return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function validateDayOrder(
  prayers: Array<{ prayer: string; adhan: string | null; iqamah: string | null }>
): string[] {
  const warnings: string[] = [];
  const order = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  const times: (string | null)[] = [];

  for (const name of order) {
    const p = prayers.find((pr) => pr.prayer === name);
    times.push(p?.adhan || p?.iqamah || null);
  }

  for (let i = 0; i < times.length - 1; i++) {
    if (times[i] && times[i + 1] && times[i]! >= times[i + 1]!) {
      warnings.push(
        `${order[i]} (${times[i]}) is not before ${order[i + 1]} (${times[i + 1]})`
      );
    }
  }

  for (const p of prayers) {
    if (p.adhan && !validateTime(p.adhan)) {
      warnings.push(`Invalid adhan time format for ${p.prayer}: ${p.adhan}`);
    }
    if (p.iqamah && !validateTime(p.iqamah)) {
      warnings.push(`Invalid iqamah time format for ${p.prayer}: ${p.iqamah}`);
    }
  }

  return warnings;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { file_url, file_type, mosque_id, mosque_name, madhab_preference, mode } =
      await req.json();

    if (!file_url || !mosque_id) {
      return new Response(
        JSON.stringify({ success: false, error: "file_url and mosque_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt
    const prompt = buildPrompt(madhab_preference || null, mode || "single");

    // Determine MIME type from file_type sent by frontend
    const mimeType = file_type || "image/jpeg";

    // Direct Gemini REST API call using fileData.fileUri
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              fileData: {
                mimeType: mimeType,
                fileUri: file_url,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      tools: [
        {
          functionDeclarations: [extractionTool],
        },
      ],
      tool_config: {
        function_calling_config: {
          mode: "ANY",
          allowed_function_names: ["extract_prayer_times"],
        },
      },
      generationConfig: {
        maxOutputTokens: 8192,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);

      if (geminiRes.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in a minute." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "AI extraction failed. Please try again or use a clearer image." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();

    // Parse Gemini native response format
    const functionCall =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (!functionCall || functionCall.name !== "extract_prayer_times") {
      console.error("No function call in Gemini response:", JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not extract prayer times from this image. Please ensure it shows a clear prayer timetable.",
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gemini returns args as an object directly (not a JSON string)
    const extracted = functionCall.args;

    if (!extracted || !extracted.monthly_times) {
      console.error("Invalid extracted data:", JSON.stringify(functionCall));
      return new Response(
        JSON.stringify({ success: false, error: "AI returned invalid data. Please try again." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalise empty strings to null for consistency
    if (extracted.monthly_times?.days) {
      for (const day of extracted.monthly_times.days) {
        if (day.prayers) {
          for (const p of day.prayers) {
            if (p.adhan === "") p.adhan = null;
            if (p.iqamah === "") p.iqamah = null;
          }
          if (day.jumuah === "") day.jumuah = null;
        }
      }
    }

    // Validate extracted data
    const validationWarnings: string[] = [];
    if (extracted.monthly_times?.days) {
      for (const day of extracted.monthly_times.days) {
        if (day.prayers) {
          const dayWarnings = validateDayOrder(day.prayers);
          for (const w of dayWarnings) {
            validationWarnings.push(`${day.date}: ${w}`);
          }
        }
      }
    }

    const allWarnings = [
      ...(extracted.warnings || []),
      ...validationWarnings,
    ];

    // Delete temp file from storage
    try {
      const urlPath = new URL(file_url).pathname;
      const match = urlPath.match(/\/temp-uploads\/(.+)$/);
      if (match) {
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        await adminClient.storage.from("temp-uploads").remove([match[1]]);
      }
    } catch (e) {
      console.error("Failed to delete temp file:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        extracted: {
          month: extracted.month,
          year: extracted.year,
          monthly_times: extracted.monthly_times,
          special_dates: extracted.special_dates || [],
          warnings: allWarnings,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-prayer-times error:", e);
    return new Response(
      JSON.stringify({
        success: false,
        error: e instanceof Error ? e.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
