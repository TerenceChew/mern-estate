import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import UserListingCard from "../components/UserListingCard";
import DeleteConfirmationBox from "../components/DeleteConfirmationBox";
import { extractImageFileNameFromUrl } from "../utils/utilities";
import { deleteImageFileFromFirebase } from "../utils/firebase.storage";
import { HiPlusCircle } from "react-icons/hi";
import { TiPlus } from "react-icons/ti";

export default function Listings() {
  const { id } = useParams();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState({
    deleteRequested: false,
    listingId: null,
  });
  const [deletedImageFileNames, setDeletedImageFileNames] = useState([]);

  // Handler functions
  const handleDeleteListingClick = (listingId) => {
    const deletedImageUrls = listings.filter(
      (listing) => listing._id === listingId
    )[0].imageUrls;
    const deletedImageFileNames = deletedImageUrls.map((url) =>
      extractImageFileNameFromUrl(url)
    );

    setDeletedImageFileNames(deletedImageFileNames);
    setDeleteRequest({
      deleteRequested: true,
      listingId,
    });
  };
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(
        `/api/listing/delete/${deleteRequest.listingId}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (res.ok) {
        deletedImageFileNames.forEach((fileName) => {
          deleteImageFileFromFirebase(fileName);
        });

        setListings(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to handle delete listing");
    }

    setDeleteRequest({
      deleteRequested: false,
      listingId: null,
    });
  };
  const handleCancelDelete = () => {
    setDeleteRequest({
      deleteRequested: false,
      listingId: null,
    });
  };

  // Side effects
  useEffect(() => {
    const getListingsData = async () => {
      setError(null);

      try {
        const res = await fetch(`/api/user/listings/${id}`);
        const data = await res.json();

        if (res.ok) {
          setListings(data);
        } else {
          setError(data.message);
          setListings([]);
        }
      } catch (err) {
        setError("Failed to get listings data");
        setListings([]);
      }
    };

    getListingsData();
  }, []);

  return (
    <>
      <main
        className={`min-h-dvh flex justify-center relative pt-11 pb-10 px-5 md:px-8 bg-gray-50 ${
          deleteRequest.deleteRequested
            ? "pointer-events-none brightness-[.65] blur-sm"
            : ""
        }`}
      >
        <article className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-screen-2xl flex flex-col items-center gap-8">
          <h1 className="font-semibold text-2xl sm:text-3xl">Your Listings</h1>

          <Link
            to="/create-listing"
            className="flex justify-center items-center absolute right-4 xs:right-5 md:right-6 lg:right-8 xl:right-10 2xl:right-12 top-4 md:top-5 text-blue-700"
            aria-label="Create new listing"
            title="Create new listing"
          >
            <HiPlusCircle className="sm:hidden text-[28px] xs:text-[32px] hover:scale-[1.15] transition-transform duration-200" />
            <span className="hidden sm:flex justify-center items-center gap-1 text-sm lg:text-[15px] xl:text-base font-poppins py-1.5 pl-1.5 pr-2.5 xl:pr-3 hover:bg-blue-700 hover:text-white transition-colors duration-500 rounded-md">
              <TiPlus />
              New Listing
            </span>
          </Link>

          {error ? (
            <p className="text-red-600 text-center" aria-label="Error message">
              {error}
            </p>
          ) : (
            <div className="w-full flex flex-wrap justify-center gap-7">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <UserListingCard
                    key={listing._id}
                    listing={listing}
                    handleDeleteListingClick={handleDeleteListingClick}
                  />
                ))
              ) : (
                <p className="">
                  No listings. Create your first listing{" "}
                  <Link to="/create-listing">
                    <span className="text-blue-700 hover:underline">here</span>
                  </Link>
                  !
                </p>
              )}
            </div>
          )}
        </article>
      </main>
      {deleteRequest.deleteRequested && (
        <DeleteConfirmationBox
          deleteHandler={handleConfirmDelete}
          cancelHandler={handleCancelDelete}
          type="listing"
        />
      )}
    </>
  );
}
