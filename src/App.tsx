import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Home,
  Layers3,
  ListChecks,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import rawQuestions from './data/questions.json'
import {
  GRAMMAR_TOPICS,
  QUESTION_TYPES,
  difficultyLabel,
  questionTypeLabel,
  subTopicLabel,
  topicLabel,
} from './data/topics'
import {
  addPracticeResult,
  loadMistakes,
  loadRecords,
  markMistakeReviewed,
  saveMistakes,
  upsertMistake,
} from './storage'
import type {
  AnswerState,
  GrammarQuestion,
  MistakeItem,
  PracticeRecord,
  QuestionType,
} from './types'

type Page = 'dashboard' | 'topics' | 'practice' | 'explanation' | 'mistakes' | 'history' | 'progress'

const questions = rawQuestions as GrammarQuestion[]

const navItems: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'topics', label: 'Grammar Topics', icon: BookOpen },
  { id: 'practice', label: 'Practice', icon: Target },
  { id: 'mistakes', label: 'Mistake Book', icon: ClipboardList },
  { id: 'history', label: '练习记录', icon: ListChecks },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
]

const formatAnswer = (answer: string | string[]) =>
  Array.isArray(answer) ? answer.join(' / ') : answer

const sameAnswer = (a: string | string[], b: string | string[]) =>
  Array.isArray(a) || Array.isArray(b)
    ? JSON.stringify(a) === JSON.stringify(b)
    : a.trim().toLowerCase() === b.trim().toLowerCase()

function formatOrderedAnswer(answer: string | string[]) {
  return Array.isArray(answer)
    ? answer.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : answer
}

function buildDetailedExplanation(
  question: GrammarQuestion,
  userAnswer: string | string[],
  isCorrect: boolean,
) {
  const topic = topicLabel(question.topic)
  const subTopic = subTopicLabel(question.subTopic)
  const user = formatAnswer(userAnswer)
  const correct = formatAnswer(question.correctAnswer)
  const resultLine = isCorrect
    ? `你这次选择的是“${user}”，答案正确。`
    : `你这次选择的是“${user}”，正确答案应该是“${correct}”。`

  const intro = `这道题考查的是“${topic} - ${subTopic}”。题干是：${question.question}`
  const baseRule = question.explanationCN.replace(/\s+/g, ' ').trim()

  if (question.questionType === 'Error Correction') {
    const correction = question.correction
      ? `本题真正需要修改的片段是“${correct}”，应改为“${question.correction}”。`
      : `本题真正需要修改的片段是“${correct}”。`
    return [
      intro,
      resultLine,
      correction,
      `做错误纠正题时，先不要急着看中文意思，要先找句子的主语、谓语、修饰成分和固定搭配。这里的错误不是整句逻辑，而是局部语法形式不符合“${topic}”规则。`,
      baseRule,
      `记忆方法：${question.memoryTip}`,
    ].join('\n\n')
  }

  if (question.questionType === 'Fill in the Blanks') {
    return [
      intro,
      resultLine,
      `空格所在位置决定了它需要承担特定语法功能，所以不能只看哪个选项“意思差不多”。正确选项“${correct}”能和空格前后的词自然连接，并且符合“${topic}”规则。`,
      `如果选错，通常是因为只看了局部词义，忽略了句子结构、词形或搭配要求。${question.commonMistake}`,
      baseRule,
      `记忆方法：${question.memoryTip}`,
    ].join('\n\n')
  }

  if (question.questionType === 'Sentence Combination') {
    return [
      intro,
      resultLine,
      `句子合并题的关键是保留两个句子的原意，同时避免碎片句、重复主语、连接词误用或从句结构错误。正确答案“${correct}”把信息合并成一个完整、自然的学术句子。`,
      `检查这类题时，可以问自己三件事：第一，主句是否完整；第二，从句或连接结构是否正确；第三，合并后有没有改变原意。`,
      baseRule,
      `记忆方法：${question.memoryTip}`,
    ].join('\n\n')
  }

  return [
    intro,
    resultLine,
    `你的排序是：\n${formatOrderedAnswer(userAnswer)}`,
    `正确排序是：\n${formatOrderedAnswer(question.correctAnswer)}`,
    `段落排序题要先找“总起句”，再找解释原因、举例或考试关联，最后找结论句。这个题的正确顺序是先提出 ${topic} 的作用，再解释原因，然后连接到 PTE 场景，最后用 regular review 做总结。`,
    baseRule,
    `记忆方法：${question.memoryTip}`,
  ].join('\n\n')
}

