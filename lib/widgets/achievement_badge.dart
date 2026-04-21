import 'package:flutter/material.dart';

import '../models/achievement.dart';
import '../theme/app_theme.dart';

class AchievementBadge extends StatelessWidget {
  final AchievementDef def;
  final bool unlocked;

  const AchievementBadge({
    super.key,
    required this.def,
    required this.unlocked,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: unlocked
              ? AppColors.gold
              : AppColors.divider,
          width: unlocked ? 1.5 : 1,
        ),
        boxShadow: unlocked
            ? [
                BoxShadow(
                  color: AppColors.gold.withOpacity(0.15),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Opacity(
                opacity: unlocked ? 1.0 : 0.35,
                child: Text(
                  def.emoji,
                  style: const TextStyle(fontSize: 44),
                ),
              ),
              if (!unlocked)
                const Icon(
                  Icons.lock,
                  color: AppColors.subtext,
                  size: 28,
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            def.title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: unlocked ? AppColors.gold : AppColors.subtext,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            def.description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10,
              color: AppColors.subtext,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '+${def.xpReward} XP${def.isLegendary ? ' · LEGEND' : ''}',
            style: TextStyle(
              fontSize: 10,
              color: def.isLegendary
                  ? AppColors.red
                  : AppColors.gold.withOpacity(0.8),
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}
