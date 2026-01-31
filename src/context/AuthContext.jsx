import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../entities/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← ADD THIS

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const savedUser = {
      id: localStorage.getItem("id"),
      role: localStorage.getItem("role"),
      courseNo: localStorage.getItem("courseNo"),
      name: localStorage.getItem("name"),
      token: token,
      armyNo: localStorage.getItem("armyNo")
    };

    setUser(savedUser);
    setLoading(false); // ← FINISH LOADING
  }, []);

  const login = async (armyNo, password) => {
    const res = await api.post("/auth/login", { armyNo, password });

    const userData = {
      id: res.data.id,
      role: res.data.role,
      courseNo: res.data.courseNo,
      name: res.data.name,
      token: res.data.token,
      armyNo: res.data.armyNo,
    };

    setUser(userData);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("courseNo", res.data.courseNo);
    localStorage.setItem("name", res.data.name);
    localStorage.setItem("id", res.data.id);
    localStorage.setItem("armyNo", res.data.armyNo);

    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
