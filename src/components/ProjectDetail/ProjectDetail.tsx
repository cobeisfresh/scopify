import { Link } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { QuestionSectionQuestions } from '@/components/QuestionTable/QuestionSectionQuestions'
import { useQuestionBank } from '@/components/QuestionBank/QuestionBank.logic'
import { useProjectDetail } from './ProjectDetail.logic'

export function ProjectDetail() {
  const {
    project,
    enabledSectionIds,
    invites,
    isLoading,
    toggleSection,
    generateInvite,
    copyInviteLink,
    updateLanguage,
  } = useProjectDetail()

  const {
    sections,
    isLoading: isQuestionsLoading,
    language,
    setLanguage,
    editQuestion,
    deleteQuestion,
    addQuestion,
    moveQuestion,
  } = useQuestionBank()

  if (isLoading || isQuestionsLoading || !project)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  return (
    <div className="mx-auto flex max-w-2xl animate-in flex-col gap-8 p-8 duration-300 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {project.clientName} · {project.status}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Client receives:
            </span>
            <Button
              type="button"
              variant={project.language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateLanguage('en')}
            >
              EN
            </Button>
            <Button
              type="button"
              variant={project.language === 'de' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateLanguage('de')}
            >
              DE
            </Button>
          </div>
        </div>
        <Link
          to={`/staff/projects/${project.id}/review`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Review answers
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Question sections for this project
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              View language:
            </span>
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

        <Accordion defaultValue={[]} className="flex flex-col gap-2">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-lg border px-3"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={enabledSectionIds.has(section.id)}
                  onCheckedChange={(checked) =>
                    toggleSection(section.id, checked === true)
                  }
                />
                <div className="min-w-0 flex-1">
                  <AccordionTrigger className="w-full pr-2">
                    <span>
                      {language === 'en' ? section.nameEn : section.nameDe}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {section.questions.length} questions
                      </span>
                    </span>
                  </AccordionTrigger>
                </div>
              </div>
              <AccordionContent>
                <QuestionSectionQuestions
                  section={section}
                  language={language}
                  onEditQuestion={editQuestion}
                  onDeleteQuestion={deleteQuestion}
                  onMoveQuestion={moveQuestion}
                  onAddQuestion={addQuestion}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Client invite</h2>
        <Button type="button" onClick={generateInvite} className="w-fit">
          Generate invite link
        </Button>
        <div className="flex flex-col gap-2">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="truncate text-sm text-muted-foreground">
                /invite/{invite.token}
              </span>
              <div className="flex items-center gap-2">
                {invite.usedAt && (
                  <span className="text-sm text-muted-foreground">Used</span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(invite.token)}
                >
                  Copy link
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
