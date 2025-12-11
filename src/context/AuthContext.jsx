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
      batchNo: localStorage.getItem("batchNo"),
      name: localStorage.getItem("name"),
      token: token
    };

    setUser(savedUser);
    setLoading(false); // ← FINISH LOADING
  }, []);

  const login = async (armyId, password) => {
    const res = await api.post("/auth/login", { armyId, password });

    const userData = {
      id: res.data.id,
      role: res.data.role,
      batchNo: res.data.batchNo,
      name: res.data.name,
      token: res.data.token,
    };

    setUser(userData);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("batchNo", res.data.batchNo);
    localStorage.setItem("name", res.data.name);
    localStorage.setItem("id", res.data.id);

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
