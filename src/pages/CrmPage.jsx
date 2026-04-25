import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useCrmStore, CRM_STAGES } from '../store/useCrmStore';

function LeadModal({ lead, onSave, onDelete, onClose }) {
  const [f, setF] = useState(lead || { name: '', phone: '', amount: 0, next: '', note: '', stage: 'lead' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-bg-border bg-bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">
          {lead ? 'Редактировать' : 'Новый лид'}
        </div>
        <h2 className="font-display text-xl font-black mb-5">Карточка клиента</h2>

        <div className="space-y-3">
          <div>
            <label className="label">Имя</label>
            <input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus placeholder="Иван Иванов" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Телефон</label>
              <input className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 999 000-00-00" />
            </div>
            <div>
              <label className="label">Сумма (₽)</label>
              <input className="input" type="number" value={f.amount || ''} onChange={(e) => set('amount', parseInt(e.target.value) || 0)} placeholder="10000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Этап</label>
              <select className="input" value={f.stage} onChange={(e) => set('stage', e.target.value)}>
                {CRM_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Следующий контакт</label>
              <input className="input" type="date" value={f.next || ''} onChange={(e) => set('next', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Заметки</label>
            <textarea className="input resize-none" rows={3} value={f.note} onChange={(e) => set('note', e.target.value)} placeholder="Цель, особенности, договорённости..." />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <div>
            {lead && (
              <button onClick={() => onDelete(lead.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-accent-red/40 text-accent-red hover:bg-accent-red/10 transition-colors">
                Удалить
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">Отмена</button>
            <button onClick={() => onSave(f)} className="btn-primary">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead }) {
  const { moveLead } = useCrmStore();
  const [editing, setEditing] = useState(false);
  const { updateLead, deleteLead } = useCrmStore();

  const handleSave = (data) => { updateLead(lead.id, data); setEditing(false); };
  const handleDelete = (id) => { deleteLead(id); setEditing(false); };

  return (
    <>
      <div
        onClick={() => setEditing(true)}
        className="group p-3 rounded-xl bg-bg-card border border-bg-border hover:border-brand-gold/50 cursor-pointer transition-all mb-2"
      >
        <div className="flex items-start justify-between gap-2 text-sm">
          <span className="font-medium leading-tight">{lead.name}</span>
          {lead.amount > 0 && (
            <span className="font-display text-xs font-bold text-brand-gold shrink-0">
              {lead.amount.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
        {lead.phone && (
          <div className="font-mono text-[11px] text-text-muted mt-1">{lead.phone}</div>
        )}
        {lead.note && (
          <div className="text-[11px] text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">{lead.note}</div>
        )}
        {lead.next && (
          <div className="text-[10px] text-brand-gold mt-1.5">→ {lead.next}</div>
        )}
        {/* Stage quick-move buttons */}
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {CRM_STAGES.filter((s) => s.id !== lead.stage).map((s) => (
            <button
              key={s.id}
              onClick={(e) => { e.stopPropagation(); moveLead(lead.id, s.id); }}
              style={{ color: s.color, borderColor: `${s.color}40` }}
              className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border bg-transparent hover:opacity-80 transition-opacity"
            >
              → {s.label}
            </button>
          ))}
        </div>
      </div>

      {editing && (
        <LeadModal
          lead={lead}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

export default function CrmPage() {
  const { leads, addLead, updateLead, deleteLead } = useCrmStore();
  const [newOpen, setNewOpen] = useState(false);

  const totalPaid = leads
    .filter((l) => l.stage === 'paid' || l.stage === 'done')
    .reduce((s, l) => s + (l.amount || 0), 0);

  const handleSave = (data) => {
    if (data.id) updateLead(data.id, data);
    else addLead(data);
    setNewOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-text-muted">Воронка</p>
          <h1 className="font-display text-2xl font-black">CRM · Лиды</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {leads.length} клиентов · всего оплачено {totalPaid.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <button onClick={() => setNewOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Новый лид
        </button>
      </div>

      {/* Kanban board */}
      {leads.length === 0 && !newOpen ? (
        <div className="card p-10 text-center">
          <Users className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-secondary">Нет лидов</p>
          <p className="text-sm text-text-muted mt-1">Добавь первого клиента в воронку</p>
          <button onClick={() => setNewOpen(true)} className="btn-primary mt-4 mx-auto">
            <Plus className="h-4 w-4" /> Первый лид
          </button>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          {CRM_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            return (
              <div key={stage.id} className="rounded-2xl border border-bg-border bg-bg-soft p-3 min-h-[400px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px]" style={{ color: stage.color }}>●</span>
                    <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: stage.color }}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-text-muted">{stageLeads.length}</span>
                </div>
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile fallback — stacked columns */}
      <style>{`@media(max-width:640px){.crm-board{grid-template-columns:1fr!important}}`}</style>

      {newOpen && (
        <LeadModal
          lead={null}
          onSave={handleSave}
          onDelete={() => {}}
          onClose={() => setNewOpen(false)}
        />
      )}
    </div>
  );
}
