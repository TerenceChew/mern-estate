import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  resetUser,
  signUpStart,
  signUpSuccess,
  signUpFailure,
} from "../redux/user/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { validateSignUp } from "../validations/auth.validation.js";
import { CgSpinner } from "react-icons/cg";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const formDataRef = useRef(formData);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.user);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitRequested, setSubmitRequested] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState({});

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
    setValidationErrors(validateSignUp(formData));
    setSubmitRequested(true);
  };

  // Side effects
  useEffect(() => {
    dispatch(resetUser());
  }, [dispatch]);

  useEffect(() => {
    const makeSignUpRequest = async () => {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataRef.current),
      });

      if (res.ok) {
        dispatch(signUpSuccess());
        navigate("/sign-in");
        return;
      } else {
        const data = await res.json();

        if (res.status === 500) {
          dispatch(signUpFailure(data.message));
        } else if (res.status === 422) {
          const errors = {};

          data.errors.forEach((error) => {
            errors[error.path] = error.msg;
          });

          setServerValidationErrors(errors);
          dispatch(signUpFailure(""));
        } else {
          dispatch(signUpFailure(res.statusText));
        }
      }
    };

    if (submitRequested && !Object.keys(validationErrors).length) {
      try {
        dispatch(signUpStart());
        makeSignUpRequest();
      } catch (err) {
        dispatch(signUpFailure("Failed to handle submit for sign up"));
      }
    }
  }, [validationErrors, submitRequested, dispatch, navigate]);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  return (
    <main className="flex justify-center py-10">
      <article className="w-64 xs:w-full xs:max-w-72 sm:max-w-sm flex flex-col items-center gap-8">
        <h1 className="font-semibold text-2xl sm:text-3xl">Sign Up</h1>

        <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
          <input
            className="border border-gray-300 focus:outline-gray-400 rounded-lg p-2.5 sm:p-3 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            aria-label="Username"
            onChange={handleChange}
            value={formData.username}
            minLength="5"
            maxLength="20"
            required
          />
          <p className="text-center text-red-600">
            {validationErrors.username || serverValidationErrors.username}
          </p>
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
            minLength="8"
            maxLength="16"
            required
          />
          <p className="text-center text-red-600">
            {validationErrors.password || serverValidationErrors.password}
          </p>
          <button
            disabled={loading}
            className="flex justify-center items-center gap-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-3 disabled:pointer-events-none"
          >
            {loading && <CgSpinner className="animate-spin text-2xl" />}
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </button>
        </form>

        <div className="flex gap-2">
          <p>Have an account?</p>
          <Link to="/sign-in" className="text-blue-700 hover:underline">
            Sign in
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
