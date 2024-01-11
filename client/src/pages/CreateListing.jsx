import { useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import { generateUniqueFileName } from "../utils/utilities";

export default function CreateListing() {
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(null);
  const imageFileInputRef = useRef();

  // For managing image file input
  const resetImageFileInput = () => {
    imageFileInputRef.current.value = null;
  };

  // Handler functions
  const handleFileInputChange = (e) => {
    const { files } = e.target;
    const imageFiles = Object.entries(files).map((e) => e[1]); // Convert files obj to an array

    setImageFiles(imageFiles);
  };
  const handleUploadBtnClick = async () => {
    setFileUploadError(null);
    setIsUploadingFiles(true);

    if (
      imageFiles.length > 0 &&
      imageFiles.length + formData.imageUrls.length < 7
    ) {
      const promises = [];

      imageFiles.forEach((file) => {
        promises.push(uploadImageFile(file));
      });

      try {
        const imageUrls = await Promise.all(promises);

        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(imageUrls),
        });
        setFileUploadError(null);
      } catch (err) {
        setFileUploadError(
          "Failed to upload! Make sure each image is less than 2MB"
        );
      }
    } else {
      setFileUploadError(
        imageFiles.length === 0
          ? "Please choose an image to upload"
          : "You can only upload 6 images per listing"
      );
    }

    setImageFiles([]);
    setIsUploadingFiles(false);
    resetImageFileInput();
  };
  const handleDeleteImage = (imageIndex) => {
    const updatedImageUrls = formData.imageUrls.filter(
      (_, idx) => idx !== imageIndex
    );

    setFormData({
      ...formData,
      imageUrls: updatedImageUrls,
    });
  };

  // For uploading image file
  const uploadImageFile = (imageFile) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const uniqueFileName = generateUniqueFileName(imageFile.name); // To prevent errors in case user uploads new file with same name
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

  return (
    <main className="flex justify-center py-10">
      <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-md xl:max-w-5xl flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Create a Listing</h1>

        <form className="w-full flex flex-col xl:flex-row xl:flex-wrap gap-4 xl:gap-6">
          <div className="flex flex-col flex-1 gap-4">
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              type="text"
              id="name"
              name="name"
              aria-label="Name"
              placeholder="Name"
              minLength="10"
              maxLength="60"
              required
            />
            <textarea
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              id="description"
              name="description"
              aria-label="Description"
              placeholder="Description"
              required
            />
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              type="text"
              id="address"
              name="address"
              aria-label="Address"
              placeholder="Address"
              minLength="10"
              maxLength="60"
              required
            />

            <div className="flex flex-wrap items-center gap-3.5 xl:gap-5">
              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="sell"
                  name="sell"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="sell">
                  Sell
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="rent"
                  name="rent"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="rent">
                  Rent
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="parking"
                  name="parking"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="parking">
                  Parking
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="furnished"
                  name="furnished"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="furnished">
                  Furnished
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="offer"
                  name="offer"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="offer">
                  Offer
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2.5">
                <input
                  className="w-16 p-2 rounded-lg focus:outline-gray-300"
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  defaultValue={1}
                  min="1"
                  max="15"
                  required
                />
                <label className="font-semibold" htmlFor="bedrooms">
                  Beds
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  className="w-16 p-2 rounded-lg focus:outline-gray-300"
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  defaultValue={1}
                  min="1"
                  max="15"
                  required
                />
                <label className="font-semibold" htmlFor="bathrooms">
                  Baths
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  className="w-24 p-2 rounded-lg focus:outline-gray-300"
                  id="regularPrice"
                  name="regularPrice"
                  type="number"
                  defaultValue={0}
                  min="1"
                  required
                />
                <label className="font-semibold" htmlFor="regularPrice">
                  Regular price ($/Month)
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  className="w-24 p-2 rounded-lg focus:outline-gray-300"
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  defaultValue={0}
                  min="1"
                />
                <label className="font-semibold" htmlFor="discountPrice">
                  Discount price ($/Month)
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 gap-4">
            <label htmlFor="images">
              <strong>Images:</strong> The first image will be the cover (max 6)
            </label>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <input
                className="flex-1 border border-solid border-gray-300 rounded-lg p-2.5"
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                required
                aria-label="Select images to upload"
                onChange={handleFileInputChange}
                ref={imageFileInputRef}
              />
              <button
                className={`w-28 self-center sm:self-stretch border border-solid border-green-600 text-green-600 hover:bg-green-600 hover:text-white duration-500 rounded-lg p-2.5 ${
                  isUploadingFiles
                    ? "w-32 bg-green-600 text-white pointer-events-none"
                    : ""
                }`}
                type="button"
                aria-label="Upload images"
                onClick={handleUploadBtnClick}
              >
                {isUploadingFiles ? "UPLOADING..." : "UPLOAD"}
              </button>
            </div>

            {fileUploadError && (
              <p
                className="text-red-600 text-center"
                aria-label="Error message"
              >
                {fileUploadError}
              </p>
            )}

            {formData.imageUrls.length > 0 && (
              <div className="flex sm:grid flex-col sm:grid-cols-2 gap-6 my-3">
                {formData.imageUrls.map((url, index) => (
                  <div
                    className="flex flex-col items-center justify-end gap-4"
                    key={url}
                  >
                    <img
                      className="w-full object-contain rounded-lg"
                      src={url}
                      alt={`Listing image ${index + 1}`}
                    />
                    <button
                      className="w-full text-red-600 hover:text-white border border-solid border-red-600 hover:bg-red-600 rounded-lg p-1.5 duration-500"
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none">
              CREATE LISTING
            </button>
          </div>
        </form>
      </article>
    </main>
  );
}
