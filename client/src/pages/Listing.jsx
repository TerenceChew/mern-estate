import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { IoLocationSharp, IoBedOutline } from "react-icons/io5";
import { LuParkingCircle, LuParkingCircleOff, LuBath } from "react-icons/lu";
import { PiArmchair, PiShareNetwork } from "react-icons/pi";
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
          setError(data.message || "Failed to get listing data");
          setListing(null);
        }
      } catch (err) {
        setError("Failed to get listing data");
        setListing(null);
      }

      setLoading(false);
    };

    getListingData();
  }, [id]);

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
    <main className="min-h-dvh bg-gray-50 font-poppins">
      <article className="flex justify-center">
        {loading ? (
          <p className="mt-3">Loading ...</p>
        ) : error ? (
          <p
            className="text-red-600 text-center mt-3"
            aria-label="Error message"
          >
            {error}
          </p>
        ) : listing ? (
          <div className="w-full max-w-screen-xl flex flex-col items-center relative">
            <button
              className="w-9 md:w-10 h-9 md:h-10 flex justify-center items-center absolute top-5 right-5 z-10 border-none rounded-xl bg-gray-900 bg-opacity-80 cursor-pointer hover:-translate-y-1 duration-300 outline-none"
              aria-label="Share listing"
              title="Share listing"
              onClick={handleShareListingClick}
            >
              <PiShareNetwork className="text-white text-[22px] md:text-[26px]" />
            </button>

            <span
              className={`absolute z-10 border rounded-md px-3 sm:px-[1.15rem] py-1.5 sm:py-2 sm:text-lg bg-white text-gray-700 duration-700 transition-all opacity-0 ${
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
                  <a href={url} target="_blank" rel="noreferrer">
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
              <h1 className="text-2xl md:text-3xl font-semibold">
                {listing.title}
              </h1>

              <div className="w-full flex items-center gap-1">
                <IoLocationSharp className="text-2xl text-green-600 shrink-0 ml-[-4px]" />
                <p className="text-sm md:text-base text-gray-600 font-roboto font-normal line-clamp-2">
                  {listing.address}
                </p>
              </div>

              <div className="flex items-center gap-4 text-white">
                <span className="text-sm bg-blue-600 rounded-md px-2.5 py-1">
                  {listing.type === "rent" ? "For Rent" : "For Sale"}
                </span>
                {!!listing.discountPrice && (
                  <span className="text-sm text-white bg-red-600 rounded-md px-2.5 py-1">
                    RM
                    {formatNumberWithCommas(
                      listing.regularPrice - listing.discountPrice
                    )}{" "}
                    Discount
                  </span>
                )}
              </div>

              <hr className="border-gray-300" />

              <h2 className="text-2xl md:text-3xl font-semibold mt-4 mb-3">
                <sup className="text-sm md:text-lg font-normal mr-1">RM</sup>
                {listing.discountPrice
                  ? formatNumberWithCommas(listing.discountPrice)
                  : formatNumberWithCommas(listing.regularPrice)}{" "}
                {listing.type === "rent" ? "/month" : ""}
              </h2>

              <div className="max-w-[280px] min-[515px]:max-w-fit flex flex-wrap items-center gap-x-[55px] min-[515px]:gap-x-[35px] gap-y-12 text-gray-600 font-normal mb-4">
                <div className="w-[85px] flex flex-col gap-2">
                  <IoBedOutline className="text-[26px] leading-8" />
                  <p className="text-sm">{listing.bedrooms} Bed(s)</p>
                </div>
                <div className="w-[85px] flex flex-col gap-2.5">
                  <LuBath className="text-2xl" />
                  <p className="text-sm">{listing.bathrooms} Bath(s)</p>
                </div>
                <div className="w-[85px] flex flex-col gap-2.5">
                  {listing.parking ? (
                    <LuParkingCircle className="text-2xl" />
                  ) : (
                    <LuParkingCircleOff className="text-2xl" />
                  )}
                  <p className="text-sm">
                    {listing.parking ? "Parking" : "No Parking"}
                  </p>
                </div>
                <div className="w-[85px] flex flex-col gap-2">
                  <PiArmchair className="text-[27px] leading-8" />
                  <p className="text-sm">
                    {listing.furnished ? "Furnished" : "Unfurnished"}
                  </p>
                </div>
              </div>

              <hr className="border-gray-300" />

              <div>
                <h2 className="text-2xl md:text-3xl font-medium mt-4 mb-3">
                  Description
                </h2>
                <p className="text-base text-gray-600">{listing.description}</p>
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
          <p className="mt-3">
            This is a fallback. Listing can&apos;t be loaded!
          </p>
        )}
      </article>
    </main>
  );
}
