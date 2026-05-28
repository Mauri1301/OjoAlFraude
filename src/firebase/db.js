import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, writeBatch,
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

/* ── Contenido del juego ── */

export async function loadScenarios() {
  const q = query(collection(db, 'scenarios'), where('activo', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

export async function loadQuestions() {
  const q = query(collection(db, 'questions'), where('activo', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

export async function loadAllScenarios() {
  const snap = await getDocs(collection(db, 'scenarios'));
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

export async function loadAllQuestions() {
  const snap = await getDocs(collection(db, 'questions'));
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

export async function updateScenario(firestoreId, data) {
  await updateDoc(doc(db, 'scenarios', firestoreId), data);
}

export async function updateQuestion(firestoreId, data) {
  await updateDoc(doc(db, 'questions', firestoreId), data);
}

export async function seedContent(scenarios, questions) {
  const batch = writeBatch(db);
  scenarios.forEach(s => {
    const ref = doc(collection(db, 'scenarios'));
    batch.set(ref, s);
  });
  questions.forEach(q => {
    const ref = doc(collection(db, 'questions'));
    batch.set(ref, q);
  });
  await batch.commit();
}
