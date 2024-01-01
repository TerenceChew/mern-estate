const generateDefaultPassword = () => {
  const left = Math.random().toString(36).slice(-8);
  const right = Math.random().toString(36).slice(-8);

  return left + right;
};

const generateUniqueUsername = (username) => {
  return username + Math.random().toString(36).slice(-5);
};

export { generateDefaultPassword, generateUniqueUsername };
