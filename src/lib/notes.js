import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const notesCol = (uid, bookId) => collection(db, 'users', uid, 'books', bookId, 'notes');
const noteDoc = (uid, bookId, noteId) =>
  doc(db, 'users', uid, 'books', bookId, 'notes', noteId);

export function subscribeToNotes(uid, bookId, callback) {
  const q = query(notesCol(uid, bookId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(notes);
  });
}

export async function createNote(uid, bookId, { content, page }) {
  const ref = await addDoc(notesCol(uid, bookId), {
    content: content.trim(),
    page: Number.isFinite(page) ? page : null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNote(uid, bookId, noteId, patch) {
  const clean = { ...patch };
  if (typeof clean.content === 'string') clean.content = clean.content.trim();
  if (clean.page !== undefined && !Number.isFinite(clean.page)) clean.page = null;
  await updateDoc(noteDoc(uid, bookId, noteId), clean);
}

export async function deleteNote(uid, bookId, noteId) {
  await deleteDoc(noteDoc(uid, bookId, noteId));
}
