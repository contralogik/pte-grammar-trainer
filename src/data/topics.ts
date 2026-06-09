export const GRAMMAR_TOPICS = [
  'Tenses',
  'Subject Verb Agreement',
  'Articles',
  'Nouns and Plurals',
  'Pronouns',
  'Prepositions',
  'Adjectives and Adverbs',
  'Comparatives',
  'Infinitives and Gerunds',
  'Relative Clauses',
  'Noun Clauses',
  'Adverbial Clauses',
  'Connectors',
  'Parallel Structure',
  'Punctuation',
  'Word Forms',
  'Collocations',
] as const

export const QUESTION_TYPES = [
  'Error Correction',
  'Fill in the Blanks',
  'Sentence Combination',
  'Reorder Paragraph',
] as const

export const TOPIC_LABELS: Record<string, string> = {
  Tenses: '时态',
  'Subject Verb Agreement': '主谓一致',
  Articles: '冠词',
  'Nouns and Plurals': '名词与复数',
  Pronouns: '代词',
  Prepositions: '介词',
  'Adjectives and Adverbs': '形容词与副词',
  Comparatives: '比较级',
  'Infinitives and Gerunds': '不定式与动名词',
  'Relative Clauses': '定语从句',
  'Noun Clauses': '名词性从句',
  'Adverbial Clauses': '状语从句',
  Connectors: '连接词',
  'Parallel Structure': '平行结构',
  Punctuation: '标点',
  'Word Forms': '词形变化',
  Collocations: '固定搭配',
}

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  'Error Correction': '错误纠正',
  'Fill in the Blanks': '填空题',
  'Sentence Combination': '句子合并',
  'Reorder Paragraph': '段落排序',
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  Easy: '简单',
  Medium: '中等',
  Hard: '困难',
}

export const SUB_TOPIC_LABELS: Record<string, string> = {
  'present perfect': '现在完成时',
  'past perfect': '过去完成时',
  'past simple': '一般过去时',
  'future forms': '将来表达',
  'singular subjects': '单数主语',
  'compound subjects': '复合主语',
  'distance from subject': '主谓隔离',
  'there be': 'there be 句型',
  'a/an': 'a/an 用法',
  the: 'the 用法',
  'zero article': '零冠词',
  'countable nouns': '可数名词',
  'irregular plurals': '不规则复数',
  'uncountable nouns': '不可数名词',
  reference: '指代关系',
  case: '代词格',
  possessives: '所有格',
  time: '时间介词',
  place: '地点介词',
  'academic phrases': '学术短语',
  'modifier position': '修饰语位置',
  'adverb form': '副词形式',
  intensifiers: '程度副词',
  'more/less': 'more/less 比较',
  'than clauses': 'than 比较结构',
  superlatives: '最高级',
  'verb patterns': '动词搭配模式',
  purpose: '目的表达',
  'after prepositions': '介词后动名词',
  'defining clauses': '限定性定语从句',
  'non-defining clauses': '非限定性定语从句',
  'relative pronouns': '关系代词',
  'that clauses': 'that 从句',
  'embedded questions': '嵌入式疑问句',
  'whether/if': 'whether/if 从句',
  'time clauses': '时间状语从句',
  condition: '条件状语从句',
  contrast: '转折/让步',
  'cause and effect': '因果关系',
  addition: '递进补充',
  lists: '列表并列',
  'paired conjunctions': '成对连词',
  comparison: '比较并列',
  commas: '逗号',
  semicolons: '分号',
  apostrophes: '撇号',
  'noun forms': '名词形式',
  'adjective forms': '形容词形式',
  'verb forms': '动词形式',
  'academic verbs': '学术动词',
  'preposition pairs': '介词搭配',
  'noun phrases': '名词短语',
}

export function topicLabel(value: string) {
  return TOPIC_LABELS[value] ?? value
}

export function questionTypeLabel(value: string) {
  return QUESTION_TYPE_LABELS[value] ?? value
}

export function difficultyLabel(value: string) {
  return DIFFICULTY_LABELS[value] ?? value
}

export function subTopicLabel(value: string) {
  return SUB_TOPIC_LABELS[value] ?? value
}
