import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type {
  Language,
  QuestionDTO,
  QuestionEditPatch,
} from './QuestionTable.types'

const rowFormSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  notes: z.string(),
  recommendation: z.string(),
  assumptions: z.string(),
})

type RowFormValues = z.infer<typeof rowFormSchema>

function toPatch(language: Language, values: RowFormValues): QuestionEditPatch {
  const orNull = (value: string) => (value.trim() === '' ? null : value)
  return language === 'en'
    ? {
        textEn: values.text,
        notesEn: orNull(values.notes),
        recommendationEn: orNull(values.recommendation),
        assumptionsEn: orNull(values.assumptions),
      }
    : {
        textDe: values.text,
        notesDe: orNull(values.notes),
        recommendationDe: orNull(values.recommendation),
        assumptionsDe: orNull(values.assumptions),
      }
}

type QuestionRowProps = {
  question: QuestionDTO
  language: Language
  index: number
  canMoveUp: boolean
  canMoveDown: boolean
  onSave: (patch: QuestionEditPatch) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function QuestionRow({
  question,
  language,
  index,
  canMoveUp,
  canMoveDown,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuestionRowProps) {
  const [isEditing, setIsEditing] = useState(false)

  const text = language === 'en' ? question.textEn : question.textDe
  const notes = language === 'en' ? question.notesEn : question.notesDe
  const recommendation =
    language === 'en' ? question.recommendationEn : question.recommendationDe
  const assumptions =
    language === 'en' ? question.assumptionsEn : question.assumptionsDe

  const form = useForm<RowFormValues>({
    resolver: zodResolver(rowFormSchema),
    values: {
      text,
      notes: notes ?? '',
      recommendation: recommendation ?? '',
      assumptions: assumptions ?? '',
    },
  })

  const handleSave = form.handleSubmit((values) => {
    onSave(toPatch(language, values))
    setIsEditing(false)
  })

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-3 rounded-lg border p-4"
      >
        <Field>
          <FieldLabel htmlFor={`text-${question.id}`}>Question</FieldLabel>
          <Textarea id={`text-${question.id}`} {...form.register('text')} />
          <FieldError errors={[form.formState.errors.text]} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`notes-${question.id}`}>
            Notes / why this matters
          </FieldLabel>
          <Textarea id={`notes-${question.id}`} {...form.register('notes')} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`recommendation-${question.id}`}>
            Recommendation (COBE default)
          </FieldLabel>
          <Textarea
            id={`recommendation-${question.id}`}
            {...form.register('recommendation')}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`assumptions-${question.id}`}>
            Assumptions / disclaimers
          </FieldLabel>
          <Textarea
            id={`assumptions-${question.id}`}
            {...form.register('assumptions')}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <span className="mt-0.5 text-sm text-muted-foreground">{index + 1}.</span>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{text}</p>
        {notes && <p className="text-sm text-muted-foreground">{notes}</p>}
        {recommendation && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Recommendation:</span>{' '}
            {recommendation}
          </p>
        )}
        {assumptions && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Assumptions:</span> {assumptions}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMoveUp}
          disabled={!canMoveUp}
        >
          Up
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMoveDown}
          disabled={!canMoveDown}
        >
          Down
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
