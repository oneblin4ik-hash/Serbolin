import 'dart:math';

import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Placeholder-аватар. Рисуется кодом, если соответствующий PNG в
/// assets/avatar/level_N.png отсутствует. Выглядит достаточно для
/// демо и кликабелен на всех уровнях.
class AvatarView extends StatelessWidget {
  final int level;
  final bool glowing;
  final double size;

  const AvatarView({
    super.key,
    required this.level,
    this.glowing = false,
    this.size = 220,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (glowing)
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold.withOpacity(0.6),
                    blurRadius: 60,
                    spreadRadius: 20,
                  ),
                ],
              ),
            ),
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.surfaceElevated,
                  AppColors.background,
                ],
              ),
              border: Border.all(color: AppColors.gold, width: 2),
            ),
            padding: const EdgeInsets.all(12),
            child: CustomPaint(
              painter: _SilhouettePainter(level: level),
            ),
          ),
          Positioned(
            bottom: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppColors.gold.withOpacity(0.6)),
              ),
              child: Text(
                'STAGE $_stage',
                style: const TextStyle(
                  color: AppColors.gold,
                  letterSpacing: 2,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  int get _stage {
    if (level <= 3) return 1;
    if (level <= 6) return 2;
    return 3;
  }
}

class _SilhouettePainter extends CustomPainter {
  final int level;
  _SilhouettePainter({required this.level});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.gold
      ..style = PaintingStyle.fill;

    final cx = size.width / 2;
    final topY = size.height * 0.14;
    final headR = size.width * 0.11;

    // Head
    canvas.drawCircle(Offset(cx, topY), headR, paint);

    // Body proportions by level stage
    final muscleFactor = level <= 3
        ? 0.25
        : level <= 6
            ? 0.35
            : 0.45;

    final shoulderW = size.width * (0.28 + muscleFactor * 0.5);
    final waistW = size.width * (0.18 + muscleFactor * 0.15);

    final shoulderY = topY + headR + 6;
    final waistY = size.height * 0.58;
    final hipY = size.height * 0.68;
    final footY = size.height * 0.96;

    final torso = Path()
      ..moveTo(cx - shoulderW, shoulderY)
      ..quadraticBezierTo(
        cx - shoulderW * 1.1,
        (shoulderY + waistY) / 2,
        cx - waistW,
        waistY,
      )
      ..lineTo(cx - waistW * 1.1, hipY)
      ..lineTo(cx + waistW * 1.1, hipY)
      ..lineTo(cx + waistW, waistY)
      ..quadraticBezierTo(
        cx + shoulderW * 1.1,
        (shoulderY + waistY) / 2,
        cx + shoulderW,
        shoulderY,
      )
      ..close();

    canvas.drawPath(torso, paint);

    // Arms
    final armW = size.width * (0.07 + muscleFactor * 0.12);
    final armPaint = paint;
    final leftArm = Rect.fromLTWH(
      cx - shoulderW - armW,
      shoulderY,
      armW,
      size.height * 0.35,
    );
    final rightArm = Rect.fromLTWH(
      cx + shoulderW,
      shoulderY,
      armW,
      size.height * 0.35,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(leftArm, const Radius.circular(8)),
      armPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(rightArm, const Radius.circular(8)),
      armPaint,
    );

    // Legs
    final legW = size.width * (0.12 + muscleFactor * 0.08);
    final gap = size.width * 0.02;
    final leftLeg = Rect.fromLTWH(
      cx - legW - gap,
      hipY,
      legW,
      footY - hipY,
    );
    final rightLeg = Rect.fromLTWH(
      cx + gap,
      hipY,
      legW,
      footY - hipY,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(leftLeg, const Radius.circular(10)),
      paint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(rightLeg, const Radius.circular(10)),
      paint,
    );

    // Glow streak on chest for higher levels
    if (level > 3) {
      final streak = Paint()
        ..color = AppColors.goldBright
        ..strokeWidth = 3
        ..style = PaintingStyle.stroke;
      final lineY = shoulderY + (waistY - shoulderY) * 0.3;
      canvas.drawLine(
        Offset(cx - shoulderW * 0.5, lineY),
        Offset(cx + shoulderW * 0.5, lineY),
        streak,
      );
    }
    // Extra pecs/abs for level 7+
    if (level > 6) {
      final detail = Paint()
        ..color = AppColors.background.withOpacity(0.4)
        ..style = PaintingStyle.fill;
      final midY = (shoulderY + waistY) / 2;
      final stripeW = shoulderW * 0.08;
      canvas.drawRect(
        Rect.fromCenter(
          center: Offset(cx, midY),
          width: stripeW,
          height: (waistY - shoulderY) * 0.9,
        ),
        detail,
      );
      // small random ab-dots
      final rnd = Random(7);
      for (var i = 0; i < 4; i++) {
        final y = midY + i * stripeW * 1.8;
        canvas.drawCircle(
          Offset(cx - stripeW * 1.5, y),
          stripeW * 0.5,
          detail,
        );
        canvas.drawCircle(
          Offset(cx + stripeW * 1.5, y),
          stripeW * 0.5,
          detail,
        );
        // reference rnd to avoid unused warning without changing visuals
        rnd.nextInt(1);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SilhouettePainter oldDelegate) =>
      oldDelegate.level != level;
}
