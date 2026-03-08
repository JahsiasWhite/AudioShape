const fs = require('fs');
const path = require('path');

let logPath = null;

function init(dataDirectory) {
  logPath = path.join(dataDirectory, 'app.log');
}

const ts = () => new Date().toISOString();

function serialize(args) {
  return args
    .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
    .join(' ');
}

function write(level, args) {
  const line = `[${ts()}] [${level}] ${serialize(args)}\n`;
  if (logPath) {
    try {
      fs.appendFileSync(logPath, line);
    } catch (_) {}
  }
  if (level === 'ERROR') console.error(line.trimEnd());
  else if (level === 'WARN') console.warn(line.trimEnd());
  else console.log(line.trimEnd());
}

const logger = {
  init,
  debug: (...args) => write('DEBUG', args),
  info: (...args) => write('INFO', args),
  warn: (...args) => write('WARN', args),
  error: (...args) => write('ERROR', args),
};

module.exports = logger;
