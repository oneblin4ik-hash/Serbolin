import 'dart:math';

import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Аватар героя, рисуется кодом. 3 стадии по уровню:
///   1 (lvl 1-3) — худой силуэт, без украшений
///   2 (lvl 4-6) — развитые плечи, грудная полоса, золотой пояс
///   3 (lvl 7-10) — рельеф, кубики пресса, корона и ауровое свечение
class AvatarView extends StatelessWidget {
  final int level;
  final bool glowing;
  final double size;

  const AvatarView({
    super.key,
    required this.level,
    this.glowing = false,
    this.size = 240,
  });

  int get _stage {
    if (level <= 3) return 1;
    if (level <= 6) return 2;
    return 3;
  }

  @override
  Widget build(BuildContext context) {
    final stage = _stage;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Постоянное свечение для 3 ступени + дополнительное при лвл-апе
          if (stage >= 3 || glowing)
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold
                        .withOpacity(glowing ? 0.7 : 0.35),
                    blurRadius: glowing ? 80 : 45,
                    spreadRadius: glowing ? 24 : 10,
                  ),
                ],
              ),
            ),

          // Круглый каркас с градиентом
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.surfaceElevated,
                  AppColors.background,
                ],
              ),
              border: Border.all(
                color: AppColors.gold,
                width: stage >= 3 ? 3 : 2,
              ),
            ),
            padding: const EdgeInsets.all(10),
            child: CustomPaint(
              size: Size(size - 20, size - 20),
              painter: _HeroPainter(level: level, stage: stage),
            ),
          ),

          // Корона для 3 ступени
          if (stage >= 3)
            Positioned(
              top: 2,
              child: Text(
                '👑',
                style: TextStyle(
                  fontSize: size * 0.14,
                  shadows: [
                    Shadow(
                      color: AppColors.gold.withOpacity(0.9),
                      blurRadius: 14,
                    ),
                  ],
                ),
              ),
            ),

          // Плашка «Ступень N»
          Positioned(
            bottom: 6,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: AppColors.gold
                      .withOpacity(stage >= 3 ? 0.9 : 0.6),
                  width: stage >= 3 ? 1.5 : 1,
                ),
              ),
              child: Text(
                'СТУПЕНЬ $stage',
                style: const TextStyle(
                  color: AppColors.gold,
                  letterSpacing: 2,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Рисует человеческий силуэт с разной степенью развития.
class _HeroPainter extends CustomPainter {
  final int level;
  final int stage;

  _HeroPainter({required this.level, required this.stage});

  @override
  void paint(Canvas canvas, Size size) {
    final body = Paint()
      ..color = AppColors.gold
      ..style = PaintingStyle.fill;

    final highlight = Paint()
      ..color = AppColors.goldBright
      ..style = PaintingStyle.fill;

    final detail = Paint()
      ..color = AppColors.background.withOpacity(0.55)
      ..style = PaintingStyle.fill;

    final cx = size.width / 2;
    final topY = size.height * 0.12;
    final headR = size.width * 0.11;

    // --- Параметры по стадии ---
    // muscleFactor управляет шириной плеч/рук/ног.
    final muscleFactor = switch (stage) {
      1 => 0.22,
      2 => 0.42,
      3 => 0.62,
      _ => 0.22,
    };

    // --- Аура (только 3 стадия) ---
    if (stage >= 3) {
      final aura = Paint()
        ..shader = RadialGradient(
          colors: [
            AppColors.gold.withOpacity(0.35),
            AppColors.gold.withOpacity(0.0),
          ],
        ).createShader(
          Rect.fromCircle(
            center: Offset(cx, size.height * 0.5),
            radius: size.width * 0.55,
          ),
        );
      canvas.drawCircle(
        Offset(cx, size.height * 0.5),
        size.width * 0.55,
        aura,
      );
    }

    // --- Голова ---
    canvas.drawCircle(Offset(cx, topY), headR, body);
    // Подбородок/шея
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(cx, topY + headR + size.height * 0.018),
        width: size.width * 0.08,
        height: size.height * 0.04,
      ),
      body,
    );

    final shoulderW = size.width * (0.28 + muscleFactor * 0.55);
    final waistW = size.width * (0.17 + muscleFactor * 0.12);
    final hipW = size.width * (0.20 + muscleFactor * 0.10);

    final shoulderY = topY + headR + size.height * 0.05;
    final chestY = shoulderY + size.height * 0.10;
    final waistY = size.height * 0.56;
    final hipY = size.height * 0.66;
    final footY = size.height * 0.96;

    // --- Торс (верх — грудь, сужение к талии, расширение к бёдрам) ---
    final torso = Path()
      ..moveTo(cx - shoulderW, shoulderY)
      ..quadraticBezierTo(
        cx - shoulderW * 1.12,
        chestY,
        cx - waistW,
        waistY,
      )
      ..lineTo(cx - hipW, hipY)
      ..lineTo(cx + hipW, hipY)
      ..lineTo(cx + waistW, waistY)
      ..quadraticBezierTo(
        cx + shoulderW * 1.12,
        chestY,
        cx + shoulderW,
        shoulderY,
      )
      ..close();
    canvas.drawPath(torso, body);

    // --- Руки ---
    final armW = size.width * (0.07 + muscleFactor * 0.10);
    final armH = size.height * 0.36;
    // Бицепс выдаётся наружу чуть больше с ростом стадии
    final bicepBulge = size.width * muscleFactor * 0.08;

    Path _arm(bool left) {
      final sign = left ? -1 : 1;
      final x = cx + sign * shoulderW;
      return Path()
        ..moveTo(x, shoulderY)
        ..quadraticBezierTo(
          x + sign * (armW / 2 + bicepBulge),
          shoulderY + armH * 0.28,
          x + sign * armW,
          shoulderY + armH * 0.55,
        )
        ..lineTo(x + sign * (armW * 0.8), shoulderY + armH)
        ..lineTo(x + sign * (armW * 0.1), shoulderY + armH)
        ..lineTo(x - sign * (armW * 0.1), shoulderY + armH * 0.55)
        ..close();
    }

    canvas.drawPath(_arm(true), body);
    canvas.drawPath(_arm(false), body);

    // --- Ноги ---
    final legW = size.width * (0.12 + muscleFactor * 0.06);
    final gap = size.width * 0.02;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(cx - legW - gap, hipY, legW, footY - hipY),
        const Radius.circular(12),
      ),
      body,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(cx + gap, hipY, legW, footY - hipY),
        const Radius.circular(12),
      ),
      body,
    );

    // --- Грудная мышца (светлый блик на груди) для 2+ стадии ---
    if (stage >= 2) {
      final pecW = shoulderW * 0.55;
      final pecH = (waistY - shoulderY) * 0.35;
      final pecY = shoulderY + (waistY - shoulderY) * 0.18;
      canvas.drawOval(
        Rect.fromCenter(
          center: Offset(cx - shoulderW * 0.28, pecY),
          width: pecW,
          height: pecH,
        ),
        highlight,
      );
      canvas.drawOval(
        Rect.fromCenter(
          center: Offset(cx + shoulderW * 0.28, pecY),
          width: pecW,
          height: pecH,
        ),
        highlight,
      );
    }

    // --- Пояс (золотая пряжка) для 2+ стадии ---
    if (stage >= 2) {
      final beltY = hipY - size.height * 0.01;
      canvas.drawRect(
        Rect.fromCenter(
          center: Offset(cx, beltY),
          width: hipW * 2 * 0.9,
          height: size.height * 0.028,
        ),
        highlight,
      );
      canvas.drawRect(
        Rect.fromCenter(
          center: Offset(cx, beltY),
          width: size.width * 0.04,
          height: size.height * 0.032,
        ),
        detail,
      );
    }

    // --- Кубики пресса и центральная линия для 3 стадии ---
    if (stage >= 3) {
      final midY = (shoulderY + waistY) / 2;
      final stripeW = shoulderW * 0.08;
      // Центральная борозда
      canvas.drawRect(
        Rect.fromCenter(
          center: Offset(cx, midY),
          width: stripeW,
          height: (waistY - shoulderY) * 0.95,
        ),
        detail,
      );
      // 3 ряда кубиков слева и справа
      for (var i = 0; i < 3; i++) {
        final y = midY + (i - 0.5) * stripeW * 2.2;
        canvas.drawOval(
          Rect.fromCenter(
            center: Offset(cx - stripeW * 1.8, y),
            width: stripeW * 1.8,
            height: stripeW * 1.4,
          ),
          detail,
        );
        canvas.drawOval(
          Rect.fromCenter(
            center: Offset(cx + stripeW * 1.8, y),
            width: stripeW * 1.8,
            height: stripeW * 1.4,
          ),
          detail,
        );
      }
      // Дельты плеч (наплечники)
      canvas.drawOval(
        Rect.fromCenter(
          center: Offset(cx - shoulderW * 0.92, shoulderY + size.height * 0.01),
          width: shoulderW * 0.5,
          height: size.height * 0.055,
        ),
        highlight,
      );
      canvas.drawOval(
        Rect.fromCenter(
          center: Offset(cx + shoulderW * 0.92, shoulderY + size.height * 0.01),
          width: shoulderW * 0.5,
          height: size.height * 0.055,
        ),
        highlight,
      );
      // Небольшие «искры» вокруг (маркер энергии)
      final rnd = Random(level);
      final sparkle = Paint()..color = AppColors.goldBright;
      for (var i = 0; i < 6; i++) {
        final angle = rnd.nextDouble() * 2 * pi;
        final r = size.width * (0.35 + rnd.nextDouble() * 0.08);
        final sx = cx + cos(angle) * r;
        final sy = size.height * 0.5 + sin(angle) * r;
        canvas.drawCircle(Offset(sx, sy), 2.0, sparkle);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _HeroPainter oldDelegate) =>
      oldDelegate.level != level || oldDelegate.stage != stage;
}
