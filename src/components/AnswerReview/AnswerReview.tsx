import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { AnswerReviewQuestion } from './AnswerReviewQuestion'
import { useAnswerReview } from './AnswerReview.logic'

export function AnswerReview() {
  const {
    project,
    sections,
    isLoading,
    language,
    setLanguage,
    requestChange,
    resolveChangeRequest,
    accept,
    isAccepting,
  } = useAnswerReview()

  if (isLoading || !project)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  const canAccept = project.status === 'submitted'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Review: {project.name}</h1>
        <p className="text-sm text-muted-foreground">
          {project.clientName} · {project.status}
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
              <AnswerReviewQuestion
                key={question.id}
                question={question}
                language={language}
                index={index}
                onRequestChange={(comment) =>
                  requestChange(question.id, comment)
                }
                onResolveChangeRequest={resolveChangeRequest}
              />
            ))}
          </div>
        </section>
      ))}

      {project.status === 'agreed' ? (
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
      ) : (
        <Button
          type="button"
          onClick={accept}
          disabled={!canAccept || isAccepting}
          className="w-fit"
        >
          {isAccepting ? 'Accepting…' : 'Accept plan'}
        </Button>
      )}
    </div>
  )
}
