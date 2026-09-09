import * as XLSX from 'xlsx'

export type ParsedQuestion = {
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

export type ParsedSection = {
  order: number
  nameEn: string
  nameDe: string
  questions: ParsedQuestion[]
}

type ColumnIndexes = {
  category: number
  question: number
  notes: number
  recommendation: number
  assumptions: number
}

const HEADER_PATTERNS: Record<keyof ColumnIndexes, RegExp> = {
  category: /categor|kategorie/i,
  question: /^question$|^frage$/i,
  notes: /notes|why this matters|anmerkung/i,
  recommendation: /recommendation|empfehlung/i,
  assumptions: /assumption|disclaimer|annahme|haftungsausschluss/i,
}

function findSheetName(workbook: XLSX.WorkBook, suffix: 'EN' | 'DE'): string {
  const match = workbook.SheetNames.find((name) =>
    new RegExp(`\\(${suffix}\\)\\s*$`, 'i').test(name),
  )
  if (!match)
    throw new Error(
      `Could not find a sheet ending in "(${suffix})" in the workbook`,
    )
  return match
}

function findColumnIndexes(headerRow: unknown[]): ColumnIndexes {
  const headers = headerRow.map((cell) =>
    typeof cell === 'string' ? cell.trim() : '',
  )
  const indexes: Partial<ColumnIndexes> = {}
  for (const key of Object.keys(HEADER_PATTERNS) as (keyof ColumnIndexes)[]) {
    const pattern = HEADER_PATTERNS[key]
    const index = headers.findIndex((header) => pattern.test(header))
    if (index === -1)
      throw new Error(
        `Could not find a "${key}" column among headers: ${headers.join(', ')}`,
      )
    indexes[key] = index
  }
  return indexes as ColumnIndexes
}

function cellText(row: unknown[] | undefined, index: number): string | null {
  const raw = row?.[index]
  if (raw === null || raw === undefined) return null
  const text = String(raw).trim()
  return text === '' ? null : text
}

export function parseQuestionnaire(buffer: Buffer): {
  sections: ParsedSection[]
} {
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  const enSheet = workbook.Sheets[findSheetName(workbook, 'EN')]
  const deSheet = workbook.Sheets[findSheetName(workbook, 'DE')]

  const enRows = XLSX.utils.sheet_to_json<unknown[]>(enSheet, {
    header: 1,
    defval: null,
  })
  const deRows = XLSX.utils.sheet_to_json<unknown[]>(deSheet, {
    header: 1,
    defval: null,
  })

  const enCols = findColumnIndexes(enRows[0] ?? [])
  const deCols = findColumnIndexes(deRows[0] ?? [])

  const sections: ParsedSection[] = []
  let currentSection: ParsedSection | null = null

  const rowCount = Math.max(enRows.length, deRows.length)
  for (let i = 1; i < rowCount; i++) {
    const enRow = enRows[i]
    const deRow = deRows[i]

    const enCategory = cellText(enRow, enCols.category)
    const enQuestion = cellText(enRow, enCols.question)

    if (enCategory && !enQuestion) {
      currentSection = {
        order: sections.length,
        nameEn: enCategory,
        nameDe: cellText(deRow, deCols.category) ?? enCategory,
        questions: [],
      }
      sections.push(currentSection)
      continue
    }

    if (!enQuestion) continue

    if (!currentSection) {
      currentSection = {
        order: sections.length,
        nameEn: 'Uncategorized',
        nameDe: 'Unkategorisiert',
        questions: [],
      }
      sections.push(currentSection)
    }

    currentSection.questions.push({
      order: currentSection.questions.length,
      textEn: enQuestion,
      textDe: cellText(deRow, deCols.question) ?? enQuestion,
      notesEn: cellText(enRow, enCols.notes),
      notesDe: cellText(deRow, deCols.notes),
      recommendationEn: cellText(enRow, enCols.recommendation),
      recommendationDe: cellText(deRow, deCols.recommendation),
      assumptionsEn: cellText(enRow, enCols.assumptions),
      assumptionsDe: cellText(deRow, deCols.assumptions),
    })
  }

  return { sections }
}
