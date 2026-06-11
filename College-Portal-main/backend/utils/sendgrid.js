const sgMail = require("@sendgrid/mail");

const ensureSendgridConfigured = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set");
  }
  sgMail.setApiKey(apiKey);
};

const sendClaimEmailToReporter = async ({
  reporterEmail,
  reporterName,
  item,
  claim,
}) => {
  ensureSendgridConfigured();

  const from = process.env.SENDGRID_FROM || "raghavvohra375@gmail.com";
  const to = reporterEmail;

  const subject = `Lost & Found Claim Request: ${item.itemName}`;

  const text = [
    `Hi ${reporterName || "there"},`,
    "",
    "A student has submitted a claim request for your lost & found item.",
    "",
    `Item: ${item.itemName}`,
    `Category: ${item.category}`,
    `Status: ${item.status}`,
    `Location Lost: ${item.locationLost}`,
    `Date Lost: ${new Date(item.dateLost).toLocaleDateString()}`,
    "",
    "Claimant Details:",
    `Name: ${claim.claimerName}`,
    `Email: ${claim.claimerEmail}`,
    `Phone: ${claim.claimerPhone || "N/A"}`,
    "",
    "Proof / Details:",
    `${claim.proofDescription}`,
    claim.additionalDetails ? `Additional: ${claim.additionalDetails}` : "",
    "",
    `Item ID: ${item._id}`,
    "",
    "If you have verified the claimant, you can mark the item as claimed in the portal.",
  ]
    .filter(Boolean)
    .join("\n");

  const msg = {
    to,
    from,
    subject,
    text,
  };

  await sgMail.send(msg);
};

const sendAlumniCredentialsEmail = async ({ toEmail, firstName, loginEmail, tempPassword }) => {
  ensureSendgridConfigured();

  const fromEmail = process.env.SENDGRID_FROM;
  if (!fromEmail) {
    throw new Error("SENDGRID_FROM is not set");
  }

  const safeName = firstName || "there";

  const text = `Hi ${safeName},\n\nYour alumni account has been created.\n\nLogin Email: ${loginEmail}\nTemporary Password: ${tempPassword}\n\nPlease login and change your password after first sign-in.\n`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Your Alumni Account</h2>
      <p>Hi ${safeName},</p>
      <p>Your alumni account has been created.</p>
      <p><strong>Login Email:</strong> ${loginEmail}<br/>
      <strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please login and change your password after first sign-in.</p>
    </div>
  `;

  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: "Your Alumni Account Credentials",
    text,
    html,
  };

  const [resp] = await sgMail.send(msg);
  const headers = resp?.headers || {};
  const messageId = headers["x-message-id"] || headers["X-Message-Id"] || headers["X-Message-ID"];

  return {
    statusCode: resp?.statusCode,
    messageId,
  };
};

module.exports = {
  ensureSendgridConfigured,
  sendClaimEmailToReporter,
  sendAlumniCredentialsEmail,
};
