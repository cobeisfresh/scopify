import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ClientQuestionField } from './ClientQuestionField'
import { useClientAnswers } from './ClientAnswers.logic'

export function ClientAnswers() {
  const {
    project,
    sections,
    isLoading,
    language,
    setLanguage,
    form,
    saveAnswer,
    applyRecommendation,
    submit,
    isSubmitting,
  } = useClientAnswers()

  if (isLoading || !project)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  const readOnly = project.status === 'submitted' || project.status === 'agreed'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          Status: {project.status}
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
            {section.questions.map((question, index) => {
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
      ))}

      {!readOnly && (
        <Button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="w-fit"
        >
          {isSubmitting ? 'Submitting…' : 'Submit for review'}
        </Button>
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
    </div>
  )
}
