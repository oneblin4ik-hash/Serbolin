import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/body_stat.dart';
import '../services/achievement_service.dart';
import '../services/supabase_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import '../widgets/avatar_view.dart';
import '../widgets/body_stat_bar.dart';
import 'shell_screen.dart';

class CharacterScreen extends StatefulWidget {
  const CharacterScreen({super.key});

  @override
  State<CharacterScreen> createState() => _CharacterScreenState();
}

class _CharacterScreenState extends State<CharacterScreen> {
  final SupabaseService _svc = SupabaseService.instance;
  BodyStat? _latest;
  BodyStat? _first;
  BodyGoals? _goals;
  bool _glowing = false;
  StreamSubscription<int>? _levelSub;

  @override
  void initState() {
    super.initState();
    _load();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _levelSub = context.read<XPService>().levelUpStream.listen((_) async {
        if (!mounted) return;
        setState(() => _glowing = true);
        await Future.delayed(const Duration(milliseconds: 1500));
        if (mounted) setState(() => _glowing = false);
      });
    });
  }

  @override
  void dispose() {
    _levelSub?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    final latest = await _svc.getLatestBodyStat();
    final first = await _svc.getFirstBodyStat();
    final goals = await _svc.getBodyGoals();
    if (!mounted) return;
    setState(() {
      _latest = latest;
      _first = first;
      _goals = goals;
    });
  }

  Future<void> _openMeasureForm() async {
    final saved = await showDialog<BodyStat>(
      context: context,
      builder: (ctx) => _MeasureDialog(initial: _latest),
    );
    if (saved == null) return;
    final xp = context.read<XPService>();
    final ach = context.read<AchievementService>();
    final previous = _latest;
    final inserted = await _svc.insertBodyStat(saved);

    // XP for progress
    var totalXp = 0;
    final deltas = <String, double>{};
    if (previous != null) {
      final dw = (inserted.weight ?? 0) - (previous.weight ?? 0);
      if (dw >= 1) totalXp += dw.floor() * XPReward.weightKg;
      deltas['weight'] = dw;

      final db = (inserted.bicep ?? 0) - (previous.bicep ?? 0);
      if (db >= 1) totalXp += db.floor() * XPReward.bicepCm;
      deltas['bicep'] = db;

      final dc = (inserted.chest ?? 0) - (previous.chest ?? 0);
      if (dc >= 2) totalXp += (dc / 2).floor() * XPReward.chest2Cm;

      final dt = (inserted.thigh ?? 0) - (previous.thigh ?? 0);
      if (dt >= 2) totalXp += (dt / 2).floor() * XPReward.thigh2Cm;
    }
    if (totalXp > 0) {
      await xp.addXP(
        amount: totalXp,
        source: 'body_progress',
        description: 'Замеры',
      );
    }

    // Achievements based on cumulative gain vs first record
    if (_first != null) {
      final dWeight = (inserted.weight ?? 0) - (_first!.weight ?? 0);
      if (dWeight >= 10) await ach.checkWeightGain(dWeight);
      final dBicep = (inserted.bicep ?? 0) - (_first!.bicep ?? 0);
      if (dBicep >= 5) await ach.checkBicepGain(dBicep);
    }

    // Body Boss: all goals reached
    if (_goals != null) {
      await ach.checkBodyBoss(_allGoalsReached(inserted, _goals!));
    }

    await _load();
  }

  bool _allGoalsReached(BodyStat cur, BodyGoals g) {
    bool ok(double? current, double? target) {
      if (target == null || target == 0) return true;
      if (current == null) return false;
      return current >= target;
    }

    return ok(cur.weight, g.weight) &&
        ok(cur.chest, g.chest) &&
        ok(cur.bicep, g.bicep) &&
        ok(cur.thigh, g.thigh);
  }

  Future<void> _openGoalsForm() async {
    final saved = await showDialog<BodyGoals>(
      context: context,
      builder: (ctx) => _GoalsDialog(initial: _goals),
    );
    if (saved == null) return;
    await _svc.upsertBodyGoals(saved);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ПЕРСОНАЖ')),
      body: SafeArea(
        child: Consumer<XPService>(
          builder: (context, xp, _) {
            final stats = xp.stats;
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        AvatarView(level: stats.level, glowing: _glowing),
                        const SizedBox(height: 12),
                        Text(
                          'УРОВЕНЬ ${stats.level}',
                          style: AppTheme.hero.copyWith(fontSize: 32),
                        ),
                        Text(
                          stats.rank.toUpperCase(),
                          style: AppTheme.subtitle.copyWith(letterSpacing: 3),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SectionCard(
                  title: 'Параметры тела',
                  subtitle: _latest == null
                      ? 'Ещё нет замеров'
                      : 'Последний замер: ${_formatDate(_latest!.date)}',
                  child: Column(
                    children: [
                      BodyStatBar(
                        label: 'Вес',
                        current: _latest?.weight,
                        target: _goals?.weight,
                        unit: 'кг',
                      ),
                      BodyStatBar(
                        label: 'Грудь',
                        current: _latest?.chest,
                        target: _goals?.chest,
                      ),
                      BodyStatBar(
                        label: 'Бицепс',
                        current: _latest?.bicep,
                        target: _goals?.bicep,
                      ),
                      BodyStatBar(
                        label: 'Бедро',
                        current: _latest?.thigh,
                        target: _goals?.thigh,
                      ),
                      BodyStatBar(
                        label: 'Талия',
                        current: _latest?.waist,
                        showProgress: false,
                      ),
                      BodyStatBar(
                        label: 'Бёдра',
                        current: _latest?.hips,
                        showProgress: false,
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _openMeasureForm,
                              child: const Text('ОБНОВИТЬ ЗАМЕРЫ'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _openGoalsForm,
                              child: const Text('ЗАДАТЬ ЦЕЛИ'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SectionCard(
                  title: 'Атрибуты героя',
                  child: Column(
                    children: [
                      AttributeBar(
                        emoji: '⚔️',
                        name: 'Сила',
                        value: stats.strength,
                      ),
                      AttributeBar(
                        emoji: '🏃',
                        name: 'Выносливость',
                        value: stats.endurance,
                      ),
                      AttributeBar(
                        emoji: '🎯',
                        name: 'Дисциплина',
                        value: stats.discipline,
                      ),
                      AttributeBar(
                        emoji: '⚡',
                        name: 'Энергия',
                        value: stats.energy,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
              ],
            );
          },
        ),
      ),
    );
  }

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
}

class _MeasureDialog extends StatefulWidget {
  final BodyStat? initial;
  const _MeasureDialog({this.initial});

  @override
  State<_MeasureDialog> createState() => _MeasureDialogState();
}

class _MeasureDialogState extends State<_MeasureDialog> {
  late final TextEditingController weight;
  late final TextEditingController chest;
  late final TextEditingController waist;
  late final TextEditingController hips;
  late final TextEditingController thigh;
  late final TextEditingController bicep;
  DateTime date = DateTime.now();

  @override
  void initState() {
    super.initState();
    weight = TextEditingController(text: widget.initial?.weight?.toString() ?? '');
    chest = TextEditingController(text: widget.initial?.chest?.toString() ?? '');
    waist = TextEditingController(text: widget.initial?.waist?.toString() ?? '');
    hips = TextEditingController(text: widget.initial?.hips?.toString() ?? '');
    thigh = TextEditingController(text: widget.initial?.thigh?.toString() ?? '');
    bicep = TextEditingController(text: widget.initial?.bicep?.toString() ?? '');
  }

  @override
  void dispose() {
    weight.dispose();
    chest.dispose();
    waist.dispose();
    hips.dispose();
    thigh.dispose();
    bicep.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Новые замеры'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _row('Вес, кг', weight),
            _row('Грудь, см', chest),
            _row('Талия, см', waist),
            _row('Бёдра, см', hips),
            _row('Бедро, см', thigh),
            _row('Бицепс, см', bicep),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Отмена'),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(
              context,
              BodyStat(
                date: date,
                weight: double.tryParse(weight.text.trim()),
                chest: double.tryParse(chest.text.trim()),
                waist: double.tryParse(waist.text.trim()),
                hips: double.tryParse(hips.text.trim()),
                thigh: double.tryParse(thigh.text.trim()),
                bicep: double.tryParse(bicep.text.trim()),
              ),
            );
          },
          child: const Text('СОХРАНИТЬ'),
        ),
      ],
    );
  }

  Widget _row(String label, TextEditingController ctrl) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: TextField(
          controller: ctrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: label),
        ),
      );
}

