// components/ErrorMessage.tsx

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}