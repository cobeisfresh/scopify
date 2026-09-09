import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import type { NewQuestionInput } from './QuestionTable.types'

const addFormSchema = z.object({
  textEn: z.string().min(1, 'English text is required'),
  textDe: z.string().min(1, 'German text is required'),
})

type AddQuestionRowProps = {
  sectionId: string
  onAdd: (input: NewQuestionInput) => void
}

export function AddQuestionRow({ sectionId, onAdd }: AddQuestionRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const form = useForm<NewQuestionInput>({
    resolver: zodResolver(addFormSchema),
    defaultValues: { textEn: '', textDe: '' },
  })

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Add question
      </Button>
    )
  }

  const handleSubmit = form.handleSubmit((values) => {
    onAdd(values)
    form.reset({ textEn: '', textDe: '' })
    setIsOpen(false)
  })

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-dashed p-4"
      data-section-id={sectionId}
    >
      <Field>
        <FieldLabel htmlFor={`new-en-${sectionId}`}>Question (EN)</FieldLabel>
        <Textarea id={`new-en-${sectionId}`} {...form.register('textEn')} />
        <FieldError errors={[form.formState.errors.textEn]} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`new-de-${sectionId}`}>Question (DE)</FieldLabel>
        <Textarea id={`new-de-${sectionId}`} {...form.register('textDe')} />
        <FieldError errors={[form.formState.errors.textDe]} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Add
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