class _GoalsDialog extends StatefulWidget {
  final BodyGoals? initial;
  const _GoalsDialog({this.initial});

  @override
  State<_GoalsDialog> createState() => _GoalsDialogState();
}

class _GoalsDialogState extends State<_GoalsDialog> {
  late final TextEditingController weight;
  late final TextEditingController chest;
  late final TextEditingController waist;
  late final TextEditingController hips;
  late final TextEditingController thigh;
  late final TextEditingController bicep;

  @override
  void initState() {
    super.initState();
    weight = TextEditingController(text: widget.initial?.weight?.toString() ?? '');
    chest = TextEditingController(text: widget.initial?.chest?.toString() ?? '');
    waist = TextEditingController(text: widget.initial?.waist?.toString() ?? '');
    hips = TextEditingController(text: widget.initial?.hips?.toString() ?? '');
    thigh = TextEditingController(text: widget.initial?.thigh?.toString() ?? '');
    bicep = TextEditingController(text: widget.initial?.bicep?.toString() ?? '');
  }

  @override
  void dispose() {
    weight.dispose();
    chest.dispose();
    waist.dispose();
    hips.dispose();
    thigh.dispose();
    bicep.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Целевые замеры'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _row('Вес, кг', weight),
            _row('Грудь, см', chest),
            _row('Талия, см', waist),
            _row('Бёдра, см', hips),
            _row('Бедро, см', thigh),
            _row('Бицепс, см', bicep),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Отмена'),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(
              context,
              BodyGoals(
                weight: double.tryParse(weight.text.trim()),
                chest: double.tryParse(chest.text.trim()),
                waist: double.tryParse(waist.text.trim()),
                hips: double.tryParse(hips.text.trim()),
                thigh: double.tryParse(thigh.text.trim()),
                bicep: double.tryParse(bicep.text.trim()),
              ),
            );
          },
          child: const Text('СОХРАНИТЬ'),
        ),
      ],
    );
  }

  Widget _row(String label, TextEditingController ctrl) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: TextField(
          controller: ctrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: label),
        ),
      );
}
