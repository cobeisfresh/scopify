import { QuestionRow } from './QuestionRow'
import { AddQuestionRow } from './AddQuestionRow'
import type {
  Language,
  NewQuestionInput,
  QuestionEditPatch,
  SectionDTO,
} from './QuestionTable.types'

type QuestionSectionQuestionsProps = {
  section: SectionDTO
  language: Language
  onEditQuestion: (questionId: string, patch: QuestionEditPatch) => void
  onDeleteQuestion: (questionId: string) => void
  onMoveQuestion: (
    sectionId: string,
    questionId: string,
    direction: 'up' | 'down',
  ) => void
  onAddQuestion: (sectionId: string, input: NewQuestionInput) => void
}

export function QuestionSectionQuestions({
  section,
  language,
  onEditQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onAddQuestion,
}: QuestionSectionQuestionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {section.questions.map((question, index) => (
          <QuestionRow
            key={question.id}
            question={question}
            language={language}
            index={index}
            canMoveUp={index > 0}
            canMoveDown={index < section.questions.length - 1}
            onSave={(patch) => onEditQuestion(question.id, patch)}
            onDelete={() => onDeleteQuestion(question.id)}
            onMoveUp={() => onMoveQuestion(section.id, question.id, 'up')}
            onMoveDown={() => onMoveQuestion(section.id, question.id, 'down')}
          />
        ))}
      </div>

      <AddQuestionRow
        sectionId={section.id}
        onAdd={(input) => onAddQuestion(section.id, input)}
      />
    </div>
  )
}
