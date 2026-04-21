import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Показывается, если SUPABASE_URL / SUPABASE_ANON_KEY не заданы.
class SetupRequiredScreen extends StatelessWidget {
  const SetupRequiredScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('SERBOLIN', style: AppTheme.hero.copyWith(fontSize: 44)),
                const SizedBox(height: 4),
                Text(
                  'SETUP REQUIRED',
                  style: AppTheme.subtitle.copyWith(letterSpacing: 4),
                ),
                const SizedBox(height: 32),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '1. Создай Supabase проект',
                          style: TextStyle(
                              color: AppColors.gold,
                              fontSize: 18,
                              fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Перейди на supabase.com → New Project. Скопируй Project URL и anon/public key.',
                          style: TextStyle(color: AppColors.subtext),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          '2. Выполни миграцию',
                          style: TextStyle(
                              color: AppColors.gold,
                              fontSize: 18,
                              fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'В Supabase открой SQL Editor, вставь содержимое supabase/migrations/001_initial.sql и запусти.',
                          style: TextStyle(color: AppColors.subtext),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          '3. Перезапусти приложение с ключами',
                          style: TextStyle(
                              color: AppColors.gold,
                              fontSize: 18,
                              fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: const SelectableText(
                            'flutter run -d chrome \\\n'
                            '  --dart-define=SUPABASE_URL=https://xxx.supabase.co \\\n'
                            '  --dart-define=SUPABASE_ANON_KEY=eyJhbGci...',
                            style: TextStyle(
                              color: AppColors.text,
                              fontFamily: 'monospace',
                              height: 1.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'Либо пропиши значения прямо в lib/config.dart (менее безопасно).',
                          style: TextStyle(color: AppColors.subtext, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
