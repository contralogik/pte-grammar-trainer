const fs = require('fs')
const path = require('path')

const topics = [
  {
    topic: 'Tenses',
    subTopics: ['present perfect', 'past perfect', 'future forms'],
    focus: 'tense choice shows time relationships in academic claims',
    errors: [
      ['The number of online courses have increased since 2020.', 'have increased', 'has increased'],
      ['By the time the survey ended, researchers collect 800 responses.', 'collect', 'had collected'],
      ['The university will opened a new language centre next year.', 'will opened', 'will open'],
    ],
    blanks: [
      ['By the time the lecture started, most students ____ the preparatory article.', 'had read', ['had read', 'read', 'have read', 'were read']],
      ['The data ____ a steady rise in remote learning since 2019.', 'has shown', ['has shown', 'showed', 'will show', 'showing']],
      ['If the trend continues, more candidates ____ online practice tools.', 'will use', ['will use', 'used', 'had used', 'using']],
    ],
    combines: [
      ['The policy was introduced in 2021.', 'It has influenced enrolment patterns since then.', 'The policy, introduced in 2021, has influenced enrolment patterns since then.'],
      ['The researchers finished the interviews.', 'They began coding the responses.', 'After the researchers had finished the interviews, they began coding the responses.'],
    ],
  },
  {
    topic: 'Subject Verb Agreement',
    subTopics: ['singular subjects', 'compound subjects', 'distance from subject'],
    focus: 'the verb must agree with the real subject, not the nearest noun',
    errors: [
      ['The list of recommended books are available online.', 'are', 'is'],
      ['Neither the lecturer nor the students was satisfied with the timetable.', 'was', 'were'],
      ['The findings from the experiment suggests a clear pattern.', 'suggests', 'suggest'],
    ],
    blanks: [
      ['The quality of the recordings ____ important for listening practice.', 'is', ['is', 'are', 'were', 'be']],
      ['Several reasons for the change ____ discussed in the report.', 'are', ['are', 'is', 'was', 'being']],
      ['Neither the old method nor the new exercises ____ every learner.', 'suit', ['suit', 'suits', 'is suiting', 'has suited']],
    ],
    combines: [
      ['The table contains several figures.', 'The figures indicate a gradual decline.', 'The figures in the table indicate a gradual decline.'],
      ['The main cause is unclear.', 'Several possible causes are mentioned.', 'Several possible causes are mentioned, but the main cause is unclear.'],
    ],
  },
  {
    topic: 'Articles',
    subTopics: ['a/an', 'the', 'zero article'],
    focus: 'articles signal whether a noun is general, specific, or already known',
    errors: [
      ['Researchers need the evidence before they can make a reliable claim.', 'the evidence', 'evidence'],
      ['The essay discusses impact of technology on education.', 'impact', 'the impact'],
      ['A information in the chart is not complete.', 'A information', 'The information'],
    ],
    blanks: [
      ['The passage examines ____ impact of noise on concentration.', 'the', ['the', 'a', 'an', 'zero article']],
      ['Students need ____ clear strategy for managing essay time.', 'a', ['a', 'the', 'an', 'zero article']],
      ['____ Education is often linked to long-term economic growth.', 'zero article', ['zero article', 'The', 'An', 'A']],
    ],
    combines: [
      ['The report describes a survey.', 'The survey was conducted in three cities.', 'The report describes a survey conducted in three cities.'],
      ['Students need feedback.', 'The feedback should be specific and timely.', 'Students need feedback that is specific and timely.'],
    ],
  },
  {
    topic: 'Nouns and Plurals',
    subTopics: ['countable nouns', 'irregular plurals', 'uncountable nouns'],
    focus: 'academic nouns need correct number and countability',
    errors: [
      ['The lecturer gave several useful advices about note-taking.', 'advices', 'pieces of advice'],
      ['Many childs learn pronunciation more easily through repetition.', 'childs', 'children'],
      ['The research provides many informations about learner behaviour.', 'informations', 'pieces of information'],
    ],
    blanks: [
      ['The article gives three ____ for improving concentration.', 'suggestions', ['suggestions', 'suggestion', 'informations', 'advices']],
      ['Several ____ were interviewed after the seminar.', 'participants', ['participants', 'participant', 'participation', 'participate']],
      ['The speaker offered useful ____ about time management.', 'advice', ['advice', 'advices', 'an advice', 'many advice']],
    ],
    combines: [
      ['The study collected several responses.', 'The responses came from international students.', 'The study collected several responses from international students.'],
      ['The report contains information.', 'The information is relevant to exam preparation.', 'The report contains information relevant to exam preparation.'],
    ],
  },
  {
    topic: 'Pronouns',
    subTopics: ['reference', 'case', 'possessives'],
    focus: 'pronouns must clearly refer to the right noun',
    errors: [
      ['When students review feedback, it can improve their next essay.', 'it', 'the review process'],
      ['The tutor asked Maria and I to revise the introduction.', 'I', 'me'],
      ['Each candidate should check their own microphone before speaking.', 'their', 'his or her'],
    ],
    blanks: [
      ['The applicants submitted ____ forms before the deadline.', 'their', ['their', 'there', 'they', 'them']],
      ['The examiner gave Anna and ____ detailed feedback.', 'me', ['me', 'I', 'my', 'mine']],
      ['The method is useful because ____ reduces careless grammar errors.', 'it', ['it', 'they', 'them', 'its']],
    ],
    combines: [
      ['The students received feedback.', 'They used it to improve their essays.', 'The students used the feedback they received to improve their essays.'],
      ['The teacher explained the rule.', 'The rule helped candidates avoid ambiguity.', 'The teacher explained the rule, which helped candidates avoid ambiguity.'],
    ],
  },
  {
    topic: 'Prepositions',
    subTopics: ['time', 'place', 'academic phrases'],
    focus: 'prepositions complete common academic collocations',
    errors: [
      ['The result depends of the size of the sample.', 'depends of', 'depends on'],
      ['The chart shows a rise in enrolment at 2018.', 'at 2018', 'in 2018'],
      ['The discussion focuses in the causes of urban stress.', 'focuses in', 'focuses on'],
    ],
    blanks: [
      ['The success of the project depends ____ regular feedback.', 'on', ['on', 'of', 'in', 'for']],
      ['The number of users increased ____ 15 percent.', 'by', ['by', 'to', 'with', 'at']],
      ['The passage refers ____ several earlier studies.', 'to', ['to', 'on', 'with', 'for']],
    ],
    combines: [
      ['The study focuses on public transport.', 'It compares usage in three cities.', 'The study focuses on public transport and compares usage in three cities.'],
      ['The percentage rose by 12 percent.', 'The rise occurred between 2018 and 2022.', 'The percentage rose by 12 percent between 2018 and 2022.'],
    ],
  },
  {
    topic: 'Adjectives and Adverbs',
    subTopics: ['modifier position', 'adverb form', 'intensifiers'],
    focus: 'adjectives modify nouns, while adverbs modify verbs, adjectives, or clauses',
    errors: [
      ['The speaker explained the process clear during the lecture.', 'clear', 'clearly'],
      ['This is a highly importance issue for universities.', 'importance', 'important'],
      ['The results were significant improved after training.', 'significant improved', 'significantly improved'],
    ],
    blanks: [
      ['The candidate answered the question ____ and confidently.', 'clearly', ['clearly', 'clear', 'clarity', 'cleared']],
      ['The report presents a ____ analysis of the trend.', 'detailed', ['detailed', 'detail', 'details', 'detailing']],
      ['The new policy was ____ effective in reducing delays.', 'particularly', ['particularly', 'particular', 'particularity', 'particulars']],
    ],
    combines: [
      ['The explanation was clear.', 'It helped students understand the rule quickly.', 'The clear explanation helped students understand the rule quickly.'],
      ['The percentage changed significantly.', 'The change occurred after the new policy.', 'The percentage changed significantly after the new policy was introduced.'],
    ],
  },
  {
    topic: 'Comparatives',
    subTopics: ['more/less', 'than clauses', 'superlatives'],
    focus: 'comparative forms compare two things without double marking',
    errors: [
      ['Online practice is more easier than paper practice for some candidates.', 'more easier', 'easier'],
      ['The second graph is the more detailed of the three charts.', 'more detailed', 'most detailed'],
      ['This method is as effective than the previous one.', 'as effective than', 'as effective as'],
    ],
    blanks: [
      ['The final paragraph is ____ than the first draft.', 'more concise', ['more concise', 'most concise', 'concisely', 'more concisely than']],
      ['This explanation is as useful ____ the example in the textbook.', 'as', ['as', 'than', 'to', 'from']],
      ['The northern region had the ____ increase in population.', 'largest', ['largest', 'larger', 'large', 'more large']],
    ],
    combines: [
      ['The new strategy is simple.', 'The old strategy is less effective.', 'The new strategy is simpler and more effective than the old strategy.'],
      ['The first chart is detailed.', 'The second chart is even more detailed.', 'The second chart is more detailed than the first chart.'],
    ],
  },
  {
    topic: 'Infinitives and Gerunds',
    subTopics: ['verb patterns', 'purpose', 'after prepositions'],
    focus: 'some verbs are followed by infinitives, others by gerunds',
    errors: [
      ['Many candidates avoid to use complex sentences in essays.', 'avoid to use', 'avoid using'],
      ['The tutor suggested to review the grammar notes weekly.', 'suggested to review', 'suggested reviewing'],
      ['Students practise to summarise short academic texts.', 'practise to summarise', 'practise summarising'],
    ],
    blanks: [
      ['The course aims ____ students improve grammatical accuracy.', 'to help', ['to help', 'helping', 'helped', 'helps']],
      ['Candidates should avoid ____ examples that are too general.', 'using', ['using', 'to use', 'use', 'used']],
      ['The lecturer recommended ____ the passage twice.', 'reading', ['reading', 'to read', 'read', 'reads']],
    ],
    combines: [
      ['Students practise daily.', 'They want to reduce grammar errors.', 'Students practise daily to reduce grammar errors.'],
      ['The tutor recommends regular review.', 'Regular review helps candidates remember patterns.', 'The tutor recommends reviewing regularly because it helps candidates remember patterns.'],
    ],
  },
  {
    topic: 'Relative Clauses',
    subTopics: ['defining clauses', 'non-defining clauses', 'relative pronouns'],
    focus: 'relative clauses add information about a noun without creating fragments',
    errors: [
      ['The strategy which it improves fluency is useful for speaking practice.', 'which it improves', 'which improves'],
      ['Students who they revise their essays often make fewer errors.', 'who they revise', 'who revise'],
      ['The report, that was published in 2022, compares two regions.', 'that', 'which'],
    ],
    blanks: [
      ['The students ____ attended the workshop improved their scores.', 'who', ['who', 'which', 'where', 'what']],
      ['The chart, ____ appears on the next page, shows monthly sales.', 'which', ['which', 'that', 'who', 'what']],
      ['The city ____ the survey was conducted has a large student population.', 'where', ['where', 'which', 'who', 'what']],
    ],
    combines: [
      ['The strategy improves fluency.', 'It is useful for speaking practice.', 'The strategy that improves fluency is useful for speaking practice.'],
      ['The report was published in 2022.', 'It compares two regions.', 'The report, which was published in 2022, compares two regions.'],
    ],
  },
  {
    topic: 'Noun Clauses',
    subTopics: ['that clauses', 'embedded questions', 'whether/if'],
    focus: 'noun clauses work as subjects, objects, or complements',
    errors: [
      ['The study explains why do students prefer online feedback.', 'why do students prefer', 'why students prefer'],
      ['It is unclear that the method will work for all learners.', 'that', 'whether'],
      ['The lecturer emphasized students should revise their drafts.', 'emphasized students', 'emphasized that students'],
    ],
    blanks: [
      ['The article explains ____ students benefit from immediate feedback.', 'why', ['why', 'because', 'which', 'where']],
      ['It remains unclear ____ the policy will improve attendance.', 'whether', ['whether', 'that', 'what', 'where']],
      ['The lecturer argued ____ grammar accuracy affects essay scores.', 'that', ['that', 'what', 'why', 'where']],
    ],
    combines: [
      ['Students need regular feedback.', 'The teacher believes this.', 'The teacher believes that students need regular feedback.'],
      ['Will the policy improve attendance?', 'It remains unclear.', 'It remains unclear whether the policy will improve attendance.'],
    ],
  },
  {
    topic: 'Adverbial Clauses',
    subTopics: ['time clauses', 'condition', 'contrast'],
    focus: 'adverbial clauses show time, condition, cause, or contrast',
    errors: [
      ['Although the sample was small, but the results were useful.', 'but', '[remove but]'],
      ['If candidates will practise daily, they may improve faster.', 'will practise', 'practise'],
      ['The score improved because of students revised more carefully.', 'because of students revised', 'because students revised'],
    ],
    blanks: [
      ['____ the sample was small, the findings were still useful.', 'Although', ['Although', 'Because of', 'Despite of', 'However']],
      ['If students ____ daily, they may improve faster.', 'practise', ['practise', 'will practise', 'practised', 'practising']],
      ['The score improved ____ students revised more carefully.', 'because', ['because', 'because of', 'despite', 'although']],
    ],
    combines: [
      ['The sample was small.', 'The findings were still useful.', 'Although the sample was small, the findings were still useful.'],
      ['Students revise carefully.', 'Their essays become clearer.', 'When students revise carefully, their essays become clearer.'],
    ],
  },
  {
    topic: 'Connectors',
    subTopics: ['contrast', 'cause and effect', 'addition'],
    focus: 'connectors show the logical relationship between ideas',
    errors: [
      ['The method is simple, however it requires regular practice.', 'however', 'but'],
      ['The sample was large. Because the results were reliable.', 'Because', 'Therefore'],
      ['Many students practise grammar. In addition, they ignore feedback.', 'In addition', 'However'],
    ],
    blanks: [
      ['The method is simple; ____, it requires regular practice.', 'however', ['however', 'because', 'therefore', 'also']],
      ['The sample was large; ____, the results were more reliable.', 'therefore', ['therefore', 'although', 'however', 'despite']],
      ['The course improves grammar; ____, it builds confidence.', 'in addition', ['in addition', 'however', 'because', 'instead']],
    ],
    combines: [
      ['The method is simple.', 'It requires regular practice.', 'The method is simple; however, it requires regular practice.'],
      ['The sample was large.', 'The results were more reliable.', 'The sample was large; therefore, the results were more reliable.'],
    ],
  },
  {
    topic: 'Parallel Structure',
    subTopics: ['lists', 'paired conjunctions', 'comparison'],
    focus: 'parallel forms make lists and comparisons clear',
    errors: [
      ['The course helps students plan essays, revising grammar, and improve fluency.', 'revising grammar', 'revise grammar'],
      ['Candidates need not only accuracy but also writing quickly.', 'writing quickly', 'speed'],
      ['The survey asked students to rate clarity, usefulness, and whether it was difficult.', 'whether it was difficult', 'difficulty'],
    ],
    blanks: [
      ['The programme teaches students to plan, revise, and ____ essays.', 'edit', ['edit', 'editing', 'edited', 'edits']],
      ['The course improves not only accuracy but also ____.', 'fluency', ['fluency', 'fluent', 'fluently', 'to be fluent']],
      ['The survey measured clarity, usefulness, and ____.', 'difficulty', ['difficulty', 'difficult', 'difficultly', 'being difficult']],
    ],
    combines: [
      ['The course teaches planning.', 'It teaches revision and editing.', 'The course teaches planning, revision, and editing.'],
      ['The method improves accuracy.', 'It also improves fluency.', 'The method improves both accuracy and fluency.'],
    ],
  },
  {
    topic: 'Punctuation',
    subTopics: ['commas', 'semicolons', 'apostrophes'],
    focus: 'punctuation separates clauses and clarifies meaning',
    errors: [
      ['The sample was small however the trend was clear.', 'small however', 'small; however,'],
      ['The students essays were reviewed by two tutors.', 'students essays', "students' essays"],
      ['After the lecture ended the students completed a short quiz.', 'ended the', 'ended, the'],
    ],
    blanks: [
      ['The sample was small; ____, the trend was clear.', 'however', ['however', 'because', 'although', 'and']],
      ["The ____ essays were reviewed by two tutors.", "students'", ["students'", 'students', "student's", 'student']],
      ['After the lecture ended, the students completed a short quiz. Which mark is needed after "ended"?', 'comma', ['comma', 'semicolon', 'apostrophe', 'no punctuation']],
    ],
    combines: [
      ['The sample was small.', 'However, the trend was clear.', 'The sample was small; however, the trend was clear.'],
      ['The lecture ended.', 'The students completed a short quiz.', 'After the lecture ended, the students completed a short quiz.'],
    ],
  },
  {
    topic: 'Word Forms',
    subTopics: ['noun forms', 'adjective forms', 'verb forms'],
    focus: 'word form must match the grammatical role in the sentence',
    errors: [
      ['The rapid develop of technology has changed education.', 'develop', 'development'],
      ['The report provides a clearly explanation of the trend.', 'clearly', 'clear'],
      ['Regular practise can improvement grammar accuracy.', 'improvement', 'improve'],
    ],
    blanks: [
      ['The rapid ____ of technology has changed education.', 'development', ['development', 'develop', 'developing', 'developed']],
      ['The report provides a ____ explanation of the trend.', 'clear', ['clear', 'clearly', 'clarity', 'cleared']],
      ['Regular practice can ____ grammar accuracy.', 'improve', ['improve', 'improvement', 'improved', 'improving']],
    ],
    combines: [
      ['Technology develops rapidly.', 'This development has changed education.', 'The rapid development of technology has changed education.'],
      ['The trend is clear.', 'The report explains it carefully.', 'The report provides a clear explanation of the trend.'],
    ],
  },
  {
    topic: 'Collocations',
    subTopics: ['academic verbs', 'preposition pairs', 'noun phrases'],
    focus: 'collocations are natural word partnerships used in academic English',
    errors: [
      ['The graph makes a comparison between two age groups.', 'makes a comparison', 'draws a comparison'],
      ['The study gives emphasis on the need for feedback.', 'gives emphasis on', 'places emphasis on'],
      ['Candidates should do progress through regular review.', 'do progress', 'make progress'],
    ],
    blanks: [
      ['The author ____ emphasis on the role of feedback.', 'places', ['places', 'does', 'gets', 'takes']],
      ['Candidates can ____ progress through regular review.', 'make', ['make', 'do', 'take', 'get']],
      ['The chart ____ a comparison between two age groups.', 'draws', ['draws', 'does', 'puts', 'keeps']],
    ],
    combines: [
      ['The author emphasizes feedback.', 'Feedback improves essay quality.', 'The author places emphasis on feedback because it improves essay quality.'],
      ['Candidates review regularly.', 'They make steady progress.', 'Candidates who review regularly make steady progress.'],
    ],
  },
]

