import PropTypes from "prop-types";

export default function DeleteConfirmationBox({
  deleteHandler,
  cancelHandler,
}) {
  return (
    <div
      className="w-64 xs:w-72 h-36 flex flex-col items-center justify-between bg-slate-200 px-5 xs:px-8 pt-6 pb-5 rounded-lg shadow-md shadow-gray-500 fixed top-1/2 left-1/2	-translate-x-2/4 -translate-y-2/4"
      aria-label="Delete account confirmation box"
    >
      <h1 className="font-semibold text-lg">Confirm delete account?</h1>

      <div className="w-full flex justify-between">
        <button
          className="w-24 h-9 bg-green-700 hover:bg-green-800 text-white rounded-lg"
          onClick={deleteHandler}
          aria-label="Confirm delete account"
        >
          DELETE
        </button>
        <button
          className="w-24 h-9 bg-red-700 hover:bg-red-800 text-white rounded-lg"
          onClick={cancelHandler}
          aria-label="Cancel delete account"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

DeleteConfirmationBox.propTypes = {
  deleteHandler: PropTypes.func.isRequired,
  cancelHandler: PropTypes.func.isRequired,
};
