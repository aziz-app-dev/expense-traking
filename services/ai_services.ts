import { TransactionType } from "@/constants/model";
import { expenseCategories, incomeCategories } from "@/constants/data";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type ReportPeriod = "Weekly" | "Monthly" | "Yearly";

type AiResult = { success: boolean; report?: string; msg?: string };

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
  userPrompt: string
): Promise<AiResult> => {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    return { success: false, msg: "AI key is not configured." };
  }

  try {
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
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log("Groq API error:", response.status, errText);
      return {
        success: false,
        msg: `AI request failed (${response.status}). Please try again.`,
      };
    }

    const json = await response.json();
    const report = json?.choices?.[0]?.message?.content?.trim();
    if (!report) {
      return { success: false, msg: "AI returned an empty response." };
    }
    return { success: true, report };
  } catch (error: any) {
    console.log("callGroq error:", error);
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
): Promise<AiResult> => {
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

  const lines = history
    .map(
      (b) =>
        `- ${b.label}: income Rs. ${b.income.toLocaleString()}, expense Rs. ${b.expense.toLocaleString()}, net Rs. ${(
          b.income - b.expense
        ).toLocaleString()}`
    )
    .join("\n");

  const prompt =
    `You are a financial forecasting assistant. Below is the user's recent per-${unit} ` +
    `history (oldest first, amounts in Pakistani Rupees, "Rs."):\n\n${lines}\n\n` +
    `Based on these trends, forecast the UPCOMING ${unit}. Use these exact headings:\n` +
    `Predicted Income: a single Rs. estimate.\n` +
    `Predicted Expense: a single Rs. estimate.\n` +
    `Predicted Net: a single Rs. estimate (income minus expense).\n` +
    `Trend: 1-2 sentences on the direction (rising, falling or steady) with reasoning from the data.\n` +
    `Watch Out: 1-2 potential overspending risks.\n` +
    `Advice: 2 short tips to improve next ${unit}.\n\n` +
    `Base estimates on the trend of the numbers above. Keep it under 170 words. Do not use markdown symbols like # or *.`;

  return callGroq(
    "You are a careful financial forecasting assistant. Base every prediction on the historical numbers provided and explain your reasoning briefly.",
    prompt
  );
};
