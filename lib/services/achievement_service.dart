import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/achievement.dart';
import 'supabase_service.dart';
import 'xp_service.dart';

class AchievementService extends ChangeNotifier {
  AchievementService({
    required this.xpService,
    SupabaseService? supabase,
  }) : _supabase = supabase ?? SupabaseService.instance;

  final XPService xpService;
  final SupabaseService _supabase;

  Set<String> _unlocked = <String>{};
  Set<String> get unlocked => _unlocked;

  final StreamController<AchievementDef> _unlockController =
      StreamController<AchievementDef>.broadcast();
  Stream<AchievementDef> get unlockStream => _unlockController.stream;

  Future<void> load() async {
    _unlocked = await _supabase.getUnlockedAchievementKeys();
    notifyListeners();
  }

  bool isUnlocked(String key) => _unlocked.contains(key);

  Future<void> _tryUnlock(String key) async {
    if (_unlocked.contains(key)) return;
    final def = AchievementCatalog.byKey(key);
    if (def == null) return;

    final ok = await _supabase.unlockAchievement(key);
    if (!ok) return;

    _unlocked = {..._unlocked, key};
    notifyListeners();
    await xpService.addXP(
      amount: def.xpReward,
      source: 'achievement',
      description: def.title,
    );
    _unlockController.add(def);
  }

  Future<void> checkAfterWorkout({required int totalWorkouts}) async {
    if (totalWorkouts >= 1) await _tryUnlock('first_workout');
    if (totalWorkouts >= 30) await _tryUnlock('iron_discipline');
  }

  Future<void> checkAfterStreak(int streakDays) async {
    if (streakDays >= 7) await _tryUnlock('streak_7');
    if (streakDays >= 30) await _tryUnlock('streak_30');
  }

  Future<void> checkBicepGain(double gainCm) async {
    if (gainCm >= 5) await _tryUnlock('muscle_builder');
  }

  Future<void> checkWeightGain(double gainKg) async {
    if (gainKg >= 10) await _tryUnlock('mass_monster');
  }

  Future<void> checkBodyBoss(bool allGoalsReached) async {
    if (allGoalsReached) await _tryUnlock('body_boss');
  }

  Future<void> checkContent(int totalPublications) async {
    if (totalPublications >= 100) await _tryUnlock('content_machine');
  }

  Future<void> checkIncome(double totalIncome) async {
    if (totalIncome >= 1000000) await _tryUnlock('first_million');
  }

  Future<void> checkPerfectWeek({required int completedLast7}) async {
    if (completedLast7 >= 7) await _tryUnlock('perfect_week');
  }

  @override
  void dispose() {
    _unlockController.close();
    super.dispose();
  }
}
