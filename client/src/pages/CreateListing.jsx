export default function CreateListing() {
  return (
    <main className="flex justify-center py-10">
      <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-md xl:max-w-5xl flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Create a Listing</h1>

        <form className="w-full flex flex-col xl:flex-row xl:flex-wrap gap-4 xl:gap-6">
          <div className="flex flex-col flex-1 gap-4">
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              type="text"
              id="name"
              name="name"
              aria-label="Name"
              placeholder="Name"
              minLength="10"
              maxLength="60"
              required
            />
            <textarea
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              id="description"
              name="description"
              aria-label="Description"
              placeholder="Description"
              required
            />
            <input
              className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
              type="text"
              id="address"
              name="address"
              aria-label="Address"
              placeholder="Address"
              minLength="10"
              maxLength="60"
              required
            />

            <div className="flex flex-wrap items-center gap-3.5 xl:gap-5">
              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="sell"
                  name="sell"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="sell">
                  Sell
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="rent"
                  name="rent"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="rent">
                  Rent
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="parking"
                  name="parking"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="parking">
                  Parking
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="furnished"
                  name="furnished"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="furnished">
                  Furnished
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 cursor-pointer"
                  id="offer"
                  name="offer"
                  type="checkbox"
                />
                <label className="font-semibold" htmlFor="offer">
                  Offer
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2.5">
                <input
                  className="w-16 p-2 rounded-lg focus:outline-gray-300"
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  defaultValue={1}
                  min="1"
                  max="15"
                  required
                />
                <label className="font-semibold" htmlFor="bedrooms">
                  Beds
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  className="w-16 p-2 rounded-lg focus:outline-gray-300"
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  defaultValue={1}
                  min="1"
                  max="15"
                  required
                />
                <label className="font-semibold" htmlFor="bathrooms">
                  Baths
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  className="w-24 p-2 rounded-lg focus:outline-gray-300"
                  id="regularPrice"
                  name="regularPrice"
                  type="number"
                  defaultValue={0}
                  min="1"
                  required
                />
                <label className="font-semibold" htmlFor="regularPrice">
                  Regular price ($/Month)
                </label>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  className="w-24 p-2 rounded-lg focus:outline-gray-300"
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  defaultValue={0}
                  min="1"
                />
                <label className="font-semibold" htmlFor="discountPrice">
                  Discount price ($/Month)
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 gap-4">
            <label htmlFor="images">
              <strong>Images:</strong> The first image will be the cover (max 6)
            </label>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <input
                className="flex-1 border border-solid border-gray-300 rounded-lg p-2.5"
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                required
                aria-label="Select images to upload"
              />
              <button
                className="w-28 border border-solid border-green-600 text-green-600 hover:bg-green-600 hover:text-white duration-300 rounded-lg p-2.5"
                type="button"
                aria-label="Upload images"
              >
                UPLOAD
              </button>
            </div>
            <button className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none">
              CREATE LISTING
            </button>
          </div>
        </form>
      </article>
    </main>
  );
}
