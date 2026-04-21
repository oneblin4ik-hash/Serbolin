class Boss {
  final String? id;
  final String? userId;
  final DateTime weekStart;
  final String title;
  final String description;
  final int xpReward;
  final Map<String, dynamic> progress;
  final bool isCompleted;

  const Boss({
    this.id,
    this.userId,
    required this.weekStart,
    required this.title,
    required this.description,
    required this.xpReward,
    this.progress = const {},
    this.isCompleted = false,
  });

  factory Boss.fromMap(Map<String, dynamic> map) => Boss(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        weekStart: DateTime.parse(map['week_start'] as String),
        title: map['title'] as String,
        description: map['description'] as String,
        xpReward: (map['xp_reward'] as num).toInt(),
        progress: map['progress'] == null
            ? const {}
            : Map<String, dynamic>.from(map['progress'] as Map),
        isCompleted: map['is_completed'] as bool? ?? false,
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'week_start': weekStart.toIso8601String().substring(0, 10),
        'title': title,
        'description': description,
        'xp_reward': xpReward,
        'progress': progress,
        'is_completed': isCompleted,
      };
}
