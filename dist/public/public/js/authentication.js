import { showAlert } from "./alerts.js";

/**
 * Authentication utility functions for handling user authentication
 */

// Constants for shared values
const REDIRECT_DELAY = 1500;
const SUCCESS_STATUS = "success";

/**
 * Generic API request handler with error handling
 * @param {Object} config - Axios request configuration
 * @returns {Promise} - Response data or throws error
 */
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

/**
 * Redirects to a page after showing success alert
 * @param {string} message - Success message to display
 * @param {string} path - Path to redirect to
 */
const redirectWithSuccess = (message, path) => {
  showAlert("success", message);
  window.setTimeout(() => {
    location.assign(path);
  }, REDIRECT_DELAY);
};

/**
 * Logs in a user with their credentials
 * @param {string} username - User's username
 * @param {string} password - User's password
 */
export const login = async (username, password) => {
  try {
    const res = await makeApiRequest({
      method: "POST",
      url: "/auth/login",
      data: { username, password },
    });

    if (res.data.status === SUCCESS_STATUS) {
      redirectWithSuccess("Logged in successfully.", "/feed");
    }
  } catch (err) {
    // Error already handled by makeApiRequest
  }
};

/**
 * Logs out the current user
 */
export const logout = async () => {
  try {
    const res = await makeApiRequest({
      method: "GET",
      url: "/auth/logout",
    });

    if (res.data.status === SUCCESS_STATUS) {
      redirectWithSuccess("Logged out successfully.", "/");
    }
  } catch (err) {
    // Error already handled by makeApiRequest
  }
};

/**
 * Registers a new user
 * @param {string} email - User's email
 * @param {string} username - User's username
 * @param {string} usertag - User's tag
 * @param {string} password - User's password
 */
export const register = async (email, username, usertag, password) => {
  try {
    const res = await makeApiRequest({
      method: "POST",
      url: "/auth/register",
      data: { email, username, usertag, password },
    });

    if (res.data.status === SUCCESS_STATUS) {
      redirectWithSuccess("Registered successfully.", "/feed");
    }
  } catch (err) {
    // Error already handled by makeApiRequest
  }
};
