import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class BodyStatBar extends StatelessWidget {
  final String label;
  final double? current;
  final double? target;
  final String unit;
  final bool showProgress;

  const BodyStatBar({
    super.key,
    required this.label,
    required this.current,
    this.target,
    this.unit = 'см',
    this.showProgress = true,
  });

  @override
  Widget build(BuildContext context) {
    final hasCurrent = current != null;
    final hasTarget = target != null && target! > 0;
    final progress = (hasCurrent && hasTarget)
        ? (current! / target!).clamp(0.0, 1.0)
        : 0.0;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.text,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              Text(
                _fmt(current, unit),
                style: const TextStyle(
                  color: AppColors.gold,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (showProgress && hasTarget) ...[
                const Text(' → ',
                    style: TextStyle(color: AppColors.subtext)),
                Text(
                  _fmt(target, unit),
                  style: const TextStyle(color: AppColors.subtext),
                ),
              ],
            ],
          ),
          if (showProgress && hasTarget) ...[
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: Stack(
                children: [
                  Container(
                    height: 8,
                    color: const Color(0xFF1A1A1A),
                  ),
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: progress),
                    duration: const Duration(milliseconds: 700),
                    curve: Curves.easeOutCubic,
                    builder: (context, value, _) => FractionallySizedBox(
                      widthFactor: value,
                      child: Container(
                        height: 8,
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
        ],
      ),
    );
  }

  String _fmt(double? v, String unit) {
    if (v == null) return '— $unit';
    final text = v % 1 == 0 ? v.toInt().toString() : v.toStringAsFixed(1);
    return '$text $unit';
  }
}

class AttributeBar extends StatelessWidget {
  final String emoji;
  final String name;
  final int value;

  const AttributeBar({
    super.key,
    required this.emoji,
    required this.name,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final progress = (value / 100).clamp(0.0, 1.0);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  name,
                  style: const TextStyle(
                    fontSize: 14,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Text(
                value.toString(),
                style: const TextStyle(
                  color: AppColors.gold,
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: Stack(
              children: [
                Container(
                  height: 10,
                  color: const Color(0xFF1A1A1A),
                ),
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: progress),
                  duration: const Duration(milliseconds: 700),
                  curve: Curves.easeOutCubic,
                  builder: (context, value, _) => FractionallySizedBox(
                    widthFactor: value,
                    child: Container(
                      height: 10,
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
      ),
    );
  }
}
