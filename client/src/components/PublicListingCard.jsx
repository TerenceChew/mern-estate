import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaBed } from "react-icons/fa6";
import { FaBath } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { IoLocationSharp } from "react-icons/io5";
import { MdAttachMoney } from "react-icons/md";
import { formatNumberWithCommas } from "../utils/utilities";

export default function PublicListingCard({ listing }) {
  const {
    title,
    description,
    address,
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
    <Link to={`/listing/${_id}`} className="w-full sm:w-auto">
      <div className="sm:w-[360px] flex flex-col items-center gap-5 pb-5 bg-white rounded-md shadow-lg shadow-slate-300 text-slate-700">
        <div className="w-full h-80 sm:h-[235px] rounded-tl-md rounded-tr-md shadow-md shadow-slate-400 overflow-hidden">
          <img
            className="h-full w-full object-cover rounded-tl-md rounded-tr-md hover:scale-105 duration-300"
            src={imageUrls[0]}
            alt="Listing cover image"
          />
        </div>

        <h1 className="w-full h-20 xs:h-14 flex justify-center items-center px-4 text-lg font-semibold [overflow-wrap:anywhere] text-center">
          {title}
        </h1>

        <div className="w-full h-8 flex justify-center items-center gap-1.5 px-4 xs:px-6">
          <IoLocationSharp className="text-lg shrink-0 text-green-600" />
          <p className="text-sm line-clamp-2">{address}</p>
        </div>

        <div className="w-full h-14 flex justify-center items-center gap-1.5 px-4 xs:px-6">
          <p className="text-sm line-clamp-3">{description}</p>
        </div>

        <div className="w-full h-5 flex flex-wrap justify-center gap-4">
          <span className="h-5 flex justify-center items-center gap-2">
            <FaBed className="text-lg" />
            {bedrooms} Beds
          </span>
          <span className="h-5 flex justify-center items-center gap-1.5">
            <FaBath className="text-base" />
            {bathrooms} Baths
          </span>
        </div>

        <div className="w-full h-5 flex justify-center items-center px-2">
          <span className="flex justify-center items-center gap-1 text-sm">
            {type === "rent" ? "Rent" : "Sale"}
            <LuDot />
            {furnished ? "Furnished" : "Unfurnished"}
            <LuDot />
            {parking ? "Parking" : "No Parking"}
          </span>
        </div>

        <div className="w-full h-5 flex justify-center px-2">
          <span className="flex justify-center items-center gap-0.5 font-semibold text-slate-500">
            <MdAttachMoney className="text-xl" />
            <span className={`mr-1.5 ${discountPrice ? "line-through" : ""}`}>
              {formatNumberWithCommas(regularPrice)}
            </span>
            {discountPrice ? formatNumberWithCommas(discountPrice) : ""}
            {type === "rent" ? " / month" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

PublicListingCard.propTypes = {
  listing: PropTypes.object.isRequired,
};
