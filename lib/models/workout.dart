class Exercise {
  final String name;
  final double weight;
  final int sets;
  final int reps;

  const Exercise({
    required this.name,
    this.weight = 0,
    this.sets = 0,
    this.reps = 0,
  });

  factory Exercise.fromMap(Map<String, dynamic> map) => Exercise(
        name: map['name'] as String? ?? '',
        weight: (map['weight'] as num?)?.toDouble() ?? 0,
        sets: (map['sets'] as num?)?.toInt() ?? 0,
        reps: (map['reps'] as num?)?.toInt() ?? 0,
      );

  Map<String, dynamic> toMap() => {
        'name': name,
        'weight': weight,
        'sets': sets,
        'reps': reps,
      };

  Exercise copyWith({String? name, double? weight, int? sets, int? reps}) =>
      Exercise(
        name: name ?? this.name,
        weight: weight ?? this.weight,
        sets: sets ?? this.sets,
        reps: reps ?? this.reps,
      );
}

class Workout {
  final String? id;
  final String? userId;
  final DateTime date;
  final List<String> muscleGroups;
  final List<Exercise> exercises;
  final String? notes;
  final int recovery;
  final int xpEarned;

  const Workout({
    this.id,
    this.userId,
    required this.date,
    this.muscleGroups = const [],
    this.exercises = const [],
    this.notes,
    this.recovery = 5,
    this.xpEarned = 0,
  });

  factory Workout.fromMap(Map<String, dynamic> map) {
    final groups = (map['muscle_groups'] as List?)?.cast<String>() ?? const [];
    final exercisesRaw = map['exercises'];
    final exercises = <Exercise>[];
    if (exercisesRaw is List) {
      for (final item in exercisesRaw) {
        if (item is Map) {
          exercises.add(Exercise.fromMap(Map<String, dynamic>.from(item)));
        }
      }
    }
    return Workout(
      id: map['id'] as String?,
      userId: map['user_id'] as String?,
      date: DateTime.parse(map['date'] as String),
      muscleGroups: groups,
      exercises: exercises,
      notes: map['notes'] as String?,
      recovery: (map['recovery'] as num?)?.toInt() ?? 5,
      xpEarned: (map['xp_earned'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toMap() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'date': date.toIso8601String().substring(0, 10),
        'muscle_groups': muscleGroups,
        'exercises': exercises.map((e) => e.toMap()).toList(),
        'notes': notes,
        'recovery': recovery,
        'xp_earned': xpEarned,
      };
}
