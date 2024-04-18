// import { Timestamp } from 'firebase/firestore';
import { nanoid } from "nanoid";
import { sendTwilioMessage } from "./twilio";
import initializeFirebaseAdmin from "./firebase";

// Initialize Firebase Admin
const firebaseAdminApp = initializeFirebaseAdmin();

// Get Firestore instance from the initialized app
const db = firebaseAdminApp.firestore();

async function saveWaitList(fname, lname, email, phone, partySize, game) {
  const userId = nanoid();
  try {
    const collectionSnapshot = await db.collection("waitlist").get();
    const userPosition = collectionSnapshot.size + 1; // Increment count to get position
    await db.collection("waitlist").doc(userId).set({
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      partySize: partySize,
      game: game,
      // date: Timestamp.fromDate(new Date()),
      position: userPosition, // Store user's position in the document
    });
    console.log("User added to Firestore");
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
  }
}

async function getCurrentPosition() {
  try {
    const collectionSnapshot = await db.collection("waitlist").get();
    const userPosition = collectionSnapshot.size;
    console.log("User position: ", userPosition);
    return userPosition;
  } catch (error) {
    console.error("Error getting current position: ", error);
  }
}

async function updateRemainingUsers() {
  try {
    const usersSnapshot = await db.collection("waitlist").get();
    usersSnapshot.forEach(async (userDoc) => {
      const docId = userDoc.id;
      const docData = userDoc.data();
      const { fname, phone, position } = docData;
      const newPosition = position - 1;
      await db
        .collection("waitlist")
        .doc(docId)
        .update({ position: newPosition });
      await sendTwilioMessage(
        phone,
        `Hi ${fname}, \nYour position in the waitlist has been updated to ${newPosition}.`
      );
    });
  } catch (error) {
    console.error("Error updating remaining users: ", error);
  }
}

async function listenForDeletions() {
  try {
    const unsubscribe = db
      .collection("waitlist")
      .onSnapshot(async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "removed") {
            const deletedData = change.doc.data();
            const deletedDocId = change.doc.id;
            console.log("Document deleted:", deletedDocId);
            console.log("Deleted data:", deletedData);
            await sendTwilioMessage(
              deletedData.phone,
              `Hi ${deletedData.fname}, \nYour table is ready. Please come to the front desk to be seated.`
            );
            await updateRemainingUsers();
          }
        });
      });
    // Uncomment if you want to unsubscribe at some point
    // return unsubscribe;
  } catch (error) {
    console.error("Error listening for deletions:", error);
  }
}

// Call the function to start listening for updates
listenForDeletions();

export { saveWaitList, getCurrentPosition };
