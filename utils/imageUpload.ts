/**
 * Uploads a compressed image (as a base64 data URL) to Firebase Storage and
 * returns its public download URL.
 *
 * Firestore documents are capped at 1MB total. Earlier versions of this app
 * saved photos as base64 strings directly inside the vehicle/verification
 * document, so a handful of photos could blow past that limit and the write
 * would fail with "cannot be written because its size ... exceeds the
 * maximum allowed size". Storing the actual image bytes in Firebase Storage
 * and only the short download URL in Firestore avoids that entirely.
 */
import { storage, storageRef, uploadString, getDownloadURL } from '../firebase';

export const uploadDataUrlToStorage = async (
  dataUrl: string,
  path: string
): Promise<string> => {
  const fileRef = storageRef(storage, path);
  await uploadString(fileRef, dataUrl, 'data_url');
  return getDownloadURL(fileRef);
};

/**
 * Uploads several data-URL images in parallel to `${basePath}/0`, `${basePath}/1`, ...
 * and returns their download URLs in the same order.
 */
export const uploadDataUrlsToStorage = async (
  dataUrls: string[],
  basePath: string
): Promise<string[]> => {
  return Promise.all(
    dataUrls.map((url, idx) => uploadDataUrlToStorage(url, `${basePath}/${idx}-${Date.now()}.jpg`))
  );
};
