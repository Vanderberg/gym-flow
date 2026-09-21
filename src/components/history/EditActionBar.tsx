import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { spacing } from '@/constants/theme';

interface Props {
  editing: boolean;
  canSave: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditActionBar({ editing, canSave, onEdit, onSave, onCancel }: Props) {
  if (!editing) return <Button label="EDITAR" variant="ghost" onPress={onEdit} />;
  return (
    <View style={styles.bar}>
      <Button label="Salvar" onPress={onSave} disabled={!canSave} />
      <Button label="Cancelar" variant="ghost" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({ bar: { gap: spacing.sm } });
