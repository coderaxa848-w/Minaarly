

# Switch Prayer Time Extraction to Direct Gemini API

## Why
- Use your own `GEMINI_API_KEY` (already configured in Supabase secrets) with the free `gemini-2.0-flash-exp` model
- No vendor lock-in, no Lovable credit costs
- `fileUri` means Gemini fetches the image directly from the public Supabase Storage URL -- zero memory usage in the edge function

## Changes

### 1. Edge Function: `supabase/functions/extract-prayer-times/index.ts`

Replace the Lovable AI Gateway call with a direct Gemini REST API call:

- Switch from `LOVABLE_API_KEY` to `GEMINI_API_KEY`
- Use the Gemini `generateContent` endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={API_KEY}`
- Pass the image via `fileData.fileUri` (public Supabase Storage URL) instead of downloading/encoding
- Convert the OpenAI-style tool definition to Gemini's native `functionDeclarations` format
- Convert `tool_choice` to Gemini's `tool_config` with `function_calling_config: { mode: "ANY", allowed_function_names: ["extract_prayer_times"] }`
- Parse the response from Gemini's native format (`candidates[0].content.parts[0].functionCall.args`) instead of OpenAI format

Key payload structure:
```text
{
  contents: [{
    parts: [
      { fileData: { mimeType: "image/...", fileUri: "<public_url>" } },
      { text: "<prompt>" }
    ]
  }],
  tools: [{ functionDeclarations: [...] }],
  tool_config: { function_calling_config: { mode: "ANY", allowed_function_names: ["extract_prayer_times"] } },
  generationConfig: { maxOutputTokens: 8192 }
}
```

- Keep all existing validation logic (validateTime, validateDayOrder) unchanged
- Keep the temp file cleanup logic unchanged
- Keep auth checking logic unchanged

### 2. Frontend: Add Client-Side Image Compression (Optional Enhancement)

In `src/pages/MosqueDashboard.tsx`, compress images before uploading to `temp-uploads`:

- Add a `compressImage` utility that uses the Canvas API (no extra dependency needed) to resize to max 1920px and convert to JPEG at 0.6 quality
- Apply compression in `handleExtract()` before the storage upload
- Skip compression for PDFs (only compress image types)
- This reduces file size by ~70-80%, making uploads faster and AI processing quicker

### 3. Determine MIME Type for fileUri

The edge function will infer the MIME type from the `file_type` field already sent from the frontend (e.g., `image/jpeg`, `image/png`, `application/pdf`). This gets passed into the `fileData.mimeType` field.

## What stays the same
- All prompt logic, tool schema, validation, temp file cleanup, auth checks
- The `GEMINI_API_KEY` secret is already configured in Supabase
- The `temp-uploads` bucket is already public (required for `fileUri` access)

## Risk / Considerations
- `gemini-2.0-flash-exp` is an experimental model -- Google may deprecate it. Fallback: switch to `gemini-2.0-flash` (still very cheap at ~$5/year for your usage)
- If Google changes the free tier, you just update the model name in one line
- The `LOVABLE_API_KEY` reference and gateway code will be fully removed from this function

