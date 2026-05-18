import axiosInstance from "./axiosInstance";

class UserManager {
  signup(data) {
    return axiosInstance.post("/api/auth/signup", data);
  }

  login(data) {
    return axiosInstance.post("/api/auth/login", data);
  }

  verifyEmail(data) {
    return axiosInstance.post("/api/auth/verify-email", data);
  }

  resendCode(data) {
    return axiosInstance.post("/api/auth/resend-code", data);
  }

  forgotPassword(data) {
    return axiosInstance.post("/api/auth/forgot-password", data);
  }

  resetPassword(data) {
    return axiosInstance.post("/api/auth/reset-password", data);
  }

  changePassword(data) {
    return axiosInstance.post("/api/auth/change-password", data);
  }
}

export default new UserManager();