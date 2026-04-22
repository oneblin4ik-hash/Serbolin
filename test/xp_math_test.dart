import 'package:flutter_test/flutter_test.dart';
import 'package:serbolin/models/player_stats.dart';

void main() {
  group('PlayerStats', () {
    test('rank mapping matches spec', () {
      expect(const PlayerStats(level: 1).rank, 'Новичок');
      expect(const PlayerStats(level: 2).rank, 'Новичок');
      expect(const PlayerStats(level: 3).rank, 'Воин');
      expect(const PlayerStats(level: 4).rank, 'Воин');
      expect(const PlayerStats(level: 5).rank, 'Чемпион');
      expect(const PlayerStats(level: 6).rank, 'Чемпион');
      expect(const PlayerStats(level: 7).rank, 'Архитектор дисциплины');
      expect(const PlayerStats(level: 8).rank, 'Архитектор дисциплины');
      expect(const PlayerStats(level: 9).rank, 'Легенда');
      expect(const PlayerStats(level: 10).rank, 'Легенда');
    });

    test('xpToNextLevel matches xpForLevel table', () {
      expect(const PlayerStats(level: 1).xpToNextLevel, 500);
      expect(const PlayerStats(level: 2).xpToNextLevel, 1000);
      expect(const PlayerStats(level: 3).xpToNextLevel, 2000);
      expect(const PlayerStats(level: 4).xpToNextLevel, 3000);
      expect(const PlayerStats(level: 5).xpToNextLevel, 4500);
      expect(const PlayerStats(level: 6).xpToNextLevel, 6000);
      expect(const PlayerStats(level: 7).xpToNextLevel, 8000);
      expect(const PlayerStats(level: 8).xpToNextLevel, 10000);
      expect(const PlayerStats(level: 9).xpToNextLevel, 15000);
    });

    test('xpProgress clamps to 0..1', () {
      expect(const PlayerStats(level: 1, xpCurrent: 0).xpProgress, 0.0);
      expect(const PlayerStats(level: 1, xpCurrent: 250).xpProgress, 0.5);
      expect(const PlayerStats(level: 1, xpCurrent: 500).xpProgress, 1.0);
      expect(const PlayerStats(level: 1, xpCurrent: 999).xpProgress, 1.0);
    });

    test('avatar stage maps correctly', () {
      expect(const PlayerStats(level: 1).avatarStage, 1);
      expect(const PlayerStats(level: 3).avatarStage, 1);
      expect(const PlayerStats(level: 4).avatarStage, 2);
      expect(const PlayerStats(level: 6).avatarStage, 2);
      expect(const PlayerStats(level: 7).avatarStage, 3);
      expect(const PlayerStats(level: 10).avatarStage, 3);
    });
  });
}
