import { db } from "./firebase";
import { collection, doc, setDoc, onSnapshot, getDocs, getCountFromServer } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { nanoid } from "nanoid";
import { sendTwilioMessage } from "./api";

let userPosition;

async function saveWaitList(fname, lname, email, phone, partySize, game){
    let userId = nanoid();
    try{
        await setDoc(doc(db, "waitlist", userId), {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            partySize: partySize,
            game: game,
            date: Timestamp.fromDate(new Date()),
            removed: false
        });
        console.log("User added to Firestore")
        } catch (error){
            console.error("Error adding user to Firestore: ", error);
        }
    }

async function getUserPosition(){
    const collectionSnapshot = await getCountFromServer(collection(db, "waitlist"));
    let collectionSize = collectionSnapshot.data().count;
    return collectionSize;
}
async function updatePosition() {
    let newPosition = 1;
    // Fetch all the documents in the waitlist collection
    const querySnapshot = await getDocs(collection(db, "waitlist"));
    // Loop through each document and find the index of each document in the collection waitlist
    for (const [index, doc] of querySnapshot.docs.entries()) {
        const { fname, phone } = doc.data();
        newPosition = index - 1;
        await sendTwilioMessage(fname, phone, newPosition);
    }
}


// Function to listen for real-time updates and update the user position accordingly
async function listenForUpdates() {
    try {
        const unsubscribe = onSnapshot(collection(db, "waitlist"), () => {
            // When there is a change in the "waitlist" collection, update the user position
            userPosition = updatePosition();
        });
        // Uncomment if you want to unsubscribe at some point
        // return unsubscribe;
    } catch (error) {
        console.error("Error listening for updates:", error);
    }
}

// Call the function to start listening for updates
listenForUpdates();

export { saveWaitList, getUserPosition, updatePosition};