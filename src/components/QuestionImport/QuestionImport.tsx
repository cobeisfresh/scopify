import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { QuestionTable } from '@/components/QuestionTable/QuestionTable'
import { useQuestionImport } from './QuestionImport.logic'

export function QuestionImport() {
  const {
    sections,
    language,
    setLanguage,
    isUploading,
    isCommitting,
    committed,
    uploadFile,
    editQuestion,
    deleteQuestion,
    moveQuestion,
    addQuestion,
    commit,
  } = useQuestionImport()

  const fileInputRef = useRef<HTMLInputElement>(null)

  let commitLabel = 'Save to question bank'
  if (committed) commitLabel = 'Saved'
  else if (isCommitting) commitLabel = 'Saving…'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Import scoping questions</h1>
      <p className="text-sm text-muted-foreground">
        Upload the source-of-truth Excel. Nothing is saved until you review the
        extracted questions below and click "Save to question bank".
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) uploadFile(file)
          event.target.value = ''
        }}
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Parsing…' : 'Upload .xlsx'}
      </Button>

      {sections && (
        <>
          <QuestionTable
            sections={sections}
            language={language}
            onLanguageChange={setLanguage}
            onEditQuestion={editQuestion}
            onDeleteQuestion={deleteQuestion}
            onMoveQuestion={moveQuestion}
            onAddQuestion={addQuestion}
          />

          <Button
            type="button"
            onClick={commit}
            disabled={isCommitting || committed}
          >
            {commitLabel}
          </Button>
        </>
      )}
    </div>
  )
}
