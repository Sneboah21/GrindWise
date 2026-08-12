/**
 * Read values from chrome.storage.local.
 * @param {string|string[]} keys
 * @returns {Promise<any>}
 */
export function getLocalStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (data) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(data);
    });
  });
}

/**
 * Write values to chrome.storage.local.
 * @param {Object} values
 * @returns {Promise<void>}
 */
export function setLocalStorage(values) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(values, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/**
 * Remove values from chrome.storage.local.
 * @param {string|string[]} keys
 * @returns {Promise<void>}
 */
export function removeLocalStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}
