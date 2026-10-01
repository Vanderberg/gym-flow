import type { ImageSourcePropType } from 'react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { EXERCISE_IMAGES } from '@/assets/exercises';
import { colors, radius } from '@/constants/theme';
import { normalizeName } from '@/utils/normalizeName';

/** Altura fixa da área de imagem/placeholder; ver specs/013-imagens-exercicio/design/tokens.md. */
const EXERCISE_IMAGE_HEIGHT = 160;

/** Glifo do placeholder — mesma família monocromática de ✓ / ○ / ⓘ já usada no app. */
const PLACEHOLDER_GLYPH = '▦';

export function resolveExerciseImage(name: string): ImageSourcePropType | null {
  if (name.trim() === '') return null;
  return EXERCISE_IMAGES[normalizeName(name)] ?? null;
}

interface Props {
  name: string;
}

export function ExerciseImage({ name }: Props) {
  const source = resolveExerciseImage(name);
  if (source) {
    return (
      <Image
        source={source}
        resizeMode="cover"
        style={styles.box}
        accessibilityLabel={`Imagem de ${name}`}
      />
    );
  }
  return (
    <View
      style={[styles.box, styles.placeholder]}
      accessibilityLabel={`Sem imagem disponível para ${name}`}
    >
      <Text style={styles.glyph}>{PLACEHOLDER_GLYPH}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: EXERCISE_IMAGE_HEIGHT,
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 28, color: colors.textMuted },
});
