import { useState } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { QuestionSectionQuestions } from '@/components/QuestionTable/QuestionSectionQuestions'
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
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  )

  if (isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  const selected =
    sections.find((section) => section.id === selectedSectionId) ?? sections[0]

  return (
    <div className="mx-auto flex max-w-5xl animate-in gap-8 p-8 duration-300 fade-in">
      <aside className="flex w-64 shrink-0 flex-col gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Question bank
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Language:</span>
            <Button
              type="button"
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              EN
            </Button>
            <Button
              type="button"
              variant={language === 'de' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('de')}
            >
              DE
            </Button>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setSelectedSectionId(section.id)}
              className={cn(
                'rounded-lg px-3 py-2 text-left text-sm transition-colors',
                selected?.id === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
              )}
            >
              {language === 'en' ? section.nameEn : section.nameDe}
              <span
                className={cn(
                  'block text-xs',
                  selected?.id === section.id
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground',
                )}
              >
                {section.questions.length} questions
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        {selected && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">
              {language === 'en' ? selected.nameEn : selected.nameDe}
            </h2>
            <QuestionSectionQuestions
              section={selected}
              language={language}
              onEditQuestion={editQuestion}
              onDeleteQuestion={deleteQuestion}
              onMoveQuestion={moveQuestion}
              onAddQuestion={addQuestion}
            />
          </section>
        )}
      </main>
    </div>
  )
}
