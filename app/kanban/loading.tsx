import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function KanbanLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Carregando kanban...</p>
      </div>
    </div>
  )
}