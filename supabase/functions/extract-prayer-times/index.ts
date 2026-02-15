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

const extractionTool = {
  type: "function" as const,
  function: {
    name: "extract_prayer_times",
    description: "Submit the extracted prayer timetable data",
    parameters: {
      type: "object",
      properties: {
        month: {
          type: "string",
          description: "Month name e.g. January, February, Ramadan",
        },
        year: { type: "integer", description: "Year e.g. 2026" },
        monthly_times: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: {
                    type: "string",
                    description: "Date in YYYY-MM-DD format",
                  },
                  day: {
                    type: "string",
                    description: "Day of week lowercase",
                  },
                  prayers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        prayer: {
                          type: "string",
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
                          type: ["string", "null"],
                          description: "Adhan time HH:MM or null",
                        },
                        iqamah: {
                          type: ["string", "null"],
                          description: "Iqamah time HH:MM or null",
                        },
                      },
                      required: ["prayer", "adhan", "iqamah"],
                    },
                  },
                  jumuah: {
                    type: ["string", "null"],
                    description: "Jumuah time HH:MM if Friday, else null",
                  },
                },
                required: ["date", "day", "prayers"],
              },
            },
          },
          required: ["days"],
        },
        special_dates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              name: { type: "string" },
              notes: { type: "string" },
            },
          },
        },
        warnings: {
          type: "array",
          items: { type: "string" },
          description:
            "Any warnings about missing data, unreadable times, or assumptions made",
        },
      },
      required: ["month", "year", "monthly_times", "warnings"],
    },
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt
    const prompt = buildPrompt(madhab_preference || null, mode || "single");

    // Use Lovable AI Gateway (OpenAI-compatible) - passes image URL directly, no download needed
    const gatewayPayload = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: file_url },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      tools: [extractionTool],
      tool_choice: { type: "function", function: { name: "extract_prayer_times" } },
      max_tokens: 8192,
    };

    const gatewayRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gatewayPayload),
    });

    if (!gatewayRes.ok) {
      const errText = await gatewayRes.text();
      console.error("AI Gateway error:", gatewayRes.status, errText);

      if (gatewayRes.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in a minute." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (gatewayRes.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: "AI extraction failed. Please try again or use a clearer image." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gatewayData = await gatewayRes.json();

    // Extract tool call result (OpenAI format)
    const toolCall = gatewayData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function?.name !== "extract_prayer_times") {
      console.error("No tool call in AI response:", JSON.stringify(gatewayData));
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not extract prayer times from this image. Please ensure it shows a clear prayer timetable.",
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let extracted;
    try {
      extracted = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      return new Response(
        JSON.stringify({ success: false, error: "AI returned invalid data. Please try again." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
