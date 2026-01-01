import axiosInstance from "./axiosInstance";

class UserManager {
  signup(data) {
    return axiosInstance.post("/api/auth/signup", data);
  }

  login(data) {
    return axiosInstance.post("/api/auth/login", data);
  }

}

export default new UserManager();