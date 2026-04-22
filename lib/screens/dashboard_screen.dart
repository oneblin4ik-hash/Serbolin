import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/achievement_service.dart';
import '../services/quest_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import '../widgets/streak_widget.dart';
import '../widgets/xp_bar.dart';
import 'shell_screen.dart';
import 'stats_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ДОМ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Выйти',
            onPressed: () => _signOut(context),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.gold,
        onRefresh: () async {
          await context.read<XPService>().refresh();
          await context.read<QuestService>().refresh();
          await context.read<AchievementService>().load();
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            _HeroBlock(),
            SizedBox(height: 14),
            _StatsRow(),
            SizedBox(height: 14),
            _XpBlock(),
            SizedBox(height: 14),
            _StreakBlock(),
            SizedBox(height: 14),
            _QuestsSummaryRow(),
            SizedBox(height: 14),
            _BranchesBlock(),
            SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Future<void> _signOut(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Выйти?'),
        content: const Text('Сессия будет закрыта.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('ВЫЙТИ'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await Supabase.instance.client.auth.signOut();
    }
  }
}

class _HeroBlock extends StatelessWidget {
  const _HeroBlock();

  @override
  Widget build(BuildContext context) {
    return Consumer<XPService>(
      builder: (context, xp, _) {
        final stats = xp.stats;
        return Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: AppColors.heroGradient,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: AppColors.gold.withOpacity(0.5),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.gold.withOpacity(0.1),
                blurRadius: 40,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'УРОВЕНЬ ${stats.level}',
                      style: AppTheme.hero.copyWith(fontSize: 44),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            gradient: AppColors.goldGradient,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            stats.rank.toUpperCase(),
                            style: const TextStyle(
                              color: AppColors.background,
                              letterSpacing: 2,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Всего набрано: ${stats.xpTotal} XP',
                      style: AppTheme.subtitle,
                    ),
                  ],
                ),
              ),
              Container(
                width: 80,
                height: 80,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppColors.goldGradient,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.gold.withOpacity(0.4),
                      blurRadius: 24,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Text(
                  '${stats.level}',
                  style: const TextStyle(
                    color: AppColors.background,
                    fontWeight: FontWeight.w900,
                    fontSize: 36,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow();

  @override
  Widget build(BuildContext context) {
    return Consumer<XPService>(
      builder: (context, xp, _) {
        final s = xp.stats;
        return Row(
          children: [
            Expanded(
              child: _MiniStat(
                emoji: '⚔️',
                label: 'СИЛА',
                value: s.strength,
                color: AppColors.red,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _MiniStat(
                emoji: '🏃',
                label: 'ВЫНОСЛ.',
                value: s.endurance,
                color: AppColors.emerald,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _MiniStat(
                emoji: '🎯',
                label: 'ДИСЦИПЛ.',
                value: s.discipline,
                color: AppColors.gold,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _MiniStat(
                emoji: '⚡',
                label: 'ЭНЕРГИЯ',
                value: s.energy,
                color: AppColors.cyan,
              ),
            ),
          ],
        );
      },
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String emoji;
  final String label;
  final int value;
  final Color color;

  const _MiniStat({
    required this.emoji,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 4),
          Text(
            '$value',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w900,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.subtext,
              fontSize: 9,
              letterSpacing: 1,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _XpBlock extends StatelessWidget {
  const _XpBlock();

  @override
  Widget build(BuildContext context) {
    return Consumer<XPService>(
      builder: (context, xp, _) {
        final stats = xp.stats;
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: XpBar(
              current: stats.xpCurrent,
              next: stats.xpToNextLevel,
            ),
          ),
        );
      },
    );
  }
}

class _StreakBlock extends StatelessWidget {
  const _StreakBlock();

  @override
  Widget build(BuildContext context) {
    return Consumer<XPService>(
      builder: (context, xp, _) =>
          StreakWidget(streakDays: xp.stats.streakDays),
    );
  }
}

class _QuestsSummaryRow extends StatelessWidget {
  const _QuestsSummaryRow();

  @override
  Widget build(BuildContext context) {
    return Consumer<QuestService>(
      builder: (context, quests, _) {
        final list = quests.todayQuests;
        final done = list.where((q) => q.isCompleted).length;
        final boss = quests.currentBoss;
        final bossProgress =
            boss == null ? 0.0 : quests.bossProgressPercent(boss);
        return Row(
          children: [
            Expanded(
              child: _SummaryCard(
                emoji: '⚔️',
                title: 'КВЕСТЫ ДНЯ',
                subtitle: list.isEmpty
                    ? 'Пока нет'
                    : '$done из ${list.length} готово',
                progress: list.isEmpty ? 0 : done / list.length,
                color: AppColors.gold,
                onTap: () => RootNav.goToTab(context, 1),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _SummaryCard(
                emoji: '👹',
                title: 'БОСС НЕДЕЛИ',
                subtitle: boss == null
                    ? 'Не назначен'
                    : boss.isCompleted
                        ? 'Побеждён'
                        : boss.title,
                progress: bossProgress,
                color: AppColors.red,
                onTap: () => RootNav.goToTab(context, 1),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String emoji;
  final String title;
  final String subtitle;
  final double progress;
  final Color color;
  final VoidCallback onTap;

  const _SummaryCard({
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.progress,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.45)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(emoji, style: const TextStyle(fontSize: 20)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: color,
                      letterSpacing: 2,
                      fontWeight: FontWeight.w800,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 6,
                backgroundColor: AppColors.background,
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BranchesBlock extends StatelessWidget {
  const _BranchesBlock();

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: '🌿 Ветки развития',
      child: GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 2.0,
        children: [
          _BranchTile(
            emoji: '💪',
            label: 'ТЕЛО',
            color: AppColors.red,
            onTap: () => _openStats(context, StatsTab.body),
          ),
          _BranchTile(
            emoji: '📈',
            label: 'БРЕНД',
            color: AppColors.cyan,
            onTap: () => _openStats(context, StatsTab.content),
          ),
          _BranchTile(
            emoji: '💰',
            label: 'БОГАТСТВО',
            color: AppColors.emerald,
            onTap: () => _openStats(context, StatsTab.finance),
          ),
          _BranchTile(
            emoji: '🧠',
            label: 'ТВОРЕНИЕ',
            color: AppColors.violet,
            onTap: () => _openStats(context, StatsTab.general),
          ),
        ],
      ),
    );
  }

  void _openStats(BuildContext context, StatsTab tab) {
    StatsScreen.selectedTab.value = tab;
    // Stats теперь индекс 4 после добавления вкладки Квесты.
    RootNav.goToTab(context, 4);
  }
}

class _BranchTile extends StatelessWidget {
  final String emoji;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _BranchTile({
    required this.emoji,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              color.withOpacity(0.12),
              AppColors.background,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.55)),
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 26)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  color: color,
                  letterSpacing: 2,
                  fontWeight: FontWeight.w800,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
