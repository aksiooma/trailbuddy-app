// Email validation
export const isValidEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
};

// Phone number validation
export const isValidPhone = (phone) => {
    const re = /^[0-9\b]+$/;
    return re.test(phone);
};

// Name validation
export const isValidName = (name) => {
    return /^[a-zA-Z ]+$/.test(name);
};

// Password validation
export const isValidPassword = (password) => {
    // Minimum eight characters, at least one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
};

// Form completeness and validity check (example structure)
export const isFormCompleteAndValid = (formData, formErrors) => {

    // Check if all fields are filled
    const allFieldsFilled = formData.firstName && formData.lastName && formData.email && formData.phone;

    // Check if there are no errors
    const noErrors = !Object.values(formErrors).some(error => error !== '');

    return allFieldsFilled && noErrors;
};
