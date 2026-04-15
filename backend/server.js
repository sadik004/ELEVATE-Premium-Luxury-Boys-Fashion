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

  // Auto-initialize DB on Render Free plan
  console.log("Production environment detected. Initializing database...");
  exec("npx prisma db push", (err, stdout, stderr) => {
    if (err) {
      console.error("DB PUSH ERROR:", err);
      console.error(stderr);
      return;
    }
    console.log("DB PUSH SUCCESS:", stdout);

    exec("npm run seed", (seedErr, seedStdout, seedStderr) => {
      if (seedErr) {
        console.error("DB SEED ERROR:", seedErr);
        console.error(seedStderr);
        return;
      }
      console.log("DB SEED SUCCESS:", seedStdout);
    });
  });
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
