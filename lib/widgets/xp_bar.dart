import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class XpBar extends StatelessWidget {
  final int current;
  final int next;
  final double height;
  final bool showLabels;

  const XpBar({
    super.key,
    required this.current,
    required this.next,
    this.height = 14,
    this.showLabels = true,
  });

  @override
  Widget build(BuildContext context) {
    final progress = next <= 0 ? 1.0 : (current / next).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (showLabels)
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'XP',
                  style: AppTheme.subtitle.copyWith(color: AppColors.gold),
                ),
                Text(
                  '$current / $next',
                  style: AppTheme.subtitle.copyWith(color: AppColors.text),
                ),
              ],
            ),
          ),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: Stack(
            children: [
              Container(
                height: height,
                color: const Color(0xFF1A1A1A),
              ),
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: progress),
                duration: const Duration(milliseconds: 800),
                curve: Curves.easeOutCubic,
                builder: (context, value, _) => FractionallySizedBox(
                  widthFactor: value,
                  child: Container(
                    height: height,
                    decoration: const BoxDecoration(
                      gradient: AppColors.xpGradient,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
