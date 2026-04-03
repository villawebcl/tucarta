/**
 * Logger estructurado mínimo.
 * En producción emite JSON; en desarrollo emite texto legible.
 * Nunca usar console.log directo en código de producción.
 */

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  msg: string
  [key: string]: unknown
}

function log(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = { level, msg, ...meta, ts: new Date().toISOString() }
  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(JSON.stringify(entry) + '\n')
  } else {
    const prefix = { info: '›', warn: '⚠', error: '✖' }[level]
    const extras = meta ? ' ' + JSON.stringify(meta) : ''
    console[level === 'info' ? 'log' : level](`${prefix} [${level.toUpperCase()}] ${msg}${extras}`)
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
}
