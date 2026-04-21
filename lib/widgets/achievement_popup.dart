import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';

import '../models/achievement.dart';
import '../theme/app_theme.dart';

Future<void> showAchievementPopup(
  BuildContext context,
  AchievementDef def,
) async {
  await showDialog<void>(
    context: context,
    barrierColor: Colors.black.withOpacity(0.85),
    builder: (ctx) => _AchievementDialog(def: def),
  );
}

class _AchievementDialog extends StatefulWidget {
  final AchievementDef def;
  const _AchievementDialog({required this.def});

  @override
  State<_AchievementDialog> createState() => _AchievementDialogState();
}

class _AchievementDialogState extends State<_AchievementDialog>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final ConfettiController _confetti;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
    _confetti = ConfettiController(duration: const Duration(seconds: 2))
      ..play();
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) Navigator.of(context).maybePop();
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _confetti.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.of(context).maybePop(),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 40,
            child: ConfettiWidget(
              confettiController: _confetti,
              blastDirectionality: BlastDirectionality.explosive,
              numberOfParticles: 24,
              colors: const [AppColors.gold, AppColors.goldBright, Colors.white],
              gravity: 0.2,
            ),
          ),
          Center(
            child: ScaleTransition(
              scale: CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut),
              child: Container(
                width: 320,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                      color: widget.def.isLegendary
                          ? AppColors.red
                          : AppColors.gold,
                      width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: (widget.def.isLegendary
                              ? AppColors.red
                              : AppColors.gold)
                          .withOpacity(0.35),
                      blurRadius: 60,
                      spreadRadius: 4,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'ACHIEVEMENT UNLOCKED',
                      style: TextStyle(
                        color: widget.def.isLegendary
                            ? AppColors.red
                            : AppColors.gold,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 3,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      widget.def.emoji,
                      style: const TextStyle(fontSize: 60),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      widget.def.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.text,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      widget.def.description,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppColors.subtext,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: AppColors.gold),
                      ),
                      child: Text(
                        '+${widget.def.xpReward} XP',
                        style: const TextStyle(
                          color: AppColors.gold,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
