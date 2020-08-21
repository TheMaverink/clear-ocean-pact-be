import dotenv from 'dotenv'
import { createLogger, format, transports } from 'winston'

dotenv.config()

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'clear-ocean-pack' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `ifancydata-combined.log`.
    // - Write all logs error (and below) to `ifancydata-error.log`.
    //
    new transports.File({ filename: 'clear-ocean-pack.log', level: 'error' }),
    new transports.File({ filename: 'clear-ocean-pack.log' }),
  ],
})

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  )
}

export default logger
