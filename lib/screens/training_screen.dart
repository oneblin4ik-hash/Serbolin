import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';

import '../models/workout.dart';
import '../services/achievement_service.dart';
import '../services/supabase_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import 'shell_screen.dart';

class TrainingScreen extends StatefulWidget {
  const TrainingScreen({super.key});

  @override
  State<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends State<TrainingScreen> {
  final SupabaseService _svc = SupabaseService.instance;

  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  Map<DateTime, List<Workout>> _byDay = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final from = DateTime(_focusedDay.year, _focusedDay.month - 1, 1);
    final to = DateTime(_focusedDay.year, _focusedDay.month + 2, 0);
    final workouts = await _svc.getWorkouts(from: from, to: to);
    final map = <DateTime, List<Workout>>{};
    for (final w in workouts) {
      final key = DateTime(w.date.year, w.date.month, w.date.day);
      map.putIfAbsent(key, () => []).add(w);
    }
    if (!mounted) return;
    setState(() {
      _byDay = map;
      _loading = false;
    });
  }

  List<Workout> _eventsFor(DateTime day) {
    return _byDay[DateTime(day.year, day.month, day.day)] ?? const [];
  }

  Future<void> _openForm({Workout? existing}) async {
    final saved = await Navigator.of(context).push<Workout>(
      MaterialPageRoute(
        builder: (_) => _WorkoutFormPage(
          initial: existing,
          initialDate: _selectedDay,
        ),
      ),
    );
    if (saved == null) return;

    // Determine XP including personal record bonus
    int xpEarned = XPReward.workout;
    final existingWorkouts = await _svc.getWorkouts();
    for (final ex in saved.exercises) {
      double best = 0;
      for (final w in existingWorkouts) {
        if (existing != null && w.id == existing.id) continue;
        for (final e in w.exercises) {
          if (e.name.toLowerCase() == ex.name.toLowerCase() && e.weight > best) {
            best = e.weight;
          }
        }
      }
      if (ex.weight > best && best > 0) {
        xpEarned += XPReward.personalRecord;
        break;
      }
    }

    final toSave = Workout(
      id: existing?.id,
      userId: existing?.userId,
      date: saved.date,
      muscleGroups: saved.muscleGroups,
      exercises: saved.exercises,
      notes: saved.notes,
      recovery: saved.recovery,
      xpEarned: xpEarned,
    );
    Workout persisted;
    if (existing == null) {
      persisted = await _svc.insertWorkout(toSave);
    } else {
      persisted = await _svc.updateWorkout(toSave);
    }

    final xp = context.read<XPService>();
    final ach = context.read<AchievementService>();

    if (existing == null) {
      await xp.addXP(
        amount: xpEarned,
        source: 'workout',
        description: 'Тренировка',
      );
      await xp.bumpAttributes(
        endurance: ((xp.stats.workoutCount + 1) % 5 == 0) ? 1 : 0,
        strength: xpEarned > XPReward.workout ? 1 : 0,
        workouts: 1,
      );
      await xp.setEnergyFromRecovery(persisted.recovery);
      await ach.checkAfterWorkout(totalWorkouts: xp.stats.workoutCount);
      await ach.checkAfterStreak(xp.stats.streakDays);
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ТРЕНИРОВКИ')),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.gold,
        foregroundColor: AppColors.background,
        icon: const Icon(Icons.add),
        label: const Text('НОВАЯ'),
        onPressed: () => _openForm(),
      ),
      body: SafeArea(
        child: _loading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.gold))
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: TableCalendar<Workout>(
                        focusedDay: _focusedDay,
                        firstDay: DateTime(2020),
                        lastDay: DateTime(2035),
                        selectedDayPredicate: (d) => isSameDay(d, _selectedDay),
                        onDaySelected: (d, f) {
                          setState(() {
                            _selectedDay = d;
                            _focusedDay = f;
                          });
                        },
                        onPageChanged: (d) {
                          _focusedDay = d;
                          _load();
                        },
                        eventLoader: _eventsFor,
                        startingDayOfWeek: StartingDayOfWeek.monday,
                        calendarStyle: const CalendarStyle(
                          todayDecoration: BoxDecoration(
                            color: AppColors.surfaceElevated,
                            shape: BoxShape.circle,
                          ),
                          selectedDecoration: BoxDecoration(
                            color: AppColors.gold,
                            shape: BoxShape.circle,
                          ),
                          selectedTextStyle:
                              TextStyle(color: AppColors.background),
                          markerDecoration: BoxDecoration(
                            color: AppColors.gold,
                            shape: BoxShape.circle,
                          ),
                          weekendTextStyle: TextStyle(color: AppColors.text),
                          outsideTextStyle: TextStyle(color: AppColors.subtext),
                          defaultTextStyle: TextStyle(color: AppColors.text),
                        ),
                        headerStyle: const HeaderStyle(
                          titleCentered: true,
                          formatButtonVisible: false,
                          leftChevronIcon:
                              Icon(Icons.chevron_left, color: AppColors.gold),
                          rightChevronIcon:
                              Icon(Icons.chevron_right, color: AppColors.gold),
                          titleTextStyle: TextStyle(
                            color: AppColors.gold,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 2,
                          ),
                        ),
                        daysOfWeekStyle: const DaysOfWeekStyle(
                          weekdayStyle: TextStyle(color: AppColors.subtext),
                          weekendStyle: TextStyle(color: AppColors.subtext),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SectionCard(
                    title: 'Тренировки за день',
                    subtitle: _dateLabel(_selectedDay),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        ...(_eventsFor(_selectedDay).map((w) => _workoutTile(w))),
                        if (_eventsFor(_selectedDay).isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: Text(
                              'Нет тренировок. Жми "НОВАЯ".',
                              style: TextStyle(color: AppColors.subtext),
                              textAlign: TextAlign.center,
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
      ),
    );
  }

  Widget _workoutTile(Workout w) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  w.muscleGroups.isEmpty
                      ? 'Тренировка'
                      : w.muscleGroups.join(' · '),
                  style: const TextStyle(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${w.exercises.length} упражнений · Восст: ${w.recovery}/10 · +${w.xpEarned} XP',
                  style: AppTheme.subtitle,
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit, color: AppColors.gold),
            onPressed: () => _openForm(existing: w),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.red),
            onPressed: () async {
              if (w.id == null) return;
              await _svc.deleteWorkout(w.id!);
              await _load();
            },
          ),
        ],
      ),
    );
  }

  String _dateLabel(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
}

// ============================================================================
// WORKOUT FORM PAGE
// ============================================================================

class _WorkoutFormPage extends StatefulWidget {
  final Workout? initial;
  final DateTime initialDate;
  const _WorkoutFormPage({this.initial, required this.initialDate});

  @override
  State<_WorkoutFormPage> createState() => _WorkoutFormPageState();
}

class _WorkoutFormPageState extends State<_WorkoutFormPage> {
  static const List<String> _groups = [
    'Грудь', 'Спина', 'Ноги', 'Плечи', 'Руки', 'Пресс',
  ];

  late DateTime _date;
  late Set<String> _selectedGroups;
  late List<Exercise> _exercises;
  late TextEditingController _notes;
  late double _recovery;

  @override
  void initState() {
    super.initState();
    _date = widget.initial?.date ?? widget.initialDate;
    _selectedGroups = widget.initial?.muscleGroups.toSet() ?? <String>{};
    _exercises = widget.initial?.exercises.toList() ?? <Exercise>[];
    _notes = TextEditingController(text: widget.initial?.notes ?? '');
    _recovery = (widget.initial?.recovery ?? 5).toDouble();
  }

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  void _addExercise() {
    setState(() => _exercises.add(const Exercise(name: '')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.initial == null ? 'НОВАЯ ТРЕНИРОВКА' : 'РЕДАКТИРОВАНИЕ'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ДАТА',
                        style: TextStyle(color: AppColors.gold, letterSpacing: 2)),
                    const SizedBox(height: 6),
                    InkWell(
                      onTap: _pickDate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.divider),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.calendar_today, color: AppColors.gold),
                            const SizedBox(width: 10),
                            Text(
                              '${_date.day.toString().padLeft(2, '0')}.${_date.month.toString().padLeft(2, '0')}.${_date.year}',
                              style: const TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ГРУППЫ МЫШЦ',
                        style: TextStyle(color: AppColors.gold, letterSpacing: 2)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _groups.map((g) {
                        final selected = _selectedGroups.contains(g);
                        return FilterChip(
                          label: Text(g),
                          selected: selected,
                          onSelected: (v) => setState(() {
                            if (v) {
                              _selectedGroups.add(g);
                            } else {
                              _selectedGroups.remove(g);
                            }
                          }),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Expanded(
                          child: Text('УПРАЖНЕНИЯ',
                              style: TextStyle(
                                  color: AppColors.gold, letterSpacing: 2)),
                        ),
                        TextButton.icon(
                          onPressed: _addExercise,
                          icon: const Icon(Icons.add),
                          label: const Text('ДОБАВИТЬ'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    if (_exercises.isEmpty)
                      const Text('Пока нет упражнений',
                          style: TextStyle(color: AppColors.subtext)),
                    ...List.generate(_exercises.length, (i) {
                      final ex = _exercises[i];
                      return _ExerciseRow(
                        key: ValueKey('ex-$i'),
                        initial: ex,
                        onChanged: (next) => _exercises[i] = next,
                        onRemove: () => setState(() => _exercises.removeAt(i)),
                      );
                    }),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ЗАМЕТКИ',
                        style: TextStyle(color: AppColors.gold, letterSpacing: 2)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notes,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Самочувствие, идеи, комментарии…',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ВОССТАНОВЛЕНИЕ: ${_recovery.round()}/10',
                      style: const TextStyle(
                          color: AppColors.gold, letterSpacing: 2),
                    ),
                    Slider(
                      value: _recovery,
                      min: 1,
                      max: 10,
                      divisions: 9,
                      label: _recovery.round().toString(),
                      onChanged: (v) => setState(() => _recovery = v),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _save,
              child: const Text('СОХРАНИТЬ ТРЕНИРОВКУ'),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: AppColors.gold,
            onPrimary: AppColors.background,
            surface: AppColors.surface,
            onSurface: AppColors.text,
          ),
          dialogBackgroundColor: AppColors.surface,
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _date = picked);
  }

  void _save() {
    final cleaned = _exercises
        .where((e) => e.name.trim().isNotEmpty)
        .toList(growable: false);
    Navigator.of(context).pop(Workout(
      date: _date,
      muscleGroups: _selectedGroups.toList(),
      exercises: cleaned,
      notes: _notes.text.trim().isEmpty ? null : _notes.text.trim(),
      recovery: _recovery.round(),
    ));
  }
}

class _ExerciseRow extends StatefulWidget {
  final Exercise initial;
  final ValueChanged<Exercise> onChanged;
  final VoidCallback onRemove;

  const _ExerciseRow({
    super.key,
    required this.initial,
    required this.onChanged,
    required this.onRemove,
  });

  @override
  State<_ExerciseRow> createState() => _ExerciseRowState();
}

class _ExerciseRowState extends State<_ExerciseRow> {
  late final TextEditingController _name;
  late final TextEditingController _weight;
  late final TextEditingController _sets;
  late final TextEditingController _reps;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.initial.name);
    _weight = TextEditingController(
        text: widget.initial.weight == 0 ? '' : widget.initial.weight.toString());
    _sets = TextEditingController(
        text: widget.initial.sets == 0 ? '' : widget.initial.sets.toString());
    _reps = TextEditingController(
        text: widget.initial.reps == 0 ? '' : widget.initial.reps.toString());
  }

  @override
  void dispose() {
    _name.dispose();
    _weight.dispose();
    _sets.dispose();
    _reps.dispose();
    super.dispose();
  }

  void _emit() {
    widget.onChanged(Exercise(
      name: _name.text.trim(),
      weight: double.tryParse(_weight.text.trim()) ?? 0,
      sets: int.tryParse(_sets.text.trim()) ?? 0,
      reps: int.tryParse(_reps.text.trim()) ?? 0,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _name,
                  onChanged: (_) => _emit(),
                  decoration: const InputDecoration(
                    hintText: 'Упражнение',
                    isDense: true,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: AppColors.subtext),
                onPressed: widget.onRemove,
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _weight,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (_) => _emit(),
                  decoration: const InputDecoration(
                    hintText: 'Вес, кг',
                    isDense: true,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _sets,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => _emit(),
                  decoration: const InputDecoration(
                    hintText: 'Подходы',
                    isDense: true,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _reps,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => _emit(),
                  decoration: const InputDecoration(
                    hintText: 'Повторы',
                    isDense: true,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