const pteSkills = ['Writing', 'Reading', 'Listening', 'Speaking']
const difficultyCycle = ['Easy', 'Medium', 'Hard', 'Medium', 'Hard', 'Medium', 'Easy', 'Medium', 'Hard', 'Medium']
const focusCN = {
  Tenses: '时态用于表达动作发生的时间、持续状态和先后关系',
  'Subject Verb Agreement': '谓语动词必须和真正的主语在人称和数上保持一致',
  Articles: '冠词用于区分泛指、特指和不可数/抽象名词',
  'Nouns and Plurals': '名词需要根据可数性、单复数和固定表达选择正确形式',
  Pronouns: '代词必须指代清楚，并在句中使用正确格',
  Prepositions: '介词常和动词、名词、形容词形成固定学术搭配',
  'Adjectives and Adverbs': '形容词修饰名词，副词修饰动词、形容词或整个分句',
  Comparatives: '比较结构需要避免双重比较，并保持比较对象一致',
  'Infinitives and Gerunds': '不定式和动名词取决于前面动词、介词或目的表达',
  'Relative Clauses': '定语从句用于补充或限定名词，不能重复主语',
  'Noun Clauses': '名词性从句可以充当主语、宾语或表语，语序要用陈述语序',
  'Adverbial Clauses': '状语从句表达时间、条件、原因或让步关系',
  Connectors: '连接词必须准确表达转折、因果、递进或对比关系',
  'Parallel Structure': '并列结构中的词性、形式和层级需要保持一致',
  Punctuation: '标点用于划分分句、连接独立句并避免歧义',
  'Word Forms': '词形必须符合句中语法角色，如名词、动词、形容词或副词',
  Collocations: '搭配强调英语中自然固定的词语组合',
}

