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
      console.log("Image file deleted successfully!");
    })
    .catch((err) => {
      console.log("Failed to delete image file!");
    });
};

export const uploadImageFileToFirebase = (imageFile) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage(app);
    const uniqueFileName = generateUniqueFileName(imageFile.name); // To prevent naming conflicts in case user uploads file(s) with same name
    const newImageFileRef = ref(storage, uniqueFileName);
    const uploadTask = uploadBytesResumable(newImageFileRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        console.log("File upload is " + progress + "% complete");
      },
      (err) => {
        reject(err);
      },
      async () => {
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
