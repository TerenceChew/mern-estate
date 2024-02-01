import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaShare } from "react-icons/fa6";

export default function Listing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Handler functions
  const handleShareListingClick = () => {
    navigator.clipboard.writeText(window.location.href);

    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 2500);
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
          console.log(data);
          setListing(data);
        } else {
          console.log(data.message);
          setError(data.message);
          setListing(null);
        }
      } catch (err) {
        console.log(err);
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
          <div className="w-full max-w-screen-2xl flex flex-wrap justify-center relative">
            <button
              className="w-9 sm:w-10 md:w-11 h-9 sm:h-10 md:h-11 flex justify-center items-center absolute top-5 sm:top-7 lg:top-9 right-5 sm:right-7 lg:right-9 z-10 border-none rounded-full bg-slate-200 bg-opacity-80 cursor-pointer hover:-translate-y-1 duration-300"
              aria-label="Share listing"
              title="Share listing"
              onClick={handleShareListingClick}
            >
              <FaShare className="text-slate-700 text-sm md:text-base" />
            </button>

            <span
              className={`absolute z-10 border rounded-md px-3 sm:px-[1.15rem] py-1.5 sm:py-2 sm:text-lg bg-slate-200 text-slate-700 duration-700 transition-transform -translate-y-full ${
                linkCopied ? "translate-y-2/4" : ""
              }`}
            >
              Link Copied!
            </span>

            <Swiper
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              onSwiper={(swiper) => console.log(swiper)}
              onSlideChange={() => console.log("slide change")}
              style={swiperStyle}
            >
              {listing.imageUrls.map((url) => (
                <SwiperSlide key={url}>
                  <img
                    className="w-full h-[265px] xs:h-[345px] sm:h-[425px] md:h-[540px] lg:h-[625px] xl:h-[740px] object-cover"
                    src={url}
                    alt="Listing image"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <h1>{listing.title}</h1>
          </div>
        ) : (
          <p>This is a fallback. Listing can't be loaded!</p>
        )}
      </article>
    </main>
  );
}
