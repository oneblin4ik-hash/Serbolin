import { useState } from 'react';
import { Plus, Rocket, Pencil, Trash2, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { useProjectsStore } from '../store/useProjectsStore';
import { useUiStore } from '../store/useUiStore';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const STATUSES = {
  active:    { label: 'Активен',   color: 'text-accent-green',  bg: 'bg-accent-green/10',  icon: Clock },
  paused:    { label: 'Пауза',     color: 'text-accent-amber',  bg: 'bg-accent-amber/10',  icon: PauseCircle },
  completed: { label: 'Готово',    color: 'text-brand-gold',    bg: 'bg-brand-gold/10',    icon: CheckCircle2 },
};

const FILTER_OPTIONS = [
  { key: 'all',       label: 'Все' },
  { key: 'active',    label: 'Активные' },
  { key: 'paused',    label: 'На паузе' },
  { key: 'completed', label: 'Готовые' },
];

function ProjectForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', status: 'active', progress: 0, deadline: '', tags: '',
    ...(initial ? { ...initial, tags: (initial.tags || []).join(', ') } : {}),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      progress: Math.min(100, Math.max(0, parseInt(form.progress) || 0)),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Название проекта</label>
        <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required autoFocus placeholder="Онлайн-курс по питанию" />
      </div>
      <div>
        <label className="label">Описание</label>
        <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Что это за проект?" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Статус</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {Object.entries(STATUSES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Прогресс (%)</label>
          <input className="input" type="number" min="0" max="100" value={form.progress} onChange={(e) => set('progress', e.target.value)} />
        </div>
        <div>
          <label className="label">Дедлайн</label>
          <input className="input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
        </div>
        <div>
          <label className="label">Теги (через запятую)</label>
          <input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="контент, коучинг" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 justify-center">Сохранить</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-ghost flex-1 justify-center">Отмена</button>}
      </div>
    </form>
  );
}

function ProjectCard({ project }) {
  const { updateProject, deleteProject } = useProjectsStore();
  const { openModal, closeModal } = useUiStore();
  const status = STATUSES[project.status] || STATUSES.active;
  const StatusIcon = status.icon;

  const handleEdit = () => openModal('Редактировать проект',
    <ProjectForm initial={project} onSave={(data) => { updateProject(project.id, data); closeModal(); }} onCancel={closeModal} />
  );

  const handleProgress = (delta) => {
    const next = Math.min(100, Math.max(0, (project.progress || 0) + delta));
    updateProject(project.id, { progress: next, status: next >= 100 ? 'completed' : project.status });
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${status.bg}`}>
          <StatusIcon className={`h-4.5 w-4.5 ${status.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{project.title}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleEdit} className="btn-ghost !p-1.5"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => window.confirm('Удалить проект?') && deleteProject(project.id)} className="btn-ghost !p-1.5 text-accent-red"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {project.description && (
            <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{project.description}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-[11px] text-text-muted">
          <span className={`flex items-center gap-1 font-medium ${status.color}`}>
            <StatusIcon className="h-3 w-3" />{status.label}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleProgress(-10)} className="btn-ghost !p-0.5 text-xs leading-none">−</button>
            <span className="font-bold text-text-primary">{project.progress || 0}%</span>
            <button onClick={() => handleProgress(10)} className="btn-ghost !p-0.5 text-xs leading-none">+</button>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${project.status === 'completed' ? 'bg-brand-gold' : 'bg-accent-green'}`}
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap">
        {project.deadline && (
          <span className="text-[11px] text-text-muted">
            📅 {format(parseISO(project.deadline), 'd MMM yyyy', { locale: ru })}
          </span>
        )}
        {project.tags?.map((tag) => (
          <span key={tag} className="text-[10px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, addProject } = useProjectsStore();
  const { openModal, closeModal } = useUiStore();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);
  const activeCount    = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const handleAdd = () => openModal('Новый проект',
    <ProjectForm onSave={(data) => { addProject(data); closeModal(); }} onCancel={closeModal} />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black">Проекты</h1>
          <p className="text-sm text-text-muted mt-0.5">Цели, запуски и инициативы</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> Проект
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Всего проектов', value: projects.length,    color: 'text-brand-gold'   },
          { label: 'Активных',       value: activeCount,         color: 'text-accent-green' },
          { label: 'Завершённых',    value: completedCount,      color: 'text-accent-blue'  },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <Rocket className={`h-4 w-4 mb-2 ${s.color}`} />
            <div className="font-display text-xl font-black">{s.value}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      {projects.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map((opt) => (
            <button key={opt.key} onClick={() => setFilter(opt.key)}
              className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filter === opt.key
                  ? 'bg-brand-gold text-bg-base border-brand-gold'
                  : 'border-bg-border text-text-secondary hover:border-brand-gold/40'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {projects.length === 0 ? (
        <div className="card p-10 text-center">
          <Rocket className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-secondary">Нет проектов</p>
          <p className="text-sm text-text-muted mt-1">Создай первый проект и отслеживай прогресс</p>
          <button onClick={handleAdd} className="btn-primary mt-4 mx-auto">
            <Plus className="h-4 w-4" /> Первый проект
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-text-muted text-sm">Нет проектов в этом статусе</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
