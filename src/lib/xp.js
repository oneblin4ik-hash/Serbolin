// Level thresholds (cumulative XP to reach level N) — from Flutter player_stats.dart
export const LEVEL_THRESHOLDS = [0, 0, 500, 1500, 3500, 6500, 11000, 17000, 25000, 35000, 50000];
// index = level, value = total XP needed to be at that level

export function getLevelFromXp(totalXp) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 1; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) { level = i; break; }
  }
  return Math.min(level, 10);
}

export function getProgressToNextLevel(totalXp) {
  const level   = getLevelFromXp(totalXp);
  const current = totalXp - LEVEL_THRESHOLDS[level];
  const needed  = (LEVEL_THRESHOLDS[level + 1] ?? LEVEL_THRESHOLDS[10]) - LEVEL_THRESHOLDS[level];
  return {
    level,
    current,
    needed,
    percent: level >= 10 ? 100 : Math.min(100, Math.round((current / needed) * 100)),
    totalXp,
  };
}

// Streak multipliers — from Flutter xp_service.dart
const STREAK_MULTIPLIERS = [[30, 1.8], [14, 1.4], [7, 1.2], [3, 1.1]];

export function getStreakMultiplier(streakDays) {
  for (const [days, mult] of STREAK_MULTIPLIERS) {
    if (streakDays >= days) return mult;
  }
  return 1.0;
}

export function applyXp(baseAmount, streakDays) {
  const multiplier = getStreakMultiplier(streakDays);
  let amount = Math.round(baseAmount * multiplier);
  const bonus = Math.random() < 0.1 ? 100 : 0;  // 10% chance random +100
  return { amount: amount + bonus, multiplier, bonus };
}

export const RANKS = {
  1:  'Новобранец',
  2:  'Рекрут',
  3:  'Воин',
  4:  'Воин-ветеран',
  5:  'Чемпион',
  6:  'Стратег',
  7:  'Командир',
  8:  'Архитектор',
  9:  'Архитектор дисциплины',
  10: 'Легенда',
};

export function getRank(level) {
  return RANKS[Math.min(level, 10)] || 'Новобранец';
}

// Season tracking
const SEASON_START = new Date('2026-01-20');
export function getSeasonDay() {
  const diff = Date.now() - SEASON_START.getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}
