// Кривая прогрессии: уровень N требует N * 100 XP для завершения.
// Полная сумма XP для достижения уровня N = 100 * (N-1) * N / 2.

export const BASE_XP_PER_LEVEL = 100;

export function xpRequiredForLevel(level) {
  if (level <= 1) return 0;
  return BASE_XP_PER_LEVEL * ((level - 1) * level) / 2;
}

export function getLevelFromXp(totalXp) {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

export function getProgressToNextLevel(totalXp) {
  const level = getLevelFromXp(totalXp);
  const current = totalXp - xpRequiredForLevel(level);
  const needed = xpRequiredForLevel(level + 1) - xpRequiredForLevel(level);
  return {
    level,
    current,
    needed,
    percent: Math.min(100, Math.round((current / needed) * 100)),
  };
}
