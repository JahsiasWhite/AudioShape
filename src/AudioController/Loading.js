// Array of effects currently being loaded
export var loading = [];

// TODO: Why would I ever call this function without effects? Doesn't it do nothing for now?
/**
 * Initiates the loading of the current song
 * @param {[]} effects - An array of of current effects to be loaded
 */
export const startLoading = (effects) => {
  let loadingQueue = [];
  if (effects !== undefined) {
    loadingQueue = Object.keys(effects);
  }
  console.log('Starting loading', effects, loadingQueue);
  loading = loadingQueue;
};

export const finishLoading = (effect) => {
  let loadingQueue = [];
  if (effect !== undefined) {
    loadingQueue = loadingQueue.filter((curEffect) => curEffect !== effect);
  }
  console.log('Finished loading', loading, effect, loadingQueue);
  loading = loadingQueue;
};
