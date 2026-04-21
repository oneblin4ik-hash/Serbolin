import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/body_stat.dart';
import '../models/boss.dart';
import '../models/client.dart';
import '../models/player_stats.dart';
import '../models/quest.dart';
import '../models/workout.dart';

/// Thin wrapper вокруг Supabase: CRUD для всех таблиц.
/// Все запросы фильтруются по auth.uid() за счёт RLS.
class SupabaseService {
  SupabaseService._();
  static final SupabaseService instance = SupabaseService._();

  SupabaseClient get _client => Supabase.instance.client;
  String? get userId => _client.auth.currentUser?.id;

  // ==========================================================================
  // PLAYER STATS
  // ==========================================================================

  Future<PlayerStats> getOrCreatePlayerStats() async {
    final uid = userId;
    if (uid == null) {
      throw StateError('Not authenticated');
    }
    final row = await _client
        .from('player_stats')
        .select()
        .eq('user_id', uid)
        .maybeSingle();

    if (row != null) {
      return PlayerStats.fromMap(row);
    }

    final inserted = await _client
        .from('player_stats')
        .insert({'user_id': uid})
        .select()
        .single();
    return PlayerStats.fromMap(inserted);
  }

  Future<PlayerStats> updatePlayerStats(PlayerStats stats) async {
    final uid = userId;
    if (uid == null) throw StateError('Not authenticated');
    final data = stats.toMap()..remove('id');
    data['user_id'] = uid;
    final row = await _client
        .from('player_stats')
        .update(data)
        .eq('user_id', uid)
        .select()
        .single();
    return PlayerStats.fromMap(row);
  }

  // ==========================================================================
  // QUESTS
  // ==========================================================================

  Future<List<Quest>> getQuestsForDate(DateTime date) async {
    final uid = userId!;
    final dateStr = date.toIso8601String().substring(0, 10);
    final rows = await _client
        .from('quests')
        .select()
        .eq('user_id', uid)
        .eq('date', dateStr)
        .order('created_at', ascending: true);
    return (rows as List).map((e) => Quest.fromMap(e)).toList();
  }

  Future<Quest> insertQuest(Quest quest) async {
    final uid = userId!;
    final data = quest.toMap()..remove('id');
    data['user_id'] = uid;
    final row = await _client.from('quests').insert(data).select().single();
    return Quest.fromMap(row);
  }

  Future<Quest> updateQuest(Quest quest) async {
    final row = await _client
        .from('quests')
        .update(quest.toMap()..remove('id')..remove('user_id'))
        .eq('id', quest.id!)
        .select()
        .single();
    return Quest.fromMap(row);
  }

  Future<void> deleteQuest(String id) async {
    await _client.from('quests').delete().eq('id', id);
  }

  Future<List<Quest>> getCompletedQuestsSince(DateTime since) async {
    final uid = userId!;
    final rows = await _client
        .from('quests')
        .select()
        .eq('user_id', uid)
        .eq('is_completed', true)
        .gte('date', since.toIso8601String().substring(0, 10))
        .order('date', ascending: false);
    return (rows as List).map((e) => Quest.fromMap(e)).toList();
  }

  // ==========================================================================
  // BOSSES
  // ==========================================================================

  Future<Boss?> getBossForWeek(DateTime weekStart) async {
    final uid = userId!;
    final row = await _client
        .from('bosses')
        .select()
        .eq('user_id', uid)
        .eq('week_start', weekStart.toIso8601String().substring(0, 10))
        .maybeSingle();
    if (row == null) return null;
    return Boss.fromMap(row);
  }

  Future<Boss> insertBoss(Boss boss) async {
    final uid = userId!;
    final data = boss.toMap()..remove('id');
    data['user_id'] = uid;
    final row = await _client.from('bosses').insert(data).select().single();
    return Boss.fromMap(row);
  }

  Future<Boss> updateBoss(Boss boss) async {
    final row = await _client
        .from('bosses')
        .update(boss.toMap()..remove('id')..remove('user_id'))
        .eq('id', boss.id!)
        .select()
        .single();
    return Boss.fromMap(row);
  }

  // ==========================================================================
  // WORKOUTS
  // ==========================================================================

