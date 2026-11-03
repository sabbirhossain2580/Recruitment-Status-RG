/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function isCurrentlyFullscreen(): boolean {
  const doc = document as any;
  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export async function toggleBrowserFullscreen(): Promise<boolean> {
  const doc = document as any;
  const elem = document.documentElement as any;

  try {
    if (!isCurrentlyFullscreen()) {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      return true;
    } else {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
      return false;
    }
  } catch (err) {
    console.warn('Browser fullscreen error:', err);
    return isCurrentlyFullscreen();
  }
}
