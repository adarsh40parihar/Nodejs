const nodemailer = require("nodemailer");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config({ path: "./sendgrid.env" });


/*********************Changable Content**************************** */
// const PathToTemplate = "./templates/otp.html";
// const receiverEmail = "22je0040@iitism.ac.in";
// const  subject = "OTP for Resetting your password",

// Replace placeholders in the template with actual values
// const toReplaceObject = {
//   name: "Adarsh Parihar",
//   otp: "6969",
// };
/*********************End of Changable Content********************* */


async function updateTemplateHelper(templatePath, toReplaceObject) {
  let templateContent = await fs.promises.readFile(templatePath, "utf8");
  const keyArrs = Object.keys(toReplaceObject);
  keyArrs.forEach((key) => {
    templateContent = templateContent.replace(
      `#{${key}}`,
      toReplaceObject[key]
    );
  });
  return templateContent;
}

async function emailSender(subject, templatePath, receiverEmail, toReplaceObject) {
  try {
    // thorugh which service you have to send the mail
    const sendGridDetails = {
      host: "smtp.sendgrid.net",
      port: 465,
      secure: true,
      auth: {
        user: "apikey", //define for sendgrid authentication
        pass: process.env.SENDGRID_API_KEY,
      },
    };

    // Read the template content and replace placeholders
    const Content = await updateTemplateHelper(templatePath,toReplaceObject);

    const msg = {
      to: receiverEmail,
      from: "noreply.jiocinema@gmail.com", // Change to your verified sender
      subject: subject,
      text: `Hi ${toReplaceObject.name}, Kindly view in an HTML viewer for better readability.`,
      html: Content,
    };

    const transporter = nodemailer.createTransport(sendGridDetails);

    await transporter.sendMail(msg);
    // console.log("Email sent successfully")

  } catch (err) {
    console.error("Error sending email:", err);
  }
}



//emailSender(PathToTemplate, receiverEmail, toReplaceObject);
module.exports = emailSender;