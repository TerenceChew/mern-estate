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
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserSuccess,
  deleteUserFailure,
  signOutSuccess,
  signOutFailure,
} from "../redux/user/userSlice";
import DeleteConfirmationBox from "../components/DeleteConfirmationBox";
import { Link } from "react-router-dom";
import { deleteImageFileFromFirebase } from "../utils/firebase.storage";
import { extractImageFileNameFromUrl } from "../utils/utilities.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const [imageFile, setImageFile] = useState(undefined);
  const [fileUploadPercentage, setFileUploadPercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    password: "",
    passwordConfirmation: "",
  });
  const [showUpdateSuccessMessage, setShowUpdateSuccessMessage] =
    useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitRequested, setSubmitRequested] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState({});
  const passwordInputRef = useRef();
  const passwordConfirmationInputRef = useRef();
  const [eye, setEye] = useState({
    password: "password",
    passwordConfirmation: "password",
  });

  // Validation
  const validate = (formData) => {
    const { username, email, password, passwordConfirmation } = formData;
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;

    if (!username) {
      errors.username = "Please enter a valid username!";
    } else if (username.length < 5) {
      errors.username = "Username must be at least 5 characters!";
    } else if (username.length > 20) {
      errors.username = "Username cannot be more than 20 characters!";
    }

    if (!email || !emailRegex.test(email)) {
      errors.email = "Please enter a valid email!";
    }

    if (!password) {
      errors.password = "Please enter your current or new password!";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters!";
    } else if (password.length > 16) {
      errors.password = "Password cannot be more than 16 characters!";
    } else if (!passwordRegex.test(password)) {
      errors.password =
        "Password must contain at least 1 digit, 1 uppercase and 1 lowercase letter!";
    }

    if (!passwordConfirmation) {
      errors.passwordConfirmation = "Please re-enter your password here!";
    } else if (passwordConfirmation !== password) {
      errors.passwordConfirmation = "Does not match password!";
    }

    return errors;
  };

  // Handler functions
  const handleImgClick = () => {
    fileInputRef.current.click();
  };
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData({
      ...formData,
      [id]: value,
    });
  };
  const handleFileInputChange = (e) => {
    const { type } = e.target.files[0];
    const imageFileTypeRegex = /^image\/[A-z]*$/;

    if (imageFileTypeRegex.test(type)) {
      setImageFile(e.target.files[0]);

      const { imageFile, ...otherErrors } = validationErrors;

      setValidationErrors(otherErrors);
    } else {
      setValidationErrors({
        ...validationErrors,
        imageFile: "Invalid file type. Only images are allowed!",
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    fileInputRef.current.value = "";

    setServerValidationErrors({});
    setDeleteRequested(false);
    setValidationErrors(validate(formData));
    setSubmitRequested(true);
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
        const { imageUrlsToDelete } = data;
        const imageFileNamesToDelete = imageUrlsToDelete.map((url) =>
          extractImageFileNameFromUrl(url)
        );

        imageFileNamesToDelete.forEach((fileName) => {
          deleteImageFileFromFirebase(fileName);
        });

        dispatch(deleteUserSuccess());
        return;
      } else {
        dispatch(deleteUserFailure(data.message));
      }
    } catch (err) {
      dispatch(deleteUserFailure("Failed to handle delete account"));
    }
  };
  const handleCancelDelete = () => {
    setDeleteRequested(false);
  };
  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(signOutSuccess());
        return;
      } else {
        dispatch(signOutFailure(data.message));
      }
    } catch (err) {
      dispatch(signOutFailure("Failed to handle sign out"));
    }
  };
  const handleEyeClick = (inputRef) => {
    const input = inputRef.current;
    const { name, type } = input;

    if (type === "password") {
      input.type = "text";
      setEye({ ...eye, [name]: "text" });
    } else {
      input.type = "password";
      setEye({ ...eye, [name]: "password" });
    }
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

          setFormData({
            ...formData,
            photoURL: downloadURL,
          });
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
    const makeUpdateUserRequest = async () => {
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(updateUserSuccess(data));
        setShowUpdateSuccessMessage(true);
        return;
      } else if (res.status === 422) {
        const errors = {};

        data.errors.forEach((error) => {
          errors[error.path] = error.msg;
        });

        setServerValidationErrors(errors);
        dispatch(updateUserFailure(""));
      } else {
        dispatch(updateUserFailure(data.message));
        setShowUpdateSuccessMessage(false);
      }
    };

    if (submitRequested && !Object.keys(validationErrors).length) {
      try {
        dispatch(updateUserStart());
        makeUpdateUserRequest();
      } catch (err) {
        dispatch(updateUserFailure("Failed to handle submit for update"));
        setShowUpdateSuccessMessage(false);
      }
    }
  }, [validationErrors]);

  return (
    <>
      <main
        className={`min-h-dvh flex justify-center py-10 ${
          deleteRequested ? "pointer-events-none brightness-[.65] blur-sm" : ""
        }`}
      >
        <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-sm flex flex-col items-center gap-8">
          <h1 className="font-semibold text-2xl sm:text-3xl">Profile</h1>

          <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
            <input
              type="file"
              id="imageFile"
              name="imageFile"
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
            <p className="text-center text-red-600">
              {validationErrors.imageFile}
            </p>
            {!validationErrors.imageFile && (
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
            )}
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              aria-label="Username"
              onChange={handleChange}
              defaultValue={currentUser.username}
              minLength="5"
              maxLength="20"
              required
            />
            <p className="text-center text-red-600">
              {validationErrors.username || serverValidationErrors.username}
            </p>
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              aria-label="Email"
              onChange={handleChange}
              defaultValue={currentUser.email}
              required
            />
            <p className="text-center text-red-600">
              {validationErrors.email || serverValidationErrors.email}
            </p>
            <div className="relative">
              <input
                className="w-full border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                aria-label="Password"
                onChange={handleChange}
                minLength="8"
                maxLength="16"
                ref={passwordInputRef}
              />
              {eye.password === "password" ? (
                <FaEye
                  className="absolute inset-y-0 right-3 my-auto cursor-pointer text-lg"
                  onClick={() => handleEyeClick(passwordInputRef)}
                  title="Show password"
                />
              ) : (
                <FaEyeSlash
                  className="absolute inset-y-0 right-3 my-auto cursor-pointer text-lg"
                  onClick={() => handleEyeClick(passwordInputRef)}
                  title="Hide password"
                />
              )}
            </div>
            <p className="text-center text-red-600">
              {validationErrors.password || serverValidationErrors.password}
            </p>
            <div className="relative">
              <input
                className="w-full border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
                placeholder="Password confirmation"
                aria-label="Password confirmation"
                onChange={handleChange}
                ref={passwordConfirmationInputRef}
              />
              {eye.passwordConfirmation === "password" ? (
                <FaEye
                  className="absolute inset-y-0 right-3 my-auto cursor-pointer text-lg"
                  onClick={() => handleEyeClick(passwordConfirmationInputRef)}
                  title="Show password"
                />
              ) : (
                <FaEyeSlash
                  className="absolute inset-y-0 right-3 my-auto cursor-pointer text-lg"
                  onClick={() => handleEyeClick(passwordConfirmationInputRef)}
                  title="Hide password"
                />
              )}
            </div>
            <p className="text-center text-red-600">
              {validationErrors.passwordConfirmation ||
                serverValidationErrors.passwordConfirmation}
            </p>
            <button
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none mb-2"
            >
              {loading ? "LOADING..." : "UPDATE"}
            </button>
            <Link to="/create-listing">
              <button
                type="button"
                className="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg p-2.5 sm:p-3"
                aria-label="Go to create listing page"
              >
                CREATE LISTING
              </button>
            </Link>
          </form>

          <div className="w-full flex justify-between">
            <span
              className="text-red-600 cursor-pointer hover:underline"
              onClick={handleDeleteAccountClick}
            >
              Delete Account
            </span>
            <span
              className="text-red-600 cursor-pointer hover:underline"
              onClick={handleSignOut}
            >
              Sign Out
            </span>
          </div>

          {error && (
            <p className="text-red-600 text-center" aria-label="Error message">
              {error}
            </p>
          )}

          {showUpdateSuccessMessage && (
            <p className="text-green-600 text-center">Update success!</p>
          )}
        </article>
      </main>

      {deleteRequested && (
        <DeleteConfirmationBox
          deleteHandler={handleConfirmDelete}
          cancelHandler={handleCancelDelete}
          type="account"
        />
      )}
    </>
  );
}