function difficultyAt(i) {
  return difficultyCycle[i % difficultyCycle.length]
}

function optionSet(correct, options) {
  return Array.from(new Set([correct, ...options])).slice(0, 4)
}

function rotateOptions(options, seed) {
  const unique = Array.from(new Set(options))
  const shift = seed % unique.length
  return [...unique.slice(shift), ...unique.slice(0, shift)]
}

function lowerFirst(text) {
  return `${text[0].toLowerCase()}${text.slice(1)}`
}

function sentenceWithPrefix(prefix, sentence) {
  return prefix ? `${prefix}${lowerFirst(sentence)}` : sentence
}

function errorOptions(sentence, wrong) {
  const cleaned = sentence.replace(/[.,;:?]/g, '')
  const words = cleaned.split(/\s+/)
  const chunks = [
    wrong,
    words.slice(0, Math.min(4, words.length)).join(' '),
    words.slice(Math.max(0, words.length - 4)).join(' '),
    words.slice(2, Math.min(7, words.length)).join(' '),
    words.slice(Math.max(0, words.length - 7), Math.max(0, words.length - 2)).join(' '),
  ].filter(Boolean)
  return rotateOptions(Array.from(new Set(chunks)).slice(0, 4), sentence.length)
}

function explanationCN(config, difficulty, focusLabel) {
  const depth =
    difficulty === 'Easy'
      ? 'Easy 题重点考核心规则，先看句子主干即可定位。'
      : difficulty === 'Medium'
        ? 'Medium 题会加入修饰语或常见干扰项，需要同时检查结构和搭配。'
        : 'Hard 题通常放在长句或学术表达中，需要判断逻辑关系、词形和句法边界。'
  return `${config.topic}：${focusCN[config.topic] ?? focusLabel}。${depth} 在 PTE 中，这类错误会直接影响阅读填空、写作句子准确性和摘要表达。`
}

