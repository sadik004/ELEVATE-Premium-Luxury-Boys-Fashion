require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

// Enforce strict environment variables in production
if (process.env.NODE_ENV === "production") {
  const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL", "FRONTEND_URL"];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error(`FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(", ")}`);
    process.exit(1);
  }

  // Auto-initialize DB on Render Free plan
  (async () => {
    console.log("Production environment detected. Initializing database...");
    try {
      console.log("DB push started");
      const { stdout: pushStdout } = await execPromise("npx prisma db push --accept-data-loss");
      console.log("DB push success", pushStdout);

      console.log("Seeding started");
      const { stdout: seedStdout } = await execPromise("npm run seed");
      console.log("Seeding success", seedStdout);
    } catch (error) {
      console.error("Database setup failed:", error);
    }
  })();
}

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "ELEVATE API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
