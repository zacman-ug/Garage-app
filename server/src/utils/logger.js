export function info(message, meta = {}) {
  console.log(`[info] ${message}`, meta);
}

export function error(message, meta = {}) {
  console.error(`[error] ${message}`, meta);
}
