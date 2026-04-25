import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useContentStore } from '../store/useContentStore';
import { useUiStore } from '../store/useUiStore';
import { PLATFORMS, FORMATS, POST_STATUSES } from '../lib/constants';
import MiniCalendar from '../features/content/MiniCalendar';
import IdeaGenerator from '../features/content/IdeaGenerator';

// ─── Add / Edit post modal ────────────────────────────────────────────────────
function PostModal({ post, defaultDate, onClose }) {
  const isEdit    = !!post;
  const addPost   = useContentStore((s) => s.addPost);
  const updatePost = useContentStore((s) => s.updatePost);

  const [platform, setPlatform] = useState(post?.platform || 'telegram');
  const [fmt, setFmt]           = useState(post?.format   || 'post');
  const [title, setTitle]       = useState(post?.title    || '');
  const [body, setBody]         = useState(post?.body     || '');
  const [date, setDate]         = useState(post?.date     || defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus]     = useState(post?.status   || 'idea');

  const submit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updatePost(post.id, { platform, format: fmt, title, body, date, status });
    } else {
      addPost({ date, platform, format: fmt, title, body });
    }
    onClose();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        {PLATFORMS.map((p) => (
          <button key={p.key} type="button" onClick={() => { setPlatform(p.key); setFmt(FORMATS[p.key][0].key); }}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${platform === p.key ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' : 'btn-secondary'}`}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Формат</label>
          <select className="select" value={fmt} onChange={(e) => setFmt(e.target.value)}>
            {(FORMATS[platform] || []).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Дата</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label">Заголовок</label>
        <input className="input" placeholder="Тема публикации..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>
      <div>
        <label className="label">Идея / сценарий</label>
        <textarea className="input !h-24 resize-none" placeholder="Краткое описание или сценарий..." value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      {isEdit && (
        <div>
          <label className="label">Статус</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {POST_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      )}
      <button type="submit" className="btn-primary w-full justify-center">
        {isEdit ? 'Сохранить' : 'Добавить в план'}
      </button>
    </form>
  );
}

// ─── Kanban column card ────────────────────────────────────────────────────────
function PostKanbanCard({ post }) {
  const { updatePost, publishPost, deletePost } = useContentStore();
  const { openModal, closeModal } = useUiStore();
  const plat   = PLATFORMS.find((p) => p.key === post.platform);
  const status = POST_STATUSES.find((s) => s.key === post.status);
  const statIdx = POST_STATUSES.findIndex((s) => s.key === post.status);

  const advance = () => {
    const next = POST_STATUSES[statIdx + 1];
    if (!next) return;
    if (next.key === 'published') { publishPost(post.id); return; }
    updatePost(post.id, { status: next.key });
  };

  return (
    <div className="rounded-xl border border-bg-border bg-bg-card p-3 group hover:border-bg-hover transition-colors">
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="text-base">{plat?.icon}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => openModal('Редактировать', <PostModal post={post} onClose={closeModal} />)}
            className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-bg-hover text-text-muted">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={() => deletePost(post.id)}
            className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-bg-hover text-text-muted hover:text-accent-red">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="text-xs font-medium leading-tight text-text-primary mb-1 line-clamp-2">
        {post.title || `${plat?.label} · ${post.format}`}
      </div>
      <div className="text-[10px] text-text-muted mb-2">{post.date}</div>
      {post.status !== 'published' && statIdx < POST_STATUSES.length - 1 && (
        <button onClick={advance}
          className="w-full rounded-lg border border-bg-border py-1 text-[11px] font-semibold text-text-muted hover:border-brand-gold/40 hover:text-brand-gold transition-colors">
          {POST_STATUSES[statIdx + 1]?.label} →
        </button>
      )}
      {post.xpEarned && <span className="text-[10px] text-brand-gold font-mono">XP ✓</span>}
    </div>
  );
}

// ─── Calendar view ─────────────────────────────────────────────────────────────
function CalendarView() {
  const [selectedDay, setSelected] = useState(null);
  const { posts, deletePost }     = useContentStore();
  const { openModal, closeModal } = useUiStore();

  const dayPosts = selectedDay ? posts.filter((p) => p.date === format(selectedDay, 'yyyy-MM-dd')) : [];

  const openAdd = (date) => openModal('Добавить публикацию',
    <PostModal defaultDate={date ? format(date, 'yyyy-MM-dd') : undefined} onClose={closeModal} />
  );

  return (
    <div className="space-y-4">
      <MiniCalendar onDayClick={setSelected} />
      {selectedDay && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {format(selectedDay, 'd MMMM', { locale: ru })}
            </h3>
            <button onClick={() => openAdd(selectedDay)} className="btn-ghost !py-1 !px-2 text-xs gap-1">
              <Plus className="h-3 w-3" /> Добавить
            </button>
          </div>
          {dayPosts.length === 0
            ? <p className="text-sm text-text-muted py-4 text-center">Нет публикаций. Добавь первую!</p>
            : <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-2">{dayPosts.map((p) => <PostKanbanCard key={p.id} post={p} />)}</div>
          }
        </div>
      )}
      {!selectedDay && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Запланировано</h3>
          {posts.filter((p) => p.status !== 'published').length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Ничего не запланировано</p>
          ) : (
            <div className="space-y-2">
              {posts.filter((p) => p.status !== 'published').slice(0, 8).map((p) => (
                <div key={p.id} className="card-hover flex items-center gap-3 p-3.5">
                  <span className="text-lg">{PLATFORMS.find((pl) => pl.key === p.platform)?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.title || `${p.platform} · ${p.format}`}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">{p.date}</div>
                  </div>
                  <span className={`text-[11px] font-semibold shrink-0 ${POST_STATUSES.find((s) => s.key === p.status)?.color}`}>
                    {POST_STATUSES.find((s) => s.key === p.status)?.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Kanban view ───────────────────────────────────────────────────────────────
function KanbanView() {
  const posts = useContentStore((s) => s.posts);
  const { openModal, closeModal } = useUiStore();

  const openAdd = (status) => openModal('Добавить публикацию',
    <PostModal defaultDate={format(new Date(), 'yyyy-MM-dd')} onClose={closeModal} />
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {POST_STATUSES.map((st) => {
        const col = posts.filter((p) => p.status === st.key);
        return (
          <div key={st.key} className="rounded-2xl border border-bg-border bg-bg-soft p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: st.dot }} />
                <span className="text-xs font-semibold text-text-secondary">{st.label}</span>
                <span className="text-[10px] text-text-muted tabular-nums">{col.length}</span>
              </div>
              <button onClick={() => openAdd(st.key)}
                className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-bg-hover text-text-muted hover:text-brand-gold transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {col.map((p) => <PostKanbanCard key={p.id} post={p} />)}
              {col.length === 0 && (
                <div className="rounded-xl border border-dashed border-bg-border py-6 text-center text-[11px] text-text-muted">
                  Пусто
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ContentPage() {
  const [tab, setTab] = useState('calendar');
  const posts         = useContentStore((s) => s.posts);
  const { openModal, closeModal } = useUiStore();

  const published = posts.filter((p) => p.status === 'published').length;
  const upcoming  = posts.filter((p) => p.status !== 'published').length;

  const openAdd = () => openModal('Добавить публикацию',
    <PostModal defaultDate={format(new Date(), 'yyyy-MM-dd')} onClose={closeModal} />
  );

  const useIdea = (idea) => openModal('Добавить публикацию',
    <PostModal
      defaultDate={format(new Date(), 'yyyy-MM-dd')}
      post={{ platform: idea.platform, format: idea.format, title: idea.title, body: idea.body, date: format(new Date(), 'yyyy-MM-dd'), status: 'idea' }}
      onClose={closeModal}
    />
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-text-muted">Фабрика смыслов</div>
          <h1 className="font-display text-2xl font-black mt-0.5 sm:text-3xl">Контент-план</h1>
          <p className="mt-1 text-sm text-text-muted">
            <span className="font-bold text-brand-gold">{published}</span> опубликовано ·{' '}
            <span className="font-bold text-text-secondary">{upcoming}</span> запланировано
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'calendar', label: '📅 Календарь' },
          { key: 'kanban',   label: '📋 Канбан' },
          { key: 'ideas',    label: '💡 Генератор' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              tab === t.key ? 'bg-brand-gold text-bg-base border-brand-gold' : 'border-bg-border text-text-secondary hover:border-brand-gold/40'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'calendar' && <CalendarView />}
      {tab === 'kanban'   && <KanbanView />}
      {tab === 'ideas'    && <IdeaGenerator onUseIdea={useIdea} />}

    </div>
  );
}
