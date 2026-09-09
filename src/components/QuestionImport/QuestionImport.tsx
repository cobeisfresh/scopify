import { useRef, useState } from 'react'
import { cn } from 'cn'
import { Upload } from 'lucide-react'
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
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  let commitLabel = 'Save to question bank'
  if (committed) commitLabel = 'Saved'
  else if (isCommitting) commitLabel = 'Saving…'

  return (
    <div className="mx-auto flex max-w-3xl animate-in flex-col gap-6 p-8 duration-300 fade-in">
      <h1 className="font-serif text-2xl font-semibold tracking-tight">
        Import briefing doc
      </h1>
      <p className="text-sm text-muted-foreground">
        Upload your briefing document to extract its questions. Nothing is saved
        until you review them below and click "Save to question bank".
      </p>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) uploadFile(file)
          event.target.value = ''
        }}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDraggingOver(false)
          const file = event.dataTransfer.files?.[0]
          if (file) uploadFile(file)
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors disabled:pointer-events-none disabled:opacity-50',
          isDraggingOver
            ? 'border-primary bg-accent'
            : 'border-border hover:bg-muted/50',
        )}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isUploading
            ? 'Uploading…'
            : 'Drop your document here, or click to browse'}
        </p>
      </button>

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
