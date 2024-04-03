import PropTypes from "prop-types";

export default function DeleteConfirmationBox({
  deleteHandler,
  cancelHandler,
  type,
}) {
  return (
    <div
      className="w-[265px] xs:w-[350px] h-48 flex flex-col bg-white px-4 xs:px-5 py-4 rounded-md shadow-sm shadow-gray-300 fixed top-1/2 left-1/2	-translate-x-2/4 -translate-y-2/4"
      aria-label={`Delete ${type} confirmation box`}
    >
      <h1 className="w-full font-semibold text-xl xs:text-2xl border-b pb-4">
        Delete Confirmation
      </h1>

      <p className="my-2.5 xs:my-4">
        Are you sure you want to delete this {type}?
      </p>

      <div className="w-full flex justify-end gap-5 mt-2 xs:mt-4">
        <button
          className="hover:font-medium"
          onClick={cancelHandler}
          aria-label={`Cancel delete ${type}`}
        >
          Cancel
        </button>
        <button
          className="w-20 h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          onClick={deleteHandler}
          aria-label={`Confirm delete ${type}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

DeleteConfirmationBox.propTypes = {
  deleteHandler: PropTypes.func.isRequired,
  cancelHandler: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};
