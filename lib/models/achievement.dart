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
      title: 'Первая тренировка',
      description: 'Залогируй 1 тренировку',
      xpReward: 50,
    ),
    AchievementDef(
      key: 'streak_7',
      emoji: '🔥',
      title: '7 дней подряд',
      description: 'Streak 7 дней без пропусков',
      xpReward: 100,
    ),
    AchievementDef(
      key: 'streak_30',
      emoji: '🔥',
      title: '30 дней подряд',
      description: 'Streak 30 дней без пропусков',
      xpReward: 300,
    ),
    AchievementDef(
      key: 'iron_discipline',
      emoji: '⚔️',
      title: 'Железная дисциплина',
      description: '30 тренировок',
      xpReward: 500,
    ),
    AchievementDef(
      key: 'muscle_builder',
      emoji: '💪',
      title: 'Строитель мышц',
      description: 'Бицепс +5 см от стартового',
      xpReward: 400,
    ),
    AchievementDef(
      key: 'mass_monster',
      emoji: '🏋',
      title: 'Масс-монстр',
      description: 'Вес +10 кг от стартового',
      xpReward: 600,
      isLegendary: true,
    ),
    AchievementDef(
      key: 'content_machine',
      emoji: '📈',
      title: 'Контент-машина',
      description: '100 публикаций суммарно',
      xpReward: 500,
    ),
    AchievementDef(
      key: 'first_million',
      emoji: '💰',
      title: 'Первый миллион',
      description: '1 000 000 ₽ дохода',
      xpReward: 1000,
      isLegendary: true,
    ),
    AchievementDef(
      key: 'body_boss',
      emoji: '🐉',
      title: 'Босс тела',
      description: 'Все целевые замеры достигнуты',
      xpReward: 2000,
      isLegendary: true,
    ),
    AchievementDef(
      key: 'perfect_week',
      emoji: '🏆',
      title: 'Идеальная неделя',
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
