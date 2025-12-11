import { useState } from "react";
import api from "../entities/axios";
import React from "react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    regiment: "",
    batch_no: "",
    army_id: "",
    role: "student",
    password: "",
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/register", form);
      setMsg("Registration submitted. Await approval.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-800 px-4">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
        
        <h2 className="text-3xl font-semibold text-white text-center mb-2">
          Create Account
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Fill the details below to register
        </p>

        <form 
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="col-span-2 input-box"
            required
          />

          <input
            name="regiment"
            placeholder="Regiment"
            onChange={handleChange}
            className="input-box"
            required
          />

          <input
            name="batch_no"
            placeholder="Batch No"
            onChange={handleChange}
            className="input-box"
            required
          />

          <input
            name="army_id"
            placeholder="Army ID"
            onChange={handleChange}
            className="input-box"
            required
          />

          <select
            name="role"
            onChange={handleChange}
            className="input-box col-span-2"
            required
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="col-span-2 input-box"
            required
          />

          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg"
          >
            Register
          </button>
        </form>

        {msg && (
          <p className="text-center mt-4 text-green-300 font-medium">
            {msg}
          </p>
        )}

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </section>
  );
}
