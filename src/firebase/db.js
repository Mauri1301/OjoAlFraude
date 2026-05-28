import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from './config.js';

export const db = getFirestore(app);

export async function saveUserProfile(uid, profileData) {
  await setDoc(doc(db, 'users', uid), profileData, { merge: true });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}
