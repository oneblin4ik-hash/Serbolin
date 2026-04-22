import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { TELEGRAM_TEMPLATES, REELS_TEMPLATES, DEFAULT_BRAND } from '../../lib/constants';
import { useCharacterStore } from '../../store/useCharacterStore';

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function IdeaGenerator({ onUseIdea }) {
  const brand = useCharacterStore((s) => s.brand) || DEFAULT_BRAND;
  const [platform, setPlatform] = useState('telegram');
  const [topic, setTopic]       = useState('');
  const [ideas, setIdeas]       = useState([]);
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    const templates = platform === 'telegram' ? TELEGRAM_TEMPLATES : REELS_TEMPLATES;
    const picked    = shuffle(templates).slice(0, 4);
    const t = topic.trim() || brand.topics[Math.floor(Math.random() * brand.topics.length)];
    setIdeas(picked.map((tmpl) => ({
      id:       tmpl.id,
      title:    tmpl.title,
      body:     tmpl.template(t, brand.niche, brand.audience),
      topic:    t,
      platform,
    })));
    setGenerated(true);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 space-y-3">
        <h3 className="font-display font-bold text-sm text-text-primary">Генератор идей</h3>

        <div className="flex gap-2">
          {[{ key: 'telegram', label: '✈️ Telegram' }, { key: 'instagram', label: '📸 Reels' }].map((p) => (
            <button
              key={p.key}
              onClick={() => setPlatform(p.key)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${platform === p.key ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' : 'btn-secondary'}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Тема (необязательно)</label>
          <input
            className="input"
            placeholder={`Например: ${brand.topics[0]}`}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <button onClick={generate} className="btn-primary w-full justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Сгенерировать идеи
        </button>
      </div>

      {/* Results */}
      {generated && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {ideas.length} идеи по теме «{ideas[0]?.topic}»
            </h4>
            <button onClick={generate} className="btn-ghost !px-2 !py-1 text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              Ещё
            </button>
          </div>

          {ideas.map((idea) => (
            <div key={idea.id} className="card-hover p-4 space-y-2">
              <div className="font-semibold text-sm text-text-primary">{idea.title}</div>
              <pre className="text-xs text-text-muted whitespace-pre-wrap font-sans leading-relaxed">{idea.body}</pre>
              {onUseIdea && (
                <button
                  onClick={() => onUseIdea({ title: idea.title, body: idea.body, platform: idea.platform, format: platform === 'instagram' ? 'reel' : 'post' })}
                  className="btn-secondary text-xs !py-1.5 w-full justify-center"
                >
                  Добавить в план
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
