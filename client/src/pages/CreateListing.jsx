import { useEffect, useRef, useState } from "react";
import {
  generateUniqueFileName,
  extractImageFileNameFromUrl,
} from "../utils/utilities";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  validateCreateOrUpdateListing,
  validateListingImages,
} from "../validations/listing.validation.js";
import {
  uploadImageFileToFirebase,
  deleteImageFileFromFirebase,
} from "../utils/firebase.storage.js";
import { CgSpinner } from "react-icons/cg";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    type: "sale",
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: null,
    imageUrls: [],
  });
  const formDataRef = useRef(formData);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitRequested, setSubmitRequested] = useState(false);
  const submitRequestedRef = useRef(submitRequested);
  const [serverValidationErrors, setServerValidationErrors] = useState({});
  const imageFileInputRef = useRef();
  const navigate = useNavigate();
  const [imageFileNames, setImageFileNames] = useState([]);
  const imageFileNamesRef = useRef(imageFileNames);
  const [newImageUrls, setNewImageUrls] = useState([]);
  const [isValidatingImages, setIsValidatingImages] = useState(false);
  const [imagesValidationError, setImagesValidationError] = useState(null);
  const [shouldValidateImages, setShouldValidateImages] = useState(false);

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
    setImagesValidationError(null);
    setValidationErrors({ ...validationErrors, imageUrls: "" });
    setIsUploadingFiles(true);

    if (
      imageFiles.length > 0 &&
      imageFiles.length + formData.imageUrls.length < 7
    ) {
      const promises = [];
      const fileNames = [];

      imageFiles.forEach((file) => {
        const uniqueFileName = generateUniqueFileName(file.name); // To prevent naming conflicts in case user uploads file(s) with same name

        promises.push(uploadImageFileToFirebase(file, uniqueFileName));
        fileNames.push(uniqueFileName);
      });

      try {
        const results = await Promise.allSettled(promises);
        const validImageUrls = results
          .filter((obj) => obj.status === "fulfilled")
          .map((obj) => obj.value);
        const validFileNames = validImageUrls.map((url) =>
          extractImageFileNameFromUrl(url)
        );

        setShouldValidateImages(true);
        setNewImageUrls(validImageUrls);
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(validImageUrls),
        });
        setImageFileNames([...imageFileNames, ...validFileNames]);
        setFileUploadError(
          validFileNames.length !== fileNames.length
            ? "Invalid image(s) found! Make sure each image is less than 2MB!"
            : null
        );
      } catch (err) {
        setFileUploadError(
          "An error has occurred! Upload might not be complete!"
        );
      }
    } else {
      setFileUploadError(
        imageFiles.length === 0
          ? "Please choose an image to upload!"
          : "You can only upload 6 images per listing!"
      );
    }

    setImageFiles([]);
    setIsUploadingFiles(false);
    resetImageFileInput();
  };
  const handleDeleteImage = (imageIndex) => {
    deleteImageFileFromFirebase(imageFileNames[imageIndex]);

    const updatedImageUrls = formData.imageUrls.filter(
      (_, idx) => idx !== imageIndex
    );
    const updatedImageFileNames = imageFileNames.filter(
      (_, idx) => idx !== imageIndex
    );

    setFormData({
      ...formData,
      imageUrls: updatedImageUrls,
    });
    setImageFileNames(updatedImageFileNames);
  };
  const handleChange = (e) => {
    const { value, checked, type, name } = e.target;

    if (name === "sale" || name === "rent") {
      setFormData({
        ...formData,
        type: name,
      });
    } else if (name === "offer") {
      setFormData({
        ...formData,
        [name]: checked,
        discountPrice: checked ? 0 : null,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    setValidationErrors(validateCreateOrUpdateListing(formData));
    setServerValidationErrors({});
    setImagesValidationError(null);
    setFileUploadError(null);
    setSubmitRequested(true);
  };

  // Side effects
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    imageFileNamesRef.current = imageFileNames;
    submitRequestedRef.current = submitRequested;
  }, [imageFileNames, submitRequested]);

  useEffect(() => {
    return () => {
      if (!submitRequestedRef.current && imageFileNamesRef.current.length > 0) {
        imageFileNamesRef.current.forEach((fileName) => {
          deleteImageFileFromFirebase(fileName);
        });
      }
    };
  }, []);

  useEffect(() => {
    const makeCreateListingRequest = async () => {
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formDataRef.current,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitError(null);
        navigate(`/listing/${data._id}`);
      } else if (res.status === 422) {
        const errors = {};

        data.errors.forEach((error) => {
          errors[error.path] = error.msg;
        });

        setServerValidationErrors(errors);
        setSubmitRequested(false);
      } else {
        setSubmitError(data.message || "Failed to create listing!");
        setSubmitRequested(false);
      }

      setLoading(false);
    };

    if (submitRequested && !Object.keys(validationErrors).length) {
      try {
        setLoading(true);
        makeCreateListingRequest();
      } catch (err) {
        setSubmitError("Failed to create listing!");
      }
    }
  }, [validationErrors, currentUser._id, submitRequested, navigate]);

  useEffect(() => {
    const checkAndHandleImagesValidity = async () => {
      setIsValidatingImages(true);
      setImagesValidationError(null);

      try {
        const result = await validateListingImages(newImageUrls);

        if (result.includes("Invalid")) {
          const validImagesLength =
            formDataRef.current.imageUrls.length - result.length;

          result.forEach((res, idx) => {
            if (res === "Invalid") {
              deleteImageFileFromFirebase(
                imageFileNames[validImagesLength + idx]
              );
            }
          });

          setImagesValidationError(
            "Invalid image(s) found! Make sure each file is an appropriate property image!"
          );

          setFormData((formData) => ({
            ...formData,
            imageUrls: formData.imageUrls.filter(
              (_, idx) =>
                idx < validImagesLength ||
                result[idx - validImagesLength] === "Valid"
            ),
          }));
          setImageFileNames(
            imageFileNames.filter(
              (_, idx) =>
                idx < validImagesLength ||
                result[idx - validImagesLength] === "Valid"
            )
          );
        }
        setNewImageUrls([]);
      } catch (err) {
        console.error("Failed to check and handle images validity!");
      }

      setIsValidatingImages(false);
      setShouldValidateImages(false);
    };

    if (shouldValidateImages && formDataRef.current.imageUrls.length) {
      checkAndHandleImagesValidity();
    }
  }, [imageFileNames, newImageUrls, shouldValidateImages]);

  return (
    <main className="min-h-dvh flex justify-center py-10 bg-gray-50">
      <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-md xl:max-w-5xl flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Create a Listing</h1>

        <form
          className="w-full flex flex-col xl:flex-row xl:flex-wrap gap-2 xl:gap-6"
          onSubmit={handleSubmit}
        >
          <fieldset disabled={loading}>
            <div className="flex flex-col flex-1 gap-2">
              <input
                className="border border-gray-300 focus:outline-gray-400 rounded-lg p-2.5 sm:p-3 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
                type="text"
                id="title"
                name="title"
                aria-label="Title"
                placeholder="Title"
                minLength="20"
                maxLength="60"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <p className="text-center text-red-600">
                {validationErrors.title || serverValidationErrors.title}
              </p>
              <textarea
                className="border border-gray-300 focus:outline-gray-400 rounded-lg p-2.5 sm:p-3"
                id="description"
                name="description"
                aria-label="Description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <p className="text-center text-red-600">
                {validationErrors.description ||
                  serverValidationErrors.description}
              </p>
              <input
                className="border border-gray-300 focus:outline-gray-400 rounded-lg p-2.5 sm:p-3 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
                type="text"
                id="address"
                name="address"
                aria-label="Address"
                placeholder="Address"
                minLength="15"
                maxLength="60"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <p className="text-center text-red-600">
                {validationErrors.address || serverValidationErrors.address}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 xl:gap-5">
                <div className="flex items-center gap-2">
                  <input
                    className="w-4 h-4 cursor-pointer"
                    id="sale"
                    name="sale"
                    type="checkbox"
                    checked={formData.type === "sale"}
                    onChange={handleChange}
                  />
                  <label className="font-semibold" htmlFor="sale">
                    Sale
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    className="w-4 h-4 cursor-pointer"
                    id="rent"
                    name="rent"
                    type="checkbox"
                    checked={formData.type === "rent"}
                    onChange={handleChange}
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
                    checked={formData.parking}
                    onChange={handleChange}
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
                    checked={formData.furnished}
                    onChange={handleChange}
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
                    checked={formData.offer}
                    onChange={handleChange}
                  />
                  <label className="font-semibold" htmlFor="offer">
                    Offer
                  </label>
                </div>
              </div>

              <div className="w-full flex flex-col text-center text-red-600">
                <p>{validationErrors.type || serverValidationErrors.type}</p>
                <p>
                  {validationErrors.parking || serverValidationErrors.parking}
                </p>
                <p>
                  {validationErrors.furnished ||
                    serverValidationErrors.furnished}
                </p>
                <p>{validationErrors.offer || serverValidationErrors.offer}</p>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2.5">
                  <input
                    className="w-16 p-2 rounded-lg border border-gray-300 focus:outline-gray-400"
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.bedrooms.toString()} // A trick to remove leading 0
                    onChange={handleChange}
                    required
                  />
                  <label className="font-semibold" htmlFor="bedrooms">
                    Beds
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    className="w-16 p-2 rounded-lg border border-gray-300 focus:outline-gray-400"
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.bathrooms.toString()} // A trick to remove leading 0
                    onChange={handleChange}
                    required
                  />
                  <label className="font-semibold" htmlFor="bathrooms">
                    Baths
                  </label>
                </div>
              </div>

              <div className="w-full flex flex-col text-center text-red-600">
                <p>
                  {validationErrors.bedrooms || serverValidationErrors.bedrooms}
                </p>
                <p>
                  {validationErrors.bathrooms ||
                    serverValidationErrors.bathrooms}
                </p>
              </div>

              <div className="max-w-[250px] flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2.5">
                  <input
                    className="w-32 p-2 rounded-lg border border-gray-300 focus:outline-gray-400"
                    id="regularPrice"
                    name="regularPrice"
                    type="number"
                    min="50"
                    max="100000000"
                    value={formData.regularPrice.toString()} // A trick to remove leading 0
                    onChange={handleChange}
                    required
                  />
                  <label className="font-semibold" htmlFor="regularPrice">
                    {`Regular price ${
                      formData.type === "rent" ? "($/Month)" : ""
                    }`}
                  </label>
                </div>

                {formData.offer && (
                  <div className="flex items-center gap-2.5">
                    <input
                      className="w-32 p-2 rounded-lg border border-gray-300 focus:outline-gray-400"
                      id="discountPrice"
                      name="discountPrice"
                      type="number"
                      min="0"
                      max={(formData.regularPrice - 1).toString()}
                      value={
                        formData.discountPrice
                          ? formData.discountPrice.toString()
                          : "0"
                      } // A trick to remove leading 0
                      onChange={handleChange}
                    />
                    <label className="font-semibold" htmlFor="discountPrice">
                      {`Discount price ${
                        formData.type === "rent" ? "($/Month)" : ""
                      }`}
                    </label>
                  </div>
                )}
              </div>

              <div className="w-full flex flex-col text-center text-red-600">
                <p>
                  {validationErrors.regularPrice ||
                    serverValidationErrors.regularPrice}
                </p>
                <p>
                  {validationErrors.discountPrice ||
                    serverValidationErrors.discountPrice}
                </p>
              </div>
            </div>
          </fieldset>

          <div className="flex flex-col flex-1 gap-2">
            <label htmlFor="images">
              <strong>Images:</strong> The first image will be the cover (max 6)
            </label>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-2">
              <input
                className="flex-1 border border-solid border-gray-300 rounded-lg p-2.5 min-w-0"
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                aria-label="Select images to upload"
                onChange={handleFileInputChange}
                ref={imageFileInputRef}
                disabled={isUploadingFiles || loading}
              />

              <button
                className={`flex justify-center items-center gap-2.5 self-center sm:self-stretch border border-solid border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors duration-300 rounded-lg py-2.5 disabled:pointer-events-none ${
                  isUploadingFiles || isValidatingImages
                    ? "bg-blue-700 text-white py-3 px-3.5"
                    : loading
                    ? "grayscale px-4 sm:px-5"
                    : "px-4 sm:px-5"
                }`}
                type="button"
                aria-label="Upload images"
                onClick={handleUploadBtnClick}
                disabled={isUploadingFiles || isValidatingImages || loading}
              >
                {(isUploadingFiles || isValidatingImages) && (
                  <CgSpinner className="animate-spin text-2xl" />
                )}
                {isUploadingFiles
                  ? "UPLOADING..."
                  : isValidatingImages
                  ? "VALIDATING..."
                  : "UPLOAD"}
              </button>
            </div>

            <div className="w-full flex flex-col text-center text-red-600">
              <p>
                {validationErrors.imageUrls || serverValidationErrors.imageUrls}
              </p>

              {imagesValidationError && (
                <p aria-label="Error message">{imagesValidationError}</p>
              )}

              {fileUploadError && (
                <p aria-label="Error message">{fileUploadError}</p>
              )}
            </div>

            {formData.imageUrls.length > 0 && (
              <div className="flex sm:grid flex-col sm:grid-cols-2 gap-6 mb-2">
                {formData.imageUrls.map((url, index) => (
                  <div
                    className="flex flex-col items-center justify-end gap-4"
                    key={url}
                  >
                    <img
                      className="w-full object-contain rounded-lg has-[+button:hover]:scale-95 duration-500"
                      src={url}
                      alt={`Listing image ${index + 1}`}
                    />
                    <button
                      className="w-full text-red-600 hover:text-white border border-solid border-red-600 hover:bg-red-600 rounded-lg p-1.5 duration-500 disabled:grayscale disabled:pointer-events-none"
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      disabled={
                        isUploadingFiles || isValidatingImages || loading
                      }
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className={`flex justify-center items-center gap-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-3 disabled:pointer-events-none ${
                isUploadingFiles || isValidatingImages ? "opacity-80" : ""
              }`}
              disabled={isUploadingFiles || isValidatingImages || loading}
            >
              {loading && <CgSpinner className="animate-spin text-2xl" />}
              {loading ? "CREATING LISTING..." : "CREATE LISTING"}
            </button>

            {submitError && (
              <p
                className="text-red-600 text-center"
                aria-label="Error message"
              >
                {submitError}
              </p>
            )}
          </div>
        </form>
      </article>
    </main>
  );
}
