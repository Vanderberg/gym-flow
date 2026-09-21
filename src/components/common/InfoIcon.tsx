import { HelpIcon } from './HelpIcon';

interface Props {
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

export function InfoIcon(props: Props) {
  return <HelpIcon {...props} glyph="ⓘ" accessibilityLabel="Informações do exercício" />;
}
