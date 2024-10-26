import { useEffect, useState, useRef } from "react";
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
  const formDataRef = useRef(formData);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.user);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitRequested, setSubmitRequested] = useState(false);
  const [serverValidationErrors, setServerValidationErrors] = useState({});

  // Validation
  const validate = (formData) => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;

    if (!formData.username) {
      errors.username = "Please enter a valid username!";
    } else if (formData.username.length < 5) {
      errors.username = "Username must be at least 5 characters!";
    } else if (formData.username.length > 20) {
      errors.username = "Username cannot be more than 20 characters!";
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email!";
    }

    if (!formData.password) {
      errors.password = "Please enter a valid password!";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters!";
    } else if (formData.password.length > 16) {
      errors.password = "Password cannot be more than 16 characters!";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must contain at least 1 digit, 1 uppercase and 1 lowercase letter!";
    }

    return errors;
  };

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
    setValidationErrors(validate(formData));
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
            className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg p-2.5 sm:p-3 disabled:opacity-80 disabled:pointer-events-none"
          >
            {loading ? "LOADING..." : "SIGN UP"}
          </button>
        </form>

        <div className="flex gap-2">
          <p>Have an account?</p>
          <Link to="/sign-in">
            <span className="text-blue-700 hover:underline">Sign in</span>
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
