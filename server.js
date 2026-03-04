const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs");

// Load .env locally (Render ignores .env by default; you set vars in Render dashboard)
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"index.html"));
});
// Determine public folder path (works on local and Render)
const publicPath = (() => {
  const localPath = path.join(__dirname, "public");
  const parentPath = path.join(__dirname, "..", "public");
  return fs.existsSync(localPath) ? localPath : parentPath;
})();

// Body parsers
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true }));

// Static files from /public
app.use(express.static(publicPath, { extensions: ["html"] }));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Contact form -> SMTP
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    // Env vars (set these in Render -> Environment)
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || "true") === "true";

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = process.env.TO_EMAIL;

    if (!smtpUser || !smtpPass || !toEmail) {
      return res.status(500).json({
        error:
          "Email not configured. Set SMTP_USER, SMTP_PASS, and TO_EMAIL in environment variables."
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: smtpPort,
      secure, // true for 465, false for 587
      auth: { user: smtpUser, pass: smtpPass }
    });

    // Basic sanitization
    const safe = (s) => String(s || "").replace(/[<>]/g, "").trim();

    await transporter.sendMail({
      from: `ChooseYourGameMode <${smtpUser}>`,
      to: toEmail,
      replyTo: safe(email),
      subject: `[ChooseYourGameMode] ${safe(subject)}`,
      text: `New message from ChooseYourGameMode

Name: ${safe(name)}
Email: ${safe(email)}
Subject: ${safe(subject)}

Message:
${safe(message)}
`
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({ error: "Email failed to send. Check SMTP settings." });
  }
});

// SPA fallback (must be AFTER express.static)
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`ChooseYourGameMode running on port ${PORT}`);
});