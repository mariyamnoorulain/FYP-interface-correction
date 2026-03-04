import type { Page } from "../types";

export default function InstructorLogin({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-3xl font-bold mb-6">Instructor Login</h1>

      <input
        type="email"
        placeholder="Instructor Email"
        className="w-80 px-4 py-3 border rounded-lg mb-4"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-80 px-4 py-3 border rounded-lg mb-4"
      />

      <button className="w-80 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Login
      </button>

      <button
        className="mt-4 text-green-600 underline"
        onClick={() => onNavigate("signup")}
      >
        Back to Signup
      </button>
    </div>
  );
}