const todayKey = () => new Date().toISOString().slice(0, 10)

function getQuestionPool(topic: string, type: QuestionType | 'All') {
  return questions.filter(
    (question) =>
      (topic === 'Random' || question.topic === topic) &&
      (type === 'All' || question.questionType === type),
  )
}

function pickQuestion(topic: string, type: QuestionType | 'All', skipId?: string) {
  const pool = getQuestionPool(topic, type)
  const candidates = pool.length > 1 ? pool.filter((item) => item.id !== skipId) : pool
  return candidates[Math.floor(Math.random() * candidates.length)] ?? questions[0]
}

function topicStats(records: PracticeRecord[]) {
  return GRAMMAR_TOPICS.map((topic) => {
    const related = records.filter((record) => record.topic === topic)
    const correct = related.filter((record) => record.isCorrect).length
    return {
      topic,
      total: related.length,
      accuracy: related.length ? Math.round((correct / related.length) * 100) : 0,
    }
  })
}

function weakTopics(records: PracticeRecord[], mistakes: MistakeItem[], limit = 5) {
  const byAccuracy = topicStats(records)
    .filter((item) => item.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)

  const mistakeCounts = GRAMMAR_TOPICS.map((topic) => ({
    topic,
    total: mistakes.filter((mistake) => mistake.topic === topic).length,
    accuracy: 0,
  }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)

  const merged = [...byAccuracy, ...mistakeCounts].filter(
    (item, index, arr) => arr.findIndex((candidate) => candidate.topic === item.topic) === index,
  )

  return (merged.length ? merged : topicStats(records).slice(0, 5)).slice(0, limit)
}

function lastSevenDays(records: PracticeRecord[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    return {
      key,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      count: records.filter((record) => record.answeredAt.slice(0, 10) === key).length,
    }
  })
  return days
}

