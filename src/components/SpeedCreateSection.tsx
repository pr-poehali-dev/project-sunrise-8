import { useState, useEffect, useCallback } from 'react';
import { useScrollReveal, useCountUp } from '@/hooks/useScrollReveal';
import Icon from '@/components/ui/icon';

const STEPS = [
  { id: 1, label: 'Идея', icon: 'Lightbulb', color: '#a855f7', duration: 800 },
  { id: 2, label: 'Текст', icon: 'FileText', color: '#3b82f6', duration: 1200 },
  { id: 3, label: 'Аватар', icon: 'User', color: '#ec4899', duration: 1000 },
  { id: 4, label: 'Монтаж', icon: 'Film', color: '#f59e0b', duration: 1500 },
  { id: 5, label: 'Готово!', icon: 'Rocket', color: '#22c55e', duration: 500 },
];

const SpeedCreateSection = ({ onStart }: { onStart?: () => void }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const { count: videoCount, start: startCount } = useCountUp(847, 2500);

  useEffect(() => {
    if (isVisible && !isRunning) {
      startDemo();
      startCount();
    }
  }, [isVisible]);

  const spawnParticles = useCallback((color: string) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  const startDemo = useCallback(() => {
    setIsRunning(true);
    setActiveStep(0);
    setElapsed(0);

    let step = 0;
    const runStep = () => {
      if (step >= STEPS.length) {
        setIsRunning(false);
        setTimeout(() => startDemo(), 3000);
        return;
      }
      setActiveStep(step);
      spawnParticles(STEPS[step].color);
      step++;
      setTimeout(runStep, STEPS[step - 1].duration);
    };

    runStep();
  }, [spawnParticles]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsed(prev => prev + 100), 100);
    return () => clearInterval(timer);
  }, [isRunning]);

  const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);
  const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-2 h-2 rounded-full animate-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              boxShadow: `0 0 12px ${p.color}`,
            }}
          />
        ))}
      </div>

      <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Icon name="Zap" size={16} />
            5 минут — и видео готово
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Быстрое создание
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            От идеи до готового видео за 5 минут. Никаких сложных настроек — просто смотрите, как AI работает за вас
          </p>
        </div>

        <div className="relative flex items-center justify-between max-w-4xl mx-auto mb-12">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {STEPS.map((step, i) => {
            const isActive = i === activeStep;
            const isComplete = i < activeStep;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(i);
                  spawnParticles(step.color);
                }}
                className="relative z-10 group cursor-pointer"
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? 'scale-125 shadow-2xl'
                      : isComplete
                      ? 'scale-100 shadow-lg'
                      : 'scale-90 shadow-md opacity-50'
                  }`}
                  style={{
                    backgroundColor: isActive || isComplete ? step.color : 'hsl(var(--muted))',
                    boxShadow: isActive ? `0 0 40px ${step.color}80` : undefined,
                  }}
                >
                  {isComplete ? (
                    <Icon name="Check" size={28} className="text-white" />
                  ) : (
                    <Icon name={step.icon} size={28} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                  )}
                </div>
                <div className={`mt-3 text-xs md:text-sm font-medium transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </div>
                {isActive && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: step.color }} />
                      <span className="relative inline-flex rounded-full h-4 w-4" style={{ backgroundColor: step.color }} />
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="group relative p-6 rounded-2xl bg-card border border-border hover:border-purple-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-2">
                {videoCount}+
              </div>
              <div className="text-sm text-muted-foreground">видео создано сегодня</div>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-card border border-border hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:animate-bounce">
                <Icon name="Clock" size={24} className="text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">&lt; 5 мин</div>
                <div className="text-sm text-muted-foreground">среднее время</div>
              </div>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-card border border-border hover:border-green-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 cursor-pointer hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:animate-spin-slow">
                <Icon name="Settings" size={24} className="text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">0 настроек</div>
                <div className="text-sm text-muted-foreground">всё на автомате</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => onStart?.()}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <Icon name="Zap" size={20} />
            Попробовать сейчас
          </button>
        </div>
      </div>
    </section>
  );
};

export default SpeedCreateSection;