function explanationEN(config, difficulty) {
  const level =
    difficulty === 'Easy'
      ? 'Focus on the core form before checking extra details.'
      : difficulty === 'Medium'
        ? 'Check the full clause because nearby words may distract you from the real grammar relationship.'
        : 'In longer academic sentences, identify the main clause first and then test the grammar relationship.'
  return `The rule for ${config.topic.toLowerCase()} controls how meaning is expressed accurately in academic English. ${level}`
}

function commonMistake(config) {
  return `常见错误是按中文直译或只看相邻单词，忽略 ${config.topic} 的真实语法功能。`
}

function memoryTip(config) {
  return `记忆提示：看到 ${config.topic} 题，先找主语、谓语和连接关系，再检查固定搭配或词形。`
}

function base(id, globalIndex, type, config, caseIndex) {
  const difficulty = difficultyAt(caseIndex)
  return {
    id,
    topic: config.topic,
    subTopic: config.subTopics[caseIndex % config.subTopics.length],
    difficulty,
    pteSkill: pteSkills[globalIndex % pteSkills.length],
    questionType: type,
    explanationCN: explanationCN(config, difficulty, config.focus),
    explanationEN: explanationEN(config, difficulty),
    commonMistake: commonMistake(config),
    pteRelevance:
      'PTE 关联：该语法点常出现在 Reading & Writing: Fill in the Blanks、Summarize Written Text、Essay 和听力笔记转述中。',
    memoryTip: memoryTip(config),
  }
}

