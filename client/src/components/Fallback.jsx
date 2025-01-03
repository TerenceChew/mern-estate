import propTypes from "prop-types";

export default function Fallback({ error, resetErrorBoundary }) {
  console.error(error);

  return (
    <main className="min-h-dvh flex justify-center items-center p-5 bg-gray-50">
      <article>
        <div
          className="p-5 bg-slate-200 text-center rounded-md shadow-md"
          role="alert"
        >
          <h1 className="mb-2 font-bold text-lg">
            Sorry! Website is either down or under maintenance!
          </h1>

          <p>
            Try{" "}
            <button
              className="text-blue-700 hover:underline"
              onClick={resetErrorBoundary}
            >
              reloading
            </button>{" "}
            or coming back later &#128591;
          </p>
        </div>
      </article>
    </main>
  );
}

Fallback.propTypes = {
  error: propTypes.instanceOf(Error).isRequired,
  resetErrorBoundary: propTypes.func.isRequired,
};
