const isDev = process.env.NODE_ENV !== 'production';

const ts = () => new Date().toISOString();

function serialize(args) {
  return args
    .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
    .join(' ');
}

function sendToMain(level, args) {
  window.electron?.ipcRenderer?.sendMessage('LOG', {
    ts: ts(),
    level,
    msg: serialize(args),
  });
}

const Logger = {
  debug: (...args) => {
    if (isDev) console.debug(`[${ts()}] [DEBUG]`, ...args);
  },
  info: (...args) => {
    if (isDev) console.info(`[${ts()}] [INFO]`, ...args);
  },
  warn: (...args) => {
    console.warn(`[${ts()}] [WARN]`, ...args);
    sendToMain('WARN', args);
  },
  error: (...args) => {
    console.error(`[${ts()}] [ERROR]`, ...args);
    sendToMain('ERROR', args);
  },
};

export default Logger;
