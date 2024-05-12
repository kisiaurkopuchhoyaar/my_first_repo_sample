const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const confirmEl = document.getElementById("confirm-password");
const emailEl = document.getElementById("email");
const submitBtn = document.getElementById("submit");
const formEl = document.getElementById("form");
const capLock = document
  .querySelector("input[type=password]")
  .addEventListener("keyup", function (keyboardEvent) {
    const capsLockOn = keyboardEvent.getModifierState("CapsLock");
    if (capsLockOn) {
      showError(passwordEl, "CapsLock is ON!!");
    } else {
      checkPassword();
    }
  });

const checkUsername = () => {
  let valid = false;

  const validity = usernameEl.validity;

  if (validity.valueMissing) {
    showError(usernameEl, "Username cannot be blank.");
  } else if (validity.tooShort) {
    showError(usernameEl, "Username must be at least 4 characters long");
  } else if (validity.patternMismatch) {
    showError(usernameEl, "Username must contain alphanumerical values!!");
  } else if (validity.tooLong) {
    showError(usernameEl, "Username must be at most 15 characters long");
  } else {
    // const error = usernameEl.querySelector("span");
    // if (error) {
    //   error.textContent = "";
    // }
    // htmx.trigger(usernameEl, "keyup changed delay:500ms");
    showSuccess(usernameEl);
    console.log("working");
    valid = true;
  }
  return valid;
};

const checkEmail = () => {
  let valid = false;
  const validity = emailEl.validity;
  // const email = emailEl.value.trim();
  if (validity.valueMissing) {
    showError(emailEl, "Email cannot be blank.");
  } else if (validity.typeMismatch) {
    showError(emailEl, "Email is not valid.");
  } else {
    showSuccess(emailEl);
    valid = true;
  }
  return valid;
};

const checkPassword = () => {
  let valid = false;
  const validity = passwordEl.validity;

  if (validity.valueMissing) {
    showError(passwordEl, "Password cannot be blank");
  } else if (validity.tooShort) {
    showError(passwordEl, "Password must be at least 6 characters long");
  } else if (validity.patternMismatch) {
    showError(
      passwordEl,
      "password must contain alphanumerical and special characters!!"
    );
  } else if (validity.tooLong) {
    showError(passwordEl, "Password must be at most 12 characters long");
  } else {
    showSuccess(passwordEl);
    valid = true;
  }

  return valid;
};

const checkConfirmPassword = () => {
  let valid = false;
  // check confirm password
  const confirmPassword = confirmEl.value.trim();
  const password = passwordEl.value.trim();
  const validity = confirmEl.validity;

  if (validity.valueMissing) {
    showError(confirmEl, "Please enter the password again");
  } else if (password !== confirmPassword) {
    showError(confirmEl, "The password does not match");
  } else {
    showSuccess(confirmEl);
    valid = true;
  }

  return valid;
};

const showError = (input, message) => {
  // get the form-field element
  const formField = input.parentElement;
  const error = formField.querySelector("span");
  // add the error class
  formField.classList.remove("success");
  formField.classList.add("error");

  // show the error message
  // const error = formField.querySelector("span");
  error.textContent = message;
};

const showSuccess = async (input) => {
  // get the form-field element
  htmx.trigger(input, "keyup changed delay:500ms");
  //delay by 1000ms before showing success
  setTimeout(() => {
    const formField = input.parentElement;
    const error = formField.querySelector("span");
    if (error.textContent === "") {
      // remove the error class
      formField.classList.remove("error");
      formField.classList.add("success");
    } else {
      formField.classList.remove("success");
      formField.classList.add("error");
    }
  }, 3000);

  // })
  // const formField = input.parentElement;
  // const error = formField.querySelector("span");
  // if (error.textContent === "") {
  //   // remove the error class
  //   formField.classList.remove("error");
  //   formField.classList.add("success");
  // } else {
  //   formField.classList.remove("success");
  //   formField.classList.add("error");
  // }

  // hide the error message
  // const error = formField.querySelector("span");
  // error.textContent = "";
};
//if span is not empty then remove the success class

// formEl.addEventListener("submit", function (e) {
//   // prevent the form from submitting
//   e.preventDefault();

// validate fields
// let isUsernameValid = checkUsername(),
//   isEmailValid = checkEmail(),
//   isPasswordValid = checkPassword(),
//   isConfirmPasswordValid = checkConfirmPassword();

// let isFormValid =
//   isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

//   // submit to the server if the form is valid
//   fetch("/signup", {
//     method: "POST",
//     body: formData,
//   })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       console.log("Success!", data);
//     })
//     .catch(function (error) {
//       console.error("Error!", error);
//     });
// });

const debounce = (fn, delay = 2000) => {
  let timeoutId;
  return (...args) => {
    // cancel the previous timer
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // setup a new timer
    timeoutId = setTimeout(() => {
      fn.apply(null, args);
    }, delay);
  };
};

formEl.addEventListener(
  "input",
  debounce(function (e) {
    switch (e.target.id) {
      case "username":
        checkUsername();
        break;
      case "email":
        checkEmail();
        break;
      case "password":
        checkPassword();
        break;
      case "confirm-password":
        checkConfirmPassword();
        break;
    }
  })
);
