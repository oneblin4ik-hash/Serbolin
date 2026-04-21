import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/achievement_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import '../widgets/achievement_popup.dart';
import '../widgets/level_up_overlay.dart';
import '../widgets/xp_toast.dart';
import 'character_screen.dart';
import 'crm_screen.dart';
import 'dashboard_screen.dart';
import 'stats_screen.dart';
import 'training_screen.dart';

class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key});

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  int _index = 0;
  StreamSubscription? _xpSub;
  StreamSubscription? _levelSub;
  StreamSubscription? _achSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bindStreams());
  }

  void _bindStreams() {
    final xp = context.read<XPService>();
    final ach = context.read<AchievementService>();
    _xpSub = xp.gainStream.listen((r) {
      if (!mounted) return;
      showXpToast(context, r);
    });
    _levelSub = xp.levelUpStream.listen((level) {
      if (!mounted) return;
      showLevelUpOverlay(context, level);
    });
    _achSub = ach.unlockStream.listen((def) {
      if (!mounted) return;
      showAchievementPopup(context, def);
    });
  }

  @override
  void dispose() {
    _xpSub?.cancel();
    _levelSub?.cancel();
    _achSub?.cancel();
    super.dispose();
  }

  static const List<Widget> _pages = [
    DashboardScreen(),
    CharacterScreen(),
    TrainingScreen(),
    StatsScreen(),
    CrmScreen(),
  ];

  void goTo(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: _pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Character',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.fitness_center_outlined),
            activeIcon: Icon(Icons.fitness_center),
            label: 'Training',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart_outlined),
            activeIcon: Icon(Icons.bar_chart),
            label: 'Stats',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.work_outline),
            activeIcon: Icon(Icons.work),
            label: 'CRM',
          ),
        ],
      ),
    );
  }
}

/// Простой маршрут для открытия экранов из других частей приложения.
class RootNav {
  static void goToTab(BuildContext context, int index) {
    final state = context.findAncestorStateOfType<_ShellScreenState>();
    state?.goTo(index);
  }
}

/// Карточка с golden-обводкой и заголовком, используется повсеместно.
class SectionCard extends StatelessWidget {
  final String? title;
  final String? subtitle;
  final Widget child;
  final EdgeInsetsGeometry padding;

  const SectionCard({
    super.key,
    this.title,
    this.subtitle,
    required this.child,
    this.padding = const EdgeInsets.all(16),
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: padding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (title != null) ...[
              Row(
                children: [
                  Expanded(
                    child: Text(
                      title!.toUpperCase(),
                      style: const TextStyle(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ],
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(subtitle!, style: const TextStyle(color: AppColors.subtext, fontSize: 12)),
              ],
              const SizedBox(height: 12),
            ],
            child,
          ],
        ),
      ),
    );
  }
}
