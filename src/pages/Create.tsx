import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Icon from '@/components/ui/icon';
import api, { type GeneratedScript } from '@/lib/api';

const AVATARS = [
  { id: 'alice', name: 'Алиса', role: 'Маркетолог', emoji: '👩‍💼', color: '#a855f7' },
  { id: 'max', name: 'Максим', role: 'Техно-ведущий', emoji: '👨‍💻', color: '#3b82f6' },
  { id: 'sofia', name: 'Софья', role: 'Инструктор', emoji: '👩‍🏫', color: '#ec4899' },
  { id: 'artem', name: 'Артём', role: 'Блогер', emoji: '🧑‍🎤', color: '#f59e0b' },
  { id: 'victoria', name: 'Виктория', role: 'Ведущая', emoji: '📰', color: '#22c55e' },
];

const PLATFORMS = [
  { id: 'reels', name: 'Instagram Reels', icon: 'Instagram', maxDur: 90 },
  { id: 'tiktok', name: 'TikTok', icon: 'Music', maxDur: 180 },
  { id: 'shorts', name: 'YouTube Shorts', icon: 'Youtube', maxDur: 60 },
  { id: 'stories', name: 'Stories', icon: 'Camera', maxDur: 15 },
];

const STYLES = [
  { id: 'professional', name: 'Профессиональный', icon: 'Briefcase', desc: 'Деловой тон, факты' },
  { id: 'casual', name: 'Дружелюбный', icon: 'Smile', desc: 'Разговорный стиль' },
  { id: 'energetic', name: 'Энергичный', icon: 'Zap', desc: 'Мотивация, эмоции' },
  { id: 'educational', name: 'Обучающий', icon: 'BookOpen', desc: 'Пошагово, понятно' },
];

const STEPS = [
  { id: 1, label: 'Тема', icon: 'Lightbulb' },
  { id: 2, label: 'Аватар', icon: 'User' },
  { id: 3, label: 'Формат', icon: 'Video' },
  { id: 4, label: 'Стиль', icon: 'Palette' },
  { id: 5, label: 'Результат', icon: 'Rocket' },
];

