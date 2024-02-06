const generateUniqueFileName = (fileName) => new Date().getTime() + fileName;

const formatNumberWithCommas = (num) => num.toLocaleString("en-US");

const generateEmailHref = (email, subject, message) => {
  return `mailto:${email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(message)}`;
};

export { generateUniqueFileName, formatNumberWithCommas, generateEmailHref };
