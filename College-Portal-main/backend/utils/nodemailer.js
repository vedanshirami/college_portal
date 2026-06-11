const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const user = process.env.NODEMAILER_EMAIL;
  const pass = process.env.NODEMAILER_PASS;

  if (!user || !pass) {
    throw new Error("Nodemailer is not configured (NODEMAILER_EMAIL/NODEMAILER_PASS missing)");
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = { sendEmail };
