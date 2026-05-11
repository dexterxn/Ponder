import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase.js';

export const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_COVER_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
];

export function validateCoverFile(file) {
  if (!file) return 'No file selected.';
  if (!ALLOWED_COVER_TYPES.includes(file.type)) {
    return 'Only photo files are allowed (JPG, PNG, GIF, WebP, HEIC).';
  }
  if (file.size > MAX_COVER_BYTES) {
    return `File is too large. Maximum size is ${MAX_COVER_BYTES / (1024 * 1024)} MB.`;
  }
  return null;
}

export async function uploadCover(uid, bookId, file) {
  const validationError = validateCoverFile(file);
  if (validationError) throw new Error(validationError);
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const path = `covers/${uid}/${bookId}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteCoverByUrl(url) {
  if (!url) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    // Cover may already be gone or stored elsewhere; non-fatal.
    // eslint-disable-next-line no-console
    console.warn('Failed to delete cover', err);
  }
}
