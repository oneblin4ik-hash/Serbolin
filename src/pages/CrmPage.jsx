import { useState } from 'react';
import { Plus, Users, Pencil, Trash2, ChevronDown, ChevronUp, Phone, MessageCircle, DollarSign, Calendar } from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { useUiStore } from '../store/useUiStore';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

const GOALS = ['Набор массы', 'Похудение', 'Рельеф', 'Сила', 'Поддержание формы', 'Реабилитация', 'Общая физподготовка'];
const LEVELS = ['Новичок', 'Средний', 'Опытный', 'Про'];

function ClientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '', phone: '', telegram: '', city: '', goal: '', level: 'Новичок', monthlyAmount: '', note: '',
    ...(initial || {}),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Имя клиента</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required autoFocus placeholder="Иван Иванов" />
        </div>
        <div>
          <label className="label">Телефон</label>
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 999 123-45-67" />
        </div>
        <div>
          <label className="label">Telegram</label>
          <input className="input" value={form.telegram} onChange={(e) => set('telegram', e.target.value)} placeholder="@username" />
        </div>
        <div>
          <label className="label">Город</label>
          <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Москва" />
        </div>
        <div>
          <label className="label">Сумма в месяц (₽)</label>
          <input className="input" type="number" value={form.monthlyAmount} onChange={(e) => set('monthlyAmount', e.target.value)} placeholder="10000" />
        </div>
        <div>
          <label className="label">Цель</label>
          <select className="input" value={form.goal} onChange={(e) => set('goal', e.target.value)}>
            <option value="">— Выбери —</option>
            {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Уровень подготовки</label>
          <select className="input" value={form.level} onChange={(e) => set('level', e.target.value)}>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Заметка</label>
          <textarea className="input resize-none" rows={2} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Особенности, противопоказания, пожелания..." />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 justify-center">Сохранить</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-ghost flex-1 justify-center">Отмена</button>}
      </div>
    </form>
  );
}

function PaymentForm({ onSave, onCancel }) {
  const [amount, setAmount] = useState('');
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote]     = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ amount, date, note }); }} className="space-y-3">
      <div>
        <label className="label">Сумма (₽)</label>
        <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus placeholder="10000" />
      </div>
      <div>
        <label className="label">Дата оплаты</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label className="label">Комментарий</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="За апрель, предоплата..." />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 justify-center">Добавить</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-ghost flex-1 justify-center">Отмена</button>}
      </div>
    </form>
  );
}

function ClientCard({ client }) {
  const [open, setOpen]   = useState(false);
  const { updateClient, deleteClient, addPayment, deletePayment } = useCrmStore();
  const { openModal, closeModal } = useUiStore();

  const lastPayment = client.payments?.[0];
  const daysSince   = lastPayment ? differenceInDays(new Date(), parseISO(lastPayment.date)) : null;
  const totalPaid   = (client.payments || []).reduce((s, p) => s + (p.amount || 0), 0);

  const statusColor = daysSince === null ? 'text-text-muted'
    : daysSince > 35 ? 'text-accent-red'
    : daysSince > 25 ? 'text-accent-amber'
    : 'text-accent-green';

  const handleEdit = () => openModal('Редактировать клиента',
    <ClientForm initial={client} onSave={(data) => { updateClient(client.id, data); closeModal(); }} onCancel={closeModal} />
  );

  const handleAddPayment = () => openModal('Добавить оплату',
    <PaymentForm onSave={(data) => { addPayment(client.id, data); closeModal(); }} onCancel={closeModal} />
  );

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/10 font-display font-black text-brand-gold text-sm">
          {client.name?.charAt(0)?.toUpperCase() || 'K'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{client.name}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleEdit} className="btn-ghost !p-1.5"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => window.confirm('Удалить клиента?') && deleteClient(client.id)} className="btn-ghost !p-1.5 text-accent-red"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {client.goal && <span className="text-[11px] text-text-muted">{client.goal}</span>}
            {client.level && <span className="text-[11px] bg-bg-hover px-2 py-0.5 rounded-full text-text-secondary">{client.level}</span>}
            {client.monthlyAmount && (
              <span className="text-[11px] font-semibold text-accent-green">
                {parseFloat(client.monthlyAmount).toLocaleString('ru')} ₽/мес
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-text-muted">
            {client.phone && (
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>
            )}
            {client.telegram && (
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{client.telegram}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className={`text-[11px] font-medium flex items-center gap-1 ${statusColor}`}>
              <Calendar className="h-3 w-3" />
              {lastPayment
                ? `Оплата ${daysSince}д. назад`
                : 'Нет оплат'}
            </span>
            {totalPaid > 0 && (
              <span className="text-[11px] text-text-muted">
                Итого: {totalPaid.toLocaleString('ru')} ₽
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost !p-1.5 shrink-0 text-text-muted">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="mt-3 border-t border-bg-border pt-3 space-y-3">
          {client.note && (
            <p className="text-xs text-text-muted italic">{client.note}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">История оплат</span>
            <button onClick={handleAddPayment} className="btn-ghost !py-1 !px-2 text-xs">
              <Plus className="h-3 w-3" /> Добавить
            </button>
          </div>

          {(client.payments || []).length === 0 ? (
            <p className="text-xs text-text-muted">Нет оплат</p>
          ) : (
            <div className="space-y-1.5">
              {client.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-accent-green font-semibold">+{p.amount?.toLocaleString('ru')} ₽</span>
                  <span className="text-text-muted flex-1 text-right">
                    {format(parseISO(p.date), 'd MMM yyyy', { locale: ru })}
                    {p.note ? ` · ${p.note}` : ''}
                  </span>
                  <button onClick={() => deletePayment(client.id, p.id)} className="text-text-muted hover:text-accent-red transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CrmPage() {
  const { clients, addClient } = useCrmStore();
  const { openModal, closeModal } = useUiStore();
  const [search, setSearch] = useState('');

  const totalRevenue = clients.reduce((s, c) =>
    s + (c.payments || []).reduce((ps, p) => ps + (p.amount || 0), 0), 0);
  const activeClients = clients.filter((c) => {
    const last = c.payments?.[0];
    return last && differenceInDays(new Date(), parseISO(last.date)) <= 35;
  }).length;

  const filtered = clients.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.telegram?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => openModal('Новый клиент',
    <ClientForm onSave={(data) => { addClient(data); closeModal(); }} onCancel={closeModal} />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black">Личная база</h1>
          <p className="text-sm text-text-muted mt-0.5">Клиенты, оплаты и коммуникация</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> Клиент
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Всего клиентов',  value: clients.length,                          icon: Users,       color: 'text-brand-gold'   },
          { label: 'Активных',         value: activeClients,                            icon: Users,       color: 'text-accent-green' },
          { label: 'Общий оборот',     value: `${totalRevenue.toLocaleString('ru')} ₽`, icon: DollarSign,  color: 'text-accent-blue'  },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <s.icon className={`h-4 w-4 mb-2 ${s.color}`} />
            <div className="font-display text-lg font-black leading-tight">{s.value}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <input
          className="input"
          placeholder="Поиск по имени или @telegram..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* List */}
      {clients.length === 0 ? (
        <div className="card p-10 text-center">
          <Users className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-secondary">Нет клиентов</p>
          <p className="text-sm text-text-muted mt-1">Добавь первого клиента и отслеживай оплаты</p>
          <button onClick={handleAdd} className="btn-primary mt-4 mx-auto">
            <Plus className="h-4 w-4" /> Первый клиент
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-text-muted text-sm">Ничего не найдено</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => <ClientCard key={c.id} client={c} />)}
        </div>
      )}
    </div>
  );
}
