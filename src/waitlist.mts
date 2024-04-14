import { db } from "./firebase.mts";
import { collection, doc, setDoc, onSnapshot, getDocs, getCountFromServer, updateDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { nanoid } from "nanoid";
import { sendTwilioMessage } from "./twilio.mts";

async function saveWaitList(fname, lname, email, phone, partySize, game) {
    const userId = nanoid();
    try {
        const collectionSnapshot = await getCountFromServer(collection(db, "waitlist"));
        const userPosition = collectionSnapshot.data().count + 1; // Increment count to get position
        await setDoc(doc(db, "waitlist", userId), {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            partySize: partySize,
            game: game,
            date: Timestamp.fromDate(new Date()),
            position: userPosition // Store user's position in the document
        });
        console.log("User added to Firestore");
    } catch (error) {
        console.error("Error adding user to Firestore: ", error);
    }
}

// get current position of the user
async function getCurrentPosition() {
    const collectionSnapshot = await getCountFromServer(collection(db, "waitlist"));
    let userPosition = collectionSnapshot.data().count;
    console.log("User position: ", userPosition);
    return userPosition;
}

async function updateRemainingUsers() {
    const usersSnapshot = await getDocs(collection(db, "waitlist"));
    usersSnapshot.forEach(async (userDoc) => {
        const docId = userDoc.id;
        const docData = userDoc.data();
        const { fname, phone, position } = docData;
        const newPosition = position - 1;
        const docRef = doc(db, "waitlist", docId);
        await updateDoc(docRef, { position: newPosition });
        await sendTwilioMessage(phone, `Hi ${fname}, \nYour position in the waitlist has been updated to ${newPosition}.`);
    });
}


async function listenForDeletions() {
    try {
        const unsubscribe = onSnapshot(collection(db, "waitlist"), async (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === "removed") {
                    const deletedData = change.doc.data();
                    const deletedDocId = change.doc.id;
                    console.log("Document deleted:", deletedDocId);
                    console.log("Deleted data:", deletedData);
                    await sendTwilioMessage( deletedData.phone, `Hi ${deletedData.fname}, \nYour table is ready. Please come to the front desk to be seated.`);
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
