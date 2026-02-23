const nodemailer = require("nodemailer");
const readline = require("readline");

// Create console interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",   // easier than writing host
  auth: {
    user: "omkarkurane141@gmail.com",
    pass: "rtth eava vfhq wmop"  // App password
  }
});

// Ask receiver email
rl.question("Enter receiver email: ", (toEmail) => {

  // Ask message
  rl.question("Enter message: ", (messageText) => {

    const mailOptions = {
      from: "omkarkurane141@gmail.com",
      to: toEmail,
      subject: "Mail from Node.js",
      text: messageText
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Email sent successfully!");
        console.log("Response:", info.response);
      }
      rl.close();
    });

  });

});