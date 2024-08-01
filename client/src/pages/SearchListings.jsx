import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicListingCard from "../components/PublicListingCard";

export default function SearchListings() {
  const [formData, setFormData] = useState({
    searchTerm: "",
    type: "all",
    offer: false,
    parking: false,
    furnished: false,
    minPrice: 0,
    maxPrice: 100000000,
    sort: "createdAt",
    order: "desc",
  });
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitRequested, setSubmitRequested] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState({});
  const navigate = useNavigate();

  // Validation
  const validate = (formData) => {
    const errors = {};
    const { searchTerm, type, offer, parking, furnished, sort, order } =
      formData;

    if (typeof searchTerm !== "string") {
      errors.searchTerm = "Search term must be a string!";
    }

    if (!["all", "sale", "rent"].includes(type)) {
      errors.type =
        "Invalid type value. Type must be 'all', 'sale', or 'rent'!";
    }

    if (typeof offer !== "boolean") {
      errors.offer =
        "Invalid offer value. Offer can only be checked or unchecked!";
    }

    if (typeof parking !== "boolean") {
      errors.parking =
        "Invalid parking value. Parking can only be checked or unchecked!";
    }

    if (typeof furnished !== "boolean") {
      errors.furnished =
        "Invalid furnished value. Furnished can only be checked or unchecked!";
    }

    if (!["regularPrice", "createdAt"].includes(sort)) {
      errors.sort =
        "Invalid sort value. Sort must be 'regularPrice' or 'createdAt'!";
    }

    if (!["asc", "desc"].includes(order)) {
      errors.order = "Invalid order value. Order must be 'asc' or 'desc'!";
    }

    return errors;
  };

  // Handler functions
  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "rentAndSale" || name === "sale" || name === "rent") {
      setFormData({
        ...formData,
        type: value,
      });
    } else if (name === "offer" || name === "parking" || name === "furnished") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (["minPrice", "maxPrice"].includes(name)) {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else if (name === "sort") {
      const sort = value.split("_")[0];
      const order = value.split("_")[1];

      setFormData({
        ...formData,
        sort,
        order,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    setServerValidationErrors({});
    setValidationErrors(validate(formData));
    setSubmitRequested(true);
  };
  const handleShowMoreClick = () => {
    const newStartIndex = listings.length;
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("startIndex", newStartIndex);
    const newQueryString = searchParams.toString();

    const getListingsData = async () => {
      setError(null);

      try {
        const res = await fetch(`/api/listing/search?${newQueryString}`);
        const data = await res.json();

        if (res.ok) {
          setListings([...listings, ...data.listings]);
          setShowMore(data.remainingListings > 0);
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
  };

  // Side effects
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get("searchTerm") || "";
    const type = searchParams.get("type") || "all";
    const offer = searchParams.get("offer") === "true" ? true : false;
    const parking = searchParams.get("parking") === "true" ? true : false;
    const furnished = searchParams.get("furnished") === "true" ? true : false;
    const minPrice = searchParams.get("minPrice") || 0;
    const maxPrice = searchParams.get("maxPrice") || 100000000;
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    setFormData({
      searchTerm,
      type,
      offer,
      parking,
      furnished,
      minPrice,
      maxPrice,
      sort,
      order,
    });

    const getListingsData = async () => {
      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`/api/listing/search${location.search}`);
        const data = await res.json();

        if (res.ok) {
          setListings(data.listings);
          setShowMore(data.remainingListings > 0);
        } else if (res.status === 422) {
          const errors = {};

          data.errors.forEach((error) => {
            errors[error.path] = error.msg;
          });

          setServerValidationErrors(errors);
        } else {
          setError(data.message);
          setListings([]);
        }
      } catch (err) {
        setError("Failed to get listings data");
        setListings([]);
      }

      setLoading(false);
    };

    getListingsData();
  }, [location.search]);

  useEffect(() => {
    if (submitRequested && !Object.keys(validationErrors).length) {
      const searchParams = new URLSearchParams();
      for (const prop in formData) {
        searchParams.set(prop, formData[prop]);
      }
      searchParams.set("startIndex", 0);
      const newQueryString = searchParams.toString();

      navigate(`/search?${newQueryString}`);
    }
  }, [validationErrors]);

  return (
    <main>
      <article className="md:min-h-screen flex flex-col md:flex-row">
        <div className="md:max-w-[415px] border-b md:border-b-0 md:border-r border-gray-300 px-5 xs:px-7 py-8">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3.5">
              <label htmlFor="searchTerm" className="font-semibold">
                Search:
              </label>
              <input
                className="w-full border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
                id="searchTerm"
                name="searchTerm"
                type="text"
                placeholder="Search Listings"
                value={formData.searchTerm}
                onChange={handleChange}
              />
            </div>

            <p className="text-center text-red-600">
              {validationErrors.searchTerm || serverValidationErrors.searchTerm}
            </p>

            <div className="flex gap-3.5">
              <span className="font-semibold">Type:</span>

              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="rentAndSale"
                    name="rentAndSale"
                    type="checkbox"
                    value="all"
                    checked={formData.type === "all"}
                    onChange={handleChange}
                  />
                  <label htmlFor="rentAndSale">Rent & Sale</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="sale"
                    name="sale"
                    type="checkbox"
                    value="sale"
                    checked={formData.type === "sale"}
                    onChange={handleChange}
                  />
                  <label htmlFor="sale">Sale</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="rent"
                    name="rent"
                    type="checkbox"
                    value="rent"
                    checked={formData.type === "rent"}
                    onChange={handleChange}
                  />
                  <label htmlFor="rent">Rent</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="offer"
                    name="offer"
                    type="checkbox"
                    value="offer"
                    checked={formData.offer}
                    onChange={handleChange}
                  />
                  <label htmlFor="offer">Offer</label>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col text-center text-red-600">
              <p>{validationErrors.type || serverValidationErrors.type}</p>
              <p>{validationErrors.offer || serverValidationErrors.offer}</p>
            </div>

            <div className="flex gap-3.5">
              <span className="font-semibold">Amenities:</span>

              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="parking"
                    name="parking"
                    type="checkbox"
                    value="parking"
                    checked={formData.parking}
                    onChange={handleChange}
                  />
                  <label htmlFor="parking">Parking</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="furnished"
                    name="furnished"
                    type="checkbox"
                    value="furnished"
                    checked={formData.furnished}
                    onChange={handleChange}
                  />
                  <label htmlFor="furnished">Furnished</label>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col text-center text-red-600">
              <p>
                {validationErrors.parking || serverValidationErrors.parking}
              </p>
              <p>
                {validationErrors.furnished || serverValidationErrors.furnished}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <label className="font-semibold" htmlFor="minPrice">
                  Min Price:
                </label>
                <input
                  className="w-40 p-2.5 rounded-lg focus:outline-gray-300"
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  min="0"
                  max={(formData.maxPrice - 1).toString()}
                  value={formData.minPrice.toString()} // A trick to remove leading 0
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-3.5">
                <label className="font-semibold" htmlFor="maxPrice">
                  Max Price:
                </label>
                <input
                  className="w-40 p-2.5 rounded-lg focus:outline-gray-300"
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  min={(formData.minPrice + 1).toString()}
                  max="100000000"
                  value={formData.maxPrice.toString()} // A trick to remove leading 0
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="w-full flex flex-col text-center text-red-600">
              <p>
                {/* {validationErrors.parking || serverValidationErrors.parking} */}
              </p>
              <p>
                {/* {validationErrors.furnished || serverValidationErrors.furnished} */}
              </p>
            </div>

            <div className="flex items-center gap-3.5">
              <label htmlFor="sort" className="font-semibold">
                Sort:
              </label>

              <select
                className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5"
                id="sort"
                name="sort"
                onChange={handleChange}
                value={formData.sort + "_" + formData.order}
              >
                <option value="regularPrice_desc">Price high to low</option>
                <option value="regularPrice_asc">Price low to high</option>
                <option value="createdAt_desc">Latest</option>
                <option value="createdAt_asc">Oldest</option>
              </select>
            </div>

            <div className="w-full flex flex-col text-center text-red-600">
              <p>{validationErrors.sort || serverValidationErrors.sort}</p>
              <p>{validationErrors.order || serverValidationErrors.order}</p>
              <p>{serverValidationErrors.startIndex}</p>
            </div>

            <button
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none"
            >
              {loading ? "LOADING..." : "SEARCH"}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-8 px-5 xs:px-7 py-8 md:flex-1">
          <h1 className="font-semibold text-2xl sm:text-3xl">
            Search results:
          </h1>

          {error ? (
            <p className="text-red-600" aria-label="Error message">
              {error}
            </p>
          ) : (
            <div className="flex flex-wrap gap-7">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <PublicListingCard key={listing._id} listing={listing} />
                ))
              ) : (
                <p>No listings found!</p>
              )}
            </div>
          )}

          {showMore && (
            <button
              className="text-center text-green-600 hover:underline"
              onClick={handleShowMoreClick}
            >
              Show more listings
            </button>
          )}
        </div>
      </article>
    </main>
  );
}
