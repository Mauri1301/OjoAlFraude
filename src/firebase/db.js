import {
  getFirestore, doc, setDoc, getDoc,
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { app } from './config.js';

export const db = getFirestore(app);

export async function saveUserProfile(uid, profileData) {
  await setDoc(doc(db, 'users', uid), profileData, { merge: true });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveSession(uid, data) {
  const sessionsRef = collection(db, 'sessions');
  const q = query(sessionsRef, where('userId', '==', uid));
  const existing = await getDocs(q);
  const sessionNumber = existing.size + 1;

  await addDoc(sessionsRef, {
    userId: uid,
    sessionNumber,
    ...data,
    completadoEn: serverTimestamp(),
  });

  // Actualizar contador en el perfil del usuario (para el panel admin)
  await setDoc(doc(db, 'users', uid), { sessionCount: sessionNumber }, { merge: true });
}

export async function getUserSessions(uid) {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', uid),
    orderBy('completadoEn', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}
