const {
  canSendToRenderer,
  safeSendToRenderer,
  safeReply,
  isSongLoadRequestStale,
} = require('../../public/ipcSafety');

describe('ipcSafety', () => {
  it('identifies sendable renderer windows', () => {
    const validWindow = {
      webContents: {
        isDestroyed: () => false,
      },
    };
    const destroyedWindow = {
      webContents: {
        isDestroyed: () => true,
      },
    };

    expect(canSendToRenderer(validWindow)).toBe(true);
    expect(canSendToRenderer(destroyedWindow)).toBe(false);
    expect(canSendToRenderer(null)).toBe(false);
  });

  it('accepts a WebContents-like target (ipc event.sender)', () => {
    const sender = {
      isDestroyed: () => false,
      send: jest.fn(),
    };

    expect(canSendToRenderer(sender)).toBe(true);
    safeSendToRenderer(sender, 'PING', { ok: true });
    expect(sender.send).toHaveBeenCalledWith('PING', { ok: true });
  });

  it('fails safely when send throws', () => {
    const logger = { warn: jest.fn() };
    const badWindow = {
      webContents: {
        isDestroyed: () => false,
        send: () => {
          throw new Error('Render frame was disposed before WebFrameMain could be accessed');
        },
      },
    };

    const didSend = safeSendToRenderer(badWindow, 'GRAB_SONGS', { songs: {} }, logger);
    expect(didSend).toBe(false);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('safeReply returns false when sender is destroyed', () => {
    const logger = { warn: jest.fn() };
    const event = {
      reply: jest.fn(),
      sender: { isDestroyed: () => true },
    };
    expect(safeReply(event, 'GRAB_SONGS', {}, logger)).toBe(false);
    expect(event.reply).not.toHaveBeenCalled();
  });

  it('safeReply calls event.reply when sender is alive', () => {
    const event = {
      reply: jest.fn(),
      sender: { isDestroyed: () => false },
    };
    const payload = { songsDelta: { a: 1 }, requestId: 1 };
    expect(safeReply(event, 'GRAB_SONGS', payload)).toBe(true);
    expect(event.reply).toHaveBeenCalledWith('GRAB_SONGS', payload);
  });

  it('fails safely when reply throws', () => {
    const logger = { warn: jest.fn() };
    const event = {
      reply: () => {
        throw new Error('Render frame was disposed before WebFrameMain could be accessed');
      },
      sender: { isDestroyed: () => false },
    };
    expect(safeReply(event, 'GRAB_SONGS', {}, logger)).toBe(false);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('marks stale song-load requests', () => {
    expect(isSongLoadRequestStale(1, 2)).toBe(true);
    expect(isSongLoadRequestStale(2, 2)).toBe(false);
  });
});