function configAt(i, offset = 0) {
  return topics[(i + offset) % topics.length]
}

function variantPrefix(i, difficulty) {
  if (difficulty === 'Easy') return ''
  if (difficulty === 'Medium') return i % 2 === 0 ? 'In the academic passage, ' : 'In the sample response, '
  return i % 2 === 0 ? 'Although the context is complex, ' : 'In a sentence with several modifiers, '
}

function createErrorQuestion(i) {
  const config = configAt(i)
  const item = config.errors[i % config.errors.length]
  const baseItem = base(`ec-${String(i + 1).padStart(3, '0')}`, i, 'Error Correction', config, i)
  const prefix = variantPrefix(i, baseItem.difficulty)
  const question = sentenceWithPrefix(prefix, item[0])
  return {
    ...baseItem,
    question,
    options: errorOptions(question, item[1]),
    correctAnswer: item[1],
    correction: item[2],
    explanationCN: `${baseItem.explanationCN} 本题错误片段是 “${item[1]}”，推荐改为 “${item[2]}”。`,
  }
}

function createBlankQuestion(i) {
  const config = configAt(i, 3)
  const item = config.blanks[i % config.blanks.length]
  const baseItem = base(`fb-${String(i + 1).padStart(3, '0')}`, 250 + i, 'Fill in the Blanks', config, i)
  const prefix = variantPrefix(i, baseItem.difficulty)
  return {
    ...baseItem,
    question: sentenceWithPrefix(prefix, item[0]),
    options: rotateOptions(item[2], i),
    correctAnswer: item[1],
    explanationCN: `${baseItem.explanationCN} 空格处应选择 “${item[1]}”，因为它符合句子结构和上下文意义。`,
  }
}

