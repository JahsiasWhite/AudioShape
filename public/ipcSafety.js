/**
 * Resolves a WebContents from either a BrowserWindow or a WebContents (e.g. ipc event.sender).
 */
function resolveWebContents(target) {
  if (!target) return null;
  if (target.webContents) return target.webContents;
  if (typeof target.send === 'function') return target;
  return null;
}

function canSendToRenderer(target) {
  const wc = resolveWebContents(target);
  return !!wc && typeof wc.isDestroyed === 'function' && !wc.isDestroyed();
}

function safeSendToRenderer(target, channel, payload, logger = console) {
  const wc = resolveWebContents(target);
  if (!wc || (typeof wc.isDestroyed === 'function' && wc.isDestroyed())) {
    return false;
  }
  try {
    wc.send(channel, payload);
    return true;
  } catch (error) {
    if (logger && typeof logger.warn === 'function') {
      logger.warn(`[ipc] Failed to send ${channel}: ${error?.message ?? error}`);
    }
    return false;
  }
}

/**
 * Prefer replying on the ipcMain handler event (correct routing to the invoking frame).
 */
function safeReply(ipcEvent, channel, payload, logger = console) {
  try {
    if (!ipcEvent || typeof ipcEvent.reply !== 'function') return false;
    const sender = ipcEvent.sender;
    if (
      sender &&
      typeof sender.isDestroyed === 'function' &&
      sender.isDestroyed()
    ) {
      return false;
    }
    ipcEvent.reply(channel, payload);
    return true;
  } catch (error) {
    if (logger && typeof logger.warn === 'function') {
      logger.warn(`[ipc] Failed to reply ${channel}: ${error?.message ?? error}`);
    }
    return false;
  }
}

function isSongLoadRequestStale(requestId, activeRequestId) {
  return requestId !== activeRequestId;
}

module.exports = {
  resolveWebContents,
  canSendToRenderer,
  safeSendToRenderer,
  safeReply,
  isSongLoadRequestStale,
};
