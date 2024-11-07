const validate = (formData) => {
  const { username, email, password, passwordConfirmation } = formData;
  const errors = {};
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;

  if (!username) {
    errors.username = "Please enter a valid username!";
  } else if (username.length < 5) {
    errors.username = "Username must be at least 5 characters!";
  } else if (username.length > 20) {
    errors.username = "Username cannot be more than 20 characters!";
  }

  if (!email || !emailRegex.test(email)) {
    errors.email = "Please enter a valid email!";
  }

  if (!password) {
    errors.password = "Please enter your current or new password!";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters!";
  } else if (password.length > 16) {
    errors.password = "Password cannot be more than 16 characters!";
  } else if (!passwordRegex.test(password)) {
    errors.password =
      "Password must contain at least 1 digit, 1 uppercase and 1 lowercase letter!";
  }

  if (!passwordConfirmation) {
    errors.passwordConfirmation = "Please re-enter your password here!";
  } else if (passwordConfirmation !== password) {
    errors.passwordConfirmation = "Does not match password!";
  }

  return errors;
};

export { validate };
