export default function Fallback({ error, resetErrorBoundary }) {
  return (
    <main className="h-dvh flex justify-center items-center p-5 bg-[rgb(235,240,235)]">
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
              className="text-blue-600 hover:underline"
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
