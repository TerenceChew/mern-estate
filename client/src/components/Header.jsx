import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

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
    <header className="h-[140px] sm:h-20 flex flex-col sm:flex-row justify-between items-center px-3 sm:px-4 lg:px-8 py-3 bg-slate-200 shadow-md relative z-20">
      <Link to="/">
        <h1 className="font-bold text-xl">
          <span className="text-slate-500">Mern</span>
          <span className="text-slate-700">Estate</span>
        </h1>
      </Link>

      <form
        className="w-64 sm:w-56 md:w-72 2xl:w-96 flex justify-between items-center bg-slate-50 rounded-lg px-3 py-1.5 sm:py-2.5"
        onSubmit={handleSubmit}
      >
        <input
          className="bg-transparent autofill:shadow-[inset_0_0_0px_1000px_rgb(248,250,252)] w-10/12 focus:outline-none"
          type="text"
          placeholder="Search listings"
          aria-label="Search listings"
          name="searchTerm"
          value={searchTerm}
          onChange={handleChange}
        />
        <button>
          <FaSearch className="hover:cursor-pointer text-lg text-slate-700" />
        </button>
      </form>

      <nav className="w-48 sm:w-44 md:w-48 lg:w-52 2xl:w-56 flex justify-between items-center text-sm sm:text-base">
        <Link to="/">
          <button className="text-slate-700 hover:underline">Home</button>
        </Link>
        <Link to="/about">
          <button className="text-slate-700 hover:underline">About</button>
        </Link>

        {currentUser ? (
          <Link to="/profile">
            <img
              className="w-7 sm:w-8 lg:w-9 h-7 sm:h-8 lg:h-9 rounded-full object-cover"
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
