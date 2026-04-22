import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/achievement_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import '../widgets/achievement_popup.dart';
import '../widgets/level_up_overlay.dart';
import '../widgets/xp_toast.dart';
import 'achievements_screen.dart';
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
    AchievementsScreen(),
  ];

  static const List<_NavEntry> _nav = [
    _NavEntry(
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
      label: 'Дом',
    ),
    _NavEntry(
      icon: Icons.person_outline,
      activeIcon: Icons.person,
      label: 'Персонаж',
    ),
    _NavEntry(
      icon: Icons.fitness_center_outlined,
      activeIcon: Icons.fitness_center,
      label: 'Зал',
    ),
    _NavEntry(
      icon: Icons.bar_chart_outlined,
      activeIcon: Icons.bar_chart,
      label: 'Стата',
    ),
    _NavEntry(
      icon: Icons.work_outline,
      activeIcon: Icons.work,
      label: 'CRM',
    ),
    _NavEntry(
      icon: Icons.emoji_events_outlined,
      activeIcon: Icons.emoji_events,
      label: 'Награды',
    ),
  ];

  void goTo(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 720;
    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            if (isWide)
              _SideNav(
                index: _index,
                onSelect: (i) => setState(() => _index = i),
              )
            else
              const SizedBox.shrink(),
            Expanded(
              child: IndexedStack(
                index: _index,
                children: _pages,
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: isWide
          ? null
          : NavigationBar(
              selectedIndex: _index,
              onDestinationSelected: (i) => setState(() => _index = i),
              backgroundColor: AppColors.surface,
              indicatorColor: AppColors.gold.withOpacity(0.2),
              destinations: _nav
                  .map((e) => NavigationDestination(
                        icon: Icon(e.icon),
                        selectedIcon: Icon(e.activeIcon,
                            color: AppColors.gold),
                        label: e.label,
                      ))
                  .toList(),
            ),
    );
  }
}

class _NavEntry {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavEntry({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

class _SideNav extends StatelessWidget {
  final int index;
  final ValueChanged<int> onSelect;

  const _SideNav({required this.index, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          right: BorderSide(color: AppColors.divider, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 22, 20, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SERBOLIN',
                  style: AppTheme.hero.copyWith(fontSize: 22),
                ),
                const SizedBox(height: 2),
                Text(
                  'ЛИЧНАЯ RPG-СИСТЕМА',
                  style: AppTheme.subtitle.copyWith(
                    fontSize: 10,
                    letterSpacing: 2,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.divider),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 4),
              itemCount: _ShellScreenState._nav.length,
              itemBuilder: (ctx, i) {
                final entry = _ShellScreenState._nav[i];
                final selected = i == index;
                return _SideNavTile(
                  entry: entry,
                  selected: selected,
                  onTap: () => onSelect(i),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
            child: Text(
              'DISCIPLINE · PROGRESS · POWER',
              style: AppTheme.subtitle.copyWith(
                fontSize: 9,
                letterSpacing: 2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SideNavTile extends StatelessWidget {
  final _NavEntry entry;
  final bool selected;
  final VoidCallback onTap;

  const _SideNavTile({
    required this.entry,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.gold.withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected
                ? AppColors.gold.withOpacity(0.6)
                : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Icon(
              selected ? entry.activeIcon : entry.icon,
              color: selected ? AppColors.gold : AppColors.subtext,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                entry.label,
                style: TextStyle(
                  color: selected ? AppColors.gold : AppColors.text,
                  fontWeight:
                      selected ? FontWeight.w700 : FontWeight.w500,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ],
        ),
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
                Text(subtitle!,
                    style: const TextStyle(
                        color: AppColors.subtext, fontSize: 12)),
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
