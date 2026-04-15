require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { exec } = require("child_process");
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

  // Auto-initialize DB on startup for Render Free plan
  if (process.env.NODE_ENV === "production") {
    console.log("Running automated DB initialization...");

    // Run Prisma DB push automatically
    exec("npx prisma db push --accept-data-loss", (err, stdout, stderr) => {
      console.log("DB PUSH:", stdout || stderr || err);

      if (!err) {
        // Run seed script after successful push
        exec("npm run seed", (seedErr, seedStdout, seedStderr) => {
          console.log("SEED:", seedStdout || seedStderr || seedErr);
        });
      }
    });
  }
});
