import { useState, useEffect } from 'react';
import { useScrollReveal, useCountUp } from '@/hooks/useScrollReveal';
import Icon from '@/components/ui/icon';

type ConveyorItem = {
  id: number;
  title: string;
  status: 'queued' | 'processing' | 'done';
  progress: number;
};

const AutomationSection = ({ onStart }: { onStart?: () => void }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const [items, setItems] = useState<ConveyorItem[]>([
    { id: 1, title: 'Обзор продукта #1', status: 'done', progress: 100 },
    { id: 2, title: 'Туториал по функциям', status: 'done', progress: 100 },
    { id: 3, title: 'FAQ для клиентов', status: 'processing', progress: 65 },
    { id: 4, title: 'Промо к распродаже', status: 'queued', progress: 0 },
    { id: 5, title: 'Интервью с экспертом', status: 'queued', progress: 0 },
    { id: 6, title: 'Кейс #42: Рост x3', status: 'queued', progress: 0 },
  ]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { count: savedHours, start: startHoursCount } = useCountUp(127, 2000);
  const { count: videosSeries, start: startSeriesCount } = useCountUp(34, 2000);

  useEffect(() => {
    if (isVisible) {
      startHoursCount();
      startSeriesCount();
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setItems(prev => {
        const updated = [...prev];
        const processingIdx = updated.findIndex(i => i.status === 'processing');
        
        if (processingIdx !== -1) {
          const item = updated[processingIdx];
          if (item.progress >= 100) {
            item.status = 'done';
            item.progress = 100;
            const nextQueued = updated.findIndex(i => i.status === 'queued');
            if (nextQueued !== -1) {
              updated[nextQueued].status = 'processing';
              updated[nextQueued].progress = 0;
            }
          } else {
            item.progress = Math.min(item.progress + Math.random() * 8, 100);
          }
        } else {
          const allDone = updated.every(i => i.status === 'done');
          if (allDone) {
            updated.forEach(i => {
              i.status = 'queued';
              i.progress = 0;
            });
            updated[0].status = 'processing';
          }
        }
        return updated;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-6">
            <Icon name="Sparkles" size={16} />
            Серийное производство контента
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Автоматизация
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Создавайте серии видео одним кликом. Конвейер AI обрабатывает задачи параллельно — экономьте часы работы
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-3">
            {items.map((item, i) => {
              const isHovered = hoveredItem === item.id;
              const statusConfig = {
                done: { icon: 'CheckCircle', color: '#22c55e', label: 'Готово', bg: 'bg-green-500/10' },
                processing: { icon: 'Loader', color: '#f59e0b', label: 'В работе', bg: 'bg-amber-500/10' },
                queued: { icon: 'Clock', color: '#6b7280', label: 'В очереди', bg: 'bg-muted' },
              }[item.status];

              return (
                <div
                  key={item.id}
                  className={`relative group p-5 rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                    isHovered ? 'shadow-xl scale-[1.02]' : 'hover:shadow-md hover:scale-[1.005]'
                  } ${
                    item.status === 'processing' ? 'border-amber-500/50 bg-amber-500/5' :
                    item.status === 'done' ? 'border-green-500/30 bg-green-500/5' :
                    'border-border bg-card'
                  }`}
                  style={{
                    animationDelay: `${i * 100}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
                    transition: `all 0.6s ease ${i * 0.1}s`,
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center transition-all ${
                      item.status === 'processing' ? 'animate-spin-slow' : ''
                    }`}>
                      <Icon name={statusConfig.icon} size={20} style={{ color: statusConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground truncate">{item.title}</span>
                        <span className="text-xs px-2 py-1 rounded-full ml-3 whitespace-nowrap" style={{
                          backgroundColor: statusConfig.color + '15',
                          color: statusConfig.color,
                        }}>
                          {statusConfig.label}
                        </span>
                      </div>
                      {item.status === 'processing' && (
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${item.progress}%`,
                              background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {isHovered && item.status === 'done' && (
                    <div className="absolute -right-2 -top-2 flex gap-1">
                      <button className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:scale-110 transition-transform">
                        <Icon name="Download" size={14} className="text-foreground" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:scale-110 transition-transform">
                        <Icon name="Share2" size={14} className="text-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 cursor-pointer hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 group-hover:animate-bounce">
                <Icon name="Clock" size={28} className="text-amber-500" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{savedHours}ч</div>
              <div className="text-muted-foreground">сэкономлено этим месяцем</div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:animate-pulse">
                <Icon name="Layers" size={28} className="text-purple-500" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{videosSeries} серий</div>
              <div className="text-muted-foreground">запущено автоматически</div>
            </div>

            <button
              onClick={() => onStart?.()}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
            >
              <Icon name="Play" size={22} className="group-hover:animate-pulse" />
              Запустить конвейер
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutomationSection;