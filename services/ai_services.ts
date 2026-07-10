import { TransactionType } from "@/constants/model";
import { expenseCategories, incomeCategories } from "@/constants/data";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type ReportPeriod = "Weekly" | "Monthly" | "Yearly";

type AiResult = { success: boolean; report?: string; msg?: string };

export type ForecastBucket = { label: string; income: number; expense: number };

export type ForecastResult = AiResult & {
  history?: ForecastBucket[];
  prediction?: { income: number; expense: number; net: number };
};

const catLabel = (type?: string, cat?: string) => {
  const categories = type === "income" ? incomeCategories : expenseCategories;
  return categories[cat ?? "others"]?.label ?? cat ?? "Others";
};

const getDate = (date: any): Date => {
  if (!date) return new Date(0);
  if (date.seconds) return new Date(date.seconds * 1000);
  if (date.toDate) return date.toDate();
  if (date instanceof Date) return date;
  return new Date(date);
};

// Shared Groq chat-completion call.
const callGroq = async (
  systemPrompt: string,
  userPrompt: string,
  opts?: { json?: boolean }
): Promise<AiResult> => {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();

  // Log key presence (masked) — helps diagnose env-loading issues on device.
  console.log(
    `[AI] callGroq → key present: ${!!apiKey}, length: ${apiKey?.length ?? 0}, ` +
      `prefix: ${apiKey ? apiKey.slice(0, 4) : "n/a"}`
  );

  if (!apiKey) {
    console.log(
      "[AI] EXPO_PUBLIC_GROQ_API_KEY is missing at runtime. " +
        "Add it to .env and restart the dev server with a cleared cache: npx expo start -c"
    );
    return {
      success: false,
      msg: "AI key not loaded. Restart the app with: npx expo start -c",
    };
  }

  try {
    console.log(`[AI] POST ${GROQ_API_URL} (model: ${GROQ_MODEL})`);
    const startedAt = Date.now();
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
        ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    console.log(
      `[AI] response status: ${response.status} (${Date.now() - startedAt}ms)`
    );

    if (!response.ok) {
      const errText = await response.text();
      console.log("[AI] Groq API error body:", errText);
      return {
        success: false,
        msg: `AI request failed (${response.status}). Please try again.`,
      };
    }

    const json = await response.json();
    const report = json?.choices?.[0]?.message?.content?.trim();
    console.log(
      `[AI] success. tokens: ${json?.usage?.total_tokens ?? "?"}, ` +
        `chars: ${report?.length ?? 0}`
    );
    if (!report) {
      return { success: false, msg: "AI returned an empty response." };
    }
    return { success: true, report };
  } catch (error: any) {
    console.log("[AI] callGroq network/exception error:", error?.message, error);
    return {
      success: false,
      msg: error?.message || "Could not reach the AI service.",
    };
  }
};

// Build a compact, aggregated summary so we don't ship raw docs to the model.
const buildSummary = (transactions: TransactionType[]) => {
  let income = 0;
  let expense = 0;
  const incomeByCat: Record<string, number> = {};
  const expenseByCat: Record<string, number> = {};

  transactions.forEach((t) => {
    const amount = Number(t.amount) || 0;
    if (t.type === "income") {
      income += amount;
      const label = catLabel("income", t.cat);
      incomeByCat[label] = (incomeByCat[label] || 0) + amount;
    } else {
      expense += amount;
      const label = catLabel("expense", t.cat);
      expenseByCat[label] = (expenseByCat[label] || 0) + amount;
    }
  });

  const toLines = (obj: Record<string, number>) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([label, amt]) => `- ${label}: Rs. ${amt.toLocaleString()}`)
      .join("\n") || "- None";

  return (
    `Total income: Rs. ${income.toLocaleString()}\n` +
    `Total expense: Rs. ${expense.toLocaleString()}\n` +
    `Net balance: Rs. ${(income - expense).toLocaleString()}\n` +
    `Number of transactions: ${transactions.length}\n\n` +
    `Income by category:\n${toLines(incomeByCat)}\n\n` +
    `Expense by category:\n${toLines(expenseByCat)}`
  );
};

// Group transactions into recent time buckets (oldest -> newest) for trends.
const buildHistory = (
  period: ReportPeriod,
  transactions: TransactionType[]
) => {
  const now = new Date();
  const buckets: { label: string; start: Date; end: Date; income: number; expense: number }[] = [];

  if (period === "Weekly") {
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      buckets.push({ label: i === 0 ? "This week" : `${i}w ago`, start, end, income: 0, expense: 0 });
    }
  } else if (period === "Monthly") {
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        label: start.toLocaleString("en-US", { month: "short", year: "numeric" }),
        start,
        end,
        income: 0,
        expense: 0,
      });
    }
  } else {
    for (let i = 2; i >= 0; i--) {
      const y = now.getFullYear() - i;
      buckets.push({ label: `${y}`, start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1), income: 0, expense: 0 });
    }
  }

  transactions.forEach((t) => {
    const d = getDate(t.date);
    const b = buckets.find((bk) => d >= bk.start && d < bk.end);
    if (b) {
      if (t.type === "income") b.income += Number(t.amount) || 0;
      else b.expense += Number(t.amount) || 0;
    }
  });

  return buckets;
};

export const generateReport = async (
  period: ReportPeriod,
  transactions: TransactionType[]
): Promise<AiResult> => {
  console.log(
    `[AI] generateReport → period: ${period}, transactions: ${transactions?.length ?? 0}`
  );
  if (!transactions || transactions.length === 0) {
    return {
      success: false,
      msg: `No transactions found for this ${period.toLowerCase()} period.`,
    };
  }

  const prompt =
    `You are a friendly personal-finance assistant. Based on the ${period.toLowerCase()} ` +
    `financial data below (amounts are in Pakistani Rupees, "Rs."), write a short, ` +
    `encouraging report for the user.\n\n` +
    `Data:\n${buildSummary(transactions)}\n\n` +
    `Write the report using these sections with these exact headings:\n` +
    `Overview: 2-3 sentences summarizing income, expense and net balance.\n` +
    `Top Spending: the biggest expense categories and what stands out.\n` +
    `Savings: whether they saved or overspent, with the amount.\n` +
    `Tips: 2-3 short, practical, personalized suggestions.\n\n` +
    `Keep it under 180 words. Be concrete and reference the actual numbers. Do not use markdown symbols like # or *.`;

  return callGroq(
    "You are a concise, supportive personal finance assistant. Never invent numbers that are not in the data.",
    prompt
  );
};

export const generateForecast = async (
  period: ReportPeriod,
  transactions: TransactionType[]
): Promise<ForecastResult> => {
  console.log(
    `[AI] generateForecast → period: ${period}, transactions: ${transactions?.length ?? 0}`
  );
  if (!transactions || transactions.length === 0) {
    return { success: false, msg: "Not enough history to forecast yet." };
  }

  const history = buildHistory(period, transactions);
  const hasData = history.some((b) => b.income > 0 || b.expense > 0);
  if (!hasData) {
    return { success: false, msg: "Not enough history to forecast yet." };
  }

  const unit =
    period === "Weekly" ? "week" : period === "Monthly" ? "month" : "year";

  // Compact numeric history for both the model and the chart.
  const chartHistory: ForecastBucket[] = history.map((b) => ({
    label: b.label,
    income: Math.round(b.income),
    expense: Math.round(b.expense),
  }));

  const lines = chartHistory
    .map(
      (b) =>
        `- ${b.label}: income ${b.income}, expense ${b.expense}, net ${b.income - b.expense}`
    )
    .join("\n");

  const prompt =
    `You are a financial forecasting assistant. Below is the user's recent per-${unit} ` +
    `history (oldest first, amounts are plain numbers in Pakistani Rupees):\n\n${lines}\n\n` +
    `Based on these trends, forecast the UPCOMING ${unit}. Respond with ONLY a JSON object ` +
    `with these exact keys:\n` +
    `"predictedIncome": number (plain number, no commas),\n` +
    `"predictedExpense": number (plain number, no commas),\n` +
    `"trend": string (1-2 sentences on the direction with reasoning from the data),\n` +
    `"watchOut": string (1-2 potential overspending risks),\n` +
    `"advice": string (2 short tips to improve next ${unit}).\n` +
    `Base the numeric estimates on the trend of the numbers above.`;

  const res = await callGroq(
    "You are a careful financial forecasting assistant that replies only with valid JSON. Base every prediction on the historical numbers provided.",
    prompt,
    { json: true }
  );

  if (!res.success || !res.report) {
    return { success: false, msg: res.msg, history: chartHistory };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(res.report);
  } catch {
    console.log("[AI] forecast JSON parse failed:", res.report);
    // Still show the raw text and the history chart.
    return { success: true, report: res.report, history: chartHistory };
  }

  const income = Math.max(0, Math.round(Number(parsed.predictedIncome) || 0));
  const expense = Math.max(0, Math.round(Number(parsed.predictedExpense) || 0));
  const net = income - expense;

  const report =
    `Predicted Income: Rs. ${income.toLocaleString()}\n` +
    `Predicted Expense: Rs. ${expense.toLocaleString()}\n` +
    `Predicted Net: Rs. ${net.toLocaleString()}\n` +
    `Trend: ${parsed.trend ?? "—"}\n` +
    `Watch Out: ${parsed.watchOut ?? "—"}\n` +
    `Advice: ${parsed.advice ?? "—"}`;

  return {
    success: true,
    report,
    history: chartHistory,
    prediction: { income, expense, net },
  };
};
