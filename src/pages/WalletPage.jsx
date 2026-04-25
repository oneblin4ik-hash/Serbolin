import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Target } from 'lucide-react';
import { useWalletStore } from '../store/useWalletStore';
import { useUiStore } from '../store/useUiStore';

const INCOME_CATS  = ['Клиент', 'Консультация', 'Реклама', 'Прочее'];
const EXPENSE_CATS = ['Реклама', 'Подписки', 'Еда', 'Транспорт', 'Зал', 'Прочее'];

function GoalModal({ current, onSave, onClose }) {
  const [val, setVal] = useState(current);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(parseInt(val)); }} className="space-y-4">
      <div>
        <label className="label">Цель дохода в месяц (₽)</label>
        <input className="input" type="number" value={val} onChange={(e) => setVal(e.target.value)} autoFocus />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 justify-center">Сохранить</button>
        <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Отмена</button>
      </div>
    </form>
  );
}

export default function WalletPage() {
  const { balance, goal, entries, addEntry, deleteEntry, setGoal } = useWalletStore();
  const { openModal, closeModal } = useUiStore();

  const [form, setForm] = useState({ type: 'income', cat: 'Клиент', amount: '', note: '' });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const thisMonth = new Date().toISOString().slice(0, 7);
  const income  = entries.filter((e) => e.type === 'income'  && e.date?.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
  const expense = entries.filter((e) => e.type === 'expense' && e.date?.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
  const pct = goal > 0 ? Math.min(100, Math.round((income / goal) * 100)) : 0;

  const handleAdd = () => {
    if (!form.amount) return;
    addEntry({ ...form, amount: parseInt(form.amount) });
    setForm((f) => ({ ...f, amount: '', note: '' }));
  };

  const handleSetGoal = () => openModal('Цель месяца',
    <GoalModal current={goal} onSave={(g) => { setGoal(g); closeModal(); }} onClose={closeModal} />
  );

  const monthLabel = new Date().toLocaleString('ru-RU', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black">Кошелёк</h1>
          <p className="text-sm text-text-muted mt-0.5">Доходы, расходы и финансовая цель</p>
        </div>
        <button onClick={handleSetGoal} className="btn-ghost">
          <Target className="h-4 w-4" /> Цель
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Balance */}
        <div className="card p-6 sm:col-span-1">
          <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Баланс</div>
          <div className="font-display text-4xl font-black tabular-nums text-text-primary">
            {balance.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-text-muted mt-2">
            Цель: <span className="text-brand-gold font-semibold">{goal.toLocaleString('ru-RU')} ₽</span> · {pct}%
          </div>
          <div className="mt-3 xp-bar-track h-1.5">
            <div className="xp-bar-fill h-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Income */}
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">
            Доход · {monthLabel}
          </div>
          <div className="flex items-end gap-2 mt-1">
            <TrendingUp className="h-5 w-5 text-accent-green mb-0.5" />
            <span className="font-display text-2xl font-black text-accent-green tabular-nums">
              +{income.toLocaleString('ru-RU')}
            </span>
          </div>
        </div>

        {/* Expense */}
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">
            Расход · {monthLabel}
          </div>
          <div className="flex items-end gap-2 mt-1">
            <TrendingDown className="h-5 w-5 text-accent-red mb-0.5" />
            <span className="font-display text-2xl font-black text-accent-red tabular-nums">
              −{expense.toLocaleString('ru-RU')}
            </span>
          </div>
        </div>
      </div>

      {/* Form + History */}
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">

        {/* Add entry form */}
        <div className="card p-5 space-y-4">
          <div className="text-[11px] uppercase tracking-widest text-text-muted">Новая запись</div>

          {/* Type toggle */}
          <div className="flex gap-2">
            {[['income', 'Доход', 'text-accent-green border-accent-green bg-accent-green/10'], ['expense', 'Расход', 'text-accent-red border-accent-red bg-accent-red/10']].map(([k, v, activeClass]) => (
              <button key={k} onClick={() => { setF('type', k); setF('cat', k === 'income' ? 'Клиент' : 'Реклама'); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  form.type === k ? activeClass : 'border-bg-border text-text-secondary hover:border-bg-hover'
                }`}>
                {v}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Категория</label>
            <select className="input" value={form.cat} onChange={(e) => setF('cat', e.target.value)}>
              {(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Сумма (₽)</label>
            <input className="input" type="number" placeholder="10 000" value={form.amount} onChange={(e) => setF('amount', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          </div>

          <div>
            <label className="label">Заметка</label>
            <input className="input" placeholder="Иван Иванов, за апрель..." value={form.note} onChange={(e) => setF('note', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          </div>

          <button onClick={handleAdd} className="btn-primary w-full justify-center">
            <Plus className="h-4 w-4" /> Добавить
          </button>
        </div>

        {/* History */}
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-widest text-text-muted mb-4">История</div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <Wallet className="h-10 w-10 mb-3" />
              <p className="text-sm">Нет записей</p>
            </div>
          ) : (
            <div className="space-y-0 max-h-[480px] overflow-y-auto divide-y divide-bg-border">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-3 group">
                  <span className="font-mono text-[11px] text-text-muted w-[88px] shrink-0 tabular-nums">{e.date}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{e.cat}</div>
                    {e.note && <div className="text-[11px] text-text-muted mt-0.5 truncate">{e.note}</div>}
                  </div>
                  <span className={`font-display text-base font-black tabular-nums shrink-0 ${e.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                    {e.type === 'income' ? '+' : '−'}{e.amount.toLocaleString('ru-RU')}
                  </span>
                  <button onClick={() => deleteEntry(e.id)} className="btn-ghost !p-1 opacity-0 group-hover:opacity-100 transition-opacity text-accent-red">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
