const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

// ============================================
// SEND EMAIL
// ============================================

const sendEmail = async ({
  to,
  name,
  subject,
  htmlContent,
  textContent,
}) => {
  try {
    const response =
      await brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name:
            process.env.BREVO_SENDER_NAME ||
            "TaskFlow",

          email:
            process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: to,
            name: name || "",
          },
        ],

        subject,

        htmlContent,

        textContent,
      });

    console.log(
      "Brevo email sent:",
      response.messageId
    );

    return response;

  } catch (error) {

    console.error(
      "Brevo email error:",
      error
    );

    throw error;
  }
};

module.exports = {
  sendEmail,
};