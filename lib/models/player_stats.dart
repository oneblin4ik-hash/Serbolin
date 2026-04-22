class PlayerStats {
  final String? id;
  final String? userId;
  final int level;
  final int xpCurrent;
  final int xpTotal;
  final int streakDays;
  final DateTime? lastActivityDate;
  final int strength;
  final int endurance;
  final int discipline;
  final int energy;
  final int workoutCount;
  final DateTime? updatedAt;

  const PlayerStats({
    this.id,
    this.userId,
    this.level = 1,
    this.xpCurrent = 0,
    this.xpTotal = 0,
    this.streakDays = 0,
    this.lastActivityDate,
    this.strength = 1,
    this.endurance = 1,
    this.discipline = 1,
    this.energy = 1,
    this.workoutCount = 0,
    this.updatedAt,
  });

  static const List<int> xpForLevel = [
    0,     // Level 1 start
    500,   // 1 -> 2
    1000,  // 2 -> 3
    2000,  // 3 -> 4
    3000,  // 4 -> 5
    4500,  // 5 -> 6
    6000,  // 6 -> 7
    8000,  // 7 -> 8
    10000, // 8 -> 9
    15000, // 9 -> 10
  ];

  int get xpToNextLevel {
    if (level >= xpForLevel.length) return 999999;
    return xpForLevel[level];
  }

  double get xpProgress {
    final toNext = xpToNextLevel;
    if (toNext <= 0) return 1.0;
    return (xpCurrent / toNext).clamp(0.0, 1.0);
  }

  String get rank {
    if (level <= 2) return 'Новичок';
    if (level <= 4) return 'Воин';
    if (level <= 6) return 'Чемпион';
    if (level <= 8) return 'Архитектор дисциплины';
    return 'Легенда';
  }

  String get avatarAsset {
    if (level <= 3) return 'assets/avatar/level_1.png';
    if (level <= 6) return 'assets/avatar/level_2.png';
    return 'assets/avatar/level_3.png';
  }

  int get avatarStage {
    if (level <= 3) return 1;
    if (level <= 6) return 2;
    return 3;
  }

  PlayerStats copyWith({
    String? id,
    String? userId,
    int? level,
    int? xpCurrent,
    int? xpTotal,
    int? streakDays,
    DateTime? lastActivityDate,
    int? strength,
    int? endurance,
    int? discipline,
    int? energy,
    int? workoutCount,
    DateTime? updatedAt,
  }) {
    return PlayerStats(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      level: level ?? this.level,
      xpCurrent: xpCurrent ?? this.xpCurrent,
      xpTotal: xpTotal ?? this.xpTotal,
      streakDays: streakDays ?? this.streakDays,
      lastActivityDate: lastActivityDate ?? this.lastActivityDate,
      strength: strength ?? this.strength,
      endurance: endurance ?? this.endurance,
      discipline: discipline ?? this.discipline,
      energy: energy ?? this.energy,
      workoutCount: workoutCount ?? this.workoutCount,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory PlayerStats.fromMap(Map<String, dynamic> map) => PlayerStats(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        level: (map['level'] as num?)?.toInt() ?? 1,
        xpCurrent: (map['xp_current'] as num?)?.toInt() ?? 0,
        xpTotal: (map['xp_total'] as num?)?.toInt() ?? 0,
        streakDays: (map['streak_days'] as num?)?.toInt() ?? 0,
        lastActivityDate: map['last_activity_date'] == null
            ? null
            : DateTime.parse(map['last_activity_date'] as String),
        strength: (map['strength'] as num?)?.toInt() ?? 1,
        endurance: (map['endurance'] as num?)?.toInt() ?? 1,
        discipline: (map['discipline'] as num?)?.toInt() ?? 1,
        energy: (map['energy'] as num?)?.toInt() ?? 1,
        workoutCount: (map['workout_count'] as num?)?.toInt() ?? 0,
        updatedAt: map['updated_at'] == null
            ? null
            : DateTime.parse(map['updated_at'] as String),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'level': level,
        'xp_current': xpCurrent,
        'xp_total': xpTotal,
        'streak_days': streakDays,
        'last_activity_date':
            lastActivityDate?.toIso8601String().substring(0, 10),
        'strength': strength,
        'endurance': endurance,
        'discipline': discipline,
        'energy': energy,
        'workout_count': workoutCount,
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      };
}
