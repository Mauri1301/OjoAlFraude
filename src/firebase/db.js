import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, writeBatch, deleteDoc,
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

export async function deleteParticipante(uid) {
  const sessionsSnap = await getDocs(query(collection(db, 'sessions'), where('userId', '==', uid)));
  const batch = writeBatch(db);
  sessionsSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(doc(db, 'users', uid));
  await batch.commit();
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

// Sincroniza el campo linkUrl de los escenarios locales hacia los docs ya existentes en Firestore,
// emparejando por (nivel, idx). No duplica documentos.
export async function syncOpciones(localScenarios) {
  const snap = await getDocs(collection(db, 'scenarios'));
  const batch = writeBatch(db);
  let count = 0;
  snap.docs.forEach(d => {
    const data  = d.data();
    const local = localScenarios.find(s => s.nivel === data.nivel && s.idx === data.idx);
    if (!local) return;
    const updates = {};
    if (local.opciones && JSON.stringify(local.opciones) !== JSON.stringify(data.opciones))
      updates.opciones = local.opciones;
    if (local.consecuencia_ok && local.consecuencia_ok !== data.consecuencia_ok)
      updates.consecuencia_ok = local.consecuencia_ok;
    if (Object.keys(updates).length) {
      batch.update(d.ref, updates);
      count++;
    }
  });
  if (count) await batch.commit();
  return count;
}

export async function syncConsequencias(localScenarios) {
  const snap = await getDocs(collection(db, 'scenarios'));
  const batch = writeBatch(db);
  let count = 0;
  snap.docs.forEach(d => {
    const data  = d.data();
    const local = localScenarios.find(s => s.nivel === data.nivel && s.idx === data.idx);
    const updates = {};
    if (local?.consecuencia_mal && local.consecuencia_mal !== data.consecuencia_mal)
      updates.consecuencia_mal = local.consecuencia_mal;
    if (local?.consecuencias_mal)
      updates.consecuencias_mal = local.consecuencias_mal;
    if (Object.keys(updates).length) {
      batch.update(d.ref, updates);
      count++;
    }
  });
  if (count) await batch.commit();
  return count;
}

export async function syncScenarioLinks(localScenarios) {
  const snap = await getDocs(collection(db, 'scenarios'));
  const batch = writeBatch(db);
  let count = 0;
  snap.docs.forEach(d => {
    const data  = d.data();
    const local = localScenarios.find(s => s.nivel === data.nivel && s.idx === data.idx);
    if (local && local.linkUrl && local.linkUrl !== data.linkUrl) {
      batch.update(d.ref, { linkUrl: local.linkUrl });
      count++;
    }
  });
  if (count) await batch.commit();
  return count;
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
