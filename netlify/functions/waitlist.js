import { db } from "./firebase";
import { collection, doc, setDoc, getCountFromServer } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

let userPosition = 0;

async function saveWaitList(fname, lname, email, phone, partySize, game){
    let userId = nanoid();
    try{
        await setDoc(doc(db, "wailist", userId), {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            partySize: partySize,
            game: game,
            date: Timestamp.fromDate(new Date()),
        });
        console.log("User added to Firestore")
        } catch (error){
            console.error("Error adding user to Firestore: ", error);
        }
    }

async function getUserPosition(){
    const collectionSnapshot = await getCountFromServer(collection(db, "waitlist"));
    userPosition = collectionSnapshot.data().count;
    return userPosition;
}


function updatePosition(){}

export { saveWaitList, getUserPosition, updatePosition}