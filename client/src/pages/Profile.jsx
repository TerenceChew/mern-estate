import { useSelector } from "react-redux";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <main className="flex justify-center pt-10 ">
      <article className="flex flex-col items-center gap-8 ">
        <h1 className="font-semibold text-2xl sm:text-3xl">Profile</h1>

        <form className="w-64 xs:w-72 sm:w-96 flex flex-col gap-4 ">
          <img
            className="w-24 h-24 rounded-full object-cover self-center cursor-pointer"
            src={currentUser.photoURL}
            alt="Profile photo"
          />

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
            UPDATE
          </button>
        </form>

        <div className="w-full flex justify-between ">
          <span className="text-red-600 cursor-pointer">Delete Account</span>
          <span className="text-red-600 cursor-pointer">Sign Out</span>
        </div>
      </article>
    </main>
  );
}
