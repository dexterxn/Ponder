import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const BOOK_STATUSES = [
  { id: 'want', label: 'Want to read' },
  { id: 'reading', label: 'Reading' },
  { id: 'finished', label: 'Finished' },
];

export const isValidStatus = (s) => BOOK_STATUSES.some((b) => b.id === s);

const booksCol = (uid) => collection(db, 'users', uid, 'books');
const bookDoc = (uid, bookId) => doc(db, 'users', uid, 'books', bookId);

export function subscribeToBooks(uid, callback) {
  const q = query(booksCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const books = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(books);
  });
}

export async function getBook(uid, bookId) {
  const snap = await getDoc(bookDoc(uid, bookId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createBook(uid, { title, author, coverUrl = '', status = 'want' }) {
  const ref = await addDoc(booksCol(uid), {
    title: title.trim(),
    author: author.trim(),
    coverUrl,
    status: isValidStatus(status) ? status : 'want',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBook(uid, bookId, patch) {
  const clean = { ...patch };
  if (clean.status && !isValidStatus(clean.status)) delete clean.status;
  if (typeof clean.title === 'string') clean.title = clean.title.trim();
  if (typeof clean.author === 'string') clean.author = clean.author.trim();
  await updateDoc(bookDoc(uid, bookId), clean);
}

export async function deleteBook(uid, bookId) {
  await deleteDoc(bookDoc(uid, bookId));
}
