import { useConfigDefaults } from '../components/ConfigProvider/useConfigDefaults';

/** Button's size axis (ButtonOwnProps.size). */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The three-tier Button size resolution shared by Button and CopyButton
 * (whose glyph step must match the chrome it sits in): explicit prop →
 * ConfigProvider `Button` section default → built-in 'md'. The built-in
 * stays last so a missing provider renders exactly what Button rendered
 * before the wiring (byte-identical).
 */
export function useResolvedButtonSize(sizeProp?: ButtonSize): ButtonSize {
  const config = useConfigDefaults('Button');
  return sizeProp ?? config.size ?? 'md';
}
