import validator from 'validator';

export const isEmail = (email) => {
    if (!email) {
        return false;
    }

    return validator.isEmail(email);
}

export const isPassword = (password) => {
    if (password === null || password === undefined) {
        return [false, 'Password cannot be empty'];
    }
    if (password.length < 6 || password.length > 20) {
        return [false, 'Password must be between 6 and 20 characters long'];
    }
    if (!/[A-Z]/.test(password)) {
        return [false, 'Password must contain at least 1 uppercase letter'];
    }
    if (!/[a-z]/.test(password)) {
        return [false, 'Password must contain at least 1 lowercase letter'];
    }
    if (!/[0-9]/.test(password)) {
        return [false, 'Password must contain at least 1 number'];
    }
    return [true, ''];
};