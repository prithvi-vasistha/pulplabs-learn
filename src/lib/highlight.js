/**
 * A small syntax tokeniser.
 *
 * The design system allows no hue (§1), so highlighting is expressed through
 * weight and opacity: keywords and types are --w-1 at 500, strings and numbers
 * --w-2, punctuation --w-3, comments --w-4. That is enough structure to read
 * code quickly and it cannot break the black-and-white rule.
 *
 * Returns tokens rather than markup so the renderer can emit React elements —
 * no dangerouslySetInnerHTML anywhere in the reader.
 */

const JS_KEYWORDS = [
  'abstract','as','async','await','break','case','catch','class','const','continue','debugger','default','delete','do',
  'else','enum','export','extends','finally','for','from','function','get','if','implements','import','in','instanceof',
  'interface','keyof','let','new','of','private','protected','public','readonly','return','satisfies','set','static',
  'super','switch','this','throw','try','type','typeof','var','void','while','yield','true','false','null','undefined',
  'declare','namespace','infer','never','unknown','any','string','number','boolean','symbol','bigint','object',
]

const CS_KEYWORDS = [
  'abstract','as','async','await','base','bool','break','byte','case','catch','char','checked','class','const',
  'continue','decimal','default','delegate','do','double','else','enum','event','explicit','extern','false','finally',
  'fixed','float','for','foreach','from','get','goto','if','implicit','in','init','int','interface','internal','is',
  'lock','long','namespace','new','null','object','operator','out','override','params','private','protected','public',
  'readonly','record','ref','required','return','sealed','select','set','short','sizeof','stackalloc','static','string',
  'struct','switch','this','throw','true','try','typeof','uint','ulong','unchecked','unsafe','ushort','using','var',
  'virtual','void','volatile','when','where','while','with','yield','nameof','global',
]

const SQL_KEYWORDS = [
  'add','all','alter','analyze','and','any','as','asc','begin','between','by','cascade','case','check','coalesce',
  'column','commit','concurrently','constraint','create','cross','default','delete','desc','distinct','do','drop',
  'else','end','except','exists','explain','false','for','foreign','from','full','grant','group','having','if','in',
  'index','inner','insert','intersect','interval','into','is','isolation','join','key','left','level','like','limit',
  'lock','not','null','nulls','offset','on','only','or','order','outer','over','partition','primary','read','references',
  'repeatable','right','rollback','row','select','serializable','set','skip','table','then','to','transaction','true',
  'union','unique','update','using','vacuum','validate','values','when','where','window','with',
]

const SQL_TYPES = [
  'bigint','boolean','bytea','date','decimal','double','float','int','integer','json','jsonb','numeric','real',
  'smallint','text','time','timestamp','timestamptz','uuid','varchar',
]

const PY_KEYWORDS = [
  'and','as','assert','async','await','break','class','continue','def','del','elif','else','except','False','finally',
  'for','from','global','if','import','in','is','lambda','None','nonlocal','not','or','pass','raise','return','True',
  'try','while','with','yield','match','case','self',
]

const SH_KEYWORDS = ['cd','do','done','echo','elif','else','esac','exit','export','fi','for','if','in','set','then','while']

const DOCKER_KEYWORDS = [
  'ADD','ARG','CMD','COPY','ENTRYPOINT','ENV','EXPOSE','FROM','HEALTHCHECK','LABEL','RUN','SHELL','STOPSIGNAL','USER',
  'VOLUME','WORKDIR','AS',
]

const word = (list, flags = '') =>
  new RegExp(`\\b(?:${list.map((w) => w.replace(/[$]/g, '\\$')).join('|')})\\b`, `y${flags}`)

