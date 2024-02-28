import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaBath, FaBed, FaShare } from "react-icons/fa6";
import { IoLocationSharp } from "react-icons/io5";
import { LuParkingCircle, LuParkingCircleOff } from "react-icons/lu";
import { GiSofa } from "react-icons/gi";
import { formatNumberWithCommas } from "../utils/utilities";
import { useSelector } from "react-redux";
import ContactLandlord from "../components/ContactLandlord";

export default function Listing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [contactLandlord, setContactLandlord] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  // Handler functions
  const handleShareListingClick = () => {
    navigator.clipboard.writeText(window.location.href);

    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 2500);
  };
  const handleContactLandlordClick = () => {
    setContactLandlord(true);
  };

  // Side effects
  useEffect(() => {
    const getListingData = async () => {
      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`/api/listing/get/${id}`);
        const data = await res.json();

        if (res.ok) {
          setListing(data);
        } else {
          setError(data.message);
          setListing(null);
        }
      } catch (err) {
        setError("Failed to get listing data");
        setListing(null);
      }

      setLoading(false);
    };

    getListingData();
  }, []);

  // Swiper
  const swiperStyle = {
    "--swiper-navigation-size": "30px",
    "--swiper-navigation-sides-offset": "14px",
    "--swiper-navigation-color": "white",
    "--swiper-pagination-color": "white",
    "--swiper-pagination-bottom": "8px",
    "--swiper-pagination-bullet-size": "8px",
    "--swiper-pagination-bullet-inactive-color": "white",
    "--swiper-pagination-bullet-inactive-opacity": "0.65",
  };

  return (
    <main>
      <article className="flex justify-center">
        {loading ? (
          <p>Loading ...</p>
        ) : error ? (
          <p className="text-red-600 text-center" aria-label="Error message">
            {error}
          </p>
        ) : listing ? (
          <div className="w-full max-w-screen-xl flex flex-col items-center relative">
            <button
              className="w-9 sm:w-10 md:w-11 h-9 sm:h-10 md:h-11 flex justify-center items-center absolute top-5 sm:top-7 lg:top-9 right-5 sm:right-7 lg:right-9 z-10 border-none rounded-full bg-slate-200 bg-opacity-80 cursor-pointer hover:-translate-y-1 duration-300 outline-none"
              aria-label="Share listing"
              title="Share listing"
              onClick={handleShareListingClick}
            >
              <FaShare className="text-slate-700 text-sm md:text-base" />
            </button>

            <span
              className={`absolute z-10 border rounded-md px-3 sm:px-[1.15rem] py-1.5 sm:py-2 sm:text-lg bg-slate-200 text-slate-700 duration-700 transition-all opacity-0 ${
                linkCopied ? "translate-y-2/4 opacity-100" : ""
              }`}
            >
              Link Copied!
            </span>

            <Swiper
              className="w-full"
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              style={swiperStyle}
            >
              {listing.imageUrls.map((url) => (
                <SwiperSlide key={url}>
                  <a href={url} target="_blank">
                    <img
                      className="w-full h-[265px] xs:h-[345px] sm:h-[425px] md:h-[550px] object-cover"
                      src={url}
                      alt="Listing image"
                    />
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="w-full max-w-5xl flex flex-col gap-5 pt-6 pb-8 px-5 xs:px-7 md:px-9">
              <h1 className="text-2xl font-semibold">
                {listing.title} - $
                {formatNumberWithCommas(listing.discountPrice)}{" "}
                {listing.type === "rent" ? "/ month" : ""}
              </h1>

              <div className="w-full flex items-center gap-1.5">
                <IoLocationSharp className="text-2xl shrink-0 text-green-700" />
                <p className="text-sm sm:text-base font-semibold text-slate-700 line-clamp-2">
                  {listing.address}
                </p>
              </div>

              <div className="flex items-center gap-4 text-white">
                <span className="bg-red-700 rounded-md px-4 py-1.5">
                  {listing.type === "rent" ? "For Rent" : "For Sale"}
                </span>
                <span className="bg-green-700 rounded-md px-4 py-1.5">
                  Discount ${listing.regularPrice - listing.discountPrice}
                </span>
              </div>

              <p>
                <span className="font-semibold">Description - </span>
                <span className="text-slate-700">{listing.description}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-green-700">
                <div className="flex items-center gap-1.5">
                  <FaBed className="text-xl" />
                  <p className="font-semibold">{listing.bedrooms} Beds</p>
                </div>
                <div className="flex items-center gap-1.5 ">
                  <FaBath className="text-lg" />
                  <p className="font-semibold">{listing.bathrooms} Baths</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {listing.parking ? (
                    <LuParkingCircle className="text-xl" />
                  ) : (
                    <LuParkingCircleOff className="text-xl" />
                  )}
                  <p className="font-semibold">
                    {listing.parking ? "Parking" : "No Parking"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <GiSofa className="text-xl" />
                  <p className="font-semibold">
                    {listing.furnished ? "Furnished" : "Unfurnished"}
                  </p>
                </div>
              </div>

              {currentUser &&
                listing.userRef !== currentUser._id &&
                !contactLandlord && (
                  <button
                    className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 mt-1.5"
                    onClick={handleContactLandlordClick}
                  >
                    CONTACT LANDLORD
                  </button>
                )}

              {contactLandlord && <ContactLandlord listing={listing} />}
            </div>
          </div>
        ) : (
          <p>This is a fallback. Listing can't be loaded!</p>
        )}
      </article>
    </main>
  );
}
