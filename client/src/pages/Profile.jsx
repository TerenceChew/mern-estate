import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { generateUniqueFileName } from "../utils/utilities.js";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteSuccess,
  deleteFailure,
} from "../redux/user/userSlice";
import DeleteConfirmationBox from "../components/DeleteConfirmationBox";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const [imageFile, setImageFile] = useState(undefined);
  const [fileUploadPercentage, setFileUploadPercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateIsSuccessful, setUpdateIsSuccessful] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  // Handler functions
  const handleImgClick = () => {
    fileInputRef.current.click();
  };
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  const handleFileInputChange = (e) => {
    setImageFile(e.target.files[0]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDeleteRequested(false);

    try {
      dispatch(updateStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(updateSuccess(data));
        setUpdateIsSuccessful(true);
        return;
      } else {
        dispatch(updateFailure(data.message));
        setUpdateIsSuccessful(false);
      }
    } catch (err) {
      dispatch(updateFailure("Failed to handle submit for update"));
      setUpdateIsSuccessful(false);
    }
  };
  const handleDeleteAccountClick = () => {
    setDeleteRequested(true);
  };
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(deleteSuccess());
        return;
      } else {
        dispatch(deleteFailure(data.message));
      }
    } catch (err) {
      dispatch(deleteFailure("Failed to delete account"));
    }
  };
  const handleCancelDelete = () => {
    setDeleteRequested(false);
  };

  // For uploading image file
  const uploadImageFile = (imageFile) => {
    const storage = getStorage(app);
    const uniqueFileName = generateUniqueFileName(imageFile.name); // To prevent errors in case user uploads new file with same name
    const newImageFileRef = ref(storage, uniqueFileName);

    setFileUploadError(null);
    setFileUploadPercentage(0);

    // Upload the file
    const uploadTask = uploadBytesResumable(newImageFileRef, imageFile);

    // Register three observers:
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
        setFileUploadPercentage(progress);
      },
      (err) => {
        // Handle unsuccessful uploads
        console.log(err);
        setFileUploadError(
          "Failed to upload! Make sure image is less than 2MB"
        );
      },
      async () => {
        // Handle successful uploads on complete
        try {
          const downloadURL = await getDownloadURL(newImageFileRef);

          setFormData((prevState) => ({
            ...prevState,
            photoURL: downloadURL,
          }));
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  // Side effects
  useEffect(() => {
    if (imageFile) {
      uploadImageFile(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    setUpdateIsSuccessful(false);
  }, [error, deleteRequested]);

  return (
    <>
      <main
        className={`flex justify-center pt-10 ${
          deleteRequested ? "pointer-events-none brightness-75 blur-sm" : ""
        }`}
      >
        <article className="max-w-64 xs:max-w-72 sm:max-w-sm flex flex-col items-center gap-8">
          <h1 className="font-semibold text-2xl sm:text-3xl">Profile</h1>

          <form
            className="w-64 xs:w-72 sm:w-96 flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <input
              type="file"
              id="imageFile"
              aria-label="Upload image file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              hidden
            />

            <img
              className="w-24 h-24 rounded-full object-cover self-center cursor-pointer"
              src={formData.photoURL || currentUser.photoURL}
              alt="Profile photo"
              onClick={handleImgClick}
            />

            <p
              className={`self-center text-center ${
                fileUploadError
                  ? "text-red-600"
                  : fileUploadPercentage === 100
                  ? "text-green-600"
                  : "text-black"
              }`}
              aria-label="Image upload status"
            >
              {fileUploadError
                ? fileUploadError
                : fileUploadPercentage > 0 && fileUploadPercentage < 100
                ? `Uploading ${fileUploadPercentage}%`
                : formData.photoURL
                ? "Image uploaded successfully!"
                : ""}
            </p>

            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              type="text"
              id="username"
              placeholder="Username"
              aria-label="Username"
              onChange={handleChange}
              defaultValue={currentUser.username}
            />
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              type="email"
              id="email"
              placeholder="Email"
              aria-label="Email"
              onChange={handleChange}
              defaultValue={currentUser.email}
            />
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              type="password"
              id="password"
              placeholder="Password"
              aria-label="Password"
              onChange={handleChange}
            />

            <button
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none"
            >
              {loading ? "LOADING..." : "UPDATE"}
            </button>
          </form>

          <div className="w-full flex justify-between">
            <span
              className="text-red-600 cursor-pointer hover:underline"
              onClick={handleDeleteAccountClick}
            >
              Delete Account
            </span>
            <span className="text-red-600 cursor-pointer hover:underline">
              Sign Out
            </span>
          </div>

          {error && (
            <p className="text-red-600 text-center" aria-label="Error message">
              {error}
            </p>
          )}

          {updateIsSuccessful && (
            <p className="text-green-600 text-center">Update success!</p>
          )}
        </article>
      </main>
      {deleteRequested && (
        <DeleteConfirmationBox
          deleteHandler={handleConfirmDelete}
          cancelHandler={handleCancelDelete}
        />
      )}
    </>
  );
}
