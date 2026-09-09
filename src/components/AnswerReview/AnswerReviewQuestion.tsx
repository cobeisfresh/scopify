import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { Language } from '@/components/QuestionTable/QuestionTable.types'
import type { ClientQuestion } from '@/components/ClientAnswers/ClientAnswers.types'

const commentSchema = z.object({
  comment: z.string().min(1, 'Enter a comment'),
})
type CommentValues = z.infer<typeof commentSchema>

type AnswerReviewQuestionProps = {
  question: ClientQuestion
  language: Language
  index: number
  onRequestChange: (comment: string) => void
  onResolveChangeRequest: (changeRequestId: string) => void
}

export function AnswerReviewQuestion({
  question,
  language,
  index,
  onRequestChange,
  onResolveChangeRequest,
}: AnswerReviewQuestionProps) {
  const text = language === 'en' ? question.textEn : question.textDe
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  })

  const handleSubmit = form.handleSubmit((values) => {
    onRequestChange(values.comment)
    form.reset({ comment: '' })
  })

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-sm font-medium">
        {index + 1}. {text}
      </p>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">Client answer:</span>{' '}
        {question.answer?.text || '—'}
      </p>

      {question.openChangeRequest ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Change requested: {question.openChangeRequest.comment}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              question.openChangeRequest &&
              onResolveChangeRequest(question.openChangeRequest.id)
            }
          >
            Resolve
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Field>
            <FieldLabel htmlFor={`comment-${question.id}`}>
              Request a change
            </FieldLabel>
            <Textarea
              id={`comment-${question.id}`}
              {...form.register('comment')}
            />
            <FieldError errors={[form.formState.errors.comment]} />
          </Field>
          <Button type="submit" variant="outline" size="sm" className="w-fit">
            Request change
          </Button>
        </form>
      )}
    </div>
  )
}
