import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, targetFormat } = await req.json();

    if (!code || !targetFormat) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: code and targetFormat' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = targetFormat === 'typescript' 
      ? `You are an expert JavaScript to TypeScript migration assistant. Your task is to convert legacy JavaScript code to modern TypeScript with proper type definitions.

Rules:
1. Convert var to const/let appropriately
2. Convert prototype-based classes to ES6 class syntax with TypeScript
3. Add explicit type annotations for function parameters, return types, and variables
4. Create interfaces for object shapes
5. Use modern ES6+ features: arrow functions, destructuring, template literals, spread operator
6. Add access modifiers (public, private, protected) where appropriate
7. Use optional chaining (?.) and nullish coalescing (??) where beneficial
8. Convert CommonJS require/module.exports to ES6 import/export
9. Add proper JSDoc comments where helpful
10. Ensure the code is production-ready and follows TypeScript best practices

Return ONLY the converted code, no explanations.`
      : `You are an expert JavaScript migration assistant. Your task is to convert legacy JavaScript code to modern ES6+ syntax.

Rules:
1. Convert var to const/let appropriately
2. Convert prototype-based classes to ES6 class syntax
3. Use arrow functions where appropriate
4. Use template literals instead of string concatenation
5. Use destructuring where beneficial
6. Use spread operator and rest parameters
7. Convert callbacks to async/await where possible
8. Use Array methods like .find(), .filter(), .map() instead of for loops
9. Convert CommonJS require/module.exports to ES6 import/export
10. Use optional chaining (?.) and nullish coalescing (??) where beneficial

Return ONLY the converted code, no explanations.`;

    console.log(`Processing migration request: ${code.length} chars, target: ${targetFormat}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Convert the following JavaScript code:\n\n${code}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const migratedCode = data.choices?.[0]?.message?.content;

    if (!migratedCode) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to generate migrated code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up code blocks if AI wrapped them in markdown
    let cleanCode = migratedCode.trim();
    if (cleanCode.startsWith('```')) {
      cleanCode = cleanCode.replace(/^```(?:typescript|javascript|ts|js)?\n?/, '').replace(/\n?```$/, '');
    }

    console.log(`Migration successful: ${cleanCode.length} chars output`);

    return new Response(
      JSON.stringify({ migratedCode: cleanCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in migrate-code function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
