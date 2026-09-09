export type ClientQuestion = {
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
  answer: { text: string; usedRecommendation: boolean } | null
  openChangeRequest: { id: string; comment: string } | null
}

export type ClientSection = {
  id: string
  nameEn: string
  nameDe: string
  order: number
  questions: ClientQuestion[]
}

export type ClientProjectResponse = {
  project: { id: string; name: string; clientName: string; status: string }
  sections: ClientSection[]
}
