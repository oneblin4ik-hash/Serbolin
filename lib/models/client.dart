class Client {
  final String? id;
  final String? userId;
  final String name;
  final String? contact;
  final String status;
  final String? notes;
  final DateTime? createdAt;

  const Client({
    this.id,
    this.userId,
    required this.name,
    this.contact,
    this.status = 'active',
    this.notes,
    this.createdAt,
  });

  factory Client.fromMap(Map<String, dynamic> map) => Client(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        name: map['name'] as String,
        contact: map['contact'] as String?,
        status: map['status'] as String? ?? 'active',
        notes: map['notes'] as String?,
        createdAt: map['created_at'] == null
            ? null
            : DateTime.parse(map['created_at'] as String),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'name': name,
        'contact': contact,
        'status': status,
        'notes': notes,
      };
}

class Lead {
  final String? id;
  final String? userId;
  final String name;
  final String? source;
  final String status; // cold, warm, hot
  final String? notes;
  final DateTime? createdAt;

  const Lead({
    this.id,
    this.userId,
    required this.name,
    this.source,
    this.status = 'cold',
    this.notes,
    this.createdAt,
  });

  factory Lead.fromMap(Map<String, dynamic> map) => Lead(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        name: map['name'] as String,
        source: map['source'] as String?,
        status: map['status'] as String? ?? 'cold',
        notes: map['notes'] as String?,
        createdAt: map['created_at'] == null
            ? null
            : DateTime.parse(map['created_at'] as String),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'name': name,
        'source': source,
        'status': status,
        'notes': notes,
      };
}

class TaskItem {
  final String? id;
  final String? userId;
  final String title;
  final int xpReward;
  final bool isCompleted;
  final DateTime? completedAt;
  final DateTime? createdAt;

  const TaskItem({
    this.id,
    this.userId,
    required this.title,
    this.xpReward = 0,
    this.isCompleted = false,
    this.completedAt,
    this.createdAt,
  });

  factory TaskItem.fromMap(Map<String, dynamic> map) => TaskItem(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        title: map['title'] as String,
        xpReward: (map['xp_reward'] as num?)?.toInt() ?? 0,
        isCompleted: map['is_completed'] as bool? ?? false,
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
        'xp_reward': xpReward,
        'is_completed': isCompleted,
        'completed_at': completedAt?.toUtc().toIso8601String(),
      };
}

class Transaction {
  final String? id;
  final String? userId;
  final String type; // income, expense
  final double amount;
  final String? category;
  final String? note;
  final DateTime date;
  final DateTime? createdAt;

  const Transaction({
    this.id,
    this.userId,
    required this.type,
    required this.amount,
    this.category,
    this.note,
    required this.date,
    this.createdAt,
  });

  factory Transaction.fromMap(Map<String, dynamic> map) => Transaction(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        type: map['type'] as String,
        amount: (map['amount'] as num).toDouble(),
        category: map['category'] as String?,
        note: map['note'] as String?,
        date: DateTime.parse(map['date'] as String),
        createdAt: map['created_at'] == null
            ? null
            : DateTime.parse(map['created_at'] as String),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'type': type,
        'amount': amount,
        'category': category,
        'note': note,
        'date': date.toIso8601String().substring(0, 10),
      };
}
