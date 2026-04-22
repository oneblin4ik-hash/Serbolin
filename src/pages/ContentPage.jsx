import { useState } from 'react';
import { Plus, CalendarDays, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useContentStore } from '../store/useContentStore';
import { useUiStore } from '../store/useUiStore';
import { PLATFORMS, FORMATS, POST_STATUSES } from '../lib/constants';
import MiniCalendar from '../features/content/MiniCalendar';
import IdeaGenerator from '../features/content/IdeaGenerator';

function AddPostModal({ defaultDate }) {
  const [platform, setPlatform] = useState('telegram');
  const [fmt, setFmt]           = useState('post');
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [date, setDate]         = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const addPost    = useContentStore((s) => s.addPost);
  const closeModal = useUiStore((s) => s.closeModal);

  const submit = (e) => {
    e.preventDefault();
    addPost({ date, platform, format: fmt, title, body });
    closeModal();
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
      <button type="submit" className="btn-primary w-full justify-center">Добавить в план</button>
    </form>
  );
}

function PostRow({ post }) {
  const { publishPost, updatePost, deletePost } = useContentStore();
  const plat   = PLATFORMS.find((p) => p.key === post.platform);
  const status = POST_STATUSES.find((s) => s.key === post.status);

  const nextStatus = () => {
    const idx  = POST_STATUSES.findIndex((s) => s.key === post.status);
    const next = POST_STATUSES[idx + 1];
    if (!next) return;
    if (next.key === 'published') { publishPost(post.id); return; }
    updatePost(post.id, { status: next.key });
  };

  return (
    <div className="card-hover flex items-start gap-3 p-3.5 group">
      <span className="text-lg mt-0.5">{plat?.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{post.title || `${plat?.label} ${post.format}`}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-[11px] font-semibold ${status?.color}`}>{status?.label}</span>
          {post.xpEarned && <span className="badge-gold text-[10px]">XP ✓</span>}
        </div>
      </div>
      {post.status !== 'published' && (
        <button onClick={nextStatus} className="btn-secondary !py-1 !px-2.5 !text-xs shrink-0">
          {post.status === 'filmed' ? 'Опубликовать' : '→'}
        </button>
      )}
    </div>
  );
}

export default function ContentPage() {
  const [tab, setTab]           = useState('calendar');
  const [selectedDay, setSelected] = useState(null);
  const posts     = useContentStore((s) => s.posts);
  const openModal = useUiStore((s) => s.openModal);

  const dayPosts   = selectedDay ? posts.filter((p) => p.date === format(selectedDay, 'yyyy-MM-dd')) : [];
  const published  = posts.filter((p) => p.status === 'published').length;
  const upcoming   = posts.filter((p) => p.status !== 'published').length;

  const openAdd = (date) => openModal('Добавить публикацию',
    <AddPostModal defaultDate={date ? format(date, 'yyyy-MM-dd') : undefined} />
  );

  const useIdea = (idea) => openModal('Добавить публикацию',
    <AddPostModal defaultDate={format(new Date(), 'yyyy-MM-dd')} />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black sm:text-3xl">Контент-план</h1>
          <p className="mt-1 text-sm text-text-muted">
            <span className="font-bold text-brand-gold">{published}</span> опубликовано ·{' '}
            <span className="font-bold text-text-secondary">{upcoming}</span> запланировано
          </p>
        </div>
        <button onClick={() => openAdd()} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-bg-border bg-bg-soft p-0.5 text-sm">
        {[{ key: 'calendar', label: '📅 Календарь', icon: CalendarDays }, { key: 'ideas', label: '💡 Идеи', icon: Lightbulb }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 font-semibold transition ${tab === t.key ? 'bg-brand-gold/20 text-brand-gold' : 'text-text-secondary hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'calendar' && (
        <div className="space-y-4">
          <MiniCalendar onDayClick={(day) => setSelected(day)} />

          {/* Selected day posts */}
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
                : <div className="space-y-2">{dayPosts.map((p) => <PostRow key={p.id} post={p} />)}</div>
              }
            </div>
          )}

          {/* All upcoming */}
          {!selectedDay && upcoming > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Запланировано</h3>
              <div className="space-y-2">
                {posts.filter((p) => p.status !== 'published').slice(0, 10).map((p) => <PostRow key={p.id} post={p} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'ideas' && <IdeaGenerator onUseIdea={useIdea} />}
    </div>
  );
}
