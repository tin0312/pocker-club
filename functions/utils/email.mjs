import nodemailer from "nodemailer";
import "dotenv/config";

// Set up Email services
async function sendEmail(fname, lname, email, phone, partySize, game) {
    // Create a Nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    // Email message options
    let adminMailOptions = {
      from: email,
      to: process.env.EMAIL_APP,
      subject: "Omega Poker Club - Booking",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333; text-align: center; margin-bottom: 50px;">New Appointment</h2>
      <div style="margin-bottom: 20px;">
          <p style="margin: 20px 0;"><strong>First Name:</strong> ${fname}</p>
          <p style="margin: 20px 0;"><strong>Last Name:</strong> ${lname}</p>
          <p style="margin: 20px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 20px 0;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin: 20px 0;"><strong>Game:</strong> ${game}</p>
          <p style="margin: 20px 0;"><strong>Party Size:</strong> ${partySize}</p>
      </div>
  </div>
          `,
    };
  
    let userMailOption = {
      from: process.env.EMAIL_APP,
      to: email,
      subject: "Omega Poker Club - Booking",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Booking Confirmation</h2>
          <p style="color: #666; text-align: center; margin-bottom: 50px;">Thank you for booking with us!</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 50px;">
              <p style="color: #333; margin: 0;text-align: center;">We have received your booking request and will get
                  back to you shortly.
              </p>
          </div>
          <p style="color:#14343b; margin-bottom: 20px;font-weight: bold; font-style: italic;">Toronto Omega Poker - TOP
              club</p>
      </div>
      `,
    };
  
    // Send the email
    await Promise.all([
      transporter.sendMail(userMailOption),
      transporter.sendMail(adminMailOptions),
    ]);
  }

export { sendEmail };