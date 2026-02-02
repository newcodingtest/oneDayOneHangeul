// components/LoadingSpinner.tsx

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">오늘의 문법을 불러오는 중...</p>
      </div>
    </div>
  );
}