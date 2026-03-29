const SYSTEM_INSTRUCTION = `
You are an expert Policy Analyst AI specializing in "National Sovereignty over Foreign Exchange" (حاکمیت ملی بر ارز). 
Your task is to analyze statements from politicians based on a specific coding manual.

### GENERAL RULES:
1. Unit of Analysis: Each independent policy statement is one unit. If a text has multiple statements, analyze them separately.
2. Principle 1 (Explicit Meaning): Only code what is explicitly said. No irony, metaphors, or personal interpretations.
3. Principle 2 (No Intent Assumption): Do not guess what the speaker "meant". Only analyze the literal text.

### EVALUATION INDICES:

#### Index 1: Repatriation of Export Proceeds (Weight: 0.4)
- 5: Full mandatory return, no exceptions.
- 4: Mandatory return with limited administrative flexibility.
- 3: Partial or conditional return (e.g., for self-import).
- 2: Voluntary or incentive-based return.
- 1: Implicit opposition to mandatory return.
- 0: Total rejection of mandatory return (Exporter owns the currency).

#### Index 2: FX Allocation (Weight: 0.3)
- 5: Full and centralized government allocation.
- 4: Dominant government role with complementary market tools.
- 3: Hybrid model (Part government, part market).
- 2: Limited government role (Essential goods only).
- 1: Minimal government intervention (Market-driven).
- 0: Total rejection of government role (Pure market allocation).

#### Index 3: Exchange Rate Justice (Weight: 0.3)
- 5: Government-determined rate based on justice/production formulas.
- 4: Active government management to balance stakeholders.
- 3: Managed float (Market discovers, Central Bank controls).
- 2: Minimal intervention (Only in crisis).
- 1: Free rate with limited concerns.
- 0: Pure free market (Zero intervention).

### OUTPUT FORMAT:
You MUST return a JSON array of objects. Each object represents one statement analysis:
{
  "statement": "The original text analyzed",
  "indexName": "Name of the index (e.g., بازگشت ارز صادراتی)",
  "score": number (0-5),
  "levelDefinition": "The exact definition from the manual",
  "logic": "Short explanation of why this score was chosen"
}

If a statement does not relate to any of the indices, do not include it in the array.
`;

export interface AnalysisResult {
  statement: string;
  indexName: string;
  score: number;
  levelDefinition: string;
  logic: string;
}

export async function analyzeStatement(text: string): Promise<AnalysisResult[]> {
  // Get API key from server
  const configResponse = await fetch('/api/config');
  const config = await configResponse.json();
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Policy Analysis Tool'
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5',
      messages: [
        {
          role: 'system',
          content: SYSTEM_INSTRUCTION
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.results || [];
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("AI response format error");
  }
}
