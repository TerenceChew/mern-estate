import { app } from "../firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess, signInFailure } from "../redux/user/userSlice";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handler functions
  const handleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // The signed-in user info
      const { displayName: username, email, photoURL } = user;
      const res = await fetch("/api/auth/google-sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          photoURL,
        }),
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
      dispatch(signInFailure("Failed to sign in with Google"));
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="bg-red-700 hover:bg-red-800 text-white rounded-lg p-3 disabled:opacity-80 disabled:pointer-events-none"
    >
      CONTINUE WITH GOOGLE
    </button>
  );
}
