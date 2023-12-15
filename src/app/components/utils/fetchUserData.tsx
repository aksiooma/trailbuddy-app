import { doc, getDoc, getFirestore } from "firebase/firestore";

// utils/fetchUserData.js
export const fetchUserData = async (userId: string) => {
    const firestore = getFirestore();
    const userDoc = doc(firestore, "USERS", userId);
    try {
        const docSnapshot = await getDoc(userDoc);
        if (docSnapshot.exists()) {
            return docSnapshot.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