const RULES = {
  js: [
    ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['str', /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y],
    ['num', /\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b/iy],
    ['key', word(JS_KEYWORDS)],
    ['fn', /\b[A-Za-z_$][\w$]*(?=\s*[(<])/y],
    ['typ', /\b[A-Z][A-Za-z0-9_]*\b/y],
    ['pun', /[{}()[\].,;:<>+\-*/%=!&|?~^@]/y],
  ],
  csharp: [
    ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['str', /\$?@?"(?:""|\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y],
    ['num', /\b\d[\d_]*(?:\.\d+)?[fdmul]?\b/iy],
    ['key', word(CS_KEYWORDS)],
    ['fn', /\b[A-Za-z_][\w]*(?=\s*[(<])/y],
    ['typ', /\b[A-Z][A-Za-z0-9_]*\b/y],
    ['pun', /[{}()[\].,;:<>+\-*/%=!&|?~^#]/y],
  ],
  sql: [
    ['com', /--[^\n]*|\/\*[\s\S]*?\*\//y],
    ['str', /'(?:''|[^'])*'/y],
    ['num', /\b\d+(?:\.\d+)?\b/y],
    ['key', word(SQL_KEYWORDS, 'i')],
    ['typ', word(SQL_TYPES, 'i')],
    ['fn', /\b[a-z_][\w]*(?=\s*\()/iy],
    ['pun', /[(),.;*=<>+\-/|$]/y],
  ],
  python: [
    ['com', /#[^\n]*/y],
    ['str', /"""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\\n])*"|f?'(?:\\.|[^'\\\n])*'/y],
    ['num', /\b\d[\d_]*(?:\.\d+)?\b/y],
    ['key', word(PY_KEYWORDS)],
    ['typ', /@?\b[A-Z][A-Za-z0-9_]*\b/y],
    ['fn', /\b[a-z_][\w]*(?=\s*\()/y],
    ['pun', /[{}()[\].,;:<>+\-*/%=!&|?~^@]/y],
  ],
  bash: [
    ['com', /#[^\n]*/y],
    ['str', /"(?:\\.|[^"\\])*"|'[^']*'/y],
    ['num', /\b\d+\b/y],
    ['key', word(SH_KEYWORDS)],
    ['fn', /^[ \t]*[a-z][\w.-]*/my],
    ['pun', /[|&;()<>$=]/y],
  ],
  dockerfile: [
    ['com', /#[^\n]*/y],
    ['key', word(DOCKER_KEYWORDS)],
    ['str', /"(?:\\.|[^"\\])*"|'[^']*'/y],
    ['num', /\b\d+(?:\.\d+)*\b/y],
    ['pun', /[[\],:=$@]/y],
  ],
  txt: [
    ['com', /#[^\n]*/y],
    ['str', /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y],
    ['num', /\b\d+(?:\.\d+)?\b/y],
    ['pun', /[{}()[\].,;:<>]/y],
  ],
}

const ALIASES = {
  js: 'js', jsx: 'js', ts: 'js', tsx: 'js', javascript: 'js', typescript: 'js', json: 'txt',
  csharp: 'csharp', cs: 'csharp', 'c#': 'csharp',
  sql: 'sql', postgres: 'sql', postgresql: 'sql',
  py: 'python', python: 'python',
  sh: 'bash', bash: 'bash', shell: 'bash', console: 'bash',
  dockerfile: 'dockerfile', docker: 'dockerfile',
  yaml: 'txt', yml: 'txt', text: 'txt', txt: 'txt',
}

/** Human label shown in the code block header. */
export const LANGUAGE_LABELS = {
  js: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX', csharp: 'C#', cs: 'C#',
  sql: 'SQL', python: 'Python', py: 'Python', bash: 'Shell', sh: 'Shell',
  dockerfile: 'Dockerfile', json: 'JSON', yaml: 'YAML', yml: 'YAML', text: 'Text', txt: 'Text',
}

export function languageLabel(lang) {
  if (!lang) return 'Code'
  return LANGUAGE_LABELS[lang.toLowerCase()] ?? lang.toUpperCase()
}

/**
 * Split source into typed tokens. Unmatched characters accumulate as plain
 * text, so the concatenation of every token value equals the input exactly.
 */
export function tokenize(code, lang) {
  const rules = RULES[ALIASES[String(lang ?? '').toLowerCase()] ?? 'txt']
  const tokens = []
  let plain = ''
  let i = 0

  while (i < code.length) {
    let hit = null

    for (const [type, re] of rules) {
      re.lastIndex = i
      const match = re.exec(code)
      if (match && match[0].length > 0) {
        hit = { type, value: match[0] }
        break
      }
    }

    if (hit) {
      if (plain) {
        tokens.push({ type: null, value: plain })
        plain = ''
      }
      tokens.push(hit)
      i += hit.value.length
    } else {
      plain += code[i]
      i += 1
    }
  }

  if (plain) tokens.push({ type: null, value: plain })
  return tokens
}
