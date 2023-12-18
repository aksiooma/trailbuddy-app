// /utils/utils.js

export const setAndStoreLoginMethod = (method, setLoginMethod) => {
    setLoginMethod(method);
    localStorage.setItem('loginMethod', method);
};