  Future<List<Workout>> getWorkouts({DateTime? from, DateTime? to}) async {
    final uid = userId!;
    var query = _client.from('workouts').select().eq('user_id', uid);
    if (from != null) {
      query = query.gte('date', from.toIso8601String().substring(0, 10));
    }
    if (to != null) {
      query = query.lte('date', to.toIso8601String().substring(0, 10));
    }
    final rows = await query.order('date', ascending: false);
    return (rows as List).map((e) => Workout.fromMap(e)).toList();
  }

  Future<Workout> insertWorkout(Workout workout) async {
    final uid = userId!;
    final data = workout.toMap()..remove('id');
    data['user_id'] = uid;
    final row = await _client.from('workouts').insert(data).select().single();
    return Workout.fromMap(row);
  }

  Future<Workout> updateWorkout(Workout workout) async {
    final row = await _client
        .from('workouts')
        .update(workout.toMap()..remove('id')..remove('user_id'))
        .eq('id', workout.id!)
        .select()
        .single();
    return Workout.fromMap(row);
  }

  Future<void> deleteWorkout(String id) async {
    await _client.from('workouts').delete().eq('id', id);
  }

  // ==========================================================================
  // BODY STATS / GOALS
  // ==========================================================================

  Future<List<BodyStat>> getBodyStats() async {
    final uid = userId!;
    final rows = await _client
        .from('body_stats')
        .select()
        .eq('user_id', uid)
        .order('date', ascending: false);
    return (rows as List).map((e) => BodyStat.fromMap(e)).toList();
  }

  Future<BodyStat?> getLatestBodyStat() async {
    final uid = userId!;
    final row = await _client
        .from('body_stats')
        .select()
        .eq('user_id', uid)
        .order('date', ascending: false)
        .limit(1)
        .maybeSingle();
    if (row == null) return null;
    return BodyStat.fromMap(row);
  }

  Future<BodyStat?> getFirstBodyStat() async {
    final uid = userId!;
    final row = await _client
        .from('body_stats')
        .select()
        .eq('user_id', uid)
        .order('date', ascending: true)
        .limit(1)
        .maybeSingle();
    if (row == null) return null;
    return BodyStat.fromMap(row);
  }

  Future<BodyStat> insertBodyStat(BodyStat stat) async {
    final uid = userId!;
    final data = stat.toMap()..remove('id');
    data['user_id'] = uid;
    final row =
        await _client.from('body_stats').insert(data).select().single();
    return BodyStat.fromMap(row);
  }

  Future<BodyGoals?> getBodyGoals() async {
    final uid = userId!;
    final row = await _client
        .from('body_goals')
        .select()
        .eq('user_id', uid)
        .maybeSingle();
    if (row == null) return null;
    return BodyGoals.fromMap(row);
  }

  Future<BodyGoals> upsertBodyGoals(BodyGoals goals) async {
    final uid = userId!;
    final data = goals.toMap()..remove('id');
    data['user_id'] = uid;
    data['updated_at'] = DateTime.now().toUtc().toIso8601String();
    final row = await _client
        .from('body_goals')
        .upsert(data, onConflict: 'user_id')
        .select()
        .single();
    return BodyGoals.fromMap(row);
  }

  // ==========================================================================
  // ACHIEVEMENTS
  // ==========================================================================

  Future<Set<String>> getUnlockedAchievementKeys() async {
    final uid = userId!;
    final rows = await _client
        .from('achievements')
        .select('achievement_key')
        .eq('user_id', uid);
    return (rows as List)
        .map((e) => e['achievement_key'] as String)
        .toSet();
  }

  Future<bool> unlockAchievement(String key) async {
    final uid = userId!;
    try {
      await _client
          .from('achievements')
          .insert({'user_id': uid, 'achievement_key': key});
      return true;
    } catch (_) {
      return false;
    }
  }

  // ==========================================================================
  // CRM: CLIENTS / LEADS / TASKS / TRANSACTIONS
  // ==========================================================================

  Future<List<Client>> getClients() async {
    final uid = userId!;
    final rows = await _client
        .from('clients')
        .select()
        .eq('user_id', uid)
        .order('created_at', ascending: false);
    return (rows as List).map((e) => Client.fromMap(e)).toList();
  }

  Future<Client> insertClient(Client c) async {
    final uid = userId!;
    final data = c.toMap()..remove('id');
    data['user_id'] = uid;
    final row = await _client.from('clients').insert(data).select().single();
    return Client.fromMap(row);
  }

  Future<Client> updateClient(Client c) async {
    final row = await _client
        .from('clients')
        .update(c.toMap()..remove('id')..remove('user_id'))
        .eq('id', c.id!)
        .select()
        .single();
    return Client.fromMap(row);
  }

