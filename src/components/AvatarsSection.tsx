import { useState, useEffect, useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Icon from '@/components/ui/icon';

const AVATARS = [
  { id: 1, name: 'Алиса', role: 'Маркетолог', accent: '#a855f7', emoji: '👩‍💼' },
  { id: 2, name: 'Максим', role: 'Техно-ведущий', accent: '#3b82f6', emoji: '👨‍💻' },
  { id: 3, name: 'Софья', role: 'Инструктор', accent: '#ec4899', emoji: '👩‍🏫' },
  { id: 4, name: 'Артём', role: 'Блогер', accent: '#f59e0b', emoji: '🧑‍🎤' },
  { id: 5, name: 'Виктория', role: 'Ведущая новостей', accent: '#22c55e', emoji: '📰' },
];

const PHRASES = [
  'Привет! Я расскажу о вашем продукте...',
  'Сегодня мы разберём 5 ключевых фишек...',
  'Подписывайтесь и ставьте лайк!',
  'А вы знали, что AI может всё это?',
];

const AvatarsSection = ({ onStart }: { onStart?: () => void }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(Array(32).fill(0));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    setIsTyping(true);
    const phrase = PHRASES[phraseIndex];
    let charIndex = 0;
    setTypedText('');

    const typeInterval = setInterval(() => {
      if (charIndex < phrase.length) {
        setTypedText(phrase.slice(0, charIndex + 1));
        charIndex++;

        setWaveAmplitudes(prev => prev.map(() => Math.random() * 40 + 10));
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setWaveAmplitudes(prev => prev.map(() => 2));

        setTimeout(() => {
          setPhraseIndex(prev => (prev + 1) % PHRASES.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [isVisible, phraseIndex, selectedAvatar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / 32;
      const color = AVATARS[selectedAvatar].accent;

      waveAmplitudes.forEach((amp, i) => {
        const x = i * barWidth;
        const height = amp * (canvas.height / 60);
        const y = (canvas.height - height) / 2;

        ctx.fillStyle = color + '80';
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, height, 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [waveAmplitudes, selectedAvatar]);

  const avatar = AVATARS[selectedAvatar];

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 50%, hsl(var(--background)) 100%)' }}>
      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: avatar.accent + '20', color: avatar.accent }}>
            <Icon name="User" size={16} />
            Профессиональные виртуальные ведущие
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            AI-аватары
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите виртуального ведущего — он озвучит и проведёт ваш контент как профессионал
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div
              className="relative aspect-[9/16] max-w-[320px] mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 transition-colors duration-500"
              style={{ borderColor: avatar.accent + '60' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-8xl transition-all duration-500 hover:scale-110"
                  style={{ filter: `drop-shadow(0 0 30px ${avatar.accent})` }}
                >
                  {avatar.emoji}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <canvas ref={canvasRef} width={280} height={40} className="w-full h-10 mb-3 rounded-lg" />

                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 min-h-[80px]">
                  <p className="text-white text-sm leading-relaxed">
                    {typedText}
                    {isTyping && <span className="animate-pulse ml-0.5">|</span>}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: avatar.accent + '30' }}>
                    {avatar.emoji}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{avatar.name}</div>
                    <div className="text-white/60 text-xs">{avatar.role}</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-0 pointer-events-none rounded-3xl transition-all duration-500"
                style={{ boxShadow: `inset 0 0 60px ${avatar.accent}20, 0 0 80px ${avatar.accent}15` }}
              />
            </div>

            <div
              className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-700 opacity-30"
              style={{ backgroundColor: avatar.accent }}
            />
          </div>

          <div className="space-y-4">
            {AVATARS.map((av, i) => {
              const isSelected = i === selectedAvatar;
              return (
                <button
                  key={av.id}
                  onClick={() => setSelectedAvatar(i)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-500 text-left group ${
                    isSelected
                      ? 'shadow-xl scale-[1.02]'
                      : 'border-border hover:border-border/80 bg-card hover:shadow-md hover:scale-[1.01]'
                  }`}
                  style={isSelected ? {
                    borderColor: av.accent,
                    backgroundColor: av.accent + '10',
                    boxShadow: `0 10px 40px ${av.accent}20`,
                  } : undefined}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all duration-300 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                    style={{ backgroundColor: av.accent + '20' }}
                  >
                    {av.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground text-lg">{av.name}</div>
                    <div className="text-sm text-muted-foreground">{av.role}</div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: av.accent }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: av.accent, animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: av.accent, animationDelay: '0.4s' }} />
                    </div>
                  )}
                  <Icon
                    name={isSelected ? 'Volume2' : 'ChevronRight'}
                    size={20}
                    className="text-muted-foreground transition-transform group-hover:translate-x-1"
                    style={isSelected ? { color: av.accent } : undefined}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => onStart?.()}
            className="px-8 py-4 rounded-full text-white font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${avatar.accent}, ${avatar.accent}cc)`,
              boxShadow: `0 8px 30px ${avatar.accent}30`,
            }}
          >
            <Icon name="Video" size={20} />
            Выбрать аватара и создать видео
          </button>
        </div>
      </div>
    </section>
  );
};

export default AvatarsSection;