function createCombinationQuestion(i) {
  const config = configAt(i, 7)
  const item = config.combines[i % config.combines.length]
  const baseItem = base(`sc-${String(i + 1).padStart(3, '0')}`, 500 + i, 'Sentence Combination', config, i)
  const distractors = [
    `${item[0]} Although ${item[1][0].toLowerCase()}${item[1].slice(1)}`,
    `${item[0]} And which ${item[1][0].toLowerCase()}${item[1].slice(1)}`,
    `${item[0]} ${item[1]}`,
  ]
  return {
    ...baseItem,
    question: `Combine the two sentences into one accurate academic sentence: 1) ${item[0]} 2) ${item[1]}`,
    options: rotateOptions(optionSet(item[2], distractors), i),
    correctAnswer: item[2],
    explanationCN: `${baseItem.explanationCN} 最佳合并句是 “${item[2]}”，因为它保留原意并避免碎片句或连接词错误。`,
  }
}

function createReorderQuestion(i) {
  const config = configAt(i, 11)
  const baseItem = base(`rp-${String(i + 1).padStart(3, '0')}`, 750 + i, 'Reorder Paragraph', config, i)
  const lens =
    baseItem.difficulty === 'Easy'
      ? 'The first sentence introduces the topic, and the final sentence gives a result.'
      : baseItem.difficulty === 'Medium'
        ? 'Watch for pronouns, repeated nouns, and cause-effect links between the middle sentences.'
        : 'Use discourse signals, reference words, and the shift from general claim to specific implication.'
  const ordered = [
    `Accurate use of ${config.topic.toLowerCase()} helps readers follow academic meaning.`,
    `This is because ${config.focus}.`,
    `For PTE candidates, the same pattern often appears in fill-in-the-blanks and written summaries.`,
    `Regular review therefore makes the grammar choice faster and more automatic.`,
  ]
  const shuffled =
    i % 3 === 0
      ? [ordered[2], ordered[0], ordered[3], ordered[1]]
      : i % 3 === 1
        ? [ordered[1], ordered[3], ordered[0], ordered[2]]
        : [ordered[3], ordered[1], ordered[2], ordered[0]]
  return {
    ...baseItem,
    question: `Drag the sentences into a logical paragraph order. ${lens}`,
    options: shuffled,
    correctAnswer: ordered,
    explanationCN: `${baseItem.explanationCN} 正确顺序应从总述开始，再解释原因、连接 PTE 场景，最后给出结论。`,
  }
}

const questions = []

for (let i = 0; i < 250; i += 1) questions.push(createErrorQuestion(i))
for (let i = 0; i < 250; i += 1) questions.push(createBlankQuestion(i))
for (let i = 0; i < 250; i += 1) questions.push(createCombinationQuestion(i))
for (let i = 0; i < 250; i += 1) questions.push(createReorderQuestion(i))

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'questions.json'), JSON.stringify(questions, null, 2), 'utf8')
console.log(`Wrote ${questions.length} questions`)
