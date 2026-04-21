import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class StreakWidget extends StatefulWidget {
  final int streakDays;
  const StreakWidget({super.key, required this.streakDays});

  @override
  State<StreakWidget> createState() => _StreakWidgetState();
}

class _StreakWidgetState extends State<StreakWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final active = widget.streakDays > 0;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: active ? AppColors.gold.withOpacity(0.4) : AppColors.divider,
        ),
      ),
      child: Row(
        children: [
          ScaleTransition(
            scale: Tween<double>(begin: 0.9, end: 1.1).animate(
              CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
            ),
            child: Text(
              active ? '🔥' : '🔥',
              style: TextStyle(
                fontSize: 28,
                color: active ? null : AppColors.subtext,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  active
                      ? 'Streak: ${widget.streakDays} ${_dayWord(widget.streakDays)}'
                      : 'Серия прервана',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: active ? AppColors.gold : AppColors.subtext,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  active ? _nextBonus(widget.streakDays) : 'Начни серию заново',
                  style: AppTheme.subtitle,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _dayWord(int d) {
    final mod100 = d % 100;
    final mod10 = d % 10;
    if (mod100 >= 11 && mod100 <= 14) return 'дней';
    if (mod10 == 1) return 'день';
    if (mod10 >= 2 && mod10 <= 4) return 'дня';
    return 'дней';
  }

  String _nextBonus(int streak) {
    if (streak >= 30) return 'Максимальный бонус: ×1.80';
    if (streak >= 14) return 'Текущий бонус: ×1.40 · до ×1.80 ещё ${30 - streak}';
    if (streak >= 7) return 'Текущий бонус: ×1.20 · до ×1.40 ещё ${14 - streak}';
    if (streak >= 3) return 'Текущий бонус: ×1.10 · до ×1.20 ещё ${7 - streak}';
    return 'До бонуса ×1.10 ещё ${3 - streak}';
  }
}
