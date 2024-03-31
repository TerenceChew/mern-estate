const generateUniqueFileName = (fileName) => new Date().getTime() + fileName;

const formatNumberWithCommas = (num) => num.toLocaleString("en-US");

const generateEmailHref = (email, subject, message) => {
  return `mailto:${email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`;
};

const extractImageFileNameFromUrl = (url) => {
  const fileNameRegex = /[^\/]+(?=\?[^\/]*$)/;

  return url.match(fileNameRegex)[0];
};

export {
  generateUniqueFileName,
  formatNumberWithCommas,
  generateEmailHref,
  extractImageFileNameFromUrl,
};
