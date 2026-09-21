import { useEffect, useMemo, useState } from 'react';
import { GetExerciseInfo } from '@/application/GetExerciseInfo';
import { MuscleInfoSheet } from '@/components/help/MuscleInfoSheet';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import type { MuscleInfo } from '@/domain/help/types';

/** Carrega (somente leitura) e exibe os detalhes do exercício aberto. */
export function ExerciseInfoSheet({
  exerciseId,
  onClose,
}: {
  exerciseId: number;
  onClose: () => void;
}) {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const [info, setInfo] = useState<MuscleInfo | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    new GetExerciseInfo(repos)
      .execute(exerciseId)
      .then((i) => alive && setInfo(i))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [repos, exerciseId]);
  return <MuscleInfoSheet visible info={info} error={error} onClose={onClose} />;
}
