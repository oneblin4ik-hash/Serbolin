import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/client.dart';
import '../services/achievement_service.dart';
import '../services/supabase_service.dart';
import '../services/xp_service.dart';
import '../theme/app_theme.dart';
import 'shell_screen.dart';

class CrmScreen extends StatefulWidget {
  const CrmScreen({super.key});

  @override
  State<CrmScreen> createState() => _CrmScreenState();
}

class _CrmScreenState extends State<CrmScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('CRM'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'КЛИЕНТЫ'),
              Tab(text: 'ЛИДЫ'),
              Tab(text: 'ФИНАНСЫ'),
              Tab(text: 'ЗАДАЧИ'),
            ],
          ),
        ),
        body: const SafeArea(
          child: TabBarView(
            children: [
              _ClientsTab(),
              _LeadsTab(),
              _FinanceCrmTab(),
              _TasksTab(),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// CLIENTS
// ============================================================================

class _ClientsTab extends StatefulWidget {
  const _ClientsTab();

  @override
  State<_ClientsTab> createState() => _ClientsTabState();
}

class _ClientsTabState extends State<_ClientsTab> {
  List<Client> _all = const [];
  String _query = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await SupabaseService.instance.getClients();
    if (!mounted) return;
    setState(() {
      _all = list;
      _loading = false;
    });
  }

  Future<void> _edit({Client? existing}) async {
    final saved = await showDialog<Client>(
      context: context,
      builder: (ctx) => _ClientDialog(initial: existing),
    );
    if (saved == null) return;
    if (existing == null) {
      await SupabaseService.instance.insertClient(saved);
      if (mounted) {
        await context
            .read<XPService>()
            .addXP(amount: 100, source: 'crm', description: 'Новый клиент');
      }
    } else {
      await SupabaseService.instance.updateClient(
        Client(
          id: existing.id,
          userId: existing.userId,
          name: saved.name,
          contact: saved.contact,
          status: saved.status,
          notes: saved.notes,
        ),
      );
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }
    final filtered = _all
        .where((c) => c.name.toLowerCase().contains(_query.toLowerCase()))
        .toList();
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search),
                    hintText: 'Поиск по имени',
                    isDense: true,
                  ),
                  onChanged: (v) => setState(() => _query = v),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () => _edit(),
                icon: const Icon(Icons.add),
                label: const Text('ДОБАВИТЬ'),
              ),
            ],
          ),
        ),
        Expanded(
          child: filtered.isEmpty
              ? const Center(
                  child: Text('Клиентов пока нет',
                      style: TextStyle(color: AppColors.subtext)),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (ctx, i) {
                    final c = filtered[i];
                    return Card(
                      child: ListTile(
                        title: Text(
                          c.name,
                          style: const TextStyle(
                            color: AppColors.gold,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        subtitle: Text(
                          [
                            if (c.contact != null) c.contact,
                            if (c.notes != null) c.notes,
                          ].whereType<String>().join(' · '),
                          style: const TextStyle(color: AppColors.subtext),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(c.status,
                                style: const TextStyle(color: AppColors.gold)),
                            IconButton(
                              icon: const Icon(Icons.edit,
                                  color: AppColors.gold),
                              onPressed: () => _edit(existing: c),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline,
                                  color: AppColors.red),
                              onPressed: () async {
                                await SupabaseService.instance
                                    .deleteClient(c.id!);
                                await _load();
                              },
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _ClientDialog extends StatefulWidget {
  final Client? initial;
  const _ClientDialog({this.initial});

  @override
  State<_ClientDialog> createState() => _ClientDialogState();
}

class _ClientDialogState extends State<_ClientDialog> {
  late final TextEditingController name;
  late final TextEditingController contact;
  late final TextEditingController notes;
  String status = 'active';

  @override
  void initState() {
    super.initState();
    name = TextEditingController(text: widget.initial?.name ?? '');
    contact = TextEditingController(text: widget.initial?.contact ?? '');
    notes = TextEditingController(text: widget.initial?.notes ?? '');
    status = widget.initial?.status ?? 'active';
  }

  @override
  void dispose() {
    name.dispose();
    contact.dispose();
    notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.initial == null ? 'Новый клиент' : 'Клиент'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: name,
              decoration: const InputDecoration(labelText: 'Имя'),
              autofocus: true,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: contact,
              decoration: const InputDecoration(labelText: 'Контакт'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: notes,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Заметки'),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: status,
              decoration: const InputDecoration(labelText: 'Статус'),
              dropdownColor: AppColors.surface,
              items: const [
                DropdownMenuItem(value: 'active', child: Text('Активный')),
                DropdownMenuItem(value: 'paused', child: Text('Пауза')),
                DropdownMenuItem(value: 'archived', child: Text('Архив')),
              ],
              onChanged: (v) => setState(() => status = v ?? 'active'),
            ),
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
            if (name.text.trim().isEmpty) return;
            Navigator.pop(
              context,
              Client(
                name: name.text.trim(),
                contact: contact.text.trim().isEmpty ? null : contact.text.trim(),
                status: status,
                notes: notes.text.trim().isEmpty ? null : notes.text.trim(),
              ),
            );
          },
          child: const Text('СОХРАНИТЬ'),
        ),
      ],
    );
  }
}

// ============================================================================
// LEADS
// ============================================================================

class _LeadsTab extends StatefulWidget {
  const _LeadsTab();

  @override
  State<_LeadsTab> createState() => _LeadsTabState();
}

class _LeadsTabState extends State<_LeadsTab> {
  List<Lead> _all = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await SupabaseService.instance.getLeads();
    if (!mounted) return;
    setState(() {
      _all = list;
      _loading = false;
    });
  }

  Future<void> _edit({Lead? existing}) async {
    final saved = await showDialog<Lead>(
      context: context,
      builder: (ctx) => _LeadDialog(initial: existing),
    );
    if (saved == null) return;
    if (existing == null) {
      await SupabaseService.instance.insertLead(saved);
    } else {
      await SupabaseService.instance.updateLead(
        Lead(
          id: existing.id,
          userId: existing.userId,
          name: saved.name,
          source: saved.source,
          status: saved.status,
          notes: saved.notes,
        ),
      );
    }
    await _load();
  }

  Future<void> _convert(Lead l) async {
    await SupabaseService.instance.insertClient(Client(
      name: l.name,
      contact: l.source,
      notes: l.notes,
    ));
    if (l.id != null) {
      await SupabaseService.instance.deleteLead(l.id!);
    }
    if (mounted) {
      await context
          .read<XPService>()
          .addXP(amount: 100, source: 'crm', description: 'Новый клиент');
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton.icon(
              onPressed: () => _edit(),
              icon: const Icon(Icons.add),
              label: const Text('ДОБАВИТЬ ЛИД'),
            ),
          ),
        ),
        Expanded(
          child: _all.isEmpty
              ? const Center(
                  child: Text('Лидов пока нет',
                      style: TextStyle(color: AppColors.subtext)),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: _all.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (ctx, i) {
                    final l = _all[i];
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                _statusDot(l.status),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    l.name,
                                    style: const TextStyle(
                                      color: AppColors.gold,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit,
                                      color: AppColors.gold),
                                  onPressed: () => _edit(existing: l),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline,
                                      color: AppColors.red),
                                  onPressed: () async {
                                    if (l.id != null) {
                                      await SupabaseService.instance
                                          .deleteLead(l.id!);
                                    }
                                    await _load();
                                  },
                                ),
                              ],
                            ),
                            if (l.source != null)
                              Text('Источник: ${l.source}',
                                  style: const TextStyle(
                                      color: AppColors.subtext)),
                            if (l.notes != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(l.notes!,
                                    style: const TextStyle(
                                        color: AppColors.subtext)),
                              ),
                            const SizedBox(height: 8),
                            OutlinedButton.icon(
                              onPressed: () => _convert(l),
                              icon: const Icon(Icons.arrow_forward),
                              label: const Text('ПЕРЕВЕСТИ В КЛИЕНТЫ'),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _statusDot(String status) {
    Color c;
    String t;
    switch (status) {
      case 'hot':
        c = const Color(0xFF4CAF50);
        t = '🟢';
        break;
      case 'warm':
        c = const Color(0xFFFF9800);
        t = '🟡';
        break;
      default:
        c = AppColors.red;
        t = '🔴';
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(t, style: const TextStyle(fontSize: 14)),
        const SizedBox(width: 4),
        Text(status.toUpperCase(),
            style: TextStyle(color: c, fontWeight: FontWeight.w700, fontSize: 12)),
      ],
    );
  }
}

class _LeadDialog extends StatefulWidget {
  final Lead? initial;
  const _LeadDialog({this.initial});

  @override
  State<_LeadDialog> createState() => _LeadDialogState();
}

class _LeadDialogState extends State<_LeadDialog> {
  late final TextEditingController name;
  late final TextEditingController source;
  late final TextEditingController notes;
  String status = 'cold';

  @override
  void initState() {
    super.initState();
    name = TextEditingController(text: widget.initial?.name ?? '');
    source = TextEditingController(text: widget.initial?.source ?? '');
    notes = TextEditingController(text: widget.initial?.notes ?? '');
    status = widget.initial?.status ?? 'cold';
  }

  @override
  void dispose() {
    name.dispose();
    source.dispose();
    notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.initial == null ? 'Новый лид' : 'Лид'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: name,
              decoration: const InputDecoration(labelText: 'Имя'),
              autofocus: true,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: source,
              decoration: const InputDecoration(labelText: 'Источник'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: notes,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Заметки'),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: status,
              decoration: const InputDecoration(labelText: 'Температура'),
              dropdownColor: AppColors.surface,
              items: const [
                DropdownMenuItem(value: 'cold', child: Text('🔴 Холодный')),
                DropdownMenuItem(value: 'warm', child: Text('🟡 Тёплый')),
                DropdownMenuItem(value: 'hot', child: Text('🟢 Горячий')),
              ],
              onChanged: (v) => setState(() => status = v ?? 'cold'),
            ),
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
            if (name.text.trim().isEmpty) return;
            Navigator.pop(
              context,
              Lead(
                name: name.text.trim(),
                source: source.text.trim().isEmpty ? null : source.text.trim(),
                status: status,
                notes: notes.text.trim().isEmpty ? null : notes.text.trim(),
              ),
            );
          },
          child: const Text('СОХРАНИТЬ'),
        ),
      ],
    );
  }
}

