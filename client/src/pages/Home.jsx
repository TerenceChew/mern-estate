import { Link } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useState } from "react";
import defaultListingImg1 from "../assets/defaultListingImg1.jpeg";
import defaultListingImg2 from "../assets/defaultListingImg2.jpeg";
import PublicListingCard from "../components/PublicListingCard";

export default function Home() {
  const [swiperImgs, setSwiperImgs] = useState([
    defaultListingImg1,
    defaultListingImg2,
  ]);
  const [listingsWithOffer, setListingsWithOffer] = useState([]);
  const [listingsForRent, setListingsForRent] = useState([]);
  const [listingsForSale, setListingsForSale] = useState([]);
  const [error, setError] = useState({});

  useEffect(() => {
    setError({});

    const fetchListingsWithOffer = async () => {
      try {
        const res = await fetch("/api/listing/search?offer=true&limit=4");
        const data = await res.json();

        if (res.ok) {
          setListingsWithOffer(data.listings);
          const coverImgs = data.listings.map(
            (listing) => listing.imageUrls[0]
          );
          setSwiperImgs(coverImgs);
        } else {
          setError((error) => ({
            ...error,
            listingsWithOffer:
              data.message || "Failed to fetch listings with offer",
          }));
        }
      } catch (err) {
        setError((error) => ({
          ...error,
          listingsWithOffer: "Failed to fetch listings with offer",
        }));
      }
    };
    const fetchListingsForRent = async () => {
      try {
        const res = await fetch("/api/listing/search?type=rent&limit=4");
        const data = await res.json();

        if (res.ok) {
          setListingsForRent(data.listings);
        } else {
          setError((error) => ({
            ...error,
            listingsForRent:
              data.message || "Failed to fetch listings for rent",
          }));
        }
      } catch (err) {
        setError((error) => ({
          ...error,
          listingsForRent: "Failed to fetch listings for rent",
        }));
      }
    };
    const fetchListingsForSale = async () => {
      try {
        const res = await fetch("/api/listing/search?type=sale&limit=4");
        const data = await res.json();

        if (res.ok) {
          setListingsForSale(data.listings);
        } else {
          setError((error) => ({
            ...error,
            listingsForSale:
              data.message || "Failed to fetch listings for sale",
          }));
        }
      } catch (err) {
        setError((error) => ({
          ...error,
          listingsForSale: "Failed to fetch listings for sale",
        }));
      }
    };

    fetchListingsWithOffer();
    fetchListingsForRent();
    fetchListingsForSale();
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
    <main className="bg-gray-50">
      <article className="flex flex-col">
        <section
          className="flex justify-center items-center"
          aria-label="Hero section"
        >
          <div className="flex flex-col gap-4 px-3.5 sm:px-7 py-14 sm:py-24">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-700">
              Find your next <span className="text-slate-500">perfect</span>
              <br /> home with ease
            </h1>

            <p className="text-sm text-gray-600">
              Mern Estate will help you find your new home fast, easy and
              comfortable.
              <br />
              We have a wide range of properties for you to choose from.
            </p>

            <Link to="/search" className="w-max text-blue-700 hover:underline">
              Let&apos;s start now!
            </Link>
          </div>
        </section>

        <section>
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            style={swiperStyle}
          >
            {swiperImgs.map((imgUrl) => (
              <SwiperSlide key={imgUrl}>
                <img
                  src={imgUrl}
                  alt="Listing image"
                  className="w-full h-[450px] md:h-[500px] lg:h-[650px] object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <section
          className="min-h-[8930px] xs:min-h-[8645px] min-[800px]:min-h-[4000px] min-[1600px]:min-h-[2195px] flex flex-col"
          aria-label="Listing sections container"
        >
          <section className="mx-auto flex flex-col gap-5 px-3.5 pt-14">
            <div>
              <h2 className="text-slate-700 font-semibold text-2xl">
                Recent offers
              </h2>
              <Link
                to="/search?offer=true"
                className="text-sm text-blue-700 hover:underline"
              >
                Show more offers
              </Link>
            </div>

            <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1600px]:grid-cols-4 gap-6">
              {error.listingsWithOffer ? (
                <p className="text-red-600" aria-label="Error message">
                  {error.listingsWithOffer}
                </p>
              ) : listingsWithOffer.length ? (
                listingsWithOffer.map((listing) => (
                  <PublicListingCard listing={listing} key={listing._id} />
                ))
              ) : (
                <p className="w-[265px]">
                  No listings with offer at the moment!
                </p>
              )}
            </div>
          </section>

          <section className="mx-auto flex flex-col gap-5 px-3.5 pt-14">
            <div>
              <h2 className="text-slate-700 font-semibold text-2xl">
                Recent places for rent
              </h2>
              <Link
                to="/search?type=rent"
                className="text-sm text-blue-700 hover:underline"
              >
                Show more places for rent
              </Link>
            </div>

            <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1600px]:grid-cols-4 gap-6">
              {error.listingsForRent ? (
                <p className="text-red-600" aria-label="Error message">
                  {error.listingsForRent}
                </p>
              ) : listingsForRent.length ? (
                listingsForRent.map((listing) => (
                  <PublicListingCard listing={listing} key={listing._id} />
                ))
              ) : (
                <p className="w-[265px]">No listings for rent at the moment!</p>
              )}
            </div>
          </section>

          <section className="mx-auto flex flex-col gap-5 px-3.5 py-14">
            <div>
              <h2 className="text-slate-700 font-semibold text-2xl">
                Recent places for sale
              </h2>
              <Link
                to="/search?type=sale"
                className="text-sm text-blue-700 hover:underline"
              >
                Show more places for sale
              </Link>
            </div>

            <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1200px]:grid-cols-3 min-[1600px]:grid-cols-4 gap-6">
              {error.listingsForSale ? (
                <p className="text-red-600" aria-label="Error message">
                  {error.listingsForSale}
                </p>
              ) : listingsForSale.length ? (
                listingsForSale.map((listing) => (
                  <PublicListingCard listing={listing} key={listing._id} />
                ))
              ) : (
                <p className="w-[265px]">No listings for sale at the moment!</p>
              )}
            </div>
          </section>
        </section>
      </article>
    </main>
  );
}
