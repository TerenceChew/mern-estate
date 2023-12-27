import { Link } from "react-router-dom";

export default function signUp() {
  return (
    <main className="flex justify-center pt-10">
      <article className="flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Sign Up</h1>

        <form className="w-64 xs:w-72 sm:w-96 flex flex-col gap-4">
          <input
            className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
            type="text"
            id="username"
            placeholder="Username"
            aria-label="Username"
          />
          <input
            className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
            type="email"
            id="email"
            placeholder="Email"
            aria-label="Email"
          />
          <input
            className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
            type="password"
            id="password"
            placeholder="Password"
            aria-label="Password"
          />
          <button className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none">
            SIGN UP
          </button>
        </form>

        <div className="flex gap-2">
          <p>Have an account?</p>
          <Link to="/sign-in">
            <span className="text-blue-500 hover:text-blue-600 hover:cursor-pointer">
              Sign in
            </span>
          </Link>
        </div>
      </article>
    </main>
  );
}