  Future<void> deleteClient(String id) async {
    await _client.from('clients').delete().eq('id', id);
  }

  Future<List<Lead>> getLeads() async {
    final uid = userId!;
    final rows = await _client
        .from('leads')
        .select()
        .eq('user_id', uid)
        .order('created_at', ascending: false);
    return (rows as List).map((e) => Lead.fromMap(e)).toList();
  }

  Future<Lead> insertLead(Lead l) async {
    final uid = userId!;
    final data = l.toMap()..remove('id');
    data['user_id'] = uid;
    final row = await _client.from('leads').insert(data).select().single();
    return Lead.fromMap(row);
  }

  Future<Lead> updateLead(Lead l) async {
    final row = await _client
        .from('leads')
        .update(l.toMap()..remove('id')..remove('user_id'))
        .eq('id', l.id!)
        .select()
        .single();
    return Lead.fromMap(row);
  }

  Future<void> deleteLead(String id) async {
    await _client.from('leads').delete().eq('id', id);
  }

  Future<List<TaskItem>> getTasks() async {
    final uid = userId!;
    final rows = await _client
        .from('tasks')
        .select()
        .eq('user_id', uid)
        .order('created_at', ascending: false);
    return (rows as List).map((e) => TaskItem.fromMap(e)).toList();
  }

  Future<TaskItem> insertTask(TaskItem t) async {
    final uid = userId!;
    final data = t.toMap()..remove('id');
    data['user_id'] = uid;
    final row = await _client.from('tasks').insert(data).select().single();
    return TaskItem.fromMap(row);
  }

  Future<TaskItem> updateTask(TaskItem t) async {
    final row = await _client
        .from('tasks')
        .update(t.toMap()..remove('id')..remove('user_id'))
        .eq('id', t.id!)
        .select()
        .single();
    return TaskItem.fromMap(row);
  }

  Future<void> deleteTask(String id) async {
    await _client.from('tasks').delete().eq('id', id);
  }

  Future<List<Transaction>> getTransactions({DateTime? from}) async {
    final uid = userId!;
    var query = _client.from('transactions').select().eq('user_id', uid);
    if (from != null) {
      query = query.gte('date', from.toIso8601String().substring(0, 10));
    }
    final rows = await query.order('date', ascending: false);
    return (rows as List).map((e) => Transaction.fromMap(e)).toList();
  }

  Future<Transaction> insertTransaction(Transaction t) async {
    final uid = userId!;
    final data = t.toMap()..remove('id');
    data['user_id'] = uid;
    final row =
        await _client.from('transactions').insert(data).select().single();
    return Transaction.fromMap(row);
  }

  Future<void> deleteTransaction(String id) async {
    await _client.from('transactions').delete().eq('id', id);
  }

  // ==========================================================================
  // XP LOG
  // ==========================================================================

  Future<void> logXP({
    required int amount,
    required String source,
    String? description,
  }) async {
    final uid = userId!;
    await _client.from('xp_log').insert({
      'user_id': uid,
      'amount': amount,
      'source': source,
      'description': description,
    });
  }

  Future<List<Map<String, dynamic>>> getXPLog({DateTime? from}) async {
    final uid = userId!;
    var query = _client.from('xp_log').select().eq('user_id', uid);
    if (from != null) {
      query = query.gte('created_at', from.toUtc().toIso8601String());
    }
    final rows = await query.order('created_at', ascending: true);
    return (rows as List).cast<Map<String, dynamic>>();
  }

  // ==========================================================================
  // CONTENT STATS
  // ==========================================================================

  Future<List<Map<String, dynamic>>> getContentStats() async {
    final uid = userId!;
    final rows = await _client
        .from('content_stats')
        .select()
        .eq('user_id', uid)
        .order('month', ascending: true);
    return (rows as List).cast<Map<String, dynamic>>();
  }

  Future<void> upsertContentStat({
    required DateTime month,
    required int reels,
    required int posts,
    required int subscribers,
  }) async {
    final uid = userId!;
    final firstOfMonth = DateTime(month.year, month.month, 1);
    await _client.from('content_stats').upsert(
      {
        'user_id': uid,
        'month': firstOfMonth.toIso8601String().substring(0, 10),
        'reels': reels,
        'posts': posts,
        'subscribers': subscribers,
      },
      onConflict: 'user_id,month',
    );
  }
}
