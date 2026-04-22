import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/quest.dart';
import '../services/achievement_service.dart';
import '../services/quest_service.dart';
import '../services/supabase_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import '../widgets/quest_card.dart';
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
            _LevelBlock(),
            SizedBox(height: 16),
            _XpBlock(),
            SizedBox(height: 16),
            _StreakBlock(),
            SizedBox(height: 16),
            _BossBlock(),
            SizedBox(height: 16),
            _QuestsBlock(),
            SizedBox(height: 16),
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

class _LevelBlock extends StatelessWidget {
  const _LevelBlock();

  @override
  Widget build(BuildContext context) {
    return Consumer<XPService>(
      builder: (context, xp, _) {
        final stats = xp.stats;
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'УРОВЕНЬ ${stats.level}',
                        style: AppTheme.hero.copyWith(fontSize: 40),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        stats.rank.toUpperCase(),
                        style: const TextStyle(
                          color: AppColors.gold,
                          letterSpacing: 3,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Всего XP: ${stats.xpTotal}',
                        style: AppTheme.subtitle,
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 64,
                  height: 64,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.gold, width: 2),
                  ),
                  child: Text(
                    '${stats.level}',
                    style: const TextStyle(
                      color: AppColors.gold,
                      fontWeight: FontWeight.w800,
                      fontSize: 28,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
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

class _BossBlock extends StatelessWidget {
  const _BossBlock();

  @override
  Widget build(BuildContext context) {
    return Consumer<QuestService>(
      builder: (context, quests, _) {
        final boss = quests.currentBoss;
        if (boss == null) return const SizedBox.shrink();
        final progress = quests.bossProgressPercent(boss);
        return SectionCard(
          title: '👹 Босс недели',
          subtitle: boss.isCompleted ? 'ПОБЕЖДЁН' : 'В процессе',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                boss.title,
                style: const TextStyle(
                  fontSize: 20,
                  color: AppColors.text,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(boss.description, style: AppTheme.subtitle),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 10,
                  backgroundColor: const Color(0xFF1A1A1A),
                  valueColor: AlwaysStoppedAnimation(
                    boss.isCompleted ? AppColors.gold : AppColors.red,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Награда: +${boss.xpReward} XP',
                    style: const TextStyle(color: AppColors.gold),
                  ),
                  Text(
                    '${(progress * 100).toStringAsFixed(0)}%',
                    style: AppTheme.subtitle,
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _QuestsBlock extends StatelessWidget {
  const _QuestsBlock();

  @override
  Widget build(BuildContext context) {
    return Consumer<QuestService>(
      builder: (context, quests, _) {
        final list = quests.todayQuests;
        return SectionCard(
          title: '⚔️ Квесты дня',
          subtitle: list.isEmpty
              ? 'Пока нет квестов'
              : '${list.where((q) => q.isCompleted).length}/${list.length} выполнено',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ...list.map((q) => QuestCard(
                    quest: q,
                    onToggle: (done) => _toggle(context, q, done),
                    onEdit: q.isCustom
                        ? () => _showEditDialog(context, q)
                        : null,
                    onDelete: () => quests.deleteQuest(q),
                  )),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                icon: const Icon(Icons.add),
                label: const Text('ДОБАВИТЬ СВОЙ КВЕСТ'),
                onPressed: () => _showAddDialog(context),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _toggle(BuildContext context, Quest q, bool done) async {
    final quests = context.read<QuestService>();
    final xp = context.read<XPService>();
    final ach = context.read<AchievementService>();
    final wasDone = q.isCompleted;
    final updated = await quests.toggleQuest(q, done);
    if (done && !wasDone) {
      await xp.addXP(
        amount: updated.xpReward,
        source: 'quest',
        description: updated.title,
      );
      final since = DateTime.now().subtract(const Duration(days: 7));
      final completed =
          await SupabaseService.instance.getCompletedQuestsSince(since);
      await ach.checkPerfectWeek(completedLast7: completed.length);
    }
  }

  Future<void> _showAddDialog(BuildContext context) async {
    final result = await _showQuestDialog(
      context: context,
      titleText: 'Новый квест',
      submitText: 'ДОБАВИТЬ',
    );
    if (result == null) return;
    await context
        .read<QuestService>()
        .addCustomQuest(title: result.$1, xp: result.$2);
  }

  Future<void> _showEditDialog(BuildContext context, Quest quest) async {
    final result = await _showQuestDialog(
      context: context,
      titleText: 'Редактировать квест',
      submitText: 'СОХРАНИТЬ',
      initialTitle: quest.title,
      initialXp: quest.xpReward,
    );
    if (result == null) return;
    await context
        .read<QuestService>()
        .updateCustomQuest(quest, title: result.$1, xp: result.$2);
  }

  Future<(String, int)?> _showQuestDialog({
    required BuildContext context,
    required String titleText,
    required String submitText,
    String? initialTitle,
    int? initialXp,
  }) async {
    final titleCtrl = TextEditingController(text: initialTitle ?? '');
    final xpCtrl = TextEditingController(text: (initialXp ?? 30).toString());
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(titleText),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleCtrl,
              decoration: const InputDecoration(labelText: 'Название'),
              autofocus: true,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: xpCtrl,
              decoration:
                  const InputDecoration(labelText: 'XP за выполнение'),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(submitText),
          ),
        ],
      ),
    );
    if (confirmed != true) return null;
    final title = titleCtrl.text.trim();
    final xp = int.tryParse(xpCtrl.text.trim()) ?? 30;
    if (title.isEmpty) return null;
    return (title, xp);
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
            onTap: () => _openStats(context, StatsTab.body),
          ),
          _BranchTile(
            emoji: '📈',
            label: 'БРЕНД',
            onTap: () => _openStats(context, StatsTab.content),
          ),
          _BranchTile(
            emoji: '💰',
            label: 'БОГАТСТВО',
            onTap: () => _openStats(context, StatsTab.finance),
          ),
          _BranchTile(
            emoji: '🧠',
            label: 'ТВОРЕНИЕ',
            onTap: () => _openStats(context, StatsTab.general),
          ),
        ],
      ),
    );
  }

  void _openStats(BuildContext context, StatsTab tab) {
    StatsScreen.selectedTab.value = tab;
    RootNav.goToTab(context, 3);
  }
}

class _BranchTile extends StatelessWidget {
  final String emoji;
  final String label;
  final VoidCallback onTap;

  const _BranchTile({
    required this.emoji,
    required this.label,
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
          color: AppColors.background,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.gold.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 26)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: AppColors.gold,
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
