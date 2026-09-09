import { Button } from '@/components/ui/button'
import { QuestionSectionQuestions } from './QuestionSectionQuestions'
import type {
  Language,
  NewQuestionInput,
  QuestionEditPatch,
  SectionDTO,
} from './QuestionTable.types'

type QuestionTableProps = {
  sections: SectionDTO[]
  language: Language
  onLanguageChange: (language: Language) => void
  onEditQuestion: (questionId: string, patch: QuestionEditPatch) => void
  onDeleteQuestion: (questionId: string) => void
  onMoveQuestion: (
    sectionId: string,
    questionId: string,
    direction: 'up' | 'down',
  ) => void
  onAddQuestion: (sectionId: string, input: NewQuestionInput) => void
}

export function QuestionTable({
  sections,
  language,
  onLanguageChange,
  onEditQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onAddQuestion,
}: QuestionTableProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Language:</span>
        <Button
          type="button"
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('en')}
        >
          EN
        </Button>
        <Button
          type="button"
          variant={language === 'de' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('de')}
        >
          DE
        </Button>
      </div>

      {sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">
            {language === 'en' ? section.nameEn : section.nameDe}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {section.questions.length} questions
            </span>
          </h2>

          <QuestionSectionQuestions
            section={section}
            language={language}
            onEditQuestion={onEditQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onMoveQuestion={onMoveQuestion}
            onAddQuestion={onAddQuestion}
          />
        </section>
      ))}
    </div>
  )
}