// ============================================================================
// FINANCE (CRM)
// ============================================================================

class _FinanceCrmTab extends StatefulWidget {
  const _FinanceCrmTab();

  @override
  State<_FinanceCrmTab> createState() => _FinanceCrmTabState();
}

class _FinanceCrmTabState extends State<_FinanceCrmTab> {
  List<Transaction> _list = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await SupabaseService.instance.getTransactions();
    if (!mounted) return;
    setState(() {
      _list = list;
      _loading = false;
    });
  }

  Future<void> _add() async {
    final saved = await showDialog<Transaction>(
      context: context,
      builder: (ctx) => const _TxDialog(),
    );
    if (saved == null) return;
    await SupabaseService.instance.insertTransaction(saved);
    if (mounted) {
      final xp = context.read<XPService>();
      await xp.addXP(amount: 15, source: 'finance', description: 'Транзакция');
      if (saved.type == 'income') {
        final now = DateTime.now();
        final monthStart = DateTime(now.year, now.month, 1);
        final month = await SupabaseService.instance
            .getTransactions(from: monthStart);
        final totalIncome = month
            .where((t) => t.type == 'income')
            .fold<double>(0, (acc, t) => acc + t.amount);
        if (mounted) {
          await context
              .read<AchievementService>()
              .checkIncome(totalIncome);
        }
      }
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }

    final now = DateTime.now();
    final monthStart = DateTime(now.year, now.month, 1);
    double income = 0;
    double expense = 0;
    for (final t in _list) {
      if (t.date.isBefore(monthStart)) continue;
      if (t.type == 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    }

    final grouped = <String, List<Transaction>>{};
    for (final t in _list) {
      final k = DateFormat('yyyy-MM-dd').format(t.date);
      grouped.putIfAbsent(k, () => []).add(t);
    }
    final keys = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(child: _miniCard('ДОХОД', income, AppColors.gold)),
              const SizedBox(width: 8),
              Expanded(child: _miniCard('РАСХОД', expense, AppColors.red)),
              const SizedBox(width: 8),
              Expanded(
                child: _miniCard(
                  'БАЛАНС',
                  income - expense,
                  income >= expense ? AppColors.gold : AppColors.red,
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton.icon(
              onPressed: _add,
              icon: const Icon(Icons.add),
              label: const Text('ТРАНЗАКЦИЯ'),
            ),
          ),
        ),
        Expanded(
          child: keys.isEmpty
              ? const Center(
                  child: Text('Ещё нет транзакций',
                      style: TextStyle(color: AppColors.subtext)),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: keys.length,
                  itemBuilder: (ctx, i) {
                    final key = keys[i];
                    final items = grouped[key]!;
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Padding(
                          padding:
                              const EdgeInsets.only(top: 8, bottom: 4),
                          child: Text(
                            DateFormat('dd MMMM yyyy', 'ru')
                                .format(DateTime.parse(key)),
                            style: const TextStyle(
                              color: AppColors.subtext,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                        ...items.map(
                          (t) => Card(
                            child: ListTile(
                              leading: Icon(
                                t.type == 'income'
                                    ? Icons.trending_up
                                    : Icons.trending_down,
                                color: t.type == 'income'
                                    ? AppColors.gold
                                    : AppColors.red,
                              ),
                              title: Text(t.category ?? t.type,
                                  style: const TextStyle(color: AppColors.text)),
                              subtitle: t.note == null
                                  ? null
                                  : Text(t.note!,
                                      style: const TextStyle(
                                          color: AppColors.subtext)),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '${t.type == 'income' ? '+' : '-'}${NumberFormat.decimalPattern('ru').format(t.amount)}',
                                    style: TextStyle(
                                      color: t.type == 'income'
                                          ? AppColors.gold
                                          : AppColors.red,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline,
                                        color: AppColors.subtext),
                                    onPressed: () async {
                                      if (t.id == null) return;
                                      await SupabaseService.instance
                                          .deleteTransaction(t.id!);
                                      await _load();
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _miniCard(String label, double value, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(color: AppColors.subtext, fontSize: 11)),
            const SizedBox(height: 4),
            Text(
              NumberFormat.decimalPattern('ru').format(value),
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w800,
                fontSize: 16,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _TxDialog extends StatefulWidget {
  const _TxDialog();

  @override
  State<_TxDialog> createState() => _TxDialogState();
}

class _TxDialogState extends State<_TxDialog> {
  String type = 'income';
  final amount = TextEditingController();
  final category = TextEditingController();
  final note = TextEditingController();
  DateTime date = DateTime.now();

  @override
  void dispose() {
    amount.dispose();
    category.dispose();
    note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Транзакция'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Доход'),
                    selected: type == 'income',
                    onSelected: (_) => setState(() => type = 'income'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Расход'),
                    selected: type == 'expense',
                    onSelected: (_) => setState(() => type = 'expense'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: amount,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Сумма'),
              autofocus: true,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: category,
              decoration: const InputDecoration(labelText: 'Категория'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: note,
              decoration: const InputDecoration(labelText: 'Заметка'),
            ),
            const SizedBox(height: 10),
            InkWell(
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: date,
                  firstDate: DateTime(2020),
                  lastDate: DateTime(2035),
                );
                if (picked != null) setState(() => date = picked);
              },
              child: InputDecorator(
                decoration: const InputDecoration(labelText: 'Дата'),
                child: Text(DateFormat('dd.MM.yyyy').format(date)),
              ),
            ),
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
            final a = double.tryParse(amount.text.replaceAll(',', '.'));
            if (a == null || a <= 0) return;
            Navigator.pop(
              context,
              Transaction(
                type: type,
                amount: a,
                category: category.text.trim().isEmpty
                    ? null
                    : category.text.trim(),
                note: note.text.trim().isEmpty ? null : note.text.trim(),
                date: date,
              ),
            );
          },
          child: const Text('СОХРАНИТЬ'),
        ),
      ],
    );
  }
}

// ============================================================================
// TASKS
// ============================================================================

class _TasksTab extends StatefulWidget {
  const _TasksTab();

  @override
  State<_TasksTab> createState() => _TasksTabState();
}

class _TasksTabState extends State<_TasksTab> {
  List<TaskItem> _list = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await SupabaseService.instance.getTasks();
    if (!mounted) return;
    setState(() {
      _list = list;
      _loading = false;
    });
  }

  Future<void> _add() async {
    final saved = await showDialog<TaskItem>(
      context: context,
      builder: (ctx) => const _TaskDialog(),
    );
    if (saved == null) return;
    await SupabaseService.instance.insertTask(saved);
    await _load();
  }

  Future<void> _toggle(TaskItem t, bool done) async {
    final updated = TaskItem(
      id: t.id,
      userId: t.userId,
      title: t.title,
      xpReward: t.xpReward,
      isCompleted: done,
      completedAt: done ? DateTime.now() : null,
    );
    await SupabaseService.instance.updateTask(updated);
    if (done && !t.isCompleted && t.xpReward > 0 && mounted) {
      await context.read<XPService>().addXP(
            amount: t.xpReward,
            source: 'task',
            description: t.title,
          );
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.gold),
      );
    }
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton.icon(
              onPressed: _add,
              icon: const Icon(Icons.add),
              label: const Text('ДОБАВИТЬ'),
            ),
          ),
        ),
        Expanded(
          child: _list.isEmpty
              ? const Center(
                  child: Text('Задач нет',
                      style: TextStyle(color: AppColors.subtext)),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: _list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 6),
                  itemBuilder: (ctx, i) {
                    final t = _list[i];
                    return Card(
                      child: CheckboxListTile(
                        value: t.isCompleted,
                        onChanged: (v) => _toggle(t, v ?? false),
                        activeColor: AppColors.gold,
                        checkColor: AppColors.background,
                        controlAffinity: ListTileControlAffinity.leading,
                        title: Text(
                          t.title,
                          style: TextStyle(
                            color: t.isCompleted
                                ? AppColors.subtext
                                : AppColors.text,
                            decoration: t.isCompleted
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                        subtitle: t.xpReward > 0
                            ? Text('+${t.xpReward} XP',
                                style: const TextStyle(color: AppColors.gold))
                            : null,
                        secondary: IconButton(
                          icon: const Icon(Icons.delete_outline,
                              color: AppColors.subtext),
                          onPressed: () async {
                            if (t.id == null) return;
                            await SupabaseService.instance.deleteTask(t.id!);
                            await _load();
                          },
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _TaskDialog extends StatefulWidget {
  const _TaskDialog();

  @override
  State<_TaskDialog> createState() => _TaskDialogState();
}

class _TaskDialogState extends State<_TaskDialog> {
  final title = TextEditingController();
  final xp = TextEditingController(text: '0');

  @override
  void dispose() {
    title.dispose();
    xp.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Новая задача'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: title,
            decoration: const InputDecoration(labelText: 'Название'),
            autofocus: true,
          ),
          const SizedBox(height: 10),
          TextField(
            controller: xp,
            keyboardType: TextInputType.number,
            decoration:
                const InputDecoration(labelText: 'XP (опционально)'),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Отмена'),
        ),
        ElevatedButton(
          onPressed: () {
            if (title.text.trim().isEmpty) return;
            Navigator.pop(
              context,
              TaskItem(
                title: title.text.trim(),
                xpReward: int.tryParse(xp.text.trim()) ?? 0,
              ),
            );
          },
          child: const Text('СОХРАНИТЬ'),
        ),
      ],
    );
  }
}
