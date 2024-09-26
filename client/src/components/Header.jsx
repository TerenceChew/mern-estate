import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import mernEstateIcon from "../../public/home.png";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Handler functions
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("searchTerm", searchTerm);
    searchParams.set("startIndex", 0);
    const newQueryString = searchParams.toString();

    navigate(`/search?${newQueryString}`);
  };

  // Side effects
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTermFromParams = searchParams.get("searchTerm");

    setSearchTerm(searchTermFromParams || "");
  }, [location.search]);

  return (
    <header className="h-[150px] sm:h-[90px] flex flex-col sm:flex-row justify-between items-center px-1 sm:px-4 lg:px-6 pt-4 pb-3 bg-white shadow-[0_2px_5px_0_rgba(44,44,44,0.08)] relative z-20">
      <Link to="/" className="flex items-center gap-3">
        <img
          src={mernEstateIcon}
          alt="Mern Estate icon"
          className="w-7 h-7 hover:rotate-[-10deg] transition-transform duration-300"
        />
        <h1 className="font-bold text-xl">
          <span className="text-slate-500">Mern</span>
          <span className="text-slate-700">Estate</span>
        </h1>
      </Link>

      <form
        className="w-60 xs:w-[265px] sm:w-[240px] md:w-72 lg:w-96 flex justify-between items-center border-solid border-[1px] border-slate-100 rounded-lg p-0.5 md:p-1 bg-slate-100"
        onSubmit={handleSubmit}
      >
        <input
          className="bg-transparent autofill:shadow-[inset_0_0_0px_1000px_rgb(241,245,249)] w-[85%] lg:w-[90%] focus:outline-none px-2"
          type="text"
          placeholder="Search listings"
          aria-label="Search listings"
          name="searchTerm"
          value={searchTerm}
          onChange={handleChange}
        />
        <button
          aria-label="Search listings button"
          className="w-7 h-9 flex justify-center items-center hover:-translate-y-0.5 transition-transform duration-300"
        >
          <FaSearch className="text-lg text-slate-700" />
        </button>
      </form>

      <nav className="flex justify-between items-center gap-7 sm:gap-6 lg:gap-8 text-sm sm:text-base">
        {currentUser && (
          <Link to={`/listings/${currentUser._id}`}>
            <button className="text-slate-700 hover:underline">
              My Listings
            </button>
          </Link>
        )}

        {currentUser ? (
          <Link to="/profile">
            <img
              className="w-7 sm:w-8 lg:w-9 h-7 sm:h-8 lg:h-9 rounded-full object-cover hover:-translate-y-0.5 transition-transform duration-300"
              src={currentUser.photoURL}
              alt="Profile photo"
            />
          </Link>
        ) : (
          <Link to="/sign-in">
            <button className="text-slate-700 hover:underline">Sign In</button>
          </Link>
        )}
      </nav>
    </header>
  );
}
