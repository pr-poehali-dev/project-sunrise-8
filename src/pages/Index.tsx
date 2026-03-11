import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArcGalleryHero from "@/components/ArcGalleryHero";
import SpeedCreateSection from "@/components/SpeedCreateSection";
import AvatarsSection from "@/components/AvatarsSection";
import AutomationSection from "@/components/AutomationSection";
import BusinessSection from "@/components/BusinessSection";
import FormatsSection from "@/components/FormatsSection";
import Icon from "@/components/ui/icon";

const NAV_ITEMS = [
  { id: "hero", label: "Главная", icon: "Home" },
  { id: "speed", label: "Создание", icon: "Zap" },
  { id: "avatars", label: "Аватары", icon: "User" },
  { id: "automation", label: "Автоматизация", icon: "Sparkles" },
  { id: "business", label: "Бизнес", icon: "TrendingUp" },
  { id: "formats", label: "Форматы", icon: "Video" },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);

  const images = [
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/40e58d92-2ef9-44c1-95e5-0eda2c165ce9.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/38ce97ca-d306-4277-9656-dd5e278efce7.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/49f3cac7-e52e-4dbf-9f79-10f0af961396.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/40e58d92-2ef9-44c1-95e5-0eda2c165ce9.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/38ce97ca-d306-4277-9656-dd5e278efce7.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/49f3cac7-e52e-4dbf-9f79-10f0af961396.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/40e58d92-2ef9-44c1-95e5-0eda2c165ce9.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/38ce97ca-d306-4277-9656-dd5e278efce7.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/49f3cac7-e52e-4dbf-9f79-10f0af961396.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/40e58d92-2ef9-44c1-95e5-0eda2c165ce9.jpg",
    "https://cdn.poehali.dev/projects/a2a41ba5-e011-4b5e-945c-ab520852129f/files/38ce97ca-d306-4277-9656-dd5e278efce7.jpg",
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      const sections = NAV_ITEMS.map(item => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: Infinity };
        return { id: item.id, top: Math.abs(el.getBoundingClientRect().top) };
      });
      const closest = sections.reduce((a, b) => a.top < b.top ? a : b);
      setActiveSection(closest.id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const goCreate = () => navigate("/create");

  return (
    <main className="relative min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`group flex items-center gap-3 transition-all duration-300 ${isActive ? "scale-100" : "scale-90 opacity-60 hover:opacity-100"}`}
              title={item.label}
            >
              <span className={`text-xs font-medium whitespace-nowrap transition-all duration-300 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"}`}>
                {item.label}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-lg" : "bg-card/80 text-muted-foreground hover:bg-card border border-border backdrop-blur-sm"}`}>
                <Icon name={item.icon} size={18} />
              </div>
            </button>
          );
        })}
      </nav>

      <div id="hero">
        <ArcGalleryHero
          images={images}
          startAngle={20}
          endAngle={160}
          radiusLg={480}
          radiusMd={360}
          radiusSm={260}
          cardSizeLg={120}
          cardSizeMd={100}
          cardSizeSm={80}
          className="pt-16 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24"
          onStart={goCreate}
        />
      </div>

      <div id="speed">
        <SpeedCreateSection onStart={goCreate} />
      </div>

      <div id="avatars">
        <AvatarsSection onStart={goCreate} />
      </div>

      <div id="automation">
        <AutomationSection onStart={goCreate} />
      </div>

      <div id="business">
        <BusinessSection onStart={goCreate} />
      </div>

      <div id="formats">
        <FormatsSection onStart={goCreate} />
      </div>

      <footer className="relative py-16 px-6 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Готовы создать первое видео?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Присоединяйтесь к тысячам создателей контента, которые уже используют VibeFactory
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={goCreate}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Icon name="Sparkles" size={20} />
              Создать видео бесплатно
            </button>
            <button
              onClick={() => navigate("/projects")}
              className="px-6 py-4 rounded-full border border-border hover:bg-muted transition-colors text-foreground flex items-center gap-2"
            >
              <Icon name="FolderOpen" size={20} />
              Мои проекты
            </button>
          </div>
          <div className="mt-12 text-sm text-muted-foreground">
            VibeFactory — AI-платформа для создания видео-контента
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;