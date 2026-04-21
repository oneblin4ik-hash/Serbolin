class AchievementDef {
  final String key;
  final String emoji;
  final String title;
  final String description;
  final int xpReward;
  final bool isLegendary;

  const AchievementDef({
    required this.key,
    required this.emoji,
    required this.title,
    required this.description,
    required this.xpReward,
    this.isLegendary = false,
  });
}

class UnlockedAchievement {
  final String? id;
  final String achievementKey;
  final DateTime unlockedAt;

  const UnlockedAchievement({
    this.id,
    required this.achievementKey,
    required this.unlockedAt,
  });

  factory UnlockedAchievement.fromMap(Map<String, dynamic> map) =>
      UnlockedAchievement(
        id: map['id'] as String?,
        achievementKey: map['achievement_key'] as String,
        unlockedAt: DateTime.parse(map['unlocked_at'] as String),
      );
}

class AchievementCatalog {
  static const List<AchievementDef> all = [
    AchievementDef(
      key: 'first_workout',
      emoji: '🥇',
      title: 'First Workout',
      description: 'Первая тренировка',
      xpReward: 50,
    ),
    AchievementDef(
      key: 'streak_7',
      emoji: '🔥',
      title: '7-Day Streak',
      description: '7 дней подряд',
      xpReward: 100,
    ),
    AchievementDef(
      key: 'streak_30',
      emoji: '🔥',
      title: '30-Day Streak',
      description: '30 дней подряд',
      xpReward: 300,
    ),
    AchievementDef(
      key: 'iron_discipline',
      emoji: '⚔️',
      title: 'Iron Discipline',
      description: '30 тренировок',
      xpReward: 500,
    ),
    AchievementDef(
      key: 'muscle_builder',
      emoji: '💪',
      title: 'Muscle Builder',
      description: 'Бицепс +5 см',
      xpReward: 400,
    ),
    AchievementDef(
      key: 'mass_monster',
      emoji: '🏋',
      title: 'Mass Monster',
      description: 'Вес +10 кг',
      xpReward: 600,
      isLegendary: true,
    ),
    AchievementDef(
      key: 'content_machine',
      emoji: '📈',
      title: 'Content Machine',
      description: '100 публикаций',
      xpReward: 500,
    ),
    AchievementDef(
      key: 'first_million',
      emoji: '💰',
      title: 'First Million',
      description: '1 000 000 дохода',
      xpReward: 1000,
      isLegendary: true,
    ),
    AchievementDef(
      key: 'body_boss',
      emoji: '🐉',
      title: 'Body Boss',
      description: 'Все целевые замеры достигнуты',
      xpReward: 2000,
      isLegendary: true,
    ),
    AchievementDef(
      key: 'perfect_week',
      emoji: '🏆',
      title: 'Perfect Week',
      description: '7 квестов за 7 дней',
      xpReward: 200,
    ),
  ];

  static AchievementDef? byKey(String key) {
    for (final a in all) {
      if (a.key == key) return a;
    }
    return null;
  }
}
