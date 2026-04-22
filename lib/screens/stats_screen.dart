import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/achievement_service.dart';
import '../services/quest_service.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../utils/content_ideas.dart';
import 'shell_screen.dart';

enum StatsTab { general, body, content, finance }

class StatsScreen extends StatefulWidget {
  const StatsScreen({super.key});

  /// Позволяет другим экранам переключить активную вкладку.
  static final ValueNotifier<StatsTab> selectedTab =
      ValueNotifier<StatsTab>(StatsTab.general);

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: StatsTab.values.length,
      vsync: this,
      initialIndex: StatsScreen.selectedTab.value.index,
    );
    StatsScreen.selectedTab.addListener(_onExternalTab);
  }

  void _onExternalTab() {
    final next = StatsScreen.selectedTab.value.index;
    if (_tabController.index != next) {
      _tabController.animateTo(next);
    }
  }

  @override
  void dispose() {
    StatsScreen.selectedTab.removeListener(_onExternalTab);
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('СТАТИСТИКА'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'ОБЩЕЕ'),
            Tab(text: 'ТЕЛО'),
            Tab(text: 'КОНТЕНТ'),
            Tab(text: 'ФИНАНСЫ'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: const [
            _GeneralTab(),
            _BodyTab(),
            _ContentTab(),
            _FinanceTab(),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// GENERAL
// ============================================================================

class _GeneralTab extends StatefulWidget {
  const _GeneralTab();

  @override
  State<_GeneralTab> createState() => _GeneralTabState();
}

class _GeneralTabState extends State<_GeneralTab> {
  List<MapEntry<DateTime, int>> _xpByDay = const [];
  int _workoutsMonth = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final svc = SupabaseService.instance;
    final from = DateTime.now().subtract(const Duration(days: 30));
    final log = await svc.getXPLog(from: from);
    final grouped = <DateTime, int>{};
    for (var i = 0; i <= 30; i++) {
      final d = DateTime(from.year, from.month, from.day + i);
      grouped[DateTime(d.year, d.month, d.day)] = 0;
    }
    for (final row in log) {
      final dt = DateTime.parse(row['created_at'] as String).toLocal();
      final key = DateTime(dt.year, dt.month, dt.day);
      grouped[key] = (grouped[key] ?? 0) + (row['amount'] as num).toInt();
    }
    final entries = grouped.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));

    final monthStart = DateTime(DateTime.now().year, DateTime.now().month, 1);
    final workouts = await svc.getWorkouts(from: monthStart);

    if (!mounted) return;
    setState(() {
      _xpByDay = entries;
      _workoutsMonth = workouts.length;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }
    final spots = <FlSpot>[];
    for (var i = 0; i < _xpByDay.length; i++) {
      spots.add(FlSpot(i.toDouble(), _xpByDay[i].value.toDouble()));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(
          title: 'XP за 30 дней',
          child: SizedBox(
            height: 220,
            child: spots.isEmpty
                ? const Center(
                    child: Text('Нет данных',
                        style: TextStyle(color: AppColors.subtext)),
                  )
                : LineChart(
                    LineChartData(
                      minY: 0,
                      gridData: FlGridData(
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (_) => const FlLine(
                          color: AppColors.divider,
                          strokeWidth: 0.5,
                        ),
                      ),
                      titlesData: const FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 36,
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        topTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        rightTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: spots,
                          isCurved: true,
                          color: AppColors.gold,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(
                            show: true,
                            color: AppColors.gold.withOpacity(0.15),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'Тепловая карта активности (30 дней)',
          child: _Heatmap(entries: _xpByDay),
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'Тренировок в этом месяце',
          child: Text(
            _workoutsMonth.toString(),
            style: AppTheme.hero.copyWith(fontSize: 48),
          ),
        ),
      ],
    );
  }
}

class _Heatmap extends StatelessWidget {
  final List<MapEntry<DateTime, int>> entries;
  const _Heatmap({required this.entries});

  Color _color(int xp) {
    if (xp <= 0) return AppColors.background;
    if (xp < 50) return AppColors.gold.withOpacity(0.25);
    if (xp < 150) return AppColors.gold.withOpacity(0.5);
    if (xp < 300) return AppColors.gold.withOpacity(0.75);
    return AppColors.gold;
  }

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) {
      return const Text('Нет данных',
          style: TextStyle(color: AppColors.subtext));
    }
    return Wrap(
      spacing: 4,
      runSpacing: 4,
      children: entries
          .map(
            (e) => Tooltip(
              message:
                  '${DateFormat('dd.MM').format(e.key)} · ${e.value} XP',
              child: Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: _color(e.value),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppColors.divider),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

// ============================================================================
// BODY
// ============================================================================

class _BodyTab extends StatefulWidget {
  const _BodyTab();

  @override
  State<_BodyTab> createState() => _BodyTabState();
}

class _BodyTabState extends State<_BodyTab> {
  List<Map<String, dynamic>> _points = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final stats = await SupabaseService.instance.getBodyStats();
    final sorted = [...stats]..sort((a, b) => a.date.compareTo(b.date));
    if (!mounted) return;
    setState(() {
      _points = sorted
          .map((s) => {
                'date': s.date,
                'weight': s.weight,
                'chest': s.chest,
                'bicep': s.bicep,
                'thigh': s.thigh,
              })
          .toList();
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }
    if (_points.isEmpty) {
      return const Center(
        child: Text('Нет данных по телу',
            style: TextStyle(color: AppColors.subtext)),
      );
    }

    List<FlSpot> series(String key) {
      final list = <FlSpot>[];
      for (var i = 0; i < _points.length; i++) {
        final v = _points[i][key];
        if (v is num) list.add(FlSpot(i.toDouble(), v.toDouble()));
      }
      return list;
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(
          title: 'Вес',
          child: SizedBox(
            height: 220,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) => const FlLine(
                    color: AppColors.divider,
                    strokeWidth: 0.5,
                  ),
                ),
                titlesData: const FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 36,
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: series('weight'),
                    isCurved: true,
                    color: AppColors.gold,
                    barWidth: 2,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      color: AppColors.gold.withOpacity(0.15),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'Замеры',
          subtitle: 'Бицепс · Грудь · Бедро',
          child: SizedBox(
            height: 260,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) => const FlLine(
                    color: AppColors.divider,
                    strokeWidth: 0.5,
                  ),
                ),
                titlesData: const FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 36,
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: series('bicep'),
                    color: AppColors.gold,
                    barWidth: 2,
                    isCurved: true,
                    dotData: const FlDotData(show: false),
                  ),
                  LineChartBarData(
                    spots: series('chest'),
                    color: AppColors.red,
                    barWidth: 2,
                    isCurved: true,
                    dotData: const FlDotData(show: false),
                  ),
                  LineChartBarData(
                    spots: series('thigh'),
                    color: AppColors.text,
                    barWidth: 2,
                    isCurved: true,
                    dotData: const FlDotData(show: false),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        const _Legend(items: [
          ('Бицепс', AppColors.gold),
          ('Грудь', AppColors.red),
          ('Бедро', AppColors.text),
        ]),
      ],
    );
  }
}

class _Legend extends StatelessWidget {
  final List<(String, Color)> items;
  const _Legend({required this.items});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 14,
      runSpacing: 6,
      children: items
          .map(
            (e) => Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 12, height: 12, color: e.$2),
                const SizedBox(width: 6),
                Text(e.$1, style: const TextStyle(color: AppColors.subtext)),
              ],
            ),
          )
          .toList(),
    );
  }
}

