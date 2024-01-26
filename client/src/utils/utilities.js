const generateUniqueFileName = (fileName) => new Date().getTime() + fileName;

const formatNumberWithCommas = (num) => num.toLocaleString("en-US");

export { generateUniqueFileName, formatNumberWithCommas };
