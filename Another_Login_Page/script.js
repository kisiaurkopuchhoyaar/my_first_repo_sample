const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const confirmEl = document.getElementById("confirm-password");
const emailEl = document.getElementById("email");
const submitBtn = document.getElementById("submit");
const formEl = document.getElementById("form");


const checkUsername = () => {

    let valid = false;

    

    
    const validity  = usernameEl.validity;

    if (validity.valueMissing) {
        showError(usernameEl, 'Username cannot be blank.');
   
  
    }
        else if(validity.tooShort) {
            showError(usernameEl, 'username must be at least 4 characters long');
        }
     else if (validity.patternMismatch) {
        showError(usernameEl, "username must contain alphanumerical values!!")
     }
     else if (validity.tooLong) {
        showError(usernameEl, 'username must be at most 15 characters long');
     }
     else {
        showSuccess(usernameEl);
        valid = true;
    }
    return valid;
};


const checkEmail = () => {
    let valid = false;
    const validity = emailEl.validity;
    // const email = emailEl.value.trim();
    if (validity.valueMissing) {
        showError(emailEl, 'Email cannot be blank.');
    } else if (validity.typeMismatch) {
        showError(emailEl, 'Email is not valid.')
    } else {
        showSuccess(emailEl);
        valid = true;
    }
    return valid;
};

const checkPassword = () => {
    let valid = false;
    const validity = passwordEl.validity;


    // const password = passwordEl.value.trim();

    if (validity.valueMissing) {
        showError(passwordEl, 'Password cannot be blank.');
    } else if (validity.patternMismatch) {
        showError(passwordEl, 'password must contain alphanumerical and special characters!!');
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
    const validity =confirmEl.validity;

    if (validity.valueMissing) {
        showError(confirmEl, 'Please enter the password again');
   
    } else if (password !== confirmPassword) {
        showError(confirmEl, 'The password does not match');
    } else {
        showSuccess(confirmEl);
        valid = true;
    }

    return valid;
};





const showError = (input, message) => {
    // get the form-field element
    const formField = input.parentElement;
    // add the error class
    formField.classList.remove('success');
    formField.classList.add('error');

    // show the error message
    const error = formField.querySelector('span');
    error.textContent = message;
};

const showSuccess = (input) => {
    // get the form-field element
    const formField = input.parentElement;

    // remove the error class
    formField.classList.remove('error');
    formField.classList.add('success');

    // hide the error message
    const error = formField.querySelector('span');
    error.textContent = '';
}

formEl.addEventListener('submit', function (e) {
    // prevent the form from submitting
    e.preventDefault();

    // validate fields
    let isUsernameValid = checkUsername(),
        isEmailValid = checkEmail(),
        isPasswordValid = checkPassword(),
        isConfirmPasswordValid = checkConfirmPassword();

    let isFormValid = isUsernameValid &&
        isEmailValid &&
        isPasswordValid &&
        isConfirmPasswordValid;

    // submit to the server if the form is valid
    if (isFormValid) {
console.log("all good!")
    }
    else console.log("Not good!")
});


const debounce = (fn, delay = 2000) => {
    let timeoutId;
    return (...args) => {
        // cancel the previous timer
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // setup a new timer
        timeoutId = setTimeout(() => {
            fn.apply(null, args)
        }, delay);
    };
};

formEl.addEventListener('input', debounce(function (e) {
    switch (e.target.id) {
        case 'username':
            checkUsername();
            break;
        case 'email':
            checkEmail();
            break;
        case 'password':
            checkPassword();
            break;
        case 'confirm-password':
            checkConfirmPassword();
            break;
    }
}));
