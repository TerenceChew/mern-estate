import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  resetUser,
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";
import { validateSignIn } from "../validations/auth.validation.js";
import { CgSpinner } from "react-icons/cg";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const formDataRef = useRef(formData);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitRequested, setSubmitRequested] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState({});
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

    setServerValidationErrors({});
    setValidationErrors(validateSignIn(formData));
    setSubmitRequested(true);
  };

  // Side effects
  useEffect(() => {
    dispatch(resetUser());
  }, [dispatch]);

  useEffect(() => {
    const makeSignInRequest = async () => {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataRef.current),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
        return;
      } else if (res.status === 422) {
        const errors = {};

        data.errors.forEach((error) => {
          errors[error.path] = error.msg;
        });

        setServerValidationErrors(errors);
        dispatch(signInFailure(""));
      } else {
        dispatch(signInFailure(data.message));
      }
    };

    if (submitRequested && !Object.keys(validationErrors).length) {
      try {
        dispatch(signInStart());
        makeSignInRequest();
      } catch (err) {
        dispatch(signInFailure("Failed to handle submit for sign in"));
      }
    }
  }, [validationErrors, submitRequested, dispatch, navigate]);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  return (
    <main className="flex justify-center py-10">
      <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-sm flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Sign In</h1>

        <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
          <input
            className="border border-gray-300 focus:outline-gray-400 rounded-lg p-2.5 sm:p-3 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            aria-label="Email"
            onChange={handleChange}
            value={formData.email}
            required
          />
          <p className="text-center text-red-600">
            {validationErrors.email || serverValidationErrors.email}
          </p>
          <input
            className="border border-gray-300 focus:outline-gray-400 rounded-lg p-2.5 sm:p-3"
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            onChange={handleChange}
            value={formData.password}
            required
          />
          <p className="text-center text-red-600">
            {validationErrors.password || serverValidationErrors.password}
          </p>
          <button
            disabled={loading}
            className="flex justify-center items-center gap-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-3 disabled:pointer-events-none mb-2"
          >
            {loading && <CgSpinner className="animate-spin text-2xl" />}
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
          <OAuth />
        </form>

        <div className="flex gap-2">
          <p>Don&apos;t have an account?</p>
          <Link to="/sign-up" className="text-blue-700 hover:underline">
            Sign up
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