// ============================================================================
// CONTENT
// ============================================================================

class _ContentTab extends StatefulWidget {
  const _ContentTab();

  @override
  State<_ContentTab> createState() => _ContentTabState();
}

class _ContentTabState extends State<_ContentTab> {
  List<Map<String, dynamic>> _stats = const [];
  bool _loading = true;
  final _reels = TextEditingController();
  final _posts = TextEditingController();
  final _subs = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _reels.dispose();
    _posts.dispose();
    _subs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final rows = await SupabaseService.instance.getContentStats();
    if (!mounted) return;
    setState(() {
      _stats = rows;
      _loading = false;
    });
  }

  Future<void> _save() async {
    final reels = int.tryParse(_reels.text.trim()) ?? 0;
    final posts = int.tryParse(_posts.text.trim()) ?? 0;
    final subs = int.tryParse(_subs.text.trim()) ?? 0;
    await SupabaseService.instance.upsertContentStat(
      month: DateTime.now(),
      reels: reels,
      posts: posts,
      subscribers: subs,
    );
    _reels.clear();
    _posts.clear();
    _subs.clear();
    await _load();

    // Ачивка «Контент-машина» при достижении 100 публикаций суммарно.
    if (!mounted) return;
    final totalPubs = _stats.fold<int>(0, (acc, row) {
      final r = (row['reels'] as num?)?.toInt() ?? 0;
      final p = (row['posts'] as num?)?.toInt() ?? 0;
      return acc + r + p;
    });
    await context.read<AchievementService>().checkContent(totalPubs);
  }

  int get _totalReels =>
      _stats.fold<int>(0, (a, r) => a + ((r['reels'] as num?)?.toInt() ?? 0));

  int get _totalPosts =>
      _stats.fold<int>(0, (a, r) => a + ((r['posts'] as num?)?.toInt() ?? 0));

  int get _latestSubs {
    if (_stats.isEmpty) return 0;
    return (_stats.last['subscribers'] as num?)?.toInt() ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }
    final subsSpots = <FlSpot>[];
    for (var i = 0; i < _stats.length; i++) {
      final v = _stats[i]['subscribers'] as num?;
      if (v != null) subsSpots.add(FlSpot(i.toDouble(), v.toDouble()));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: _countCard('📹 REELS', _totalReels)),
            const SizedBox(width: 8),
            Expanded(child: _countCard('📝 ПОСТЫ', _totalPosts)),
            const SizedBox(width: 8),
            Expanded(child: _countCard('👥 ПОДПИСЧИКИ', _latestSubs)),
          ],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'Контент — текущий месяц',
          subtitle: 'Обновить значения за ${DateFormat.MMMM('ru').format(DateTime.now())}',
          child: Column(
            children: [
              TextField(
                controller: _reels,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Reels Instagram',
                  prefixIcon: Icon(Icons.video_camera_back_outlined,
                      color: AppColors.gold),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _posts,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Посты Telegram',
                  prefixIcon: Icon(Icons.telegram, color: AppColors.gold),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _subs,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Подписчики (суммарно)',
                  prefixIcon: Icon(Icons.group_outlined,
                      color: AppColors.gold),
                ),
              ),
              const SizedBox(height: 14),
              ElevatedButton(
                onPressed: _save,
                child: const Text('СОХРАНИТЬ'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: '💡 Генератор идей',
          subtitle: 'Темы постов Telegram и сценарии Reels Instagram',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              OutlinedButton.icon(
                icon: const Icon(Icons.auto_awesome),
                label: const Text('ОТКРЫТЬ ГЕНЕРАТОР'),
                onPressed: () => _openIdeaGenerator(context),
              ),
              const SizedBox(height: 8),
              const Text(
                'Нажми — получишь свежую идею для Reel или поста. Можно сохранить как квест на сегодня.',
                style: TextStyle(color: AppColors.subtext, fontSize: 12),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'Подписчики по месяцам',
          child: SizedBox(
            height: 240,
            child: subsSpots.isEmpty
                ? const Center(
                    child: Text('Нет данных',
                        style: TextStyle(color: AppColors.subtext)),
                  )
                : LineChart(
                    LineChartData(
                      gridData: FlGridData(
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (_) => const FlLine(
                          color: AppColors.divider,
                          strokeWidth: 0.5,
                        ),
                      ),
                      titlesData: const FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 40,
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        topTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        rightTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: subsSpots,
                          color: AppColors.gold,
                          isCurved: true,
                          barWidth: 3,
                          belowBarData: BarAreaData(
                            show: true,
                            color: AppColors.gold.withOpacity(0.2),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  void _openIdeaGenerator(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (_) => const IdeaGeneratorDialog(),
    );
  }

  Widget _countCard(String label, int value) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: AppColors.subtext,
                letterSpacing: 1.5,
                fontSize: 10,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              NumberFormat.decimalPattern('ru').format(value),
              style: const TextStyle(
                color: AppColors.gold,
                fontWeight: FontWeight.w800,
                fontSize: 20,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// IDEA GENERATOR DIALOG
// ============================================================================

class IdeaGeneratorDialog extends StatefulWidget {
  const IdeaGeneratorDialog({super.key});

  @override
  State<IdeaGeneratorDialog> createState() => _IdeaGeneratorDialogState();
}

class _IdeaGeneratorDialogState extends State<IdeaGeneratorDialog>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  ContentIdea? _current;
  bool _isReel = false;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _tabs.addListener(_onTab);
    _generate();
  }

  void _onTab() {
    if (!_tabs.indexIsChanging && _tabs.previousIndex != _tabs.index) {
      _generate();
    }
  }

  @override
  void dispose() {
    _tabs.removeListener(_onTab);
    _tabs.dispose();
    super.dispose();
  }

  void _generate() {
    setState(() {
      _isReel = _tabs.index == 1;
      _current = _isReel
          ? ContentIdeas.randomReel()
          : ContentIdeas.randomTelegramPost();
    });
  }

  Future<void> _copyToClipboard() async {
    if (_current == null) return;
    await Clipboard.setData(ClipboardData(text: _current!.fullText));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Скопировано в буфер обмена'),
        backgroundColor: AppColors.surfaceElevated,
      ),
    );
  }

  Future<void> _saveAsQuest() async {
    if (_current == null) return;
    final prefix = _isReel ? 'Снять Reel: ' : 'Написать пост: ';
    final xp = _isReel ? 60 : 40;
    await context.read<QuestService>().addCustomQuest(
          title: '$prefix${_current!.title}',
          xp: xp,
        );
    if (!mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Квест добавлен: +$xp XP за выполнение'),
        backgroundColor: AppColors.surfaceElevated,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.surface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 48),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 12, 0),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'ГЕНЕРАТОР ИДЕЙ',
                      style: TextStyle(
                        color: AppColors.gold,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 3,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.subtext),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            TabBar(
              controller: _tabs,
              tabs: const [
                Tab(text: 'TELEGRAM ПОСТ'),
                Tab(text: 'INSTAGRAM REEL'),
              ],
            ),
            const Divider(height: 1, color: AppColors.divider),
            Padding(
              padding: const EdgeInsets.all(20),
              child: _current == null
                  ? const SizedBox(height: 120)
                  : _IdeaCard(idea: _current!, isReel: _isReel),
            ),
            const Divider(height: 1, color: AppColors.divider),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ElevatedButton.icon(
                    onPressed: _generate,
                    icon: const Icon(Icons.refresh),
                    label: const Text('СЛЕДУЮЩАЯ ИДЕЯ'),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _copyToClipboard,
                          icon: const Icon(Icons.copy_outlined),
                          label: const Text('КОПИРОВАТЬ'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _saveAsQuest,
                          icon: const Icon(Icons.flag_outlined),
                          label: const Text('В КВЕСТ'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _IdeaCard extends StatelessWidget {
  final ContentIdea idea;
  final bool isReel;
  const _IdeaCard({required this.idea, required this.isReel});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(isReel ? '🎬' : '✍️',
                style: const TextStyle(fontSize: 22)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                idea.title,
                style: const TextStyle(
                  color: AppColors.text,
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.divider),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: idea.structure
                .map(
                  (part) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          color: AppColors.text,
                          fontSize: 13,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(
                            text: '${part.$1}: ',
                            style: const TextStyle(
                              color: AppColors.gold,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          TextSpan(text: part.$2),
                        ],
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
        if (idea.tags.isNotEmpty) ...[
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: idea.tags
                .map((t) => Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                            color: AppColors.gold.withOpacity(0.4)),
                      ),
                      child: Text(
                        '#$t',
                        style: const TextStyle(
                          color: AppColors.gold,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ))
                .toList(),
          ),
        ],
      ],
    );
  }
}

// ============================================================================
// FINANCE
// ============================================================================

class _FinanceTab extends StatefulWidget {
  const _FinanceTab();

  @override
  State<_FinanceTab> createState() => _FinanceTabState();
}

class _FinanceTabState extends State<_FinanceTab> {
  List<Map<String, double>> _byMonth = const [];
  double _monthIncome = 0;
  double _monthExpense = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final from = DateTime.now().subtract(const Duration(days: 365));
    final list = await SupabaseService.instance.getTransactions(from: from);
    final grouped = <String, Map<String, double>>{};
    for (final t in list) {
      final key = DateFormat('yyyy-MM').format(t.date);
      grouped.putIfAbsent(
          key, () => {'income': 0, 'expense': 0, 'ts': 0});
      if (t.type == 'income') {
        grouped[key]!['income'] = grouped[key]!['income']! + t.amount;
      } else {
        grouped[key]!['expense'] = grouped[key]!['expense']! + t.amount;
      }
      grouped[key]!['ts'] =
          DateTime(t.date.year, t.date.month, 1).millisecondsSinceEpoch.toDouble();
    }
    final sortedKeys = grouped.keys.toList()..sort();
    final chart = sortedKeys.map((k) => grouped[k]!).toList();

    final now = DateTime.now();
    final monthKey = DateFormat('yyyy-MM').format(now);
    if (!mounted) return;
    setState(() {
      _byMonth = chart;
      _monthIncome = grouped[monthKey]?['income'] ?? 0;
      _monthExpense = grouped[monthKey]?['expense'] ?? 0;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }
    final bars = <BarChartGroupData>[];
    for (var i = 0; i < _byMonth.length; i++) {
      final m = _byMonth[i];
      bars.add(
        BarChartGroupData(
          x: i,
          barRods: [
            BarChartRodData(
              toY: m['income'] ?? 0,
              color: AppColors.gold,
              width: 12,
              borderRadius: BorderRadius.circular(3),
            ),
            BarChartRodData(
              toY: m['expense'] ?? 0,
              color: AppColors.red,
              width: 12,
              borderRadius: BorderRadius.circular(3),
            ),
          ],
        ),
      );
    }

    final balance = _monthIncome - _monthExpense;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: _moneyCard('ДОХОД', _monthIncome, AppColors.gold)),
            const SizedBox(width: 8),
            Expanded(child: _moneyCard('РАСХОД', _monthExpense, AppColors.red)),
            const SizedBox(width: 8),
            Expanded(
              child: _moneyCard(
                'БАЛАНС',
                balance,
                balance >= 0 ? AppColors.gold : AppColors.red,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'По месяцам',
          child: SizedBox(
            height: 240,
            child: bars.isEmpty
                ? const Center(
                    child: Text('Нет транзакций',
                        style: TextStyle(color: AppColors.subtext)),
                  )
                : BarChart(
                    BarChartData(
                      barGroups: bars,
                      gridData: FlGridData(
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (_) => const FlLine(
                          color: AppColors.divider,
                          strokeWidth: 0.5,
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      titlesData: const FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 40,
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        topTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        rightTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                      ),
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _moneyCard(String label, double value, Color color) {
    final formatted = NumberFormat.decimalPattern('ru').format(value);
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: AppColors.subtext,
                letterSpacing: 1.5,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              formatted,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w800,
                fontSize: 18,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
