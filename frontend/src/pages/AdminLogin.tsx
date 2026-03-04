import type { Page } from "../types";

export default function AdminLogin({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

      <input
        type="email"
        placeholder="Admin Email"
        className="w-80 px-4 py-3 border rounded-lg mb-4"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-80 px-4 py-3 border rounded-lg mb-4"
      />

      <button className="w-80 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
        Login
      </button>

      <button
        className="mt-4 text-red-600 underline"
        onClick={() => onNavigate("signup")}
      >
        Back to Signup
      </button>
    </div>
  );
}
