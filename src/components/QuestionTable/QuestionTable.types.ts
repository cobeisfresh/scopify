export type Language = 'en' | 'de'

export type QuestionDTO = {
  id: string
  order: number
  textEn: string
  textDe: string
  notesEn: string | null
  notesDe: string | null
  recommendationEn: string | null
  recommendationDe: string | null
  assumptionsEn: string | null
  assumptionsDe: string | null
}

export type SectionDTO = {
  id: string
  order: number
  nameEn: string
  nameDe: string
  questions: QuestionDTO[]
}

export type QuestionEditPatch = Partial<
  Pick<
    QuestionDTO,
    | 'textEn'
    | 'textDe'
    | 'notesEn'
    | 'notesDe'
    | 'recommendationEn'
    | 'recommendationDe'
    | 'assumptionsEn'
    | 'assumptionsDe'
  >
>

export type NewQuestionInput = {
  textEn: string
  textDe: string
}