function Shell({
  page,
  setPage,
  children,
}: {
  page: Page
  setPage: (page: Page) => void
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="mb-4 flex items-center gap-3 lg:mb-8">
            <div className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">PTE Grammar Trainer</h1>
              <p className="text-xs text-slate-500">语法刷题工作台</p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage(item.id)}
                  className={clsx(
                    'flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                    page === item.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  note,
  tone = 'default',
}: {
  label: string
  value: string
  note: string
  tone?: 'default' | 'good' | 'warn'
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div
        className={clsx(
          'mt-3 text-3xl font-semibold tracking-normal',
          tone === 'good' && 'text-emerald-700',
          tone === 'warn' && 'text-amber-700',
        )}
      >
        {value}
      </div>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </section>
  )
}

function SevenDayChart({
  days,
  title = '最近 7 天练习量',
}: {
  days: ReturnType<typeof lastSevenDays>
  title?: string
}) {
  const maxDay = Math.max(1, ...days.map((day) => day.count))
  const total = days.reduce((sum, day) => sum + day.count, 0)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">看每天做了多少题，用来判断练习是否连续。</p>
        </div>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          共 {total} 题
        </span>
      </div>
      <div className="mt-5 flex h-48 items-end gap-3">
        {days.map((day) => {
          const height = day.count === 0 ? 0 : Math.max(10, (day.count / maxDay) * 100)
          return (
            <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end rounded bg-slate-100">
                <div className="w-full rounded bg-emerald-500" style={{ height: `${height}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-700">{day.count} 题</span>
              <span className="text-xs text-slate-500">{day.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Dashboard({
  records,
  mistakes,
  onPractice,
  onTopic,
}: {
  records: PracticeRecord[]
  mistakes: MistakeItem[]
  onPractice: () => void
  onTopic: (topic: string) => void
}) {
  const today = todayKey()
  const todayRecords = records.filter((record) => record.answeredAt.slice(0, 10) === today)
  const correct = records.filter((record) => record.isCorrect).length
  const accuracy = records.length ? Math.round((correct / records.length) * 100) : 0
  const weak = weakTopics(records, mistakes, 3)
  const sevenDays = lastSevenDays(records)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-500">今日复习、正确率和薄弱点集中在一屏。</p>
        </div>
        <button
          type="button"
          onClick={onPractice}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          继续练习
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="今日练习数量" value={`${todayRecords.length}`} note="按本机日期统计" />
        <StatCard label="总体正确率" value={`${accuracy}%`} note={`${records.length} 道累计练习`} tone="good" />
        <StatCard label="错题本" value={`${mistakes.length}`} note="答错后自动加入" tone="warn" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">薄弱语法点</h3>
              <p className="text-sm text-slate-500">优先从低正确率和错题集中处开始。</p>
            </div>
            <Target className="text-emerald-600" size={22} />
          </div>
          <div className="mt-5 space-y-3">
            {weak.map((item) => (
              <button
                key={item.topic}
                type="button"
                onClick={() => onTopic(item.topic)}
                className="flex w-full items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span>
                  <span className="block text-sm font-semibold">{topicLabel(item.topic)}</span>
                  <span className="text-xs text-slate-500">
                    {item.total ? `${item.total} 条记录` : '等待更多练习数据'}
                  </span>
                </span>
                <span className="text-sm font-semibold text-amber-700">
                  {item.total ? `${item.accuracy}%` : 'Start'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <SevenDayChart days={sevenDays} title="最近 7 天" />
      </div>
    </div>
  )
}

function TopicsPage({
  selectedTopic,
  onStart,
}: {
  selectedTopic: string
  onStart: (topic: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">Grammar Topics</h2>
        <p className="mt-2 text-sm text-slate-500">选择语法点后进入专项练习。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {GRAMMAR_TOPICS.map((topic) => {
          const count = questions.filter((question) => question.topic === topic).length
          return (
            <button
              key={topic}
              type="button"
              onClick={() => onStart(topic)}
              className={clsx(
                'rounded-lg border bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50',
                selectedTopic === topic ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{topicLabel(topic)}</h3>
                <Layers3 size={18} className="text-emerald-600" />
              </div>
              <p className="mt-3 text-sm text-slate-500">{count} 道本地题目</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PracticePage({
  topic,
  setTopic,
  records,
  setRecords,
  mistakes,
  setMistakes,
  setAnswerState,
  goExplanation,
}: {
  topic: string
  setTopic: (topic: string) => void
  records: PracticeRecord[]
  setRecords: (records: PracticeRecord[]) => void
  mistakes: MistakeItem[]
  setMistakes: (mistakes: MistakeItem[]) => void
  setAnswerState: (answer: AnswerState) => void
  goExplanation: () => void
}) {
  const [questionType, setQuestionType] = useState<QuestionType | 'All'>('All')
  const [practice, setPractice] = useState(() => {
    const firstQuestion = pickQuestion(topic, 'All')
    return {
      current: firstQuestion,
      userAnswer: null as string | string[] | null,
      isCorrect: null as boolean | null,
      dragAnswer: firstQuestion.questionType === 'Reorder Paragraph' ? firstQuestion.options : [],
      selectedOrderIndex: null as number | null,
    }
  })

  const { current, userAnswer, isCorrect, dragAnswer, selectedOrderIndex } = practice

  const resetToQuestion = (next: GrammarQuestion) => {
    setPractice({
      current: next,
      userAnswer: null,
      isCorrect: null,
      dragAnswer: next.questionType === 'Reorder Paragraph' ? next.options : [],
      selectedOrderIndex: null,
    })
  }

  const submit = (answer: string | string[]) => {
    if (userAnswer !== null) return
    const correctNow = sameAnswer(answer, current.correctAnswer)
    setPractice((value) => ({ ...value, userAnswer: answer, isCorrect: correctNow }))
    setAnswerState({ question: current, userAnswer: answer, isCorrect: correctNow })
    setRecords(addPracticeResult(records, current, answer, correctNow))
    if (!correctNow) {
      setMistakes(upsertMistake(mistakes, current, answer))
    }
  }

  const nextQuestion = () => {
    resetToQuestion(pickQuestion(topic, questionType, current.id))
  }

  const moveDragItem = (from: number, to: number) => {
    const next = [...dragAnswer]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setPractice((value) => ({ ...value, dragAnswer: next, selectedOrderIndex: to }))
  }

  const moveSelectedOrderItem = (index: number, direction: -1 | 1) => {
    if (userAnswer !== null) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= dragAnswer.length) return
    moveDragItem(index, nextIndex)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">Practice</h2>
          <p className="mt-2 text-sm text-slate-500">选择答案后立即判定，答错会自动进入错题本。</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={topic}
            onChange={(event) => {
              const nextTopic = event.target.value
              setTopic(nextTopic)
              resetToQuestion(pickQuestion(nextTopic, questionType, current.id))
            }}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="Random">随机练习</option>
            {GRAMMAR_TOPICS.map((item) => (
              <option key={item} value={item}>
                {topicLabel(item)}
              </option>
            ))}
          </select>
          <select
            value={questionType}
            onChange={(event) => {
              const nextType = event.target.value as QuestionType | 'All'
              setQuestionType(nextType)
              resetToQuestion(pickQuestion(topic, nextType, current.id))
            }}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="All">全部题型</option>
            {QUESTION_TYPES.map((item) => (
              <option key={item} value={item}>
                {questionTypeLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded bg-slate-100 px-2 py-1">{topicLabel(current.topic)}</span>
          <span className="rounded bg-slate-100 px-2 py-1">{subTopicLabel(current.subTopic)}</span>
          <span className="rounded bg-slate-100 px-2 py-1">{difficultyLabel(current.difficulty)}</span>
          <span className="rounded bg-slate-100 px-2 py-1">{questionTypeLabel(current.questionType)}</span>
        </div>
        <p className="mt-5 text-lg font-medium leading-8">{current.question}</p>

        <div className="mt-6">
          {current.questionType === 'Reorder Paragraph' ? (
            <div className="space-y-3">
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                点击句子选中后用“上移/下移”调整顺序，也可以直接拖拽排序。
              </p>
              {dragAnswer.map((option, index) => (
                <div
                  key={`${option}-${index}`}
                  draggable={userAnswer === null}
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    moveDragItem(Number(event.dataTransfer.getData('text/plain')), index)
                  }}
                  onClick={() => {
                    if (userAnswer === null) {
                      setPractice((value) => ({ ...value, selectedOrderIndex: index }))
                    }
                  }}
                  className={clsx(
                    'rounded-md border px-4 py-3 text-sm transition active:cursor-grabbing',
                    userAnswer === null && 'cursor-grab',
                    selectedOrderIndex === index
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-slate-50',
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      <span className="font-semibold text-emerald-700">{index + 1}</span>
                      <span>{option}</span>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={userAnswer !== null || index === 0}
                        onClick={(event) => {
                          event.stopPropagation()
                          moveSelectedOrderItem(index, -1)
                        }}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title="上移"
                      >
                        <ArrowUp size={14} />
                        上移
                      </button>
                      <button
                        type="button"
                        disabled={userAnswer !== null || index === dragAnswer.length - 1}
                        onClick={(event) => {
                          event.stopPropagation()
                          moveSelectedOrderItem(index, 1)
                        }}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title="下移"
                      >
                        <ArrowDown size={14} />
                        下移
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                disabled={userAnswer !== null}
                onClick={() => submit(dragAnswer)}
                className="mt-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                提交排序
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {current.options.map((option) => {
                const selected = userAnswer === option
                const correct = sameAnswer(option, current.correctAnswer)
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={userAnswer !== null}
                    onClick={() => submit(option)}
                    className={clsx(
                      'rounded-md border px-4 py-3 text-left text-sm transition',
                      userAnswer === null && 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50',
                      userAnswer !== null && correct && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                      userAnswer !== null && selected && !correct && 'border-red-300 bg-red-50 text-red-700',
                      userAnswer !== null && !selected && !correct && 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {isCorrect !== null && (
          <div
            className={clsx(
              'mt-6 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
              isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50',
            )}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="text-emerald-700" size={22} />
              ) : (
                <XCircle className="text-red-700" size={22} />
              )}
              <div>
                <p className="font-semibold">{isCorrect ? '回答正确' : '回答错误'}</p>
                <p className="text-sm text-slate-600">正确答案：{formatAnswer(current.correctAnswer)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goExplanation}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                查看解析
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                下一题
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function ExplanationPage({
  answerState,
  onPractice,
}: {
  answerState: AnswerState | null
  onPractice: () => void
}) {
  if (!answerState) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-semibold">Explanation</h2>
        <p className="mt-3 text-slate-500">完成一道练习后，这里会显示详细解析。</p>
        <button
          type="button"
          onClick={onPractice}
          className="mt-5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          去练习
        </button>
      </section>
    )
  }

  const { question, userAnswer, isCorrect } = answerState
  const detailedExplanation = buildDetailedExplanation(question, userAnswer, isCorrect)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">Explanation</h2>
        <p className="mt-2 text-sm text-slate-500">
          {isCorrect ? '这题已掌握，可以继续巩固。' : '这题已记录到错题本，建议复习规则和常见错误。'}
        </p>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-lg font-medium leading-8">{question.question}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <InfoBlock label="你的答案" value={formatAnswer(userAnswer)} />
          <InfoBlock label="正确答案" value={formatAnswer(question.correctAnswer)} />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <DetailBlock title="中文解析" body={detailedExplanation} wide />
          <DetailBlock title="常见错误" body={question.commonMistake} />
          <DetailBlock title="PTE考试关联" body={question.pteRelevance} />
          <DetailBlock title="记忆提示" body={question.memoryTip} />
          {question.correction && <DetailBlock title="推荐改法" body={question.correction} />}
        </div>
        <button
          type="button"
          onClick={onPractice}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <RotateCcw size={17} />
          再练一题
        </button>
      </section>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  )
}

function DetailBlock({ title, body, wide = false }: { title: string; body: string; wide?: boolean }) {
  return (
    <article className={clsx('rounded-md border border-slate-200 p-4', wide && 'lg:col-span-2')}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{body}</p>
    </article>
  )
}

function MistakeBook({
  mistakes,
  setMistakes,
}: {
  mistakes: MistakeItem[]
  setMistakes: (mistakes: MistakeItem[]) => void
}) {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? mistakes : mistakes.filter((item) => item.topic === filter)

  const removeMistake = (questionId: string) => {
    const next = mistakes.filter((item) => item.questionId !== questionId)
    setMistakes(next)
    saveMistakes(next)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">Mistake Book</h2>
          <p className="mt-2 text-sm text-slate-500">所有错题保存在本机浏览器。</p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="All">全部语法点</option>
          {GRAMMAR_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topicLabel(topic)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">暂无错题</p>
            <p className="mt-2 text-sm text-slate-500">练习答错后会自动出现在这里。</p>
          </section>
        ) : (
          filtered.map((mistake) => (
            <section key={mistake.questionId} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-1">{topicLabel(mistake.topic)}</span>
                    <span className="rounded bg-slate-100 px-2 py-1">{questionTypeLabel(mistake.questionType)}</span>
                  </div>
                  <p className="mt-4 text-base font-medium leading-7">{mistake.question}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMistake(mistake.questionId)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  移除
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoBlock label="用户答案" value={formatAnswer(mistake.userAnswer)} />
                <InfoBlock label="正确答案" value={formatAnswer(mistake.correctAnswer)} />
                <InfoBlock label="错误类型" value={mistake.errorType} />
                <InfoBlock label="复习记录" value={`${mistake.reviewCount} 次 / ${new Date(mistake.lastReviewedAt).toLocaleString()}`} />
              </div>
              <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {mistake.explanation}
              </p>
              <button
                type="button"
                onClick={() => setMistakes(markMistakeReviewed(mistakes, mistake.questionId))}
                className="mt-4 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                标记已复习
              </button>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

function PracticeHistory({ records }: { records: PracticeRecord[] }) {
  const [topicFilter, setTopicFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'All'>('All')
  const filtered = records.filter(
    (record) =>
      (topicFilter === 'All' || record.topic === topicFilter) &&
      (typeFilter === 'All' || record.questionType === typeFilter),
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">练习记录</h2>
          <p className="mt-2 text-sm text-slate-500">
            这里列出你已经做过的题，方便回看做题轨迹和答案。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={topicFilter}
            onChange={(event) => setTopicFilter(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="All">全部语法点</option>
            {GRAMMAR_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topicLabel(topic)}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as QuestionType | 'All')}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="All">全部题型</option>
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {questionTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="已做题目" value={`${records.length}`} note="本机累计记录" />
        <StatCard
          label="筛选后"
          value={`${filtered.length}`}
          note="当前列表中的题目"
          tone="good"
        />
        <StatCard
          label="正确题数"
          value={`${filtered.filter((record) => record.isCorrect).length}`}
          note="按当前筛选统计"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">还没有练习记录</p>
            <p className="mt-2 text-sm text-slate-500">完成练习后，题目会自动出现在这里。</p>
          </section>
        ) : (
          filtered.map((record) => {
            const question = questions.find((item) => item.id === record.questionId)
            return (
              <section key={record.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-1">{topicLabel(record.topic)}</span>
                    <span className="rounded bg-slate-100 px-2 py-1">
                      {questionTypeLabel(record.questionType)}
                    </span>
                    <span
                      className={clsx(
                        'rounded px-2 py-1',
                        record.isCorrect
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700',
                      )}
                    >
                      {record.isCorrect ? '正确' : '错误'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(record.answeredAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-4 text-base font-medium leading-7">
                  {question?.question ?? `题目 ID：${record.questionId}`}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <InfoBlock label="你的答案" value={formatAnswer(record.userAnswer)} />
                  <InfoBlock label="正确答案" value={formatAnswer(record.correctAnswer)} />
                </div>
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}

function ProgressPage({
  records,
  mistakes,
}: {
  records: PracticeRecord[]
  mistakes: MistakeItem[]
}) {
  const stats = topicStats(records)
  const totalCorrect = records.filter((record) => record.isCorrect).length
  const accuracy = records.length ? Math.round((totalCorrect / records.length) * 100) : 0
  const sevenDays = lastSevenDays(records)
  const weak = weakTopics(records, mistakes, 5)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">Progress</h2>
        <p className="mt-2 text-sm text-slate-500">练习量、正确率和语法点表现。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="总练习题数" value={`${records.length}`} note="累计本机记录" />
        <StatCard label="正确率" value={`${accuracy}%`} note={`${totalCorrect} 道正确`} tone="good" />
        <StatCard label="最薄弱 5 项" value={`${weak.length}`} note="基于错题和正确率" tone="warn" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold">各语法点正确率</h3>
        <div className="mt-4 space-y-3">
          {stats.map((item) => (
            <div key={item.topic} className="grid gap-2 sm:grid-cols-[190px_1fr_56px] sm:items-center">
              <span className="text-sm font-medium">{topicLabel(item.topic)}</span>
              <div className="h-2 rounded bg-slate-100">
                <div className="h-2 rounded bg-emerald-500" style={{ width: `${item.accuracy}%` }} />
              </div>
              <span className="text-sm text-slate-500">{item.total ? `${item.accuracy}%` : '-'}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SevenDayChart days={sevenDays} />
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold">最薄弱的 5 个语法点</h3>
          <div className="mt-4 space-y-3">
            {weak.map((item, index) => (
              <div key={item.topic} className="flex items-center justify-between rounded-md bg-amber-50 px-4 py-3">
                <span className="text-sm font-semibold">
                  {index + 1}. {topicLabel(item.topic)}
                </span>
                <span className="text-sm text-amber-700">{item.total ? `${item.accuracy}%` : '待练习'}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedTopic, setSelectedTopic] = useState('Random')
  const [records, setRecords] = useState<PracticeRecord[]>(() => loadRecords())
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => loadMistakes())
  const [answerState, setAnswerState] = useState<AnswerState | null>(null)

  const content = useMemo(() => {
    if (page === 'topics') {
      return (
        <TopicsPage
          selectedTopic={selectedTopic}
          onStart={(topic) => {
            setSelectedTopic(topic)
            setPage('practice')
          }}
        />
      )
    }

    if (page === 'practice') {
      return (
        <PracticePage
          topic={selectedTopic}
          setTopic={setSelectedTopic}
          records={records}
          setRecords={setRecords}
          mistakes={mistakes}
          setMistakes={setMistakes}
          setAnswerState={setAnswerState}
          goExplanation={() => setPage('explanation')}
        />
      )
    }

    if (page === 'explanation') {
      return <ExplanationPage answerState={answerState} onPractice={() => setPage('practice')} />
    }

    if (page === 'mistakes') {
      return <MistakeBook mistakes={mistakes} setMistakes={setMistakes} />
    }

    if (page === 'history') {
      return <PracticeHistory records={records} />
    }

    if (page === 'progress') {
      return <ProgressPage records={records} mistakes={mistakes} />
    }

    return (
      <Dashboard
        records={records}
        mistakes={mistakes}
        onPractice={() => setPage('practice')}
        onTopic={(topic) => {
          setSelectedTopic(topic)
          setPage('practice')
        }}
      />
    )
  }, [answerState, mistakes, page, records, selectedTopic])

  return (
    <Shell page={page} setPage={setPage}>
      {content}
    </Shell>
  )
}

export default App
