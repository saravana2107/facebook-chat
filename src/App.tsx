import { ChatContainer } from './components/Chat';


export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Discussion</h1>
        <ChatContainer />
      </div>
    </div>
  );
}