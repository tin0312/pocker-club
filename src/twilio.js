import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Function to send Twilio message with user position
export async function sendTwilioMessage(phone, messageBody) {
  try {
    await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_NUMBER,
      to: phone,
    });
    console.log("Twilio message sent successfully.");
  } catch (error) {
    console.error("Error sending Twilio message:", error);
  }
}


const twilioClient = new Twilio(accountSid, authToken);