import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  resetUser,
  signUpStart,
  signUpSuccess,
  signUpFailure,
} from "../redux/user/userSlice";
import { useSelector, useDispatch } from "react-redux";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.user);

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
      dispatch(signUpStart());

      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        dispatch(signUpSuccess());
        navigate("/sign-in");
        return;
      } else {
        if (res.status === 500) {
          const data = await res.json();

          dispatch(signUpFailure(data.message));
        } else {
          dispatch(signUpFailure(res.statusText));
        }
      }
    } catch (err) {
      dispatch(signUpFailure("Failed to handle submit for sign up"));
    }
  };

  // Side effects
  useEffect(() => {
    dispatch(resetUser());
  }, []);

  return (
    <main className="flex justify-center pt-10 pb-5">
      <article className="flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Sign Up</h1>

        <form
          className="w-64 xs:w-72 sm:w-96 flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <input
            className="border border-gray-200 focus:outline-gray-300 rounded-lg p-2.5 sm:p-3"
            type="text"
            id="username"
            placeholder="Username"
            aria-label="Username"
            onChange={handleChange}
            value={formData.username}
          />
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
            {loading ? "LOADING..." : "SIGN UP"}
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

        {error && (
          <p className="text-red-600 text-center" aria-label="Error message">
            {error}
          </p>
        )}
      </article>
    </main>
  );
}
