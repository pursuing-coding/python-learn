const sessionKey = "python-learn-tab-drafts-v1";
const copyPrefix = "python-learn-draft-copy-v1:";

function prefix(epoch, key = "") {
  const epochPrefix = `${copyPrefix}${encodeURIComponent(epoch)}:`;
  return key ? `${epochPrefix}${key}:` : epochPrefix;
}

export function recoveryKeys(storage, epoch, key) {
  const start = prefix(epoch, key);
  return Object.keys(storage).filter(name => name.startsWith(start));
}

export function isDraftCopy(name, epoch, key) {
  return name.startsWith(prefix(epoch, key));
}

export function readDraftCopies(storage, epoch, key) {
  try {
    return recoveryKeys(storage, epoch, key).flatMap(name => {
      try {
        const entry = JSON.parse(storage.getItem(name));
        return typeof entry?.code === "string" ? [entry] : [];
      } catch {
        return [];
      }
    }).sort((a, b) => b.savedAt - a.savedAt).map(entry => entry.code);
  } catch {
    return [];
  }
}

export function writeDraftCopy(storage, epoch, key, branch, code) {
  storage.setItem(prefix(epoch, key) + branch, JSON.stringify({ code, savedAt: Date.now() }));
}

export function readDraftJournal(storage, epoch, validKeys) {
  try {
    const state = JSON.parse(storage.getItem(sessionKey));
    if (state?.epoch !== epoch) return new Map();
    return new Map(Object.entries(state.entries).filter(([key, entry]) => validKeys.has(key) &&
      (typeof entry?.value === "string" || entry?.value === null) &&
      (typeof entry.base === "string" || entry.base === null) && typeof entry.branch === "string"));
  } catch {
    return new Map();
  }
}

export function writeDraftJournal(storage, epoch, entries) {
  try {
    if (entries.size) storage.setItem(sessionKey, JSON.stringify({ epoch, entries: Object.fromEntries(entries) }));
    else storage.removeItem(sessionKey);
    return true;
  } catch {
    return false;
  }
}
