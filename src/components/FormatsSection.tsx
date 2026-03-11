import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Icon from '@/components/ui/icon';

const PLATFORMS = [
  {
    id: 'reels',
    name: 'Instagram Reels',
    icon: 'Instagram',
    color: '#E4405F',
    gradient: 'from-pink-500 via-red-500 to-yellow-500',
    ratio: '9:16',
    maxDuration: '90 сек',
    bestTime: '12:00 — 14:00',
    engagement: '+340%',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'Music',
    color: '#00f2ea',
    gradient: 'from-cyan-400 to-pink-500',
    ratio: '9:16',
    maxDuration: '3 мин',
    bestTime: '19:00 — 21:00',
    engagement: '+520%',
  },
  {
    id: 'shorts',
    name: 'YouTube Shorts',
    icon: 'Youtube',
    color: '#FF0000',
    gradient: 'from-red-600 to-red-400',
    ratio: '9:16',
    maxDuration: '60 сек',
    bestTime: '16:00 — 18:00',
    engagement: '+280%',
  },
  {
    id: 'stories',
    name: 'Stories',
    icon: 'Camera',
    color: '#833AB4',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    ratio: '9:16',
    maxDuration: '15 сек',
    bestTime: '09:00 — 11:00',
    engagement: '+190%',
  },
];

const FEED_ITEMS = [
  { text: 'Как увеличить продажи x3', likes: '12.4K', views: '89K' },
  { text: '5 секретов успешного бизнеса', likes: '8.7K', views: '56K' },
  { text: 'AI заменит маркетологов?', likes: '23.1K', views: '340K' },
];

const FormatsSection = ({ onStart }: { onStart?: () => void }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  const [activePlatform, setActivePlatform] = useState(0);
  const [feedScroll, setFeedScroll] = useState(0);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setFeedScroll(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const platform = PLATFORMS[activePlatform];

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] opacity-10 transition-colors duration-700" style={{ backgroundColor: platform.color }} />
      </div>

      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: platform.color + '20', color: platform.color }}>
            <Icon name="Video" size={16} />
            Один клик — все платформы
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Все форматы
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reels, TikTok, YouTube Shorts — создавайте видео в готовых форматах для всех платформ сразу
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center">
            <div className="relative w-[260px]">
              <div
                className="relative rounded-[40px] overflow-hidden shadow-2xl border-[6px] transition-colors duration-500"
                style={{ borderColor: platform.color + '40' }}
              >
                <div className="aspect-[9/16] bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-20">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Icon name="Signal" size={12} />
                      <span>5G</span>
                    </div>
                    <div className="w-24 h-6 bg-black rounded-full" />
                    <div className="flex items-center gap-1 text-white text-xs">
                      <span>87%</span>
                      <Icon name="Battery" size={12} />
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="text-6xl mb-4 transition-all duration-500"
                        style={{ filter: `drop-shadow(0 0 20px ${platform.color})` }}
                      >
                        {activePlatform === 0 ? '📸' : activePlatform === 1 ? '🎵' : activePlatform === 2 ? '▶️' : '📷'}
                      </div>
                      <div className="text-white font-bold text-lg px-4">
                        {FEED_ITEMS[feedScroll % FEED_ITEMS.length].text}
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Icon name="User" size={14} className="text-white" />
                        </div>
                        <span className="text-white text-sm font-medium">VibeFactory</span>
                      </div>
                      <button className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: platform.color, color: 'white' }}>
                        Подписаться
                      </button>
                    </div>

                    <div className="flex items-center justify-around">
                      {[
                        { icon: 'Heart', label: FEED_ITEMS[feedScroll % FEED_ITEMS.length].likes },
                        { icon: 'MessageCircle', label: '1.2K' },
                        { icon: 'Share2', label: 'Share' },
                        { icon: 'Bookmark', label: '' },
                      ].map((action, ai) => (
                        <button
                          key={ai}
                          className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                        >
                          <Icon name={action.icon} size={20} />
                          {action.label && <span className="text-[10px]">{action.label}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full" />
                </div>
              </div>

              <div
                className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] transition-colors duration-700 opacity-30"
                style={{ backgroundColor: platform.color }}
              />

              <div className="absolute -right-6 top-20 flex flex-col gap-3">
                {PLATFORMS.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(i)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      i === activePlatform ? 'scale-110 shadow-lg' : 'scale-90 opacity-50 hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: i === activePlatform ? p.color : 'hsl(var(--muted))',
                    }}
                  >
                    <Icon name={p.icon} size={20} className={i === activePlatform ? 'text-white' : 'text-muted-foreground'} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name={platform.icon} size={24} style={{ color: platform.color }} />
                {platform.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Формат', value: platform.ratio, icon: 'Maximize' },
                  { label: 'Длительность', value: platform.maxDuration, icon: 'Clock' },
                  { label: 'Лучшее время', value: platform.bestTime, icon: 'Calendar' },
                  { label: 'Рост охвата', value: platform.engagement, icon: 'TrendingUp' },
                ].map((spec, si) => (
                  <div
                    key={si}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name={spec.icon} size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-xs text-muted-foreground">{spec.label}</span>
                    </div>
                    <div className="font-semibold text-foreground">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onStart?.();
                setShowExport(true);
                setTimeout(() => setShowExport(false), 3000);
              }}
              className="w-full p-5 rounded-2xl text-white font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
              style={{
                background: `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                boxShadow: `0 8px 30px ${platform.color}30`,
              }}
            >
              <Icon name="Download" size={22} className="group-hover:animate-bounce" />
              Экспорт для {platform.name}
            </button>

            {showExport && (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Видео экспортируется</div>
                  <div className="text-sm text-muted-foreground">Формат {platform.ratio} для {platform.name}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon name="Info" size={16} />
              <span>Автоматическая адаптация под все платформы одновременно</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormatsSection;