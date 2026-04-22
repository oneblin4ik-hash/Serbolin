/// Долгосрочная цель — с шкалой прогресса и списком подзадач.
class Goal {
  final String? id;
  final String? userId;
  final String title;
  final String? description;
  final DateTime? dueDate;
  final bool isCompleted;
  final DateTime? completedAt;
  final DateTime? createdAt;

  const Goal({
    this.id,
    this.userId,
    required this.title,
    this.description,
    this.dueDate,
    this.isCompleted = false,
    this.completedAt,
    this.createdAt,
  });

  Goal copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? dueDate,
    bool? isCompleted,
    DateTime? completedAt,
  }) =>
      Goal(
        id: id ?? this.id,
        userId: userId,
        title: title ?? this.title,
        description: description ?? this.description,
        dueDate: dueDate ?? this.dueDate,
        isCompleted: isCompleted ?? this.isCompleted,
        completedAt: completedAt ?? this.completedAt,
        createdAt: createdAt,
      );

  factory Goal.fromMap(Map<String, dynamic> map) => Goal(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        title: map['title'] as String,
        description: map['description'] as String?,
        dueDate: map['due_date'] == null
            ? null
            : DateTime.parse(map['due_date'] as String),
        isCompleted: (map['is_completed'] as bool?) ?? false,
        completedAt: map['completed_at'] == null
            ? null
            : DateTime.parse(map['completed_at'] as String),
        createdAt: map['created_at'] == null
            ? null
            : DateTime.parse(map['created_at'] as String),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'title': title,
        'description': description,
        'due_date': dueDate?.toIso8601String().substring(0, 10),
        'is_completed': isCompleted,
        'completed_at': completedAt?.toIso8601String(),
      };
}

class GoalSubtask {
  final String? id;
  final String? userId;
  final String goalId;
  final String title;
  final bool isCompleted;
  final DateTime? completedAt;
  final int position;

  const GoalSubtask({
    this.id,
    this.userId,
    required this.goalId,
    required this.title,
    this.isCompleted = false,
    this.completedAt,
    this.position = 0,
  });

  GoalSubtask copyWith({
    String? id,
    String? title,
    bool? isCompleted,
    DateTime? completedAt,
    int? position,
  }) =>
      GoalSubtask(
        id: id ?? this.id,
        userId: userId,
        goalId: goalId,
        title: title ?? this.title,
        isCompleted: isCompleted ?? this.isCompleted,
        completedAt: completedAt ?? this.completedAt,
        position: position ?? this.position,
      );

  factory GoalSubtask.fromMap(Map<String, dynamic> map) => GoalSubtask(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        goalId: map['goal_id'] as String,
        title: map['title'] as String,
        isCompleted: (map['is_completed'] as bool?) ?? false,
        completedAt: map['completed_at'] == null
            ? null
            : DateTime.parse(map['completed_at'] as String),
        position: (map['position'] as num?)?.toInt() ?? 0,
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'goal_id': goalId,
        'title': title,
        'is_completed': isCompleted,
        'completed_at': completedAt?.toIso8601String(),
        'position': position,
      };
}
