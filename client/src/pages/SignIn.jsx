import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice.js";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Handler functions
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(signInStart());

      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
        return;
      } else {
        dispatch(signInFailure(data.message));
      }
    } catch (err) {
      dispatch(signInFailure("Failed to handle submit for sign in"));
    }
  };

  return (
    <main className="flex justify-center pt-10">
      <article className="flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Sign In</h1>

        <form
          className="w-64 xs:w-72 sm:w-96 flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <input
            className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
            type="email"
            id="email"
            placeholder="Email"
            aria-label="Email"
            onChange={handleChange}
            value={formData.email}
          />
          <input
            className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
            type="password"
            id="password"
            placeholder="Password"
            aria-label="Password"
            onChange={handleChange}
            value={formData.password}
          />
          <button
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none"
          >
            {loading ? "LOADING..." : "SIGN IN"}
          </button>
        </form>

        <div className="flex gap-2">
          <p>Don&apos;t have an account?</p>
          <Link to="/sign-up">
            <span className="text-blue-500 hover:text-blue-600 hover:cursor-pointer">
              Sign up
            </span>
          </Link>
        </div>

        {error && (
          <p className="text-red-600" aria-label="Error message">
            {error}
          </p>
        )}
      </article>
    </main>
  );
}
