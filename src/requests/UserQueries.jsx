import { useMutation } from "@tanstack/react-query";
import UserManager from "../requests/UserManager";

export const useSignup = () => {
  return useMutation({
    mutationFn: (payload) => UserManager.signup(payload),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload) => UserManager.login(payload),
    onSuccess: (res) => {
      const { token, id, fullName, email } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, fullName, email }));
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (payload) => UserManager.verifyEmail(payload),
  });
};

export const useResendCode = () => {
  return useMutation({
    mutationFn: (payload) => UserManager.resendCode(payload),
  });
};