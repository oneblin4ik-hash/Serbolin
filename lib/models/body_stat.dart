class BodyStat {
  final String? id;
  final String? userId;
  final DateTime date;
  final double? weight;
  final double? chest;
  final double? waist;
  final double? hips;
  final double? thigh;
  final double? bicep;

  const BodyStat({
    this.id,
    this.userId,
    required this.date,
    this.weight,
    this.chest,
    this.waist,
    this.hips,
    this.thigh,
    this.bicep,
  });

  factory BodyStat.fromMap(Map<String, dynamic> map) => BodyStat(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        date: DateTime.parse(map['date'] as String),
        weight: (map['weight'] as num?)?.toDouble(),
        chest: (map['chest'] as num?)?.toDouble(),
        waist: (map['waist'] as num?)?.toDouble(),
        hips: (map['hips'] as num?)?.toDouble(),
        thigh: (map['thigh'] as num?)?.toDouble(),
        bicep: (map['bicep'] as num?)?.toDouble(),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'date': date.toIso8601String().substring(0, 10),
        'weight': weight,
        'chest': chest,
        'waist': waist,
        'hips': hips,
        'thigh': thigh,
        'bicep': bicep,
      };
}

class BodyGoals {
  final String? id;
  final String? userId;
  final double? weight;
  final double? chest;
  final double? waist;
  final double? hips;
  final double? thigh;
  final double? bicep;

  const BodyGoals({
    this.id,
    this.userId,
    this.weight,
    this.chest,
    this.waist,
    this.hips,
    this.thigh,
    this.bicep,
  });

  factory BodyGoals.fromMap(Map<String, dynamic> map) => BodyGoals(
        id: map['id'] as String?,
        userId: map['user_id'] as String?,
        weight: (map['target_weight'] as num?)?.toDouble(),
        chest: (map['target_chest'] as num?)?.toDouble(),
        waist: (map['target_waist'] as num?)?.toDouble(),
        hips: (map['target_hips'] as num?)?.toDouble(),
        thigh: (map['target_thigh'] as num?)?.toDouble(),
        bicep: (map['target_bicep'] as num?)?.toDouble(),
      );

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'target_weight': weight,
        'target_chest': chest,
        'target_waist': waist,
        'target_hips': hips,
        'target_thigh': thigh,
        'target_bicep': bicep,
      };
}