const Create = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [duration, setDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [waveAmps, setWaveAmps] = useState<number[]>(Array(24).fill(3));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const avatar = AVATARS[selectedAvatar];
  const platform = PLATFORMS[selectedPlatform];
  const style = STYLES[selectedStyle];

  const canProceed = () => {
    if (step === 1) return topic.trim().length >= 3;
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else if (step === 4) handleGenerate();
  };

  const handleGenerate = async () => {
    setStep(5);
    setIsGenerating(true);
    setError('');
    setScript(null);

    try {
      const result = await api.generateScript({
        topic,
        platform: platform.id,
        style: style.id,
        avatar_name: avatar.name,
        duration,
      });
      setScript(result);
      setActiveScene(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!script) return;
    setIsSaving(true);
    try {
      await api.createProject({
        title: script.title,
        topic,
        script: JSON.stringify(script),
        avatar_id: avatar.id,
        avatar_name: avatar.name,
        platform: platform.id,
        duration_sec: duration,
        style: style.id,
        status: 'ready',
      });
      navigate('/projects');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!script || !isPlaying) return;
    const scene = script.scenes[activeScene];
    if (!scene) return;

    let charIdx = 0;
    setTypedText('');

    const typeInt = setInterval(() => {
      if (charIdx < scene.text.length) {
        setTypedText(scene.text.slice(0, charIdx + 1));
        setWaveAmps(prev => prev.map(() => Math.random() * 35 + 8));
        charIdx++;
      } else {
        clearInterval(typeInt);
        setWaveAmps(prev => prev.map(() => 3));
        setTimeout(() => {
          if (activeScene < script.scenes.length - 1) {
            setActiveScene(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }, 1500);
      }
    }, 40);

    return () => clearInterval(typeInt);
  }, [script, activeScene, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bw = canvas.width / 24;
    waveAmps.forEach((a, i) => {
      const h = a * (canvas.height / 50);
      const y = (canvas.height - h) / 2;
      ctx.fillStyle = avatar.color + '80';
      ctx.beginPath();
      ctx.roundRect(i * bw + 1, y, bw - 2, h, 2);
      ctx.fill();
    });
  }, [waveAmps, avatar.color]);

  const handlePlay = () => {
    if (!script) return;
    setActiveScene(0);
    setIsPlaying(true);
    setTypedText('');
  };

  const handleExportPDF = () => {
    if (!script) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 20;

    const addText = (text: string, size: number, bold: boolean, color: [number, number, number] = [30, 30, 30]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += size * 0.45;
      });
      y += 2;
    };

    const addLine = () => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
    };

    doc.setFillColor(100, 60, 200);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('VibeFactory', margin, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Video Script', margin, 26);
    doc.text(new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), margin, 33);
    y = 50;

    addText(script.title, 18, true, [30, 30, 30]);
    y += 4;
    addText(script.hook, 12, false, [100, 60, 200]);
    y += 4;

    addLine();
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const info = `Avatar: ${avatar.name}  |  Platform: ${platform.name}  |  Style: ${style.name}  |  Duration: ${duration}s`;
    doc.text(info, margin, y);
    y += 10;

    addLine();
    addText('SCENARIO', 14, true, [60, 60, 60]);
    y += 2;

    script.scenes.forEach((scene, i) => {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFillColor(245, 245, 250);
      doc.roundedRect(margin - 2, y - 4, contentW + 4, 8, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 60, 200);
      doc.text(`Scene ${i + 1}  [${scene.time}]`, margin, y);
      doc.setTextColor(150, 150, 150);
      doc.text(scene.emotion, pageW - margin - doc.getTextWidth(scene.emotion), y);
      y += 8;

      addText(scene.text, 11, false, [40, 40, 40]);
      y += 1;
      addText(`Visual: ${scene.visual}`, 9, false, [130, 130, 130]);
      y += 4;
    });

    addLine();
    addText('CTA', 12, true, [60, 60, 60]);
    addText(script.cta, 11, false, [40, 40, 40]);
    y += 4;

    if (script.hashtags.length > 0) {
      addLine();
      addText('HASHTAGS', 12, true, [60, 60, 60]);
      addText(script.hashtags.map(t => '#' + t).join('  '), 10, false, [100, 60, 200]);
    }

    const fileName = script.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_').slice(0, 40);
    doc.save(`${fileName}_script.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={20} />
            <span className="font-medium">VibeFactory</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => { if (s.id <= step || (s.id === 5 && script)) setStep(s.id); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    s.id === step ? 'bg-primary text-primary-foreground' :
                    s.id < step ? 'text-foreground hover:bg-muted' : 'text-muted-foreground'
                  }`}
                >
                  {s.id < step ? <Icon name="Check" size={16} /> : <Icon name={s.icon} size={16} />}
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <Icon name="ChevronRight" size={14} className="text-muted-foreground mx-1" />}
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/projects')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm">
            <Icon name="FolderOpen" size={16} />
            Проекты
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">О чём будет видео?</h1>
              <p className="text-muted-foreground">Опишите тему — AI создаст сценарий, подберёт визуал и подготовит видео</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Например: 5 способов увеличить продажи в Instagram, или: Обзор нового iPhone, или: Как начать медитировать..."
                className="w-full h-40 p-6 rounded-2xl bg-card border-2 border-border focus:border-primary outline-none text-lg resize-none transition-colors"
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-muted-foreground">{topic.length} символов</span>
                <span className="text-sm text-muted-foreground">Минимум 3 символа</span>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground mb-3">Быстрый старт:</p>
              <div className="flex flex-wrap gap-2">
                {['5 трендов маркетинга 2026', 'Как запустить онлайн-курс', 'Обзор гаджета за 60 секунд', 'Утренняя рутина продуктивности'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Выберите аватара</h1>
              <p className="text-muted-foreground">Виртуальный ведущий озвучит и проведёт ваше видео</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {AVATARS.map((av, i) => (
                <button
                  key={av.id}
                  onClick={() => setSelectedAvatar(i)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                    i === selectedAvatar
                      ? 'scale-[1.03] shadow-xl'
                      : 'border-border hover:border-border/80 bg-card hover:shadow-md'
                  }`}
                  style={i === selectedAvatar ? {
                    borderColor: av.color,
                    backgroundColor: av.color + '08',
                    boxShadow: `0 8px 30px ${av.color}20`,
                  } : undefined}
                >
                  <div className="text-5xl mb-3" style={i === selectedAvatar ? { filter: `drop-shadow(0 0 15px ${av.color})` } : undefined}>
                    {av.emoji}
                  </div>
                  <div className="font-semibold text-foreground text-lg">{av.name}</div>
                  <div className="text-sm text-muted-foreground">{av.role}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Платформа и длительность</h1>
              <p className="text-muted-foreground">Видео автоматически адаптируется под формат платформы</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {PLATFORMS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlatform(i);
                    setDuration(Math.min(duration, p.maxDur));
                  }}
                  className={`p-5 rounded-2xl border-2 text-center transition-all ${
                    i === selectedPlatform
                      ? 'border-primary bg-primary/5 shadow-lg scale-105'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <Icon name={p.icon} size={28} className={i === selectedPlatform ? 'text-primary mx-auto mb-2' : 'text-muted-foreground mx-auto mb-2'} />
                  <div className="font-medium text-foreground text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">до {p.maxDur} сек</div>
                </button>
              ))}
            </div>

            <div className="max-w-md mx-auto">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Длительность: {duration} сек
              </label>
              <input
                type="range"
                min={5}
                max={platform.maxDur}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5 сек</span>
                <span>{platform.maxDur} сек</span>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Стиль подачи</h1>
              <p className="text-muted-foreground">Выберите тон и настроение вашего видео</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {STYLES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(i)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    i === selectedStyle
                      ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <Icon name={s.icon} size={24} className={i === selectedStyle ? 'text-primary mb-3' : 'text-muted-foreground mb-3'} />
                  <div className="font-semibold text-foreground">{s.name}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </button>
              ))}
            </div>

            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-muted/50 border border-border">
              <h3 className="font-medium text-foreground mb-3">Сводка проекта</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Тема:</span> <span className="text-foreground font-medium">{topic}</span></div>
                <div><span className="text-muted-foreground">Аватар:</span> <span className="text-foreground font-medium">{avatar.emoji} {avatar.name}</span></div>
                <div><span className="text-muted-foreground">Платформа:</span> <span className="text-foreground font-medium">{platform.name}</span></div>
                <div><span className="text-muted-foreground">Длительность:</span> <span className="text-foreground font-medium">{duration} сек</span></div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-fade-in">
            {isGenerating && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <h2 className="text-2xl font-bold text-foreground mb-2">AI создаёт сценарий...</h2>
                <p className="text-muted-foreground">Анализируем тему, подбираем структуру и визуал</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Icon name="AlertTriangle" size={32} className="text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Ошибка</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button onClick={handleGenerate} className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Попробовать снова
                </button>
              </div>
            )}

            {script && !isGenerating && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div
                    className="relative rounded-[32px] overflow-hidden shadow-2xl border-4 max-w-[300px] mx-auto"
                    style={{ borderColor: avatar.color + '50' }}
                  >
                    <div className="aspect-[9/16] bg-gradient-to-b from-gray-900 to-black relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-7xl" style={{ filter: `drop-shadow(0 0 25px ${avatar.color})` }}>
                          {avatar.emoji}
                        </div>
                      </div>

                      <div className="absolute top-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-xs">
                          {script.scenes[activeScene]?.time || ''}
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <canvas ref={canvasRef} width={260} height={32} className="w-full h-8 mb-2 rounded" />
                        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 min-h-[70px]">
                          <p className="text-white text-sm leading-relaxed">
                            {isPlaying ? typedText : (script.scenes[activeScene]?.text || '')}
                            {isPlaying && <span className="animate-pulse ml-0.5">|</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: avatar.color + '30' }}>
                            {avatar.emoji}
                          </div>
                          <div>
                            <div className="text-white text-xs font-medium">{avatar.name}</div>
                            <div className="text-white/50 text-[10px]">{script.scenes[activeScene]?.emotion}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button
                      onClick={() => setActiveScene(Math.max(0, activeScene - 1))}
                      className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      disabled={activeScene === 0}
                    >
                      <Icon name="ChevronLeft" size={18} />
                    </button>
                    <button
                      onClick={handlePlay}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                      style={{ backgroundColor: avatar.color }}
                    >
                      <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
                    </button>
                    <button
                      onClick={() => setActiveScene(Math.min(script.scenes.length - 1, activeScene + 1))}
                      className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      disabled={activeScene === script.scenes.length - 1}
                    >
                      <Icon name="ChevronRight" size={18} />
                    </button>
                  </div>
                  <div className="text-center text-xs text-muted-foreground mt-2">
                    Сцена {activeScene + 1} из {script.scenes.length}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{script.title}</h2>
                    <p className="text-primary font-medium">{script.hook}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Icon name="Film" size={18} />
                      Сценарий ({script.scenes.length} сцен)
                    </h3>
                    {script.scenes.map((scene, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveScene(i); setIsPlaying(false); }}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          i === activeScene
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">{scene.time}</span>
                          <span className="text-xs text-muted-foreground">{scene.emotion}</span>
                        </div>
                        <p className="text-sm text-foreground">{scene.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{scene.visual}</p>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="text-sm font-medium text-foreground mb-1">Призыв к действию:</div>
                    <p className="text-sm text-muted-foreground">{script.cta}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {script.hashtags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Сохраняю...</>
                      ) : (
                        <><Icon name="Save" size={20} /> Сохранить проект</>
                      )}
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:shadow-xl hover:shadow-red-500/20 transition-all flex items-center gap-2"
                    >
                      <Icon name="FileDown" size={20} />
                      PDF
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="px-6 py-4 rounded-2xl border-2 border-border hover:border-primary/30 transition-all flex items-center gap-2"
                    >
                      <Icon name="RefreshCw" size={20} />
                      Заново
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step < 5 && (
          <div className="flex items-center justify-between mt-12 max-w-2xl mx-auto">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
              className="px-6 py-3 rounded-full border border-border hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Icon name="ArrowLeft" size={18} />
              {step > 1 ? 'Назад' : 'На главную'}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {step === 4 ? 'Создать видео' : 'Далее'}
              <Icon name={step === 4 ? 'Sparkles' : 'ArrowRight'} size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Create;