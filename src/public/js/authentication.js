import { showAlert } from "./alerts.js";

const REDIRECT_DELAY = 1500;
const SUCCESS_STATUS = "success";

// Takes axsios config as parameter
const makeApiRequest = async (config) => {
  try {
    const res = await axios(config);
    return res;
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
    showAlert("error", errorMessage);
    throw err;
  }
};

const redirectWithSuccess = (message, path) => {
  showAlert("success", message);

  window.setTimeout(() => {
    location.assign(path);
  }, REDIRECT_DELAY);
};

export const login = async (username, password) => {
  try {
    const res = await makeApiRequest({
      method: "POST",
      url: "/authentication/login",
      data: { username, password },
    });

    if (res.data.status === SUCCESS_STATUS) {
      redirectWithSuccess("Logged in successfully.", "/feed");
    }
  } catch (err) {
    // Error handled by makeApiRequest
  }
};

export const logout = async () => {
  try {
    const res = await makeApiRequest({
      method: "GET",
      url: "/authentication/logout",
    });

    if (res.data.status === SUCCESS_STATUS) {
      redirectWithSuccess("Logged out successfully.", "/");
    }
  } catch (err) {
    // Error handled by makeApiRequest
  }
};

export const register = async (email, username, usertag, password) => {
  try {
    const res = await makeApiRequest({
      method: "POST",
      url: "/authentication/register",
      data: { email, username, usertag, password },
    });

    if (res.data.status === SUCCESS_STATUS) {
      redirectWithSuccess("Registered successfully.", "/feed");
    }
  } catch (err) {
    // Error handled by makeApiRequest
  }
};
