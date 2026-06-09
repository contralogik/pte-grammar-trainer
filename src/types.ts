export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type QuestionType =
  | 'Error Correction'
  | 'Fill in the Blanks'
  | 'Sentence Combination'
  | 'Reorder Paragraph'

export type GrammarQuestion = {
  id: string
  topic: string
  subTopic: string
  difficulty: Difficulty
  pteSkill: string
  questionType: QuestionType
  question: string
  options: string[]
  correctAnswer: string | string[]
  explanationCN: string
  explanationEN: string
  commonMistake: string
  pteRelevance: string
  memoryTip: string
  correction?: string
}

export type PracticeRecord = {
  id: string
  questionId: string
  topic: string
  questionType: QuestionType
  isCorrect: boolean
  userAnswer: string | string[]
  correctAnswer: string | string[]
  answeredAt: string
}

export type MistakeItem = {
  questionId: string
  topic: string
  subTopic: string
  questionType: QuestionType
  question: string
  userAnswer: string | string[]
  correctAnswer: string | string[]
  errorType: string
  explanation: string
  reviewCount: number
  lastReviewedAt: string
}

export type AnswerState = {
  question: GrammarQuestion
  userAnswer: string | string[]
  isCorrect: boolean
}
