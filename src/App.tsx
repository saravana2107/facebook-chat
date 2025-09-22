import { ChatContainer } from "./components/Chat";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-800 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Comment</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-8 py-12 space-y-4">
        <ChatContainer />
      </main>
    </div>
  );
}
