import type { UseFormRegisterReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import type { Language } from '@/components/QuestionTable/QuestionTable.types'
import type { ClientQuestion } from './ClientAnswers.types'

type ClientQuestionFieldProps = {
  question: ClientQuestion
  language: Language
  index: number
  registerProps: UseFormRegisterReturn
  onUseRecommendation: () => void
  readOnly: boolean
}

export function ClientQuestionField({
  question,
  language,
  index,
  registerProps,
  onUseRecommendation,
  readOnly,
}: ClientQuestionFieldProps) {
  const text = language === 'en' ? question.textEn : question.textDe
  const notes = language === 'en' ? question.notesEn : question.notesDe
  const recommendation =
    language === 'en' ? question.recommendationEn : question.recommendationDe

  return (
    <Field className="rounded-lg border p-4">
      <FieldLabel htmlFor={registerProps.name}>
        {index + 1}. {text}
      </FieldLabel>
      {notes && <FieldDescription>{notes}</FieldDescription>}
      {question.openChangeRequest && (
        <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          COBE requested a change: {question.openChangeRequest.comment}
        </p>
      )}
      <Textarea
        id={registerProps.name}
        disabled={readOnly}
        {...registerProps}
      />
      {recommendation && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Suggested: {recommendation}</span>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUseRecommendation}
            >
              Use this
            </Button>
          )}
        </div>
      )}
    </Field>
  )
}
