import { useEffect, useState } from "react";
import { generateEmailHref } from "../utils/utilities";
import PropTypes from "prop-types";

export default function ContactLandlord({ listing }) {
  const { title, userRef } = listing;
  const [landlord, setLandlord] = useState(null);
  const [error, setError] = useState(null);
  const [userMessage, setUserMessage] = useState("");

  // Handler functions
  const handleChange = (e) => {
    setUserMessage(e.target.value);
  };

  // Side effects
  useEffect(() => {
    const getLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${userRef}`);
        const data = await res.json();

        if (res.ok) {
          setLandlord(data);
        } else {
          setError(data.message);
          setLandlord(null);
        }
      } catch (err) {
        setError("Failed to get landlord data!");
        setLandlord(null);
      }
    };

    getLandlord();
  }, []);

  return (
    <div className="mt-3">
      {error ? (
        <p className="text-red-600 text-center" aria-label="Error message">
          {error} Landlord may have deleted his/her account!
        </p>
      ) : (
        <div className="w-full flex flex-col gap-1">
          <p>
            <span className="text-gray-600">Contact </span>
            <span className="font-semibold">
              {landlord ? landlord.username : ""}
            </span>
            <span className="text-gray-600"> for </span>
            <span className="font-semibold">{title}</span>
          </p>

          <textarea
            className="min-h-20 rounded-lg border border-gray-300 focus:outline-gray-400 p-1.5"
            name="user message"
            placeholder="Enter your message here"
            aria-label="Enter your message here"
            onChange={handleChange}
            value={userMessage}
          />

          <a
            className="w-full bg-slate-700 hover:bg-slate-800 text-white text-center rounded-lg p-2.5 sm:p-3 mt-4"
            href={generateEmailHref(
              landlord ? landlord.email : "",
              title,
              userMessage
            )}
          >
            SEND MESSAGE
          </a>
        </div>
      )}
    </div>
  );
}

ContactLandlord.propTypes = {
  listing: PropTypes.object.isRequired,
};
