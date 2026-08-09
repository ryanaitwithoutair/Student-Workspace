import { MIN_BG_VISIBILITY, DEFAULT_OVERLAY_OPACITY } from './constants';

/**
 * Resolve the user-facing dimming slider value for a space.
 */
export function getSpaceOverlayOpacity(space) {
  return space?.overlayOpacity !== undefined ? space.overlayOpacity : DEFAULT_OVERLAY_OPACITY;
}

/**
 * Compute overlay alpha from user dimming (0–1).
 * Background stays at least MIN_BG_VISIBILITY visible until slider exceeds that threshold.
 */
export function computeOverlayAlpha(userDimming) {
  const dimming = userDimming ?? DEFAULT_OVERLAY_OPACITY;

  if (dimming <= MIN_BG_VISIBILITY) {
    return 1 - MIN_BG_VISIBILITY;
  }

  const excess = dimming - MIN_BG_VISIBILITY;
  const maxExcess = 1 - MIN_BG_VISIBILITY;
  const bgVisibility = MIN_BG_VISIBILITY * (1 - excess / maxExcess);
  return 1 - bgVisibility;
}

/** Build the gradient overlay applied over background images. */
export function getOverlayGradient(userDimming) {
  const alpha = computeOverlayAlpha(userDimming);
  const alphaBottom = Math.min(1, alpha + 0.08);
  return `linear-gradient(to bottom, rgba(9, 9, 11, ${alpha}), rgba(9, 9, 11, ${alphaBottom}))`;
}

/** Human-readable label for the dimming slider value. */
export function getDimmingLabel(userDimming) {
  const dimming = userDimming ?? DEFAULT_OVERLAY_OPACITY;
  if (dimming <= MIN_BG_VISIBILITY) {
    return 'Base';
  }
  const extra = Math.round(((dimming - MIN_BG_VISIBILITY) / (1 - MIN_BG_VISIBILITY)) * 100);
  return `Base + ${extra}%`;
}
