import 'package:flutter/material.dart';

import '../models/quest.dart';
import '../theme/app_theme.dart';

class QuestCard extends StatelessWidget {
  final Quest quest;
  final ValueChanged<bool> onToggle;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const QuestCard({
    super.key,
    required this.quest,
    required this.onToggle,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final done = quest.isCompleted;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: done
            ? AppColors.surface.withOpacity(0.6)
            : AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: done
              ? AppColors.gold.withOpacity(0.4)
              : AppColors.divider,
        ),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: () => onToggle(!done),
            borderRadius: BorderRadius.circular(6),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: done ? AppColors.gold : Colors.transparent,
                border: Border.all(
                  color: done ? AppColors.gold : AppColors.subtext,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(6),
              ),
              child: done
                  ? const Icon(Icons.check,
                      size: 18, color: AppColors.background)
                  : null,
            ),
          ),
          const SizedBox(width: 12),
          Text(
            quest.branch.emoji,
            style: const TextStyle(fontSize: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  quest.title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: done ? AppColors.subtext : AppColors.text,
                    decoration: done ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  quest.branch.label,
                  style: AppTheme.subtitle.copyWith(fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: AppColors.gold.withOpacity(0.5)),
            ),
            child: Text(
              '+${quest.xpReward} XP',
              style: const TextStyle(
                color: AppColors.gold,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
          if (onEdit != null && quest.isCustom && !done)
            IconButton(
              icon: const Icon(Icons.edit_outlined,
                  size: 18, color: AppColors.gold),
              onPressed: onEdit,
              tooltip: 'Редактировать',
              visualDensity: VisualDensity.compact,
            ),
          if (onDelete != null && quest.isCustom)
            IconButton(
              icon: const Icon(Icons.close,
                  size: 18, color: AppColors.subtext),
              onPressed: onDelete,
              tooltip: 'Удалить',
              visualDensity: VisualDensity.compact,
            ),
        ],
      ),
    );
  }
}
