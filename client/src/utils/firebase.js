import { getStorage, ref, deleteObject } from "firebase/storage";
import { app } from "../firebase.js";

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
