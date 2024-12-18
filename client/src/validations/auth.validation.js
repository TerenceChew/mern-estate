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

const validateSignUp = (formData) => {
  const errors = {};
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;

  if (!formData.username) {
    errors.username = "Please enter a valid username!";
  } else if (formData.username.length < 5) {
    errors.username = "Username must be at least 5 characters!";
  } else if (formData.username.length > 20) {
    errors.username = "Username cannot be more than 20 characters!";
  }

  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email!";
  }

  if (!formData.password) {
    errors.password = "Please enter a valid password!";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters!";
  } else if (formData.password.length > 16) {
    errors.password = "Password cannot be more than 16 characters!";
  } else if (!passwordRegex.test(formData.password)) {
    errors.password =
      "Password must contain at least 1 digit, 1 uppercase and 1 lowercase letter!";
  }

  return errors;
};

export { validateSignIn, validateSignUp };
