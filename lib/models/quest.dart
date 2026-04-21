enum QuestBranch { body, brand, wealth, creation, custom }

extension QuestBranchExt on QuestBranch {
  String get key {
    switch (this) {
      case QuestBranch.body:
        return 'BODY';
      case QuestBranch.brand:
        return 'BRAND';
      case QuestBranch.wealth:
        return 'WEALTH';
      case QuestBranch.creation:
        return 'CREATION';
      case QuestBranch.custom:
        return 'CUSTOM';
    }
  }

  String get emoji {
    switch (this) {
      case QuestBranch.body:
        return '💪';
      case QuestBranch.brand:
        return '📈';
      case QuestBranch.wealth:
        return '💰';
      case QuestBranch.creation:
        return '🧠';
      case QuestBranch.custom:
        return '✨';
    }
  }

  String get label {
    switch (this) {
      case QuestBranch.body:
        return 'BODY';
      case QuestBranch.brand:
        return 'BRAND';
      case QuestBranch.wealth:
        return 'WEALTH';
      case QuestBranch.creation:
        return 'CREATION';
      case QuestBranch.custom:
        return 'CUSTOM';
    }
  }

  static QuestBranch fromKey(String? key) {
    switch ((key ?? '').toUpperCase()) {
      case 'BODY':
        return QuestBranch.body;
      case 'BRAND':
        return QuestBranch.brand;
      case 'WEALTH':
        return QuestBranch.wealth;
      case 'CREATION':
        return QuestBranch.creation;
      default:
        return QuestBranch.custom;
    }
  }
}

class Quest {
  final String? id;
  final String? userId;
  final DateTime date;
  final String title;
  final int xpReward;
  final QuestBranch branch;
  final bool isCustom;
  final bool isCompleted;
  final DateTime? completedAt;

  const Quest({
    this.id,
    this.userId,
    required this.date,
    required this.title,
    required this.xpReward,
    this.branch = QuestBranch.custom,
    this.isCustom = false,
    this.isCompleted = false,
    this.completedAt,
  });

  Quest copyWith({
    String? id,
    bool? isCompleted,
    DateTime? completedAt,
  }) =>
      Quest(
        id: id ?? this.id,
        userId: userId,
        date: date,
        title: title,
        xpReward: xpReward,
        branch: branch,
        isCustom: isCustom,
        isCompleted: isCompleted ?? this.isCompleted,
        completedAt: completedAt ?? this.completedAt,
      );

  factory Quest.fromMap(Map<String, dynamic> map) => Quest(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        date: DateTime.parse(map['date'] as String),
        title: map['title'] as String,
        xpReward: (map['xp_reward'] as num).toInt(),
        branch: QuestBranchExt.fromKey(map['branch'] as String?),
        isCustom: map['is_custom'] as bool? ?? false,
        isCompleted: map['is_completed'] as bool? ?? false,
        completedAt: map['completed_at'] == null
            ? null
            : DateTime.parse(map['completed_at'] as String),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'date': date.toIso8601String().substring(0, 10),
        'title': title,
        'xp_reward': xpReward,
        'branch': branch.key,
        'is_custom': isCustom,
        'is_completed': isCompleted,
        'completed_at': completedAt?.toUtc().toIso8601String(),
      };
}
