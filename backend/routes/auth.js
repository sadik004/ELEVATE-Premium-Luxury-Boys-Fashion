const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const requireAuth = require("../middleware/auth");
const { sendOtpEmail, sendResetPasswordEmail } = require("../utils/email");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`
);

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Server Error fetching profile" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let user = await prisma.user.findUnique({ where: { email } });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user && !user.isVerified) {
       user = await prisma.user.update({
         where: { email },
         data: {
           password: hashedPassword,
           name,
           otpCode,
           otpExpiry
         }
       });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          otpCode,
          otpExpiry,
          isVerified: false
        },
      });
    }

    try {
      await sendOtpEmail(email, otpCode);
    } catch (emailError) {
      console.error("Failed to send OTP email, proceeding anyway in dev", emailError);
      // In a real production app, you might want to return an error here.
      // But for dev testing without SMTP configured yet, we let it pass.
    }

    res.status(201).json({ message: "Registration successful. Please verify your email.", email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otpCode !== otpCode || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const verifiedUser = await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null
      }
    });

    const token = jwt.sign(
      { userId: verifiedUser.id },
      process.env.JWT_SECRET,
    );

    res.json({
      message: "Email verified successfully",
      token,
      user: { id: verifiedUser.id, email: verifiedUser.email, name: verifiedUser.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first", requiresVerification: true });
    }

    if (!user.password) {
       return res.status(400).json({ message: "Please log in using your social account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await sendResetPasswordEmail(email, resetLink);
    } catch (emailError) {
      console.error("Failed to send reset email", emailError);
    }

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Google OAuth
router.get("/google", (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }

  try {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          isVerified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: { googleId, isVerified: true },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.redirect(`${frontendUrl}/auth-success?token=${token}`);
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

// Facebook OAuth
router.get("/facebook", (req, res) => {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/facebook/callback`;
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=email,public_profile`;
  res.redirect(url);
});

router.get("/facebook/callback", async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const redirectUri = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/facebook/callback`;

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }

  try {
    const tokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        fields: "id,name,email",
        access_token: accessToken,
      },
    });

    const { id: facebookId, email, name } = profileResponse.data;

    if (!email) {
       return res.redirect(`${frontendUrl}/login?error=facebook_email_missing`);
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          facebookId,
          isVerified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: { facebookId, isVerified: true },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.redirect(`${frontendUrl}/auth-success?token=${token}`);
  } catch (error) {
    console.error("Facebook OAuth Error:", error.response ? error.response.data : error.message);
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

module.exports = router;
