import { useEffect, useRef, useState } from "react";
import {
  generateUniqueFileName,
  extractImageFileNameFromUrl,
} from "../utils/utilities";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { validate, validateImages } from "../validations/listing.validation.js";
import {
  uploadImageFileToFirebase,
  deleteImageFileFromFirebase,
} from "../utils/firebase.storage.js";

export default function UpdateListing() {
  const { id } = useParams();
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
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [getListingError, setGetListingError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitRequested, setSubmitRequested] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState({});
  const imageFileInputRef = useRef();
  const navigate = useNavigate();
  const [imageFileNames, setImageFileNames] = useState([]);
  const [newImageUrls, setNewImageUrls] = useState([]);
  const [isValidatingImages, setIsValidatingImages] = useState(false);
  const [imagesValidationError, setImagesValidationError] = useState(null);
  const [shouldValidateImages, setShouldValidateImages] = useState(false);
  const [deletedImageFileNames, setDeletedImageFileNames] = useState([]);

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
      setShouldValidateImages(true);

      const promises = [];
      const fileNames = [];

      imageFiles.forEach((file) => {
        const uniqueFileName = generateUniqueFileName(file.name); // To prevent errors in case user uploads new file with same name

        promises.push(uploadImageFileToFirebase(file, uniqueFileName));
        fileNames.push(uniqueFileName);
      });

      try {
        const imageUrls = await Promise.all(promises);

        setNewImageUrls(imageUrls);
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(imageUrls),
        });
        setImageFileNames([...imageFileNames, ...fileNames]);
        setFileUploadError(null);
      } catch (err) {
        setFileUploadError(
          "Failed to upload! Make sure each image is less than 2MB!"
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
    const updatedImageUrls = formData.imageUrls.filter(
      (_, idx) => idx !== imageIndex
    );
    const deletedImageUrl = formData.imageUrls[imageIndex];
    const deletedImageFileName = extractImageFileNameFromUrl(deletedImageUrl);

    setDeletedImageFileNames([...deletedImageFileNames, deletedImageFileName]);
    setFormData({
      ...formData,
      imageUrls: updatedImageUrls,
    });
    setImageFileNames(
      updatedImageUrls.map((url) => extractImageFileNameFromUrl(url))
    );
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

    setServerValidationErrors({});
    setValidationErrors(validate(formData));
    setSubmitRequested(true);
  };

  // Side effects
  useEffect(() => {
    const getListing = async () => {
      try {
        const res = await fetch(`/api/listing/get/${id}`);
        const data = await res.json();

        if (res.ok) {
          const { updatedAt, createdAt, __v, _id, userRef, ...rest } = data;
          const processedListing = rest;

          setFormData(processedListing);
          setImageFileNames(
            processedListing.imageUrls.map((url) =>
              extractImageFileNameFromUrl(url)
            )
          ); // To make sure it's in sync with formData.imageUrls
        } else {
          setGetListingError(data.message);
        }
      } catch (err) {
        setGetListingError("Failed to get listing");
      }
    };

    getListing();
  }, []);

  useEffect(() => {
    const makeUpdateListingRequest = async () => {
      const res = await fetch(`/api/listing/update/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitError(null);

        deletedImageFileNames.forEach((fileName) => {
          deleteImageFileFromFirebase(fileName);
        });

        setDeletedImageFileNames([]);

        navigate(`/listing/${data._id}`);
      } else if (res.status === 422) {
        const errors = {};

        data.errors.forEach((error) => {
          errors[error.path] = error.msg;
        });

        setServerValidationErrors(errors);
      } else {
        setSubmitError(data.message);
      }

      setLoading(false);
    };

    if (submitRequested && !Object.keys(validationErrors).length) {
      try {
        setLoading(true);
        makeUpdateListingRequest();
      } catch (err) {
        setSubmitError("Failed to handle submit for update listing");
      }
    }
  }, [validationErrors]);

  useEffect(() => {
    const checkAndHandleImagesValidity = async () => {
      setIsValidatingImages(true);
      setImagesValidationError(null);

      try {
        const result = await validateImages(newImageUrls);

        if (result.includes("Invalid")) {
          const validImagesLength = formData.imageUrls.length - result.length;

          result.forEach((res, idx) => {
            if (res === "Invalid") {
              deleteImageFileFromFirebase(
                imageFileNames[validImagesLength + idx]
              );
            }
          });

          setImagesValidationError(
            "Failed to upload! Make sure each file is an appropriate property image!"
          );
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter(
              (_, idx) =>
                idx < validImagesLength ||
                result[idx - validImagesLength] === "Valid"
            ),
          });
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
        console.log("Failed to check and handle images validity!");
      }

      setIsValidatingImages(false);
      setShouldValidateImages(false);
    };

    if (shouldValidateImages && formData.imageUrls.length) {
      checkAndHandleImagesValidity();
    }
  }, [formData.imageUrls]);

  return (
    <main className="min-h-dvh flex justify-center py-10 bg-gray-50">
      <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-md xl:max-w-5xl flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Edit Listing</h1>

        {getListingError ? (
          <p className="text-red-600 text-center" aria-label="Error message">
            {getListingError}
            {". "}
            <span className="text-black">
              Back to{" "}
              <Link
                to={`/listings/${currentUser._id}`}
                className="text-blue-700 hover:underline"
              >
                listings
              </Link>
            </span>
          </p>
        ) : (
          <form
            className="w-full flex flex-col xl:flex-row xl:flex-wrap gap-2 xl:gap-6"
            onSubmit={handleSubmit}
          >
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

              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2.5">
                  <input
                    className="w-24 p-2 rounded-lg border border-gray-300 focus:outline-gray-400"
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
                      className="w-24 p-2 rounded-lg border border-gray-300 focus:outline-gray-400"
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

            <div className="flex flex-col flex-1 gap-2">
              <label htmlFor="images">
                <strong>Images:</strong> The first image will be the cover (max
                6)
              </label>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-2">
                <input
                  className="flex-1 border border-solid border-gray-300 rounded-lg p-2.5"
                  id="images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  aria-label="Select images to upload"
                  onChange={handleFileInputChange}
                  ref={imageFileInputRef}
                />

                <button
                  className={`w-28 self-center sm:self-stretch border border-solid border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white duration-500 rounded-lg p-2.5 ${
                    isUploadingFiles
                      ? "w-32 bg-blue-700 text-white pointer-events-none"
                      : ""
                  }`}
                  type="button"
                  aria-label="Upload images"
                  onClick={handleUploadBtnClick}
                >
                  {isUploadingFiles ? "UPLOADING..." : "UPLOAD"}
                </button>
              </div>

              <div className="w-full flex flex-col text-center text-red-600">
                <p>
                  {validationErrors.imageUrls ||
                    serverValidationErrors.imageUrls}
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

              <button
                className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none"
                disabled={loading || isValidatingImages}
              >
                {isValidatingImages ? "VALIDATING IMAGES..." : "UPDATE LISTING"}
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
        )}
      </article>
    </main>
  );
}
