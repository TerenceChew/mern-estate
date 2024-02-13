export default function SearchListings() {
  return (
    <main>
      <article className="md:min-h-screen flex flex-col md:flex-row">
        <div className="md:max-w-[415px] border-b md:border-b-0 md:border-r border-gray-300 px-5 xs:px-7 py-8">
          <form className="flex flex-col gap-8">
            <div className="flex items-center gap-3.5">
              <label htmlFor="searchTerm" className="font-semibold">
                Search:
              </label>
              <input
                className="w-full border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
                id="searchTerm"
                name="searchTerm"
                type="text"
                placeholder="Search Listings"
              />
            </div>

            <div className="flex gap-3.5">
              <span className="font-semibold">Type:</span>

              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="rentAndSale"
                    name="rentAndSale"
                    type="checkbox"
                  />
                  <label htmlFor="rentAndSale">Rent & Sale</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="sale"
                    name="sale"
                    type="checkbox"
                  />
                  <label htmlFor="sale">Sale</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="rent"
                    name="rent"
                    type="checkbox"
                  />
                  <label htmlFor="rent">Rent</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="offer"
                    name="offer"
                    type="checkbox"
                  />
                  <label htmlFor="offer">Offer</label>
                </div>
              </div>
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
                  />
                  <label htmlFor="parking">Parking</label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    className="w-4 h-4"
                    id="furnished"
                    name="furnished"
                    type="checkbox"
                  />
                  <label htmlFor="furnished">Furnished</label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <label htmlFor="sort" className="font-semibold">
                Sort:
              </label>

              <select
                className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
                id="sort"
                name="sort"
              >
                <option>Price high to low</option>
                <option>Price low to high</option>
                <option>Latest</option>
                <option>Oldest</option>
              </select>
            </div>

            <button className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none">
              SEARCH
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-8 px-5 xs:px-7 py-8 md:flex-1">
          <h1 className="font-semibold text-2xl sm:text-3xl">
            Search results:
          </h1>
        </div>
      </article>
    </main>
  );
}
