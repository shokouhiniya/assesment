const SYSTEM_INSTRUCTION = `
You are an expert Policy Analyst AI specializing in "National Sovereignty over Foreign Exchange" (حاکمیت ملی بر ارز). 
Your task is to analyze statements from politicians based on a specific coding manual.

CRITICAL: You MUST respond in Persian (Farsi) language. All fields including levelDefinition and logic MUST be in Persian.

### GENERAL RULES:
1. Unit of Analysis: Each independent policy statement is one unit. If a text has multiple statements, analyze them separately.
2. Principle 1 (Explicit Meaning): Only code what is explicitly said. No irony, metaphors, or personal interpretations.
3. Principle 2 (No Intent Assumption): Do not guess what the speaker "meant". Only analyze the literal text.

### EVALUATION INDICES:

#### Index 1: Repatriation of Export Proceeds (بازگشت ارز صادراتی) (Weight: 0.4)
- 5: بازگشت کامل و اجباری، بدون استثنا
- 4: بازگشت اجباری با انعطاف اداری محدود
- 3: بازگشت جزئی یا مشروط (مثلاً برای واردات خود)
- 2: بازگشت داوطلبانه یا مبتنی بر مشوق
- 1: مخالفت ضمنی با بازگشت اجباری
- 0: رد کامل بازگشت اجباری (ارز متعلق به صادرکننده است)

#### Index 2: FX Allocation (تخصیص و توزیع ارز) (Weight: 0.3)
- 5: تخصیص کامل و متمرکز توسط دولت
- 4: نقش غالب دولت با ابزارهای مکمل بازار
- 3: مدل ترکیبی (بخشی دولت، بخشی بازار)
- 2: نقش محدود دولت (فقط کالاهای اساسی)
- 1: حداقل مداخله دولت (بازار محور)
- 0: رد کامل نقش دولت (تخصیص خالص بازاری)

#### Index 3: Exchange Rate Justice (عدالت در نرخ‌گذاری) (Weight: 0.3)
- 5: نرخ تعیین شده توسط دولت بر اساس فرمول‌های عدالت/تولید
- 4: مدیریت فعال دولت برای تعادل ذینفعان
- 3: شناور مدیریت شده (بازار کشف می‌کند، بانک مرکزی کنترل می‌کند)
- 2: حداقل مداخله (فقط در بحران)
- 1: نرخ آزاد با نگرانی‌های محدود
- 0: بازار کاملاً آزاد (بدون مداخله)

### OUTPUT FORMAT:
You MUST return ONLY a valid JSON array with no additional text. ALL TEXT FIELDS MUST BE IN PERSIAN (FARSI).
Each object represents one statement analysis:
[
  {
    "statement": "متن اصلی که تحلیل شده (به فارسی)",
    "indexName": "نام شاخص (مثلاً: بازگشت ارز صادراتی)",
    "score": 4,
    "levelDefinition": "تعریف دقیق از دستنامه (به فارسی)",
    "logic": "توضیح کوتاه اینکه چرا این نمره انتخاب شد (به فارسی)"
  }
]

IMPORTANT: levelDefinition and logic MUST be written in Persian language.
If a statement does not relate to any of the indices, do not include it in the array.
Return ONLY the JSON array, no markdown, no explanation, just the JSON.
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
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: SYSTEM_INSTRUCTION
        },
        {
          role: 'user',
          content: `Analyze this statement and return ONLY a JSON array:\n\n${text}`
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('OpenRouter error:', errorData);
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    // Remove markdown code blocks if present
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : (parsed.results || []);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    console.error("Raw content:", content);
    throw new Error("AI response format error");
  }
}
