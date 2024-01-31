import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Listing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          <div className="w-full max-w-screen-2xl flex flex-wrap justify-center">
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
