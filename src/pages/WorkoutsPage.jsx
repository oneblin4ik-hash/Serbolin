import { useState } from 'react';
import { Plus, Dumbbell, Pencil, Trash2, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useWorkoutsStore } from '../store/useWorkoutsStore';
import { useUiStore } from '../store/useUiStore';
import { DEFAULT_XP_OPTIONS } from '../lib/constants';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const MUSCLE_GROUPS = ['Грудь', 'Спина', 'Плечи', 'Бицепс', 'Трицепс', 'Ноги', 'Пресс', 'Ягодицы', 'Икры', 'Кардио'];

function WorkoutForm({ initial, onSave, onCancel }) {
  const [title,        setTitle]        = useState(initial?.title        || '');
  const [date,         setDate]         = useState(initial?.date         || new Date().toISOString().slice(0, 10));
  const [xp,           setXp]           = useState(initial?.xp           ?? 50);
  const [note,         setNote]         = useState(initial?.note         || '');
  const [muscles,      setMuscles]      = useState(initial?.muscleGroups || []);
  const [exercises,    setExercises]    = useState(initial?.exercises    || [{ name: '', sets: '', reps: '', weight: '' }]);

  const toggleMuscle = (m) => setMuscles((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const setExercise = (i, field, val) =>
    setExercises((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const addExercise = () => setExercises((prev) => [...prev, { name: '', sets: '', reps: '', weight: '' }]);
  const removeExercise = (i) => setExercises((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      date,
      xp: parseInt(xp),
      note: note.trim(),
      muscleGroups: muscles,
      exercises: exercises.filter((ex) => ex.name.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Название</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Тренировка груди" required autoFocus />
        </div>
        <div>
          <label className="label">Дата</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">XP за тренировку</label>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_XP_OPTIONS.map((v) => (
            <button key={v} type="button" onClick={() => setXp(v)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${xp === v ? 'bg-brand-gold text-bg-base border-brand-gold' : 'border-bg-border text-text-secondary hover:border-brand-gold/50'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Группы мышц</label>
        <div className="flex gap-2 flex-wrap">
          {MUSCLE_GROUPS.map((m) => (
            <button key={m} type="button" onClick={() => toggleMuscle(m)}
              className={`px-3 py-1 rounded-lg text-xs border transition-all ${muscles.includes(m) ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' : 'border-bg-border text-text-secondary hover:border-bg-hover'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Упражнения</label>
          <button type="button" onClick={addExercise} className="btn-ghost !py-1 !px-2 text-xs">
            <Plus className="h-3 w-3" /> Добавить
          </button>
        </div>
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
              <input className="input !py-1.5 text-sm" placeholder="Жим лёжа" value={ex.name} onChange={(e) => setExercise(i, 'name', e.target.value)} />
              <input className="input !py-1.5 text-sm w-16" placeholder="Подх" value={ex.sets} onChange={(e) => setExercise(i, 'sets', e.target.value)} />
              <input className="input !py-1.5 text-sm w-16" placeholder="Повт" value={ex.reps} onChange={(e) => setExercise(i, 'reps', e.target.value)} />
              <input className="input !py-1.5 text-sm w-20" placeholder="кг" value={ex.weight} onChange={(e) => setExercise(i, 'weight', e.target.value)} />
              <button type="button" onClick={() => removeExercise(i)} className="text-text-muted hover:text-accent-red transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Заметка</label>
        <textarea className="input resize-none" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Самочувствие, вес, наблюдения..." />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 justify-center">Сохранить</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-ghost flex-1 justify-center">Отмена</button>}
      </div>
    </form>
  );
}

function WorkoutCard({ workout }) {
  const [open, setOpen] = useState(false);
  const { updateWorkout, deleteWorkout } = useWorkoutsStore();
  const { openModal, closeModal, confirm } = useUiStore();

  const handleEdit = () => openModal('Редактировать тренировку',
    <WorkoutForm initial={workout} onSave={(data) => { updateWorkout(workout.id, data); closeModal(); }} onCancel={closeModal} />
  );

  const handleDelete = () => {
    if (window.confirm('Удалить тренировку?')) deleteWorkout(workout.id);
  };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10">
          <Dumbbell className="h-5 w-5 text-brand-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{workout.title}</span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-bold text-brand-gold">+{workout.xp} XP</span>
              <button onClick={handleEdit} className="btn-ghost !p-1.5 ml-1"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={handleDelete} className="btn-ghost !p-1.5 text-accent-red"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {format(parseISO(workout.date), 'd MMMM yyyy', { locale: ru })}
          </div>
          {workout.muscleGroups?.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1.5">
              {workout.muscleGroups.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-medium">{m}</span>
              ))}
            </div>
          )}
        </div>
        {workout.exercises?.length > 0 && (
          <button onClick={() => setOpen((v) => !v)} className="btn-ghost !p-1.5 shrink-0 text-text-muted">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {open && workout.exercises?.length > 0 && (
        <div className="mt-3 border-t border-bg-border pt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-muted">
                <th className="text-left pb-1 font-medium">Упражнение</th>
                <th className="text-center pb-1 font-medium">Подх</th>
                <th className="text-center pb-1 font-medium">Повт</th>
                <th className="text-center pb-1 font-medium">кг</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {workout.exercises.map((ex, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2">{ex.name}</td>
                  <td className="py-1 text-center text-text-muted">{ex.sets || '—'}</td>
                  <td className="py-1 text-center text-text-muted">{ex.reps || '—'}</td>
                  <td className="py-1 text-center text-text-muted">{ex.weight || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {workout.note && <p className="mt-2 text-[11px] text-text-muted italic">{workout.note}</p>}
        </div>
      )}
    </div>
  );
}

export default function WorkoutsPage() {
  const { workouts, addWorkout } = useWorkoutsStore();
  const { openModal, closeModal } = useUiStore();
  const [showAll, setShowAll] = useState(false);

  const totalXp    = workouts.reduce((s, w) => s + (w.xp || 0), 0);
  const displayed  = showAll ? workouts : workouts.slice(0, 10);

  const handleAdd = () => openModal('Новая тренировка',
    <WorkoutForm onSave={(data) => { addWorkout(data); closeModal(); }} onCancel={closeModal} />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black">Тренировки</h1>
          <p className="text-sm text-text-muted mt-0.5">Журнал тренировок и прогресс</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Всего тренировок', value: workouts.length, icon: Dumbbell, color: 'text-brand-gold' },
          { label: 'XP заработано',    value: totalXp.toLocaleString('ru'), icon: Trophy, color: 'text-accent-green' },
          { label: 'Этот месяц',       value: workouts.filter((w) => w.date?.slice(0, 7) === new Date().toISOString().slice(0, 7)).length, icon: Dumbbell, color: 'text-accent-blue' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <s.icon className={`h-4 w-4 mb-2 ${s.color}`} />
            <div className="font-display text-xl font-black">{s.value}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {workouts.length === 0 ? (
        <div className="card p-10 text-center">
          <Dumbbell className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-secondary">Нет тренировок</p>
          <p className="text-sm text-text-muted mt-1">Записывай тренировки и зарабатывай XP</p>
          <button onClick={handleAdd} className="btn-primary mt-4 mx-auto">
            <Plus className="h-4 w-4" /> Первая тренировка
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((w) => <WorkoutCard key={w.id} workout={w} />)}
          {workouts.length > 10 && (
            <button onClick={() => setShowAll((v) => !v)} className="btn-ghost w-full justify-center">
              {showAll ? 'Свернуть' : `Показать все (${workouts.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
