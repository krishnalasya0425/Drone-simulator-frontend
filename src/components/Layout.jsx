export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">Map Reading Portal</h1>
      </header>

      <main className="flex-1 p-6">{children}</main>

      <footer className="bg-gray-800 text-white p-3 text-center text-sm">
        © 2025 Map Reading Training System
      </footer>
    </div>
  );
}