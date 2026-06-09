import api from "./api";

export const authService = {
  async register(data: {
    email: string;
    username: string;
    full_name: string;
    password: string;
  }) {
    const res = await api.post("/auth/register", data);
    if (res.data.access_token) {
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: res.data.user_id,
          username: res.data.username,
          full_name: res.data.full_name,
        }),
      );
    }
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post("/auth/login", data);
    if (res.data.access_token) {
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: res.data.user_id,
          username: res.data.username,
          full_name: res.data.full_name,
        }),
      );
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },
};
