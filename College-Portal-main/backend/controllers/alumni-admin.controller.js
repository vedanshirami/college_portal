const ApiResponse = require("../utils/ApiResponse");
const alumniDetails = require("../models/details/alumni-details.model");
const { sendAlumniCredentialsEmail } = require("../utils/sendgrid");
const { sendEmail } = require("../utils/nodemailer");
const { v4: uuidv4 } = require("uuid");

const createAlumniController = async (req, res) => {
  try {
    const { firstName, lastName, email: rawEmail, company, position, yearPassedOut, branch, bio, profile } = req.body;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;

    if (!firstName || !lastName || !email) {
      return ApiResponse.badRequest("firstName, lastName and email are required").send(res);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ApiResponse.badRequest("Invalid email format").send(res);
    }

    const existing = await alumniDetails.findOne({ email });
    if (existing) {
      return ApiResponse.conflict("Alumni with this email already exists").send(res);
    }

    // Per requirement: default password for new alumni accounts.
    // You can override via ALUMNI_DEFAULT_PASSWORD in .env.
    const tempPassword = process.env.ALUMNI_DEFAULT_PASSWORD || "alumni 123";

    const created = await alumniDetails.create({
      firstName,
      lastName,
      email,
      company,
      position,
      yearPassedOut,
      branch,
      bio,
      profile,
      password: tempPassword,
    });

    // Best-effort email: still create the account even if email fails.
    let emailSent = false;
    let emailProvider = null;
    let emailError = null;
    let emailMeta = null;

    const providerPref = String(process.env.ALUMNI_EMAIL_PROVIDER || "").trim().toLowerCase();
    try {
      if (providerPref === "nodemailer") {
        throw new Error("ALUMNI_EMAIL_PROVIDER=nodemailer (skipping SendGrid)");
      }

      const sgMeta = await sendAlumniCredentialsEmail({
        toEmail: email,
        firstName,
        loginEmail: email,
        tempPassword,
      });

      emailSent = true;
      emailProvider = "sendgrid";
      emailMeta = sgMeta;
    } catch (mailError) {
      if (providerPref && providerPref !== "sendgrid" && providerPref !== "nodemailer") {
        console.warn(`[ALUMNI_CREATE] Unknown ALUMNI_EMAIL_PROVIDER=${providerPref}; using default behavior`);
      }

      if (providerPref === "sendgrid") {
        console.error("Alumni credentials email (SendGrid) failed (forced):", mailError);
        emailError = mailError?.response?.body || mailError?.message || String(mailError);
      } else {
        console.error("Alumni credentials email (SendGrid) failed:", mailError);
        emailError = mailError?.response?.body || mailError?.message || String(mailError);
      }

      // Fallback to Nodemailer (Gmail) if configured
      try {
        if (providerPref === "sendgrid") {
          throw new Error("ALUMNI_EMAIL_PROVIDER=sendgrid (skipping Nodemailer fallback)");
        }
        const safeName = firstName || "there";
        const subject = "Your Alumni Account Credentials";
        const text = `Hi ${safeName},\n\nYour alumni account has been created.\n\nLogin Email: ${email}\nTemporary Password: ${tempPassword}\n\nPlease login and change your password after first sign-in.\n`;
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Your Alumni Account</h2>
            <p>Hi ${safeName},</p>
            <p>Your alumni account has been created.</p>
            <p><strong>Login Email:</strong> ${email}<br/>
            <strong>Temporary Password:</strong> ${tempPassword}</p>
            <p>Please login and change your password after first sign-in.</p>
          </div>
        `;
        await sendEmail({ to: email, subject, text, html });
        emailSent = true;
        emailProvider = "nodemailer";
        emailError = null;
        emailMeta = null;
      } catch (fallbackError) {
        console.error("Alumni credentials email (Nodemailer) failed:", fallbackError);
        emailError = emailError || fallbackError?.message || String(fallbackError);
      }
    }

    const responseData = {
      alumni: await alumniDetails.findById(created._id).select("-password -__v"),
      emailSent,
      emailProvider,
      ...(process.env.NODE_ENV !== "production" && emailMeta ? { emailMeta } : {}),
      ...(process.env.NODE_ENV !== "production" && emailError ? { emailError } : {}),
      ...(process.env.NODE_ENV !== "production" ? { tempPassword } : {}),
    };

    if (emailSent) {
      const metaStr = emailMeta?.messageId ? ` messageId=${emailMeta.messageId}` : "";
      console.log(`[ALUMNI_CREATE] credentials email sent via ${emailProvider} to ${email}${metaStr}`);
    } else {
      console.warn(`[ALUMNI_CREATE] credentials email NOT sent to ${email}${emailError ? `: ${String(emailError).slice(0, 200)}` : ""}`);
    }

    return ApiResponse.created(responseData, emailSent ? "Alumni created and email sent" : "Alumni created (email not sent)").send(res);
  } catch (error) {
    console.error("Create Alumni Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const listAlumniController = async (req, res) => {
  try {
    const alumni = await alumniDetails.find().select("-password -__v").sort({ createdAt: -1 });
    return ApiResponse.success(alumni, "Alumni list fetched").send(res);
  } catch (error) {
    console.error("List Alumni Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteAlumniController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return ApiResponse.badRequest("Alumni id is required").send(res);
    }

    const deleted = await alumniDetails.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound("Alumni not found").send(res);
    }

    console.log(`[ALUMNI_DELETE] deleted alumni ${id} (${deleted.email || "no-email"})`);
    return ApiResponse.success({ id }, "Alumni deleted").send(res);
  } catch (error) {
    console.error("Delete Alumni Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  createAlumniController,
  listAlumniController,
  deleteAlumniController,
};
