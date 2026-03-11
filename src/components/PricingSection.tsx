import Icon from '@/components/ui/icon';

const PricingSection = () => {
  const plans = [
    {
      name: 'Старт',
      price: 'Бесплатно',
      description: 'Попробуйте возможности платформы',
      features: [
        '5 видео в месяц',
        'Базовые AI-аватары',
        'Водяной знак VibeFactory',
        'Экспорт до 720p',
        'Поддержка по email',
      ],
      cta: 'Начать бесплатно',
      highlighted: false,
    },
    {
      name: 'Профи',
      price: '2 990 ₽',
      period: '/месяц',
      description: 'Для активных создателей контента',
      features: [
        '50 видео в месяц',
        'Все премиум аватары',
        'Без водяных знаков',
        'Экспорт до 4K',
        'Приоритетная поддержка',
        'Автопостинг в соцсети',
        'Брендинг и логотипы',
      ],
      cta: 'Попробовать 7 дней',
      highlighted: true,
    },
    {
      name: 'Бизнес',
      price: '9 990 ₽',
      period: '/месяц',
      description: 'Для агентств и команд',
      features: [
        'Безлимитные видео',
        'Кастомные аватары',
        'API доступ',
        'Мультиаккаунт (5 мест)',
        'Персональный менеджер',
        'Расширенная аналитика',
        'Белая метка',
        'SLA 99.9%',
      ],
      cta: 'Связаться с нами',
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Тарифы для любых задач
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            От тестирования до масштабных проектов — выберите свой план
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/20 scale-105'
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                  Популярный
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-lg">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Icon 
                      name="Check" 
                      className={plan.highlighted ? 'text-primary' : 'text-muted-foreground'} 
                      size={20} 
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-full font-semibold transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
                    : 'bg-accent text-accent-foreground hover:bg-accent/80 border border-border'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Все тарифы включают SSL, CDN и автоматические обновления</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
