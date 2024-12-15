// Use this when there is no default error
export const generateError = (statusCode, message) => {
  const error = new Error();

  error.statusCode = statusCode;
  error.message = message;

  return error;
};
