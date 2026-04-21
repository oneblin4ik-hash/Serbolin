import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

Future<void> showLevelUpOverlay(BuildContext context, int newLevel) async {
  await showDialog<void>(
    context: context,
    barrierColor: Colors.black.withOpacity(0.85),
    builder: (ctx) => _LevelUpDialog(level: newLevel),
  );
}

class _LevelUpDialog extends StatefulWidget {
  final int level;
  const _LevelUpDialog({required this.level});

  @override
  State<_LevelUpDialog> createState() => _LevelUpDialogState();
}

class _LevelUpDialogState extends State<_LevelUpDialog>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final ConfettiController _confetti;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
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
            top: 0,
            child: ConfettiWidget(
              confettiController: _confetti,
              blastDirectionality: BlastDirectionality.explosive,
              numberOfParticles: 30,
              maxBlastForce: 30,
              minBlastForce: 10,
              gravity: 0.25,
              colors: const [
                AppColors.gold,
                AppColors.goldBright,
                Colors.white,
                AppColors.red,
              ],
            ),
          ),
          Center(
            child: ScaleTransition(
              scale: CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut),
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.gold, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.gold.withOpacity(0.4),
                      blurRadius: 60,
                      spreadRadius: 8,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      '⚔️',
                      style: TextStyle(fontSize: 64),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'LEVEL UP',
                      style: AppTheme.hero.copyWith(fontSize: 36),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Level ${widget.level}',
                      style: const TextStyle(
                        fontSize: 22,
                        color: AppColors.text,
                        letterSpacing: 4,
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
