import { useState, useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Icon from '@/components/ui/icon';

const NICHES = [
  {
    id: 'smm',
    icon: 'Megaphone',
    title: 'SMM-агентства',
    desc: 'Создавайте контент для 10+ клиентов одновременно. Шаблоны, брендинг, расписание публикаций.',
    metric: 'x5 контента',
    metricLabel: 'при тех же затратах',
    color: '#8b5cf6',
    features: ['Шаблоны для серий', 'Автопостинг', 'Мультибренд'],
  },
  {
    id: 'edu',
    icon: 'GraduationCap',
    title: 'Онлайн-школы',
    desc: 'Превращайте курсы в динамичные видеоуроки с AI-ведущим. Ученики усваивают на 40% лучше.',
    metric: '+40%',
    metricLabel: 'усвоение материала',
    color: '#3b82f6',
    features: ['Видеоуроки', 'Квизы в видео', 'Субтитры'],
  },
  {
    id: 'small',
    icon: 'Store',
    title: 'Малый бизнес',
    desc: 'Рекламные ролики без бюджета на продакшн. Профессиональный контент по цене подписки.',
    metric: '-90%',
    metricLabel: 'затрат на видео',
    color: '#22c55e',
    features: ['Промо-ролики', 'Сторис', 'Обзоры товаров'],
  },
  {
    id: 'personal',
    icon: 'UserCircle',
    title: 'Личный бренд',
    desc: 'Станьте экспертом в своей нише с регулярным видео-контентом. AI делает вас лидером мнений.',
    metric: '30 видео',
    metricLabel: 'в месяц без усилий',
    color: '#ec4899',
    features: ['Экспертный контент', 'Reels/Shorts', 'Подкасты'],
  },
];

const BusinessSection = ({ onStart }: { onStart?: () => void }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  const [activeNiche, setActiveNiche] = useState(0);
  const [tiltStyle, setTiltStyle] = useState<Record<string, React.CSSProperties>>({});
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleMouseMove = (e: React.MouseEvent, id: string) => {
    const el = cardRefs.current.get(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -15;
    const rotateY = (x - 0.5) * 15;

    setTiltStyle(prev => ({
      ...prev,
      [id]: {
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`,
        transition: 'transform 0.1s ease',
      }
    }));
  };

  const handleMouseLeave = (id: string) => {
    setTiltStyle(prev => ({
      ...prev,
      [id]: {
        transform: 'perspective(800px) rotateX(0) rotateY(0) scale(1)',
        transition: 'transform 0.5s ease',
      }
    }));
  };

  const niche = NICHES[activeNiche];

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 50%, hsl(var(--background)) 100%)' }}>
      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: niche.color + '20', color: niche.color }}>
            <Icon name="TrendingUp" size={16} />
            Решения для каждой ниши
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Для бизнеса
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Идеально для SMM, онлайн-школ и малого бизнеса — готовые решения под вашу задачу
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {NICHES.map((n, i) => (
            <div
              key={n.id}
              ref={(el) => { if (el) cardRefs.current.set(n.id, el); }}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-shadow duration-300 ${
                i === activeNiche
                  ? 'shadow-2xl'
                  : 'shadow-md hover:shadow-lg'
              }`}
              style={{
                borderColor: i === activeNiche ? n.color : 'hsl(var(--border))',
                backgroundColor: i === activeNiche ? n.color + '08' : 'hsl(var(--card))',
                opacity: isVisible ? 1 : 0,
                transition: `opacity 0.6s ease ${i * 0.15}s, box-shadow 0.3s, border-color 0.5s, background-color 0.5s`,
                ...(tiltStyle[n.id] || {}),
              }}
              onClick={() => setActiveNiche(i)}
              onMouseMove={(e) => handleMouseMove(e, n.id)}
              onMouseLeave={() => handleMouseLeave(n.id)}
            >
              {i === activeNiche && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: `0 0 40px ${n.color}20` }}
                />
              )}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                  style={{ backgroundColor: n.color + '15' }}
                >
                  <Icon name={n.icon} size={24} style={{ color: n.color }} />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{n.title}</h3>
                <div className="text-2xl font-bold mb-1" style={{ color: n.color }}>{n.metric}</div>
                <div className="text-xs text-muted-foreground">{n.metricLabel}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="relative p-8 md:p-12 rounded-3xl border-2 transition-all duration-700 overflow-hidden"
          style={{
            borderColor: niche.color + '40',
            background: `linear-gradient(135deg, ${niche.color}08 0%, transparent 50%, ${niche.color}05 100%)`,
          }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2 transition-colors duration-700" style={{ backgroundColor: niche.color }} />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300" style={{ backgroundColor: niche.color + '15' }}>
                <Icon name={niche.icon} size={32} style={{ color: niche.color }} />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">{niche.title}</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{niche.desc}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {niche.features.map((feat, fi) => (
                  <span
                    key={fi}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 cursor-default"
                    style={{
                      backgroundColor: niche.color + '15',
                      color: niche.color,
                    }}
                  >
                    {feat}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onStart?.()}
                className="px-8 py-4 rounded-full text-white font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${niche.color}, ${niche.color}cc)`,
                  boxShadow: `0 8px 30px ${niche.color}30`,
                }}
              >
                Попробовать для {niche.title.toLowerCase()}
                <Icon name="ArrowRight" size={20} />
              </button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Рост аудитории', value: '+250%', icon: 'TrendingUp' },
                  { label: 'Вовлечённость', value: '+180%', icon: 'Heart' },
                  { label: 'Экономия', value: '10x', icon: 'Wallet' },
                  { label: 'Скорость', value: '5 мин', icon: 'Zap' },
                ].map((stat, si) => (
                  <div
                    key={si}
                    className="p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border hover:border-transparent hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: `all 0.5s ease ${0.6 + si * 0.1}s`,
                    }}
                  >
                    <Icon name={stat.icon} size={20} className="mb-2 transition-colors" style={{ color: niche.color }} />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;