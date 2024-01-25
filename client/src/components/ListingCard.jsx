import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaBed } from "react-icons/fa6";
import { FaBath } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { MdAttachMoney } from "react-icons/md";

export default function ListingCard({ listing, handleDeleteListingClick }) {
  const {
    title,
    bedrooms,
    bathrooms,
    furnished,
    parking,
    type,
    imageUrls,
    regularPrice,
    discountPrice,
    _id,
  } = listing;

  return (
    <div className="w-64 bg-slate-200 flex flex-col items-center justify-end  gap-5 py-5 rounded-lg shadow-lg shadow-slate-300 text-slate-700">
      <div className="w-5/6 h-5 flex">
        <span className="flex justify-center items-center gap-0.5">
          <MdAttachMoney className="text-xl" />
          <span className={`mr-1.5 ${discountPrice ? "line-through" : ""}`}>
            {regularPrice}
          </span>
          {discountPrice ? discountPrice : ""}
        </span>
      </div>

      <div className="w-5/6 h-56 flex justify-center items-end">
        <img
          className="max-h-full object-contain shadow-md shadow-slate-400"
          src={imageUrls[0]}
          alt="Listing cover image"
        />
      </div>

      <Link
        to={`/listing/${_id}`}
        className="w-5/6 h-16 flex justify-center items-center hover:underline"
      >
        <h1 className="text-center">{title}</h1>
      </Link>

      <div className="w-5/6 h-5 flex flex-wrap justify-center gap-4">
        <span className="h-5 flex justify-center items-center gap-2">
          {bedrooms}
          <FaBed className="text-lg" />
        </span>
        <span className="h-5 flex justify-center items-center gap-1.5">
          {bathrooms}
          <FaBath className="text-base" />
        </span>
      </div>

      <div className="w-5/6 h-5 flex justify-center items-center">
        <span className="flex justify-center items-center gap-1 text-sm">
          {type === "rent" ? "Rent" : "Sale"}
          <LuDot />
          {furnished ? "Furnished" : "Unfurnished"}
          <LuDot />
          {parking ? "Parking" : "No Parking"}
        </span>
      </div>

      <div className="w-5/6 flex gap-5">
        <Link
          to={`/update-listing/${_id}`}
          className="flex-1 border border-solid border-green-600 hover:bg-green-600 text-green-600 hover:text-white duration-500 rounded-lg py-1.5"
        >
          <button className="w-full" aria-label="Edit listing">
            EDIT
          </button>
        </Link>
        <button
          className="flex-1 border border-solid border-red-600 hover:bg-red-600 text-red-600 hover:text-white duration-500 rounded-lg py-1.5"
          aria-label="Delete listing"
          onClick={() => handleDeleteListingClick(_id)}
        >
          DELETE
        </button>
      </div>
    </div>
  );
}

ListingCard.propTypes = {
  listing: PropTypes.object.isRequired,
  handleDeleteListingClick: PropTypes.func.isRequired,
};
