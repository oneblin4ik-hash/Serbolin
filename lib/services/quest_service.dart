import 'dart:math';

import 'package:flutter/foundation.dart';

import '../models/boss.dart';
import '../models/quest.dart';
import 'supabase_service.dart';

class QuestPoolEntry {
  final String title;
  final int xp;
  const QuestPoolEntry(this.title, this.xp);
}

/// Сервис ежедневных квестов и босса недели.
class QuestService extends ChangeNotifier {
  QuestService({SupabaseService? supabase})
      : _supabase = supabase ?? SupabaseService.instance;

  final SupabaseService _supabase;
  final Random _random = Random();

  List<Quest> _todayQuests = const [];
  List<Quest> get todayQuests => _todayQuests;

  Boss? _currentBoss;
  Boss? get currentBoss => _currentBoss;

  bool _isLoaded = false;
  bool get isLoaded => _isLoaded;

  // ==========================================================================
  // POOLS
  // ==========================================================================

  static const Map<QuestBranch, List<QuestPoolEntry>> pools = {
    QuestBranch.body: [
      QuestPoolEntry('Сделай 100 отжиманий', 40),
      QuestPoolEntry('Выпей 2 литра воды', 20),
      QuestPoolEntry('Потяни мышцы 15 минут', 25),
      QuestPoolEntry('Запиши замеры тела', 30),
    ],
    QuestBranch.brand: [
      QuestPoolEntry('Сними один Reel', 60),
      QuestPoolEntry('Ответь на 10 комментариев', 30),
      QuestPoolEntry('Напиши пост в Telegram', 40),
      QuestPoolEntry('Сделай 5 Stories', 35),
    ],
    QuestBranch.wealth: [
      QuestPoolEntry('Свяжись с 3 лидами', 50),
      QuestPoolEntry('Выставь счёт клиенту', 40),
      QuestPoolEntry('Проведи созвон с клиентом', 60),
      QuestPoolEntry('Запиши финансы за день', 20),
    ],
    QuestBranch.creation: [
      QuestPoolEntry('Запиши 3 идеи для продукта', 30),
      QuestPoolEntry('Напиши 500 слов текста', 50),
      QuestPoolEntry('Изучи новую тему 30 минут', 40),
      QuestPoolEntry('Сделай прототип фичи', 80),
    ],
  };

  static const List<Map<String, Object>> bossPool = [
    {
      'title': 'Контент-машина',
      'description': '5 Reels + 3 поста + 20 Stories',
      'xp': 500,
      'progress': {'reels': 0, 'posts': 0, 'stories': 0},
      'targets': {'reels': 5, 'posts': 3, 'stories': 20},
    },
    {
      'title': 'Железный человек',
      'description': '5 тренировок за неделю',
      'xp': 400,
      'progress': {'workouts': 0},
      'targets': {'workouts': 5},
    },
    {
      'title': 'Продажник недели',
      'description': '10 диалогов с лидами + 1 новый клиент',
      'xp': 600,
      'progress': {'dialogues': 0, 'clients': 0},
      'targets': {'dialogues': 10, 'clients': 1},
    },
    {
      'title': 'Создатель',
      'description': '3000 слов контента + 1 публикация',
      'xp': 450,
      'progress': {'words': 0, 'posts': 0},
      'targets': {'words': 3000, 'posts': 1},
    },
  ];

  // ==========================================================================
  // DAILY QUESTS
  // ==========================================================================

  Future<void> load() async {
    final today = _today();
    _todayQuests = await _supabase.getQuestsForDate(today);
    if (_todayQuests.where((q) => !q.isCustom).isEmpty) {
      await _generateDailyQuests(today);
      _todayQuests = await _supabase.getQuestsForDate(today);
    }

    _currentBoss = await _ensureBossForThisWeek();

    _isLoaded = true;
    notifyListeners();
  }

  Future<void> refresh() async {
    final today = _today();
    _todayQuests = await _supabase.getQuestsForDate(today);
    _currentBoss = await _ensureBossForThisWeek();
    notifyListeners();
  }

