import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';

import '../models/player_stats.dart';
import 'supabase_service.dart';

/// Результат начисления XP: сколько реально зачислено с учётом бонусов,
/// произошёл ли level up, какие достижения разблокированы.
class XPGainResult {
  final int baseAmount;
  final int bonusAmount;
  final int totalAmount;
  final bool leveledUp;
  final int? newLevel;
  final bool randomBonus;
  final double streakMultiplier;

  const XPGainResult({
    required this.baseAmount,
    required this.bonusAmount,
    required this.totalAmount,
    required this.leveledUp,
    required this.newLevel,
    required this.randomBonus,
    required this.streakMultiplier,
  });
}

/// Central XP engine. Всё, что даёт XP, проходит через [addXP].
class XPService extends ChangeNotifier {
  XPService({SupabaseService? supabase})
      : _supabase = supabase ?? SupabaseService.instance;

  final SupabaseService _supabase;
  final Random _random = Random();

  PlayerStats _stats = const PlayerStats();
  PlayerStats get stats => _stats;

  bool _isLoaded = false;
  bool get isLoaded => _isLoaded;

  final StreamController<XPGainResult> _gainController =
      StreamController<XPGainResult>.broadcast();
  Stream<XPGainResult> get gainStream => _gainController.stream;

  final StreamController<int> _levelUpController =
      StreamController<int>.broadcast();
  Stream<int> get levelUpStream => _levelUpController.stream;

  Future<void> load() async {
    _stats = await _supabase.getOrCreatePlayerStats();
    _isLoaded = true;
    notifyListeners();
  }

  Future<void> refresh() async {
    _stats = await _supabase.getOrCreatePlayerStats();
    notifyListeners();
  }

  /// Множитель по streak: 3d → 1.10, 7d → 1.20, 14d → 1.40, 30d → 1.80.
  double streakMultiplier() {
    final d = _stats.streakDays;
    if (d >= 30) return 1.80;
    if (d >= 14) return 1.40;
    if (d >= 7) return 1.20;
    if (d >= 3) return 1.10;
    return 1.0;
  }

  /// Начислить [amount] XP. Применяет streak-бонус и даёт 10% шанс
  /// случайного +100 XP бонуса. Обновляет streak.
  Future<XPGainResult> addXP({
    required int amount,
    required String source,
    String? description,
  }) async {
    if (!_isLoaded) await load();

    final today = DateTime.now();
    final dateOnly = DateTime(today.year, today.month, today.day);

    // streak update
    var streak = _stats.streakDays;
    final last = _stats.lastActivityDate;
    if (last == null) {
      streak = 1;
    } else {
      final lastDay = DateTime(last.year, last.month, last.day);
      final diff = dateOnly.difference(lastDay).inDays;
      if (diff == 0) {
        // same day — keep streak
        if (streak < 1) streak = 1;
      } else if (diff == 1) {
        streak = streak + 1;
      } else if (diff > 1) {
        streak = 1;
      }
    }

    final multiplier = _multiplierFor(streak);
    final boosted = (amount * multiplier).round();

    final randomBonus = _random.nextDouble() < 0.10;
    final bonus = randomBonus ? 100 : 0;
    final total = boosted + bonus;

    var newCurrent = _stats.xpCurrent + total;
    var newLevel = _stats.level;
    var leveledUp = false;

    while (newLevel < PlayerStats.xpForLevel.length &&
        newCurrent >= PlayerStats.xpForLevel[newLevel]) {
      newCurrent -= PlayerStats.xpForLevel[newLevel];
      newLevel += 1;
      leveledUp = true;
    }

    final updated = _stats.copyWith(
      level: newLevel,
      xpCurrent: newCurrent,
      xpTotal: _stats.xpTotal + total,
      streakDays: streak,
      lastActivityDate: dateOnly,
      discipline: _bump(_stats.discipline, streak != _stats.streakDays ? 1 : 0),
    );

    _stats = await _supabase.updatePlayerStats(updated);
    await _supabase.logXP(
      amount: total,
      source: source,
      description: description,
    );

    final result = XPGainResult(
      baseAmount: amount,
      bonusAmount: total - amount,
      totalAmount: total,
      leveledUp: leveledUp,
      newLevel: leveledUp ? newLevel : null,
      randomBonus: randomBonus,
      streakMultiplier: multiplier,
    );

    _gainController.add(result);
    if (leveledUp) {
      _levelUpController.add(newLevel);
    }
    notifyListeners();
    return result;
  }

  double _multiplierFor(int streak) {
    if (streak >= 30) return 1.80;
    if (streak >= 14) return 1.40;
    if (streak >= 7) return 1.20;
    if (streak >= 3) return 1.10;
    return 1.0;
  }

  int _bump(int current, int by) {
    final next = current + by;
    return next.clamp(1, 100);
  }

  /// Инкремент атрибутов персонажа. Каждое значение клэмпится на 0..100.
  Future<void> bumpAttributes({
    int strength = 0,
    int endurance = 0,
    int discipline = 0,
    int energy = 0,
    int workouts = 0,
  }) async {
    final updated = _stats.copyWith(
      strength: (_stats.strength + strength).clamp(1, 100),
      endurance: (_stats.endurance + endurance).clamp(1, 100),
      discipline: (_stats.discipline + discipline).clamp(1, 100),
      energy: (_stats.energy + energy).clamp(1, 100),
      workoutCount: _stats.workoutCount + workouts,
    );
    _stats = await _supabase.updatePlayerStats(updated);
    notifyListeners();
  }

  /// Устанавливает значение энергии (по последнему recovery при тренировке).
  Future<void> setEnergyFromRecovery(int recovery) async {
    final energy = (recovery * 10).clamp(1, 100);
    final updated = _stats.copyWith(energy: energy);
    _stats = await _supabase.updatePlayerStats(updated);
    notifyListeners();
  }

  @override
  void dispose() {
    _gainController.close();
    _levelUpController.close();
    super.dispose();
  }
}

/// Константы XP за действия — чтобы в коде не было магических чисел.
class XPReward {
  static const int workout = 50;
  static const int personalRecord = 150;
  static const int reel = 40;
  static const int clientDialogue = 25;
  static const int newClient = 100;
  static const int financeEntry = 15;
  static const int autoQuestEasy = 30;
  static const int autoQuestMedium = 50;
  static const int autoQuestHard = 80;
  static const int weightKg = 100;
  static const int bicepCm = 120;
  static const int chest2Cm = 150;
  static const int thigh2Cm = 150;
}
