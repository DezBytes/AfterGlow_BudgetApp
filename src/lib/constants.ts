export const STORAGE_KEY = "money-matrix-transactions";
export const BUDGET_STORAGE_KEY = "money-matrix-budget";
export const CATEGORY_BUDGETS_KEY = "money-matrix-category-budgets";

export const CATEGORIES = [
  "Utilities",
  "Groceries",
  "Gas",
  "Dining",
  "Entertainment",
  "Shopping",
  "Income",
  "Other",
] as const;

export type CategoryType = (typeof CATEGORIES)[number];

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Utilities: "#a855f7",
  Groceries: "#00ff88",
  Gas: "#00f5ff",
  Dining: "#ff9500",
  Entertainment: "#e040fb",
  Shopping: "#00bfff",
  Income: "#22c55e",
  Other: "#94a3b8",
};

// MCC (Merchant Category Code) to app category mapping
export const MCC_CATEGORIES: Record<string, string> = {
  "5411": "Groceries", "5422": "Groceries", "5441": "Groceries", "5451": "Groceries", "5462": "Groceries",
  "5541": "Gas", "5542": "Gas",
  "5812": "Dining", "5813": "Dining", "5814": "Dining",
  "4814": "Utilities", "4899": "Utilities", "4900": "Utilities", "7393": "Utilities",
  "7911": "Entertainment", "7922": "Entertainment", "7929": "Entertainment", "7932": "Entertainment",
  "7933": "Entertainment", "7941": "Entertainment", "7991": "Entertainment", "7993": "Entertainment",
  "7994": "Entertainment", "7996": "Entertainment", "7997": "Entertainment", "7998": "Entertainment",
  "7999": "Entertainment", "5815": "Entertainment", "5816": "Entertainment", "5817": "Entertainment",
  "5818": "Entertainment",
  "5200": "Shopping", "5211": "Shopping", "5231": "Shopping", "5251": "Shopping", "5261": "Shopping",
  "5300": "Shopping", "5310": "Shopping", "5311": "Shopping", "5331": "Shopping", "5399": "Shopping",
  "5651": "Shopping", "5691": "Shopping", "5699": "Shopping", "5732": "Shopping", "5733": "Shopping",
  "5912": "Shopping", "5921": "Shopping", "5941": "Shopping", "5942": "Shopping", "5943": "Shopping",
  "5944": "Shopping", "5945": "Shopping", "5946": "Shopping", "5947": "Shopping", "5948": "Shopping",
  "5949": "Shopping", "5970": "Shopping", "5971": "Shopping", "5972": "Shopping", "5977": "Shopping",
  "5978": "Shopping",
};

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Utilities: [
    "electric", "power co", "energy", "water", "sewer", "internet",
    "comcast", "xfinity", "att*", "att ", "at&t", "t-mobile", "tmobile", "verizon",
    "spectrum", "cox", "utility", "utilities", "trash", "waste",
    "alabama power", "vivint", "bill payment",
  ],
  Groceries: [
    "grocery", "groceries", "wm supercenter", "walmart", "wal-mart", "target",
    "kroger", "publix", "aldi", "lidl", "trader joe", "whole foods", "costco",
    "sam's club", "sams club", "food lion", "piggly", "winn dixie",
    "safeway", "albertsons", "heb", "h-e-b", "meijer", "wegmans",
    "sprouts", "supermarket",
  ],
  Gas: [
    "shell oil", "shell ", "exxon", "chevron", "bp ", "citgo", "sunoco",
    "marathon", "speedway", "quiktrip", "qt ", "wawa", "racetrac", "raceway",
    "circle k", "fuel", "gasoline", "gas station", "valero",
    "murphy", "sheetz", "pilot", "loves travel", "thorntons",
  ],
  Dining: [
    "restaurant", "mcdonald", "burger", "wendy", "chick-fil", "chickfila",
    "taco bell", "subway", "starbucks", "dunkin", "pizza", "chipotle",
    "panda express", "popeyes", "sonic", "arby", "chili", "applebee",
    "olive garden", "ihop", "waffle", "denny", "panera", "zaxby",
    "grubhub", "doordash", "uber eats", "ubereats", "postmates",
    "dining", "cafe", "coffee", "grill", "diner", "eatery",
    "bakery", "bistro", "steakhouse", "sushi", "wing", "bbq",
    "trussville social", "mizuwa",
  ],
  Entertainment: [
    "netflix", "hulu", "disney", "spotify", "apple music", "hbo",
    "paramount", "peacock", "youtube", "amazon prime", "audible",
    "xbox", "playstation", "nintendo", "twitch", "microsoft*xbox",
    "movie", "cinema", "theater", "theatre", "amc ", "regal",
    "concert", "ticket", "ticketmaster", "live nation",
    "bowling", "arcade", "golf", "gym", "fitness", "crunch",
  ],
  Shopping: [
    "amazon", "ebay", "etsy", "best buy", "bestbuy",
    "home depot", "lowes", "lowe's", "ikea", "wayfair",
    "nordstrom", "macy", "jcpenney", "kohl", "tj maxx", "tjmaxx",
    "marshalls", "ross", "old navy", "zara", "h&m",
    "nike", "adidas", "foot locker", "dick's", "academy",
    "dollar", "family dollar", "dollar tree", "five below",
    "walgreens", "cvs", "apple com",
  ],
  Income: [
    "direct deposit", "payroll", "salary", "wages", "pay check", "paycheck",
    "ach deposit", "ach credit", "employer", "refund", "tax refund",
    "irs", "venmo", "zelle", "cash app", "transfer from",
    "interest earned", "dividend", "reimbursement",
  ],
};

export function extractMCC(rawDescription: string): string | null {
  const match = rawDescription.match(/Merchant Category Code:\s*(\d{4})/);
  return match ? match[1] : null;
}

export function cleanDescription(rawDescription: string): string {
  const firstLine = rawDescription.split("\n")[0].trim();
  return firstLine.replace(/\s{2,}\d+$/, "").replace(/\s+/g, " ").trim();
}

export function categorizeDescription(rawDescription: string): string {
  const mcc = extractMCC(rawDescription);
  if (mcc && MCC_CATEGORIES[mcc]) {
    return MCC_CATEGORIES[mcc];
  }
  const lower = rawDescription.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "Other";
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

// User-facing display: flips sign so deposits show as +$ and expenses as -$
export function formatDisplayAmount(internalAmount: number): string {
  const abs = Math.abs(internalAmount);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (internalAmount < 0) {
    // Negative internally = deposit/income → show as positive with +
    return `+$${formatted}`;
  }
  // Positive internally = expense → show as negative with -
  return `-$${formatted}`;
}
