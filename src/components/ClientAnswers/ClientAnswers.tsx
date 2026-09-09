import { useState } from 'react'
import { Link } from 'react-router'
import { cn } from 'cn'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import { ClientQuestionField } from './ClientQuestionField'
import { useClientAnswers } from './ClientAnswers.logic'

function isAnswered(text: string | undefined): boolean {
  return (text ?? '').trim() !== ''
}

export function ClientAnswers() {
  const {
    project,
    sections,
    isLoading,
    language,
    form,
    saveAnswer,
    applyRecommendation,
    submit,
    isSubmitting,
  } = useClientAnswers()
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null)

  if (isLoading || !project)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  const readOnly = project.status === 'submitted' || project.status === 'agreed'

  const sectionsWithProgress = sections.map((section) => {
    const total = section.questions.length
    const answered = section.questions.filter((question) =>
      isAnswered(question.answer?.text),
    ).length
    return {
      section,
      total,
      answered,
      complete: total > 0 && answered === total,
    }
  })

  const totalQuestions = sectionsWithProgress.reduce(
    (sum, entry) => sum + entry.total,
    0,
  )
  const totalAnswered = sectionsWithProgress.reduce(
    (sum, entry) => sum + entry.answered,
    0,
  )
  const allComplete = totalQuestions > 0 && totalAnswered === totalQuestions

  const defaultSectionId =
    sectionsWithProgress.find((entry) => !entry.complete)?.section.id ??
    sections[0]?.id
  const selectedSectionId = selectedOverride ?? defaultSectionId
  const selected = sections.find((section) => section.id === selectedSectionId)

  return (
    <div className="mx-auto flex max-w-5xl animate-in flex-col gap-6 p-8 duration-300 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          {project.name}
        </h1>
        <ThemeToggle />
      </div>

      <div className="flex gap-8">
        <aside className="flex w-64 shrink-0 flex-col gap-4">
          <div>
            <div className="mb-1 flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                {totalAnswered}/{totalQuestions}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${totalQuestions ? (totalAnswered / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {sectionsWithProgress.map(
              ({ section, total, answered, complete }) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedOverride(section.id)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    selectedSectionId === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  )}
                >
                  <span>
                    {language === 'en' ? section.nameEn : section.nameDe}
                  </span>
                  <span
                    className={cn(
                      'flex shrink-0 items-center gap-1 text-xs',
                      selectedSectionId === section.id
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {complete ? (
                      <Check className="size-3.5" />
                    ) : (
                      `${answered}/${total}`
                    )}
                  </span>
                </button>
              ),
            )}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          {selected && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-medium">
                {language === 'en' ? selected.nameEn : selected.nameDe}
              </h2>
              <div className="flex flex-col gap-3">
                {selected.questions.map((question, index) => {
                  const recommendation =
                    language === 'en'
                      ? question.recommendationEn
                      : question.recommendationDe
                  return (
                    <ClientQuestionField
                      key={question.id}
                      question={question}
                      language={language}
                      index={index}
                      registerProps={form.register(question.id, {
                        onBlur: () => saveAnswer(question.id),
                      })}
                      onUseRecommendation={() =>
                        recommendation &&
                        applyRecommendation(question.id, recommendation)
                      }
                      readOnly={readOnly}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {!readOnly && (
            <div className="flex flex-col gap-2">
              {!allComplete && (
                <p className="text-sm text-muted-foreground">
                  {totalQuestions - totalAnswered} question
                  {totalQuestions - totalAnswered === 1 ? '' : 's'} left before
                  you can submit.
                </p>
              )}
              <Button
                type="button"
                onClick={submit}
                disabled={isSubmitting || !allComplete}
                className="w-fit"
              >
                {isSubmitting ? 'Submitting…' : 'Submit for review'}
              </Button>
            </div>
          )}
          {readOnly && project.status === 'submitted' && (
            <p className="text-sm text-muted-foreground">
              Thanks — COBE is reviewing your answers.
            </p>
          )}
          {readOnly && project.status === 'agreed' && (
            <p className="text-sm text-muted-foreground">
              Plan agreed —{' '}
              <Link
                to={`/projects/${project.id}/agreed-plan`}
                className="underline"
              >
                view the agreed plan
              </Link>
              .
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
