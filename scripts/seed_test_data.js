// One-off seed script: creates test wallets + transactions for the tester account.
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} = require("firebase/auth");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Credentials can be overridden via env vars, e.g.:
//   SEED_EMAIL=test@user.com SEED_PASSWORD=112233 node scripts/seed_test_data.js
const EMAIL = process.env.SEED_EMAIL || "tester@gmail.com";
const PASSWORD = process.env.SEED_PASSWORD || "112233";
const NAME = process.env.SEED_NAME || "Tester";
const PLACEHOLDER_IMG =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFL7FzcxN7XMRjk0YOQ9br_bt_kLNYg0ZP8g&s";

// wallet -> list of transactions. daysAgo controls the date spread so the
// Weekly (0-6d), Monthly (this month) and Yearly (spread across months) charts
// all have data.
const SEED = {
  Cash: [
    // This week
    { type: "income", cat: "salary", amount: 60000, des: "Monthly salary", daysAgo: 3 },
    { type: "income", cat: "freelance", amount: 12000, des: "Freelance gig", daysAgo: 5 },
    { type: "expense", cat: "groceries", amount: 3000, des: "Groceries", daysAgo: 1 },
    { type: "expense", cat: "dining", amount: 1500, des: "Dinner out", daysAgo: 2 },
    { type: "expense", cat: "transportation", amount: 900, des: "Fuel", daysAgo: 4 },
    { type: "expense", cat: "entertainment", amount: 2200, des: "Movie night", daysAgo: 6 },
    // Earlier this month
    { type: "expense", cat: "groceries", amount: 2500, des: "Groceries", daysAgo: 10 },
  ],
  Bank: [
    // This month
    { type: "income", cat: "business", amount: 85000, des: "Business payout", daysAgo: 8 },
    { type: "expense", cat: "rent", amount: 25000, des: "Apartment rent", daysAgo: 8 },
    { type: "expense", cat: "utilities", amount: 4500, des: "Electricity bill", daysAgo: 9 },
    // Previous months (for the Yearly view)
    { type: "income", cat: "business", amount: 90000, des: "Business payout", daysAgo: 38 },
    { type: "expense", cat: "rent", amount: 25000, des: "Apartment rent", daysAgo: 38 },
    { type: "expense", cat: "health", amount: 6000, des: "Pharmacy", daysAgo: 40 },
    { type: "income", cat: "business", amount: 80000, des: "Business payout", daysAgo: 70 },
    { type: "expense", cat: "rent", amount: 25000, des: "Apartment rent", daysAgo: 70 },
    { type: "income", cat: "investments", amount: 15000, des: "Stock dividend", daysAgo: 100 },
    { type: "expense", cat: "clothing", amount: 8000, des: "Shopping", daysAgo: 105 },
    { type: "expense", cat: "insurance", amount: 5000, des: "Car insurance", daysAgo: 135 },
  ],
  Savings: [
    { type: "income", cat: "salary", amount: 20000, des: "Monthly saving", daysAgo: 15 },
    { type: "income", cat: "interest", amount: 3000, des: "Bank interest", daysAgo: 165 },
    { type: "expense", cat: "others", amount: 2000, des: "Emergency use", daysAgo: 185 },
  ],
};

function dateDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 1. Authenticate (create the account if it doesn't exist yet).
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
    console.log("Signed in as", EMAIL);
  } catch (e) {
    console.log("Sign-in failed (", e.code, ") — creating the account...");
    cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    await setDoc(doc(db, "users", cred.user.uid), {
      name: NAME,
      email: EMAIL,
      uid: cred.user.uid,
    });
    console.log("Created account", EMAIL);
  }
  const uid = cred.user.uid;
  console.log("UID:", uid);

  // 2. For each wallet, compute totals and write wallet + its transactions.
  for (const [walletName, txns] of Object.entries(SEED)) {
    let total = 0; // total income
    let totalExpances = 0; // total expense
    for (const t of txns) {
      if (t.type === "income") total += t.amount;
      else totalExpances += t.amount;
    }
    const amount = total - totalExpances;

    const walletRef = doc(collection(db, "wallets"));
    await setDoc(walletRef, {
      name: walletName,
      amount,
      total,
      totalExpances,
      image: null,
      uid,
      create: Timestamp.fromDate(new Date()),
    });
    console.log(
      `Wallet "${walletName}" -> id=${walletRef.id} amount=${amount} income=${total} expense=${totalExpances}`
    );

    for (const t of txns) {
      const txRef = doc(collection(db, "transaction"));
      await setDoc(txRef, {
        type: t.type,
        amount: t.amount,
        cat: t.cat,
        des: t.des,
        date: Timestamp.fromDate(dateDaysAgo(t.daysAgo)),
        uid,
        walletId: walletRef.id,
        image: PLACEHOLDER_IMG,
      });
      console.log(`  + ${t.type} ${t.cat} ${t.amount} (${t.des})`);
    }
  }

  console.log(
    `\nDone. Seeded ${Object.keys(SEED).length} wallets and ${Object.values(SEED).flat().length} transactions for ${EMAIL}.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
