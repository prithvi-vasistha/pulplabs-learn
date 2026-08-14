/**
 * The assessment engine.
 *
 * Pure functions over an exam definition and a set of answers. It knows nothing
 * about React, storage, or transport, so the same grading runs on the server
 * today and could run in a job or a test tomorrow. Adding a question bank
 * requires no change here and no change to the exam UI.
 */

/** Strip everything a candidate must not see. This is what reaches the browser. */
export function toCandidateExam(exam) {
  return {
    slug: exam.slug,
    title: exam.title,
    level: exam.level,
    minutes: exam.minutes,
    passing: exam.passing,
    questionCount: exam.questions.length,
    questions: exam.questions.map((q) => ({
      id: q.id,
      type: q.type,
      topic: q.topic,
      difficulty: q.difficulty,
      prompt: q.prompt,
      code: q.code ?? null,
      lang: q.lang ?? null,
      multiple: q.type === 'multiple',
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  }
}

function sameSet(a, b) {
  if (a.length !== b.length) return false
  const left = [...a].sort()
  const right = [...b].sort()
  return left.every((value, index) => value === right[index])
}

/**
 * Grade a submission.
 *
 * @param exam    the full definition, including `correct` and `explanation`
 * @param answers { [questionId]: string[] } — option ids the candidate picked
 */
export function grade(exam, answers = {}) {
  const questions = exam.questions.map((question) => {
    const picked = Array.isArray(answers[question.id]) ? answers[question.id].filter(Boolean) : []
    const answered = picked.length > 0
    const isCorrect = answered && sameSet(picked, question.correct)

    return {
      id: question.id,
      type: question.type,
      topic: question.topic,
      difficulty: question.difficulty,
      prompt: question.prompt,
      code: question.code ?? null,
      lang: question.lang ?? null,
      options: question.options,
      correct: question.correct,
      picked,
      answered,
      isCorrect,
      explanation: question.explanation,
    }
  })

  const total = questions.length
  const correct = questions.filter((q) => q.isCorrect).length
  const unanswered = questions.filter((q) => !q.answered).length
  const incorrect = total - correct - unanswered
  const score = total === 0 ? 0 : Math.round((correct / total) * 100)

  const byTopic = new Map()
  for (const question of questions) {
    const entry = byTopic.get(question.topic) ?? { topic: question.topic, total: 0, correct: 0 }
    entry.total += 1
    if (question.isCorrect) entry.correct += 1
    byTopic.set(question.topic, entry)
  }

  const topics = [...byTopic.values()]
    .map((entry) => ({ ...entry, percent: Math.round((entry.correct / entry.total) * 100) }))
    .sort((a, b) => b.percent - a.percent || a.topic.localeCompare(b.topic))

  const strong = topics.filter((t) => t.percent >= 80).map((t) => t.topic)
  const weak = topics.filter((t) => t.percent < 60).map((t) => t.topic)

  const recommendations = topics
    .filter((t) => t.percent < 80)
    .map((t) => {
      const link = exam.topicLinks?.[t.topic]
      return link ? { topic: t.topic, percent: t.percent, ...link } : null
    })
    .filter(Boolean)

  return {
    examSlug: exam.slug,
    examTitle: exam.title,
    total,
    correct,
    incorrect,
    unanswered,
    score,
    passing: exam.passing,
    passed: score >= exam.passing,
    topics,
    strong,
    weak,
    recommendations,
    questions,
  }
}

/** Short, stable id for an attempt. Generated where the attempt is created. */
export function newAttemptId() {
  const random = Math.random().toString(36).slice(2, 8)
  return `${Date.now().toString(36)}-${random}`
}
