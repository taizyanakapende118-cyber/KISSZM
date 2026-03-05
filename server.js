const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

// Load .env locally only (Render uses dashboard env vars)
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Root folder is the project directory (since public/ is deleted)
const ROOT = __dirname;

// Body parsers (contact form)
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from ROOT (images, mp4, css inside HTML, etc.)
app.use(express.static(ROOT, { extensions: ["html"] }));

// Home
app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Contact form -> SMTP
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    // REQUIRED env vars (set in Render -> Environment)
    const smtpUser = process.env.SMTP_USER; // e.g. info@xplodemedia.com
    const smtpPass = process.env.SMTP_PASS; // mailbox password (or app password)
    const toEmail = process.env.TO_EMAIL;   // where to receive messages (often same as smtpUser)

    if (!smtpUser || !smtpPass || !toEmail) {
      return res.status(500).json({
        error:
          "Email not configured. Set SMTP_USER, SMTP_PASS, and TO_EMAIL in Render environment variables."
      });
    }

    // SMTP host/port defaults for Namecheap Private Email
    // (You can override these with env vars if using another provider)
    const host = process.env.SMTP_HOST || "mail.privateemail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || "true") === "true"; // true for 465

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass }
    });

    // lightweight sanitization
    const safe = (s) => String(s || "").replace(/[<>]/g, "").trim();

    await transporter.sendMail({
      from: `Website Contact <${smtpUser}>`,
      to: toEmail,
      replyTo: safe(email),
      subject: `[Xplode Media] ${safe(subject)}`,
      text:
        `New website message\n\n` +
        `Name: ${safe(name)}\n` +
        `Email: ${safe(email)}\n` +
        `Subject: ${safe(subject)}\n\n` +
        `Message:\n${safe(message)}\n`
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({ error: "Email failed to send. Check SMTP settings." });
  }
});

// Fallback to index.html (single-page style navigation)
app.get("*", (_req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
