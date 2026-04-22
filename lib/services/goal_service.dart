import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/goal.dart';

class GoalService extends ChangeNotifier {
  GoalService();

  SupabaseClient get _client => Supabase.instance.client;
  String get _uid => _client.auth.currentUser!.id;

  List<Goal> _goals = const [];
  List<Goal> get goals => _goals;

  final Map<String, List<GoalSubtask>> _subtasks = {};
  List<GoalSubtask> subtasksFor(String goalId) =>
      _subtasks[goalId] ?? const [];

  double progressOf(String goalId) {
    final list = subtasksFor(goalId);
    if (list.isEmpty) return 0.0;
    final done = list.where((s) => s.isCompleted).length;
    return done / list.length;
  }

  bool _loaded = false;
  bool get isLoaded => _loaded;

  Future<void> load() async {
    final rows = await _client
        .from('goals')
        .select()
        .eq('user_id', _uid)
        .order('created_at', ascending: false);
    _goals = (rows as List).map((e) => Goal.fromMap(e)).toList();

    final subRows = await _client
        .from('goal_subtasks')
        .select()
        .eq('user_id', _uid)
        .order('position', ascending: true);
    _subtasks.clear();
    for (final row in subRows as List) {
      final s = GoalSubtask.fromMap(row);
      _subtasks.putIfAbsent(s.goalId, () => []).add(s);
    }

    _loaded = true;
    notifyListeners();
  }

  Future<Goal> createGoal({
    required String title,
    String? description,
    DateTime? dueDate,
  }) async {
    final data = Goal(title: title, description: description, dueDate: dueDate)
        .toMap()
      ..remove('id');
    data['user_id'] = _uid;
    final row =
        await _client.from('goals').insert(data).select().single();
    final goal = Goal.fromMap(row);
    _goals = [goal, ..._goals];
    _subtasks[goal.id!] = [];
    notifyListeners();
    return goal;
  }

  Future<Goal> updateGoal(Goal goal) async {
    final row = await _client
        .from('goals')
        .update(goal.toMap()..remove('id')..remove('user_id'))
        .eq('id', goal.id!)
        .select()
        .single();
    final updated = Goal.fromMap(row);
    _goals = _goals.map((g) => g.id == updated.id ? updated : g).toList();
    notifyListeners();
    return updated;
  }

  Future<void> deleteGoal(String goalId) async {
    await _client.from('goals').delete().eq('id', goalId);
    _goals = _goals.where((g) => g.id != goalId).toList();
    _subtasks.remove(goalId);
    notifyListeners();
  }

  Future<void> toggleGoal(Goal goal, bool completed) async {
    final updated = goal.copyWith(
      isCompleted: completed,
      completedAt: completed ? DateTime.now() : null,
    );
    await updateGoal(updated);
  }

  // ==========================================================================
  // SUBTASKS
  // ==========================================================================

  Future<GoalSubtask> addSubtask({
    required String goalId,
    required String title,
  }) async {
    final existing = subtasksFor(goalId);
    final position = existing.isEmpty
        ? 0
        : existing.map((e) => e.position).reduce((a, b) => a > b ? a : b) + 1;
    final data = GoalSubtask(
      goalId: goalId,
      title: title,
      position: position,
    ).toMap()
      ..remove('id');
    data['user_id'] = _uid;
    final row =
        await _client.from('goal_subtasks').insert(data).select().single();
    final subtask = GoalSubtask.fromMap(row);
    _subtasks.putIfAbsent(goalId, () => []).add(subtask);
    notifyListeners();
    return subtask;
  }

  Future<void> toggleSubtask(GoalSubtask s, bool completed) async {
    final updated = s.copyWith(
      isCompleted: completed,
      completedAt: completed ? DateTime.now() : null,
    );
    await _client
        .from('goal_subtasks')
        .update(updated.toMap()..remove('id')..remove('user_id'))
        .eq('id', s.id!);
    final list = _subtasks[s.goalId] ?? [];
    _subtasks[s.goalId] = list
        .map((x) => x.id == s.id ? updated : x)
        .toList(growable: false);
    notifyListeners();
  }

  Future<void> deleteSubtask(GoalSubtask s) async {
    await _client.from('goal_subtasks').delete().eq('id', s.id!);
    final list = _subtasks[s.goalId] ?? [];
    _subtasks[s.goalId] =
        list.where((x) => x.id != s.id).toList(growable: false);
    notifyListeners();
  }
}
