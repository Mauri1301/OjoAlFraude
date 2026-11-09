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
  const [sesiones, practicas] = await Promise.all([
    getDocs(query(collection(db, 'sessions'), where('userId', '==', uid))),
    getDocs(query(collection(db, 'practicas'), where('userId', '==', uid))),
  ]);
  const refs = [...sesiones.docs, ...practicas.docs].map(d => d.ref);
  refs.push(doc(db, 'users', uid));

  // Un lote admite hasta 500 operaciones: se borra en tandas
  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach(r => batch.delete(r));
    await batch.commit();
  }
}

// Guarda la sesión del primer recorrido. `userExtra` son campos del perfil que se
// actualizan en el mismo lote (ej. 'progreso.completo'), así quedan ambos o ninguno.
export async function saveSession(uid, data, userExtra = {}) {
  const sessionsRef = collection(db, 'sessions');
  const existing = await getDocs(query(sessionsRef, where('userId', '==', uid)));
  const sessionNumber = existing.size + 1;

  const batch = writeBatch(db);
  batch.set(doc(sessionsRef), {
    userId: uid,
    sessionNumber,
    ...data,
    completadoEn: serverTimestamp(),
  });
  // Contador en el perfil del usuario (para el panel admin)
  batch.update(doc(db, 'users', uid), { sessionCount: sessionNumber, ...userExtra });
  await batch.commit();
}

// Avance del recorrido en users/{uid}.progreso. `ruta` va sin el prefijo:
// 'pretest', 'niveles.2', 'posttest'…
export async function saveProgreso(uid, ruta, valor) {
  await updateDoc(doc(db, 'users', uid), { [`progreso.${ruta}`]: valor });
}

// Partida rejugada (después de completar el recorrido). Queda aparte de `sessions`
// y no entra al análisis de la tesis.
export async function savePractica(uid, data) {
  await addDoc(collection(db, 'practicas'), {
    userId: uid,
    ...data,
    completadoEn: serverTimestamp(),
  });
}

// Rejugadas del usuario (se ordenan en el cliente para no requerir índice)
export async function getMisPracticas(uid) {
  const snap = await getDocs(query(collection(db, 'practicas'), where('userId', '==', uid)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

// Lee TODA la colección de sesiones de una vez (para análisis agregado)
export async function getAllSessions() {
  const snap = await getDocs(collection(db, 'sessions'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Migra el campo `sus` a `kab` en sesiones existentes que aún no lo tengan
export async function migrarSusAKab() {
  const snap = await getDocs(collection(db, 'sessions'));
  const batch = writeBatch(db);
  let count = 0;
  snap.docs.forEach(d => {
    const data = d.data();
    if (data.sus && !data.kab) {
      batch.update(d.ref, { kab: data.sus });
      count++;
    }
  });
  if (count) await batch.commit();
  return count;
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
export async function syncNarracion(localScenarios) {
  const snap = await getDocs(collection(db, 'scenarios'));
  const batch = writeBatch(db);
  let count = 0;
  snap.docs.forEach(d => {
    const data  = d.data();
    const local = localScenarios.find(s => s.nivel === data.nivel && s.idx === data.idx);
    if (local?.narracion && local.narracion !== data.narracion) {
      batch.update(d.ref, { narracion: local.narracion });
      count++;
    }
  });
  if (count) await batch.commit();
  return count;
}

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
