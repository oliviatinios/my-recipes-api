const sgMail = require("@sendgrid/mail");

const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "tinioso@mcmaster.ca",
    subject: "Welcome to My Recipes!",
    text: `Welcome, ${name}! Let me know how you get along with the app.`,
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "tinioso@mcmaster.ca",
    subject: "Sorry to see you go!",
    text: `Goodbye, ${name}! Is there anything we could have done to keep you around longer? Let me know!`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
