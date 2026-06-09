import type { GrammarQuestion, MistakeItem, PracticeRecord } from './types'

const RECORDS_KEY = 'pte-grammar-trainer-records'
const MISTAKES_KEY = 'pte-grammar-trainer-mistakes'

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadRecords(): PracticeRecord[] {
  return readJson<PracticeRecord[]>(RECORDS_KEY, [])
}

export function saveRecords(records: PracticeRecord[]) {
  writeJson(RECORDS_KEY, records)
}

export function loadMistakes(): MistakeItem[] {
  return readJson<MistakeItem[]>(MISTAKES_KEY, [])
}

export function saveMistakes(mistakes: MistakeItem[]) {
  writeJson(MISTAKES_KEY, mistakes)
}

export function addPracticeResult(
  records: PracticeRecord[],
  question: GrammarQuestion,
  userAnswer: string | string[],
  isCorrect: boolean,
) {
  const nextRecord: PracticeRecord = {
    id: crypto.randomUUID(),
    questionId: question.id,
    topic: question.topic,
    questionType: question.questionType,
    isCorrect,
    userAnswer,
    correctAnswer: question.correctAnswer,
    answeredAt: new Date().toISOString(),
  }

  const next = [nextRecord, ...records].slice(0, 5000)
  saveRecords(next)
  return next
}

export function upsertMistake(
  mistakes: MistakeItem[],
  question: GrammarQuestion,
  userAnswer: string | string[],
) {
  const existing = mistakes.find((item) => item.questionId === question.id)
  const nextItem: MistakeItem = {
    questionId: question.id,
    topic: question.topic,
    subTopic: question.subTopic,
    questionType: question.questionType,
    question: question.question,
    userAnswer,
    correctAnswer: question.correctAnswer,
    errorType: `${question.topic} / ${question.questionType}`,
    explanation: question.explanationCN,
    reviewCount: existing?.reviewCount ?? 0,
    lastReviewedAt: existing?.lastReviewedAt ?? new Date().toISOString(),
  }

  const next = existing
    ? mistakes.map((item) => (item.questionId === question.id ? nextItem : item))
    : [nextItem, ...mistakes]

  saveMistakes(next)
  return next
}

export function markMistakeReviewed(mistakes: MistakeItem[], questionId: string) {
  const next = mistakes.map((item) =>
    item.questionId === questionId
      ? {
          ...item,
          reviewCount: item.reviewCount + 1,
          lastReviewedAt: new Date().toISOString(),
        }
      : item,
  )
  saveMistakes(next)
  return next
}
