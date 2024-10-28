import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { app } from "../firebase.js";
import { generateUniqueFileName } from "../utils/utilities.js";

export const deleteImageFileFromFirebase = (fileName) => {
  const storage = getStorage(app);

  const imgRef = ref(storage, fileName);

  deleteObject(imgRef)
    .then(() => {
      console.log("Image file deleted successfully from Firebase!");
    })
    .catch((err) => {
      console.error("Failed to delete image file from Firebase!", err);
    });
};

export const uploadImageFileToFirebase = (imageFile, onProgressCb = null) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage(app);
    const uniqueFileName = generateUniqueFileName(imageFile.name); // To prevent naming conflicts in case user uploads file(s) with same name
    const newImageFileRef = ref(storage, uniqueFileName);
    const uploadTask = uploadBytesResumable(newImageFileRef, imageFile);

    // Register three observers
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        console.log("File upload is " + progress + "% complete");

        if (onProgressCb) {
          onProgressCb(progress);
        }
      },
      (err) => {
        // Handle unsuccessful uploads
        reject(err);
      },
      async () => {
        // Handle successful uploads
        try {
          const downloadURL = await getDownloadURL(newImageFileRef);

          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};
