const validateSignIn = (formData) => {
  const errors = {};
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email!";
  }

  if (!formData.password) {
    errors.password = "Please enter your password!";
  }

  return errors;
};

export { validateSignIn };
