import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Language } from '@/components/QuestionTable/QuestionTable.types'
import { useAgreedPlan } from './AgreedPlan.logic'

export function AgreedPlan() {
  const { project, sections, isLoading, isError, errorMessage } =
    useAgreedPlan()
  const [language, setLanguage] = useState<Language>('en')

  if (isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  if (isError || !project) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-2 p-8 text-center">
        <h1 className="text-xl font-semibold">Plan not available</h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? 'This project has not been agreed yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          {project.clientName} · Agreed plan
        </p>
      </div>

      <div className="flex items-center gap-2">
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

      {sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">
            {language === 'en' ? section.nameEn : section.nameDe}
          </h2>
          <div className="flex flex-col gap-3">
            {section.questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border p-4">
                <p className="text-sm font-medium">
                  {index + 1}.{' '}
                  {language === 'en' ? question.textEn : question.textDe}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {question.answerText || '—'}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
