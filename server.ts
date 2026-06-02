import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "submissions.json");

// Parse Firebase configuration
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
if (!fs.existsSync(firebaseConfigPath)) {
  console.error("firebase-applet-config.json is missing. Please run set_up_firebase.");
  process.exit(1);
}
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize local backups submissions file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf8");
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "server-api-agent",
      email: "server-api@gamingcommunity.io"
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// API Routes
app.post("/", async (req, res, next) => {
  // If it's a Netlify Form submission
  if (req.body && req.body["form-name"] === "gaming-subscribers") {
    try {
      const email = req.body.email;
      const country = req.body.country;
      const botField = req.body["bot-field"];

      // Honeypot spam simulation detection
      if (botField && botField.trim() !== "") {
        console.warn("Spam subscription blocked via honeypot field:", botField);
        return res.json({ success: true, message: "Spam block simulated." });
      }

      // Server-side validation
      if (!email || typeof email !== "string") {
        return res.status(400).json({ success: false, error: "Email Address is required." });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: "Please provide a valid Email Address." });
      }

      if (!country || typeof country !== "string" || country.trim() === "") {
        return res.status(400).json({ success: false, error: "Country is required." });
      }

      // Read existing local file structure
      let submissions = [];
      try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        submissions = JSON.parse(data);
      } catch (e) {
        submissions = [];
      }

      // Duplicate submission prevention
      const exists = submissions.some(
        (sub: any) => sub.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (exists) {
        return res.status(409).json({
          success: false,
          error: "This Email Address is already registered in our gaming community!",
        });
      }

      // Save to Firestore matching our rules & blueprint
      const normalizedEmail = email.toLowerCase().trim();
      const subId = crypto.createHash("sha256").update(normalizedEmail).digest("hex");
      const subDocPath = `subscriptions/${subId}`;

      try {
        await setDoc(doc(db, "subscriptions", subId), {
          email: normalizedEmail,
          country: country,
          createdAt: Timestamp.now()
        });
      } catch (fsError: any) {
        if (fsError.message?.includes("PERMISSION_DENIED")) {
          return res.status(409).json({
            success: false,
            error: "This Email Address is already registered in our gaming community!",
          });
        }
        handleFirestoreError(fsError, OperationType.WRITE, subDocPath);
      }

      // Capture local subscription backup
      const newSubscription = {
        email: normalizedEmail,
        country,
        timestamp: new Date().toISOString(),
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      };

      submissions.push(newSubscription);
      fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), "utf8");

      return res.json({
        success: true,
        message: "Thank you for joining our gaming community!",
      });

    } catch (error: any) {
      console.error("Local simulated Netlify Form handling error:", error);
      return res.status(500).json({
        success: false,
        error: "An error occurred on the server processing simulated Netlify request.",
      });
    }
  }

  // Not a Netlify Form, pass through to other middleware/routing
  next();
});

// Legacy direct API Routes
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email, country } = req.body;

    // Server-side validation
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, error: "Email Address is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: "Please provide a valid Email Address." });
    }

    if (!country || typeof country !== "string" || country.trim() === "") {
      return res.status(400).json({ success: false, error: "Country is required." });
    }

    // Read existing local file
    let submissions = [];
    try {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      submissions = JSON.parse(data);
    } catch (e) {
      submissions = [];
    }

    // Duplicate submission prevention (case-insensitive email)
    const exists = submissions.some(
      (sub: any) => sub.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        error: "This Email Address is already registered in our gaming community!",
      });
    }

    // Enforce hash-based ID to ensure the write is classified as "create" by security rules
    // and naturally fails with Permission Denied if it already exists (updates aren't allowed)
    const normalizedEmail = email.toLowerCase().trim();
    const subId = crypto.createHash("sha256").update(normalizedEmail).digest("hex");
    const subDocPath = `subscriptions/${subId}`;

    try {
      // Create firestore entry matching our strict schema in firebase-blueprint and firestore.rules
      await setDoc(doc(db, "subscriptions", subId), {
        email: normalizedEmail,
        country: country,
        createdAt: Timestamp.now()
      });
    } catch (fsError: any) {
      // This will capture duplicate submission error or security rules failures
      if (fsError.message?.includes("PERMISSION_DENIED")) {
        return res.status(409).json({
          success: false,
          error: "This Email Address is already registered in our gaming community!",
        });
      }
      handleFirestoreError(fsError, OperationType.WRITE, subDocPath);
    }

    // Capture local subscription backup
    const newSubscription = {
      email: normalizedEmail,
      country,
      timestamp: new Date().toISOString(),
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
    };

    submissions.push(newSubscription);
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), "utf8");

    return res.json({
      success: true,
      message: "Thank you for joining our gaming community!",
    });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred on the server. Please try again.",
    });
  }
});

// Stats query
app.get("/api/subscriptions/count", (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ count: 1250 }); // Starting seed
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const submissions = JSON.parse(data);
    return res.json({ count: 1250 + submissions.length });
  } catch (e) {
    return res.json({ count: 1250 });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
