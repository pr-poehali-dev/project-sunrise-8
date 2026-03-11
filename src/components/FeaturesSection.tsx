import Icon from '@/components/ui/icon';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'Zap',
      title: 'Быстрое создание',
      description: 'От идеи до готового видео за 5 минут. Никаких сложных настроек.',
    },
    {
      icon: 'User',
      title: 'AI-аватары',
      description: 'Профессиональные виртуальные ведущие для вашего контента.',
    },
    {
      icon: 'Sparkles',
      title: 'Автоматизация',
      description: 'Создавайте серии видео одним кликом. Экономьте часы работы.',
    },
    {
      icon: 'TrendingUp',
      title: 'Для бизнеса',
      description: 'Идеально для SMM, онлайн-школ и малого бизнеса.',
    },
    {
      icon: 'Video',
      title: 'Все форматы',
      description: 'Reels, TikTok, YouTube Shorts — готовые форматы для всех платформ.',
    },
    {
      icon: 'Palette',
      title: 'Брендинг',
      description: 'Добавляйте логотипы, цвета бренда и фирменный стиль.',
    },
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Почему выбирают VibeFactory
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Создавайте профессиональный видео-контент без съёмок, монтажа и команды
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon name={feature.icon} className="text-primary" size={28} />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;