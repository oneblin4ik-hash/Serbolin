import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/goal.dart';
import '../models/quest.dart';
import '../services/achievement_service.dart';
import '../services/goal_service.dart';
import '../services/quest_service.dart';
import '../services/supabase_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import '../widgets/quest_card.dart';
import 'shell_screen.dart';

class QuestsScreen extends StatefulWidget {
  const QuestsScreen({super.key});

  @override
  State<QuestsScreen> createState() => _QuestsScreenState();
}

class _QuestsScreenState extends State<QuestsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('КВЕСТЫ'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'СЕГОДНЯ'),
            Tab(text: 'БОСС НЕДЕЛИ'),
            Tab(text: 'ЦЕЛИ'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const [
          _DailyTab(),
          _BossTab(),
          _GoalsTab(),
        ],
      ),
    );
  }
}

// ============================================================================
// DAILY QUESTS
// ============================================================================

class _DailyTab extends StatelessWidget {
  const _DailyTab();

  @override
  Widget build(BuildContext context) {
    return Consumer<QuestService>(
      builder: (context, quests, _) {
        final list = quests.todayQuests;
        final done = list.where((q) => q.isCompleted).length;
        return RefreshIndicator(
          color: AppColors.gold,
          onRefresh: () => quests.refresh(),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _TodayHeader(done: done, total: list.length),
              const SizedBox(height: 16),
              if (list.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(
                    child: Text(
                      'Пока нет квестов на сегодня',
                      style: TextStyle(color: AppColors.subtext),
                    ),
                  ),
                ),
              ...list.map((q) => QuestCard(
                    quest: q,
                    onToggle: (v) => _toggle(context, q, v),
                    onEdit: q.isCustom ? () => _showDialog(context, q) : null,
                    onDelete: () => quests.deleteQuest(q),
                  )),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => _showDialog(context, null),
                icon: const Icon(Icons.add),
                label: const Text('СОЗДАТЬ СВОЙ КВЕСТ'),
              ),
              const SizedBox(height: 30),
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
    } else if (!done && wasDone) {
      await xp.revokeXP(
        amount: updated.xpReward,
        source: 'quest_revoke',
        description: updated.title,
      );
    }
  }

  Future<void> _showDialog(BuildContext context, Quest? existing) async {
    final titleCtrl = TextEditingController(text: existing?.title ?? '');
    final xpCtrl =
        TextEditingController(text: (existing?.xpReward ?? 30).toString());
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(existing == null ? 'Новый квест' : 'Редактировать квест'),
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
            child: Text(existing == null ? 'ДОБАВИТЬ' : 'СОХРАНИТЬ'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    final title = titleCtrl.text.trim();
    final xp = int.tryParse(xpCtrl.text.trim()) ?? 30;
    if (title.isEmpty) return;
    if (existing == null) {
      await context
          .read<QuestService>()
          .addCustomQuest(title: title, xp: xp);
    } else {
      await context
          .read<QuestService>()
          .updateCustomQuest(existing, title: title, xp: xp);
    }
  }
}

class _TodayHeader extends StatelessWidget {
  final int done;
  final int total;
  const _TodayHeader({required this.done, required this.total});

  @override
  Widget build(BuildContext context) {
    final ratio = total == 0 ? 0.0 : done / total;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: AppColors.questGradient,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.gold.withOpacity(0.45), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Text('⚔️', style: TextStyle(fontSize: 26)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  DateFormat('EEEE, d MMMM', 'ru').format(DateTime.now()),
                  style: const TextStyle(
                    color: AppColors.text,
                    fontSize: 15,
                    letterSpacing: 1,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppColors.gold.withOpacity(0.6)),
                ),
                child: Text(
                  '$done / $total',
                  style: const TextStyle(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: ratio,
              minHeight: 8,
              backgroundColor: AppColors.background,
              valueColor: const AlwaysStoppedAnimation(AppColors.gold),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// BOSS OF THE WEEK
// ============================================================================

class _BossTab extends StatelessWidget {
  const _BossTab();

  @override
  Widget build(BuildContext context) {
    return Consumer<QuestService>(
      builder: (context, quests, _) {
        final boss = quests.currentBoss;
        if (boss == null) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Text(
                'Босс ещё не назначен. Появится в понедельник.',
                style: TextStyle(color: AppColors.subtext),
              ),
            ),
          );
        }
        final progress = quests.bossProgressPercent(boss);
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppColors.bossGradient,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.red.withOpacity(0.7),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.red.withOpacity(0.15),
                    blurRadius: 24,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const Text('👹', style: TextStyle(fontSize: 48)),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'БОСС НЕДЕЛИ',
                              style: TextStyle(
                                color: AppColors.red.withOpacity(0.8),
                                letterSpacing: 3,
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              boss.title,
                              style: const TextStyle(
                                color: AppColors.text,
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    boss.description,
                    style: const TextStyle(
                      color: AppColors.subtext,
                      fontSize: 14,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 18),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 12,
                      backgroundColor: AppColors.background,
                      valueColor: AlwaysStoppedAnimation(
                          boss.isCompleted ? AppColors.gold : AppColors.red),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.emoji_events_outlined,
                              size: 16, color: AppColors.gold),
                          const SizedBox(width: 6),
                          Text(
                            '+${boss.xpReward} XP',
                            style: const TextStyle(
                              color: AppColors.gold,
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '${(progress * 100).toStringAsFixed(0)}%',
                        style: const TextStyle(
                          color: AppColors.text,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SectionCard(
              title: 'Как бить босса',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _BossHintRow(
                      emoji: '🏋',
                      text: 'Записывай тренировки — +1 к workouts'),
                  _BossHintRow(
                      emoji: '📹',
                      text: 'Обновляй контент в Stats → Reels/Посты'),
                  _BossHintRow(
                      emoji: '💼',
                      text: 'Проводи диалоги и закрывай клиентов в CRM'),
                  _BossHintRow(
                      emoji: '✍️',
                      text: 'Создание квестов не двигает босса, но даёт XP'),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        );
      },
    );
  }
}

class _BossHintRow extends StatelessWidget {
  final String emoji;
  final String text;
  const _BossHintRow({required this.emoji, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text,
                style: const TextStyle(color: AppColors.text, fontSize: 14)),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// GOALS
// ============================================================================

class _GoalsTab extends StatefulWidget {
  const _GoalsTab();

  @override
  State<_GoalsTab> createState() => _GoalsTabState();
}

class _GoalsTabState extends State<_GoalsTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final svc = context.read<GoalService>();
      if (!svc.isLoaded) svc.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GoalService>(
      builder: (context, svc, _) {
        if (!svc.isLoaded) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          );
        }
        final goals = svc.goals;
        return RefreshIndicator(
          color: AppColors.gold,
          onRefresh: () => svc.load(),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (goals.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Column(
                    children: [
                      const Text('🎯', style: TextStyle(fontSize: 46)),
                      const SizedBox(height: 10),
                      const Text(
                        'Пока нет целей',
                        style: TextStyle(
                          color: AppColors.text,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Создай цель, разбей её на подзадачи,\nотмечай прогресс.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.subtext),
                      ),
                    ],
                  ),
                ),
              ...goals.map((g) => _GoalCard(goal: g)),
              const SizedBox(height: 18),
              ElevatedButton.icon(
                onPressed: () => _showGoalDialog(context, null),
                icon: const Icon(Icons.add),
                label: const Text('НОВАЯ ЦЕЛЬ'),
              ),
              const SizedBox(height: 30),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showGoalDialog(BuildContext context, Goal? existing) async {
    final titleCtrl = TextEditingController(text: existing?.title ?? '');
    final descCtrl =
        TextEditingController(text: existing?.description ?? '');
    DateTime? dueDate = existing?.dueDate;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSt) => AlertDialog(
          title: Text(existing == null ? 'Новая цель' : 'Редактировать цель'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Название'),
                  autofocus: true,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Описание (необязательно)',
                  ),
                  maxLines: 3,
                ),
                const SizedBox(height: 12),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: dueDate ??
                          DateTime.now().add(const Duration(days: 30)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365 * 3)),
                    );
                    if (picked != null) setSt(() => dueDate = picked);
                  },
                  child: InputDecorator(
                    decoration:
                        const InputDecoration(labelText: 'Дедлайн (необязательно)'),
                    child: Text(
                      dueDate == null
                          ? 'Не задан'
                          : DateFormat('dd.MM.yyyy').format(dueDate!),
                      style: const TextStyle(color: AppColors.text),
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Отмена'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text(existing == null ? 'СОЗДАТЬ' : 'СОХРАНИТЬ'),
            ),
          ],
        ),
      ),
    );
    if (confirmed != true) return;
    final title = titleCtrl.text.trim();
    if (title.isEmpty) return;
    final svc = context.read<GoalService>();
    if (existing == null) {
      await svc.createGoal(
        title: title,
        description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
        dueDate: dueDate,
      );
    } else {
      await svc.updateGoal(existing.copyWith(
        title: title,
        description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
        dueDate: dueDate,
      ));
    }
  }
}

class _GoalCard extends StatelessWidget {
  final Goal goal;
  const _GoalCard({required this.goal});

  @override
  Widget build(BuildContext context) {
    return Consumer<GoalService>(
      builder: (context, svc, _) {
        final subtasks = svc.subtasksFor(goal.id!);
        final progress = svc.progressOf(goal.id!);
        final done = subtasks.where((s) => s.isCompleted).length;
        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            gradient: goal.isCompleted
                ? null
                : const LinearGradient(
                    colors: [Color(0xFF1F1B2E), Color(0xFF16131F)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
            color: goal.isCompleted ? AppColors.surface : null,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: goal.isCompleted
                  ? AppColors.gold.withOpacity(0.4)
                  : AppColors.violet.withOpacity(0.6),
              width: 1.2,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Text(
                      goal.isCompleted ? '✅' : '🎯',
                      style: const TextStyle(fontSize: 22),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            goal.title,
                            style: TextStyle(
                              color: AppColors.text,
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                              decoration: goal.isCompleted
                                  ? TextDecoration.lineThrough
                                  : null,
                            ),
                          ),
                          if (goal.dueDate != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 2),
                              child: Text(
                                'до ${DateFormat('dd.MM.yyyy').format(goal.dueDate!)}',
                                style: const TextStyle(
                                  color: AppColors.subtext,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_outlined,
                          color: AppColors.cyan, size: 20),
                      onPressed: () =>
                          _editGoal(context, goal),
                      tooltip: 'Редактировать',
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline,
                          color: AppColors.red, size: 20),
                      onPressed: () => _deleteGoal(context, goal),
                      tooltip: 'Удалить',
                    ),
                  ],
                ),
                if (goal.description != null &&
                    goal.description!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    goal.description!,
                    style: const TextStyle(
                      color: AppColors.subtext,
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
                ],
                const SizedBox(height: 14),
                Row(
                  children: [
                    Text(
                      '$done / ${subtasks.length}',
                      style: const TextStyle(
                        color: AppColors.cyan,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(999),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 8,
                          backgroundColor: AppColors.background,
                          valueColor: AlwaysStoppedAnimation(
                            goal.isCompleted
                                ? AppColors.gold
                                : AppColors.violet,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      '${(progress * 100).round()}%',
                      style: const TextStyle(
                        color: AppColors.text,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ...subtasks.map(
                  (s) => _SubtaskRow(
                    goal: goal,
                    subtask: s,
                  ),
                ),
                const SizedBox(height: 6),
                TextButton.icon(
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('ДОБАВИТЬ ПОДЗАДАЧУ'),
                  onPressed: () => _addSubtask(context, goal),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _editGoal(BuildContext context, Goal goal) async {
    final state =
        context.findAncestorStateOfType<_GoalsTabState>();
    await state?._showGoalDialog(context, goal);
  }

  Future<void> _deleteGoal(BuildContext context, Goal goal) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Удалить цель?'),
        content:
            const Text('Все подзадачи и прогресс тоже удалятся.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('УДАЛИТЬ'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await context.read<GoalService>().deleteGoal(goal.id!);
  }

  Future<void> _addSubtask(BuildContext context, Goal goal) async {
    final ctrl = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Новая подзадача'),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Что конкретно надо сделать',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('ДОБАВИТЬ'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    final title = ctrl.text.trim();
    if (title.isEmpty) return;
    await context
        .read<GoalService>()
        .addSubtask(goalId: goal.id!, title: title);
  }
}

class _SubtaskRow extends StatelessWidget {
  final Goal goal;
  final GoalSubtask subtask;
  const _SubtaskRow({required this.goal, required this.subtask});

  @override
  Widget build(BuildContext context) {
    final done = subtask.isCompleted;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          InkWell(
            onTap: () => _toggle(context),
            borderRadius: BorderRadius.circular(6),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: done ? AppColors.violet : Colors.transparent,
                border: Border.all(
                  color: done ? AppColors.violet : AppColors.subtext,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(5),
              ),
              child: done
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : null,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              subtask.title,
              style: TextStyle(
                color: done ? AppColors.subtext : AppColors.text,
                decoration: done ? TextDecoration.lineThrough : null,
                fontSize: 14,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close,
                size: 16, color: AppColors.subtext),
            onPressed: () =>
                context.read<GoalService>().deleteSubtask(subtask),
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  Future<void> _toggle(BuildContext context) async {
    final svc = context.read<GoalService>();
    final willBeDone = !subtask.isCompleted;
    await svc.toggleSubtask(subtask, willBeDone);

    // +20 XP за выполнение подзадачи, -20 при откате.
    final xp = context.read<XPService>();
    const reward = 20;
    if (willBeDone) {
      await xp.addXP(
        amount: reward,
        source: 'subtask',
        description: '${goal.title} → ${subtask.title}',
      );
    } else {
      await xp.revokeXP(
        amount: reward,
        source: 'subtask_revoke',
        description: '${goal.title} → ${subtask.title}',
      );
    }

    // Автозакрытие цели при 100% подзадач.
    final list = svc.subtasksFor(goal.id!);
    final allDone =
        list.isNotEmpty && list.every((s) => s.isCompleted);
    if (allDone && !goal.isCompleted) {
      await svc.toggleGoal(goal, true);
    } else if (!allDone && goal.isCompleted) {
      await svc.toggleGoal(goal, false);
    }
  }
}
