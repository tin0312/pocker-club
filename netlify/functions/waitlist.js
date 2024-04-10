import { db } from "./firebase";
import { collection, doc, setDoc, onSnapshot, getDocs,getCountFromServer } from "firebase/firestore";
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
        userPosition = await getUserPosition(userId);
        await sendTwilioMessage(fname, phone, `Hi ${fname},\nYour position in the waitlist is ${userPosition}. We will notify you when the seat is available!`);
        } catch (error){
            console.error("Error adding user to Firestore: ", error);
        }
    }

// loop through the waitlist and get the user position
async function getUserPosition(userId){
    try{
        const querySnapshot = await getDocs(collection(db, "waitlist"));
        let i = 1;
        querySnapshot.forEach((doc) => {
            if(!doc.data().removed){
                if(doc.id === userId){
                    userPosition = i;
                }
                i++;
            }
        });
    } catch (error){
        console.error("Error getting user position:", error);
    }
    return userPosition;
}
async function updatePositions() {
    try {
        const querySnapshot = await getDocs(collection(db, "waitlist"));
        const updates = [];
        let i = 1;
        querySnapshot.forEach((doc) => {
            if (!doc.data().removed) {
                updates.push(setDoc(doc(db, "waitlist", doc.id), {
                    fname: doc.data().fname,
                    lname: doc.data().lname,
                    email: doc.data().email,
                    phone: doc.data().phone,
                    partySize: doc.data().partySize,
                    game: doc.data().game,
                    date: doc.data().date,
                    removed: false
                }));
                updates.push(sendTwilioMessage(doc.data().fname, doc.data().phone, `Your new position in the waitlist is ${i}.`));
                i++;
            }
        });
        await Promise.all(updates);
    } catch (error) {
        console.error("Error updating user positions:", error);
    }
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
                    await updatePositions();
                    await sendTwilioMessage(deletedData.fname, deletedData.phone, "Your table is ready. Please come to the front desk to be seated.");
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

export { saveWaitList, getUserPosition, updatePositions };

