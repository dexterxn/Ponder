import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase.js';

export async function uploadCover(uid, bookId, file) {
  if (!file) throw new Error('No file provided');
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
