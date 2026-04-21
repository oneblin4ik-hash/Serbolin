import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/achievement.dart';
import '../services/achievement_service.dart';
import '../theme/app_theme.dart';
import '../widgets/achievement_badge.dart';

class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ACHIEVEMENTS')),
      body: SafeArea(
        child: Consumer<AchievementService>(
          builder: (context, svc, _) {
            final items = AchievementCatalog.all;
            final unlocked =
                items.where((a) => svc.isUnlocked(a.key)).length;
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'РАЗБЛОКИРОВАНО',
                        style: AppTheme.subtitle.copyWith(letterSpacing: 3),
                      ),
                      Text(
                        '$unlocked / ${items.length}',
                        style: const TextStyle(
                          color: AppColors.gold,
                          fontWeight: FontWeight.w800,
                          fontSize: 22,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(12),
                    gridDelegate:
                        const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 200,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 0.9,
                    ),
                    itemCount: items.length,
                    itemBuilder: (ctx, i) {
                      final def = items[i];
                      return AchievementBadge(
                        def: def,
                        unlocked: svc.isUnlocked(def.key),
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
