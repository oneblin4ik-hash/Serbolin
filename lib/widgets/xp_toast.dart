import 'package:flutter/material.dart';

import '../services/xp_service.dart';
import '../theme/app_theme.dart';

void showXpToast(BuildContext context, XPGainResult result) {
  final messenger = ScaffoldMessenger.of(context);
  messenger.hideCurrentSnackBar();

  final parts = <String>[];
  parts.add('+${result.totalAmount} XP');
  if (result.streakMultiplier > 1.0) {
    parts.add('×${result.streakMultiplier.toStringAsFixed(2)} streak');
  }
  if (result.randomBonus) {
    parts.add('🎁 BONUS');
  }

  messenger.showSnackBar(
    SnackBar(
      duration: const Duration(seconds: 2),
      backgroundColor: AppColors.surface,
      content: Text(
        parts.join('  ·  '),
        style: const TextStyle(
          color: AppColors.gold,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    ),
  );
}

void showErrorToast(BuildContext context, String message) {
  final messenger = ScaffoldMessenger.of(context);
  messenger.hideCurrentSnackBar();
  messenger.showSnackBar(
    SnackBar(
      duration: const Duration(seconds: 3),
      backgroundColor: AppColors.surface,
      content: Text(
        message,
        style: const TextStyle(color: AppColors.red),
      ),
    ),
  );
}
