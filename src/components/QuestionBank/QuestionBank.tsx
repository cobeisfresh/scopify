import { QuestionTable } from '@/components/QuestionTable/QuestionTable'
import { useQuestionBank } from './QuestionBank.logic'

export function QuestionBank() {
  const {
    sections,
    isLoading,
    language,
    setLanguage,
    editQuestion,
    deleteQuestion,
    addQuestion,
    moveQuestion,
  } = useQuestionBank()

  if (isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Question bank</h1>
      <QuestionTable
        sections={sections}
        language={language}
        onLanguageChange={setLanguage}
        onEditQuestion={editQuestion}
        onDeleteQuestion={deleteQuestion}
        onMoveQuestion={moveQuestion}
        onAddQuestion={addQuestion}
      />
    </div>
  )
}
