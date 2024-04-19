import serverless from "serverless-http";
import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import { sendEmail, sendTwilioMessage, saveWaitList, getCurrentPosition } from "utils";


const app = express();
const router = Router();
let isSubmitted = false;

// Content parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));

router.post("/form-submission", async (req, res) => {
  isSubmitted = true;
  res.redirect("/confirmation.html");
  // Extract form data from the request body
  const { fname, lname, email, phone, partySize, game } = req.body;
  await sendEmail(fname, lname, email, phone, partySize, game);
  // Get user's position in waitlist
  await saveWaitList(fname, lname, email, phone, partySize, game).catch(
    (error) => {
      console.error("Error saving user to waitlist:", error);
    }
  );

  const userPosition = await getCurrentPosition();

  await sendTwilioMessage(
    phone,
    `Hi ${fname},\nYour position in the waitlist is ${userPosition}.We will notify you when the seat is available!.`
  ).catch((error) => {
    console.error("Error sending SMS:", error);
  });
});

//Routes handling

app.get("/confirmation", (req, res) => {
  try {
    if (isSubmitted) {
      res.redirect("/confirmation.html");
    } else {
      // Redirect to home page if isSubmitted is false
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).send("Failed to load confirmation page.");
  }
});

// Use the router middleware for routes under /api/
app.use("/api/", router);

// Export the handler for serverless deployment
export const handler = serverless(app);