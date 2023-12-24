import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export default function Header() {
  return (
    <header className="h-32 sm:h-20 flex flex-col sm:flex-row justify-between items-center px-3 sm:px-4 lg:px-8 py-3 bg-slate-200 shadow-md">
      <Link to="/">
        <h1 className="font-bold text-xl">
          <span className="text-slate-500">Mern</span>
          <span className="text-slate-700">Estate</span>
        </h1>
      </Link>

      <form className="w-64 sm:w-56 md:w-72 2xl:w-96 flex justify-between items-center bg-slate-50 rounded-lg px-3 py-1.5 sm:py-2.5">
        <input
          className="bg-transparent w-10/12 focus:outline-none"
          type="text"
          placeholder="Search..."
        ></input>
        <FaSearch className="hover:cursor-pointer" />
      </form>

      <nav className="w-48 sm:w-44 md:w-48 lg:w-52 2xl:w-56 flex justify-between items-center text-sm sm:text-base">
        <Link to="/">
          <button className="text-slate-700 hover:underline">Home</button>
        </Link>
        <Link to="/about">
          <button className="text-slate-700 hover:underline">About</button>
        </Link>
        <Link to="/sign-in">
          <button className="text-slate-700 hover:underline">Sign In</button>
        </Link>
      </nav>
    </header>
  );
}
