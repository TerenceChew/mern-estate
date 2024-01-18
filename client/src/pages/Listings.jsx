import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ListingCard from "../components/ListingCard";
import DeleteConfirmationBox from "../components/DeleteConfirmationBox";

export default function Listings() {
  const { id } = useParams();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [deleteRequested, setDeleteRequested] = useState(false);

  // Handler functions
  const handleDeleteListingClick = () => {
    setDeleteRequested(true);
  };
  const handleConfirmDelete = async () => {
    try {
      // const res = await fetch(`/api/user/delete/${currentUser._id}`, {
      //   method: "DELETE",
      // });
      // const data = await res.json();
      // if (res.ok) {
      //   dispatch(deleteUserSuccess());
      //   return;
      // } else {
      //   dispatch(deleteUserFailure(data.message));
      // }
    } catch (err) {
      // dispatch(deleteUserFailure("Failed to handle delete account"));
    }
  };
  const handleCancelDelete = () => {
    setDeleteRequested(false);
  };

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
        className={`flex justify-center py-10 ${
          deleteRequested ? "pointer-events-none brightness-75 blur-sm" : ""
        }`}
      >
        <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-screen-2xl flex flex-col items-center gap-8">
          <h1 className="font-semibold text-2xl sm:text-3xl">Your Listings</h1>

          {error ? (
            <p className="text-red-600 text-center" aria-label="Error message">
              {error}
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-7">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    handleDeleteListingClick={handleDeleteListingClick}
                  />
                ))
              ) : (
                <p className="">
                  No listings. Create your first listing{" "}
                  <Link to="/create-listing">
                    <span className="text-blue-500 hover:text-blue-600 hover:underline">
                      here
                    </span>
                  </Link>
                  !
                </p>
              )}
            </div>
          )}
        </article>
      </main>
      {deleteRequested && (
        <DeleteConfirmationBox
          deleteHandler={handleConfirmDelete}
          cancelHandler={handleCancelDelete}
          type="listing"
        />
      )}
    </>
  );
}