  Future<void> _generateDailyQuests(DateTime date) async {
    final branches = QuestBranch.values
        .where((b) => b != QuestBranch.custom)
        .toList();
    branches.shuffle(_random);
    final selected = branches.take(2).toList();
    for (final branch in selected) {
      final pool = pools[branch]!;
      final entry = pool[_random.nextInt(pool.length)];
      await _supabase.insertQuest(Quest(
        date: date,
        title: entry.title,
        xpReward: entry.xp,
        branch: branch,
      ));
    }
  }

  Future<Quest> addCustomQuest({
    required String title,
    required int xp,
  }) async {
    final q = await _supabase.insertQuest(Quest(
      date: _today(),
      title: title,
      xpReward: xp,
      branch: QuestBranch.custom,
      isCustom: true,
    ));
    _todayQuests = [..._todayQuests, q];
    notifyListeners();
    return q;
  }

  Future<Quest> toggleQuest(Quest quest, bool completed) async {
    final updated = quest.copyWith(
      isCompleted: completed,
      completedAt: completed ? DateTime.now() : null,
    );
    final saved = await _supabase.updateQuest(updated);
    _todayQuests = _todayQuests
        .map((q) => q.id == saved.id ? saved : q)
        .toList(growable: false);
    notifyListeners();
    return saved;
  }

  Future<void> deleteQuest(Quest quest) async {
    if (quest.id == null) return;
    await _supabase.deleteQuest(quest.id!);
    _todayQuests =
        _todayQuests.where((q) => q.id != quest.id).toList(growable: false);
    notifyListeners();
  }

  // ==========================================================================
  // BOSS
  // ==========================================================================

  Future<Boss?> _ensureBossForThisWeek() async {
    final start = _weekStart(DateTime.now());
    final existing = await _supabase.getBossForWeek(start);
    if (existing != null) return existing;

    final spec = bossPool[_random.nextInt(bossPool.length)];
    return _supabase.insertBoss(Boss(
      weekStart: start,
      title: spec['title'] as String,
      description: spec['description'] as String,
      xpReward: spec['xp'] as int,
      progress: Map<String, dynamic>.from(spec['progress'] as Map),
    ));
  }

  double bossProgressPercent(Boss boss) {
    final targets = _bossTargets(boss.title);
    if (targets.isEmpty) return 0.0;
    var total = 0.0;
    targets.forEach((key, target) {
      final raw = boss.progress[key];
      final done = raw is num ? raw.toDouble() : 0.0;
      final t = (target as num).toDouble();
      total += (done / t).clamp(0.0, 1.0);
    });
    return total / targets.length;
  }

  Map<String, dynamic> _bossTargets(String title) {
    for (final spec in bossPool) {
      if (spec['title'] == title) {
        return Map<String, dynamic>.from(spec['targets'] as Map);
      }
    }
    return const {};
  }

  Future<Boss?> bumpBossProgress(String key, {int by = 1}) async {
    final boss = _currentBoss;
    if (boss == null || boss.isCompleted) return boss;
    final progress = Map<String, dynamic>.from(boss.progress);
    final current = (progress[key] as num?)?.toInt() ?? 0;
    progress[key] = current + by;

    final targets = _bossTargets(boss.title);
    var allDone = targets.isNotEmpty;
    targets.forEach((k, t) {
      final done = (progress[k] as num?)?.toDouble() ?? 0;
      if (done < (t as num).toDouble()) allDone = false;
    });

    final updated = Boss(
      id: boss.id,
      userId: boss.userId,
      weekStart: boss.weekStart,
      title: boss.title,
      description: boss.description,
      xpReward: boss.xpReward,
      progress: progress,
      isCompleted: allDone,
    );
    _currentBoss = await _supabase.updateBoss(updated);
    notifyListeners();
    return _currentBoss;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  DateTime _today() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day);
  }

  DateTime _weekStart(DateTime d) {
    // Monday-based week
    final weekday = d.weekday; // 1..7, Mon = 1
    final monday = DateTime(d.year, d.month, d.day - (weekday - 1));
    return monday;
  }
}
