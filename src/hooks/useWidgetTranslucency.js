import { useApp } from '../context/AppContext';
import { getSpaceOverlayOpacity } from '../utils/overlay';

/** Shared translucent glass styling for floating widgets. */
export function useWidgetTranslucency() {
  const { isFocusDimmed, activeSpace } = useApp();
  const overlayOpacity = getSpaceOverlayOpacity(activeSpace);

  const widgetBgStyle = {
    background: isFocusDimmed
      ? 'rgba(12, 12, 16, 0.45)'
      : `rgba(20, 20, 24, ${Math.max(0.35, 0.88 - overlayOpacity * 0.4)})`,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  };

  const cardBgStyle = {
    background: isFocusDimmed
      ? 'rgba(10, 10, 14, 0.65)'
      : `rgba(16, 16, 20, ${Math.max(0.5, 0.88 - overlayOpacity * 0.35)})`,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  };

  return { widgetBgStyle, cardBgStyle, overlayOpacity };
}
