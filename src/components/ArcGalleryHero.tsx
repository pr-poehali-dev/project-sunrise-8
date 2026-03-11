import { useEffect, useState, useRef } from 'react';
import Icon from '@/components/ui/icon';

type ArcGalleryHeroProps = {
  images: string[];
  startAngle?: number;
  endAngle?: number;
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  className?: string;
  onStart?: () => void;
};

type Collection = {
  id: string;
  name: string;
  images: string[];
  position: { x: number; y: number };
};

type FlyingImage = {
  src: string;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  id: string;
};

const ArcGalleryHero = ({
  images,
  startAngle = -110,
  endAngle = 110,
  radiusLg = 340,
  radiusMd = 280,
  radiusSm = 200,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = '',
  onStart,
}: ArcGalleryHeroProps) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });
  const [rotation, setRotation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOverGallery, setIsOverGallery] = useState(false);
  const [draggedImage, setDraggedImage] = useState<{ src: string; index: number; fromCollection?: string } | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [hoveredCollectionId, setHoveredCollectionId] = useState<string | null>(null);
  const [flyingImages, setFlyingImages] = useState<FlyingImage[]>([]);
  const [openedCollectionId, setOpenedCollectionId] = useState<string | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const galleryRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const collectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (isOverGallery) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    return () => window.removeEventListener('wheel', preventScroll);
  }, [isOverGallery]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => prev === null ? null : (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => prev === null ? null : (prev + 1) % images.length);
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRotation(prev => prev + e.deltaY * 0.1);
  };

  const handleMouseDown = (e: React.MouseEvent, src: string, index: number, fromCollection?: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggedImage({ src, index, fromCollection });
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedImage) return;
    setDragPosition({ x: e.clientX, y: e.clientY });

    let foundHover = false;
    collections.forEach(collection => {
      if (collection.id === draggedImage.fromCollection) return;
      
      const ref = collectionRefs.current.get(collection.id);
      if (!ref) return;
      
      const rect = ref.getBoundingClientRect();
      const isOver = 
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      
      if (isOver) {
        foundHover = true;
        setHoveredCollectionId(collection.id);
      }
    });

    if (!foundHover) {
      setHoveredCollectionId(null);
    }
  };

  const createFlyingAnimation = (startPos: { x: number; y: number }, endPos: { x: number; y: number }, src: string) => {
    const flyingId = Date.now().toString() + Math.random();
    setFlyingImages(prev => [...prev, { src, startPos, endPos, id: flyingId }]);
    
    setTimeout(() => {
      setFlyingImages(prev => prev.filter(f => f.id !== flyingId));
    }, 600);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggedImage) return;

    const galleryBounds = galleryRef.current?.getBoundingClientRect();

    if (hoveredCollectionId && hoveredCollectionId !== draggedImage.fromCollection) {
      const collection = collections.find(c => c.id === hoveredCollectionId);
      if (collection) {
        createFlyingAnimation(
          { x: e.clientX, y: e.clientY },
          collection.position,
          draggedImage.src
        );
        
        setCollections(prev => prev.map(c => 
          c.id === hoveredCollectionId 
            ? { ...c, images: [...c.images, draggedImage.src] }
            : c.id === draggedImage.fromCollection
            ? { ...c, images: c.images.filter(img => img !== draggedImage.src) }
            : c
        ));
      }
    } else if (draggedImage.fromCollection) {
      setCollections(prev => prev.map(c => 
        c.id === draggedImage.fromCollection
          ? { ...c, images: c.images.filter(img => img !== draggedImage.src) }
          : c
      ));
    } else {
      const isOutsideGallery = !galleryBounds || 
        e.clientY < galleryBounds.top - 50 || 
        e.clientY > galleryBounds.bottom + 50 ||
        e.clientX < galleryBounds.left - 50 ||
        e.clientX > galleryBounds.right + 50;

      if (isOutsideGallery) {
        const endPos = { x: e.clientX, y: e.clientY };
        createFlyingAnimation(
          { x: e.clientX, y: e.clientY },
          endPos,
          draggedImage.src
        );

        setTimeout(() => {
          const newCollection: Collection = {
            id: Date.now().toString(),
            name: 'Новая папка',
            images: [draggedImage.src],
            position: endPos,
          };
          setCollections(prev => [...prev, newCollection]);
        }, 300);
      }
    }

    setDraggedImage(null);
    setHoveredCollectionId(null);
  };

  const handleDeleteCollection = (collectionId: string) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId));
    if (openedCollectionId === collectionId) {
      setOpenedCollectionId(null);
    }
  };

  const handleRenameCollection = (collectionId: string, newName: string) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId ? { ...c, name: newName } : c
    ));
    setEditingCollectionId(null);
  };

  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  const openedCollection = collections.find(c => c.id === openedCollectionId);

  return (
    <section 
      ref={sectionRef}
      className={`relative overflow-visible bg-background min-h-screen flex flex-col ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ touchAction: 'pan-y' }}
    >
      <div
        ref={galleryRef}
        className="relative mx-auto cursor-grab active:cursor-grabbing"
        style={{
          width: '100%',
          height: dimensions.radius * 1.2,
        }}
        onWheel={handleWheel}
        onMouseEnter={() => setIsOverGallery(true)}
        onMouseLeave={() => setIsOverGallery(false)}
      >
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
          {images.map((src, i) => {
            const angle = startAngle + step * i + rotation * 0.2;
            const angleRad = (angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;
            const isHovered = hoveredIndex === i;
            const isDragging = draggedImage?.index === i && !draggedImage.fromCollection;

            return (
              <div
                key={i}
                className="absolute opacity-0 animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: `translate(-50%, 50%)`,
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'forwards',
                  zIndex: isHovered ? count + 10 : count - i,
                  transition: 'z-index 0.3s, filter 0.3s',
                  opacity: isDragging ? 0.3 : undefined,
                }}
                onMouseEnter={() => !draggedImage && setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="relative rounded-2xl shadow-xl overflow-hidden ring-1 ring-border bg-card w-full h-full cursor-grab active:cursor-grabbing"
                  style={{ 
                    transform: `rotate(${angle / 4}deg) ${isHovered ? 'scale(1.15)' : 'scale(1)'}`,
                    transition: 'transform 0.3s ease-out',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, src, i)}
                  onClick={(e) => {
                    if (!draggedImage) {
                      setSelectedIndex(i);
                    }
                  }}
                >
                  {isHovered && !draggedImage && (
                    <>
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: '0 0 30px 8px rgba(139, 92, 246, 0.6), 0 0 60px 15px rgba(139, 92, 246, 0.4)',
                          borderRadius: '1rem',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      />
                      <div 
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                      >
                        <div 
                          className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 opacity-60"
                          style={{
                            background: 'radial-gradient(ellipse, rgba(200, 200, 255, 0.6) 0%, transparent 60%)',
                            filter: 'blur(20px)',
                            animation: 'smoke 4s ease-in-out infinite',
                          }}
                        />
                      </div>
                    </>
                  )}
                  <img
                    src={src}
                    alt=""
                    className="block w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
        <div className="text-center max-w-2xl px-6 opacity-0 animate-fade-in" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground drop-shadow-lg">
            От идеи до Reels за 5 минут
          </h1>
          <p className="mt-4 text-lg text-muted-foreground drop-shadow-md">
            Создавайте профессиональный видео-контент с AI-аватарами для TikTok, Reels и YouTube Shorts
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStart?.()}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Попробовать бесплатно
            </button>
            <button
              onClick={() => document.getElementById('speed')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              Посмотреть примеры
            </button>
          </div>
        </div>
      </div>

      {draggedImage && (
        <div
          className="fixed pointer-events-none z-[100]"
          style={{
            left: dragPosition.x - 60,
            top: dragPosition.y - 60,
            width: 120,
            height: 120,
          }}
        >
          <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden ring-2 ring-primary animate-pulse">
            <img
              src={draggedImage.src}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {flyingImages.map((flying) => (
        <div
          key={flying.id}
          className="fixed pointer-events-none z-[90]"
          style={{
            left: flying.startPos.x - 60,
            top: flying.startPos.y - 60,
            width: 120,
            height: 120,
            animation: 'fly-to-folder 0.6s ease-out forwards',
            '--end-x': `${flying.endPos.x - flying.startPos.x}px`,
            '--end-y': `${flying.endPos.y - flying.startPos.y}px`,
          } as React.CSSProperties}
        >
          <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden ring-2 ring-primary">
            <img
              src={flying.src}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}

      {collections.map((collection) => {
        const isHovered = hoveredCollectionId === collection.id;
        const isEditing = editingCollectionId === collection.id;
        
        return (
          <div
            key={collection.id}
            ref={(el) => {
              if (el) collectionRefs.current.set(collection.id, el);
              else collectionRefs.current.delete(collection.id);
            }}
            className="fixed z-40 animate-scale-in"
            style={{
              left: collection.position.x - 80,
              top: collection.position.y - 80,
            }}
          >
            <div className="relative group">
              <div 
                className={`w-40 h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center p-4 transition-all duration-300 cursor-pointer ${
                  isHovered 
                    ? 'border-primary scale-110 shadow-2xl ring-4 ring-primary/30' 
                    : 'border-primary/50 hover:scale-105'
                }`}
                onClick={() => setOpenedCollectionId(collection.id)}
              >
                <div className="grid grid-cols-2 gap-1 w-20 h-20 mb-2">
                  {collection.images.slice(0, 4).map((img, idx) => (
                    <div 
                      key={idx} 
                      className="rounded-lg overflow-hidden shadow-lg ring-1 ring-primary/30"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {collection.images.length < 4 && [...Array(4 - collection.images.length)].map((_, idx) => (
                    <div key={`empty-${idx}`} className="rounded-lg bg-primary/10" />
                  ))}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRenameCollection(collection.id, editingName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameCollection(collection.id, editingName);
                      if (e.key === 'Escape') setEditingCollectionId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="text-xs text-primary font-semibold bg-background/80 px-2 py-1 rounded-full text-center w-full"
                  />
                ) : (
                  <div 
                    className="text-xs text-primary font-semibold bg-background/80 px-2 py-1 rounded-full truncate w-full text-center"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingCollectionId(collection.id);
                      setEditingName(collection.name);
                    }}
                  >
                    {collection.name}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {collection.images.length} фото
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCollection(collection.id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:scale-110 transition-transform shadow-lg"
                title="Удалить папку"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {openedCollection && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setOpenedCollectionId(null)}
        >
          <div 
            className="relative max-w-6xl w-full max-h-[90vh] bg-card/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{openedCollection.name}</h2>
              <button
                onClick={() => setOpenedCollectionId(null)}
                className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-all flex items-center justify-center"
                title="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {openedCollection.images.map((img, idx) => (
                <div 
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden shadow-lg ring-1 ring-border hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                    draggable={false}
                    onMouseDown={(e) => handleMouseDown(e, img, idx, openedCollection.id)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setCollections(prev => prev.map(c => 
                          c.id === openedCollection.id
                            ? { ...c, images: c.images.filter(i => i !== img) }
                            : c
                        ));
                      }}
                      className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform"
                      title="Удалить из папки"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {openedCollection.images.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Icon name="FolderOpen" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Папка пуста</p>
                <p className="text-sm mt-2">Перетащите сюда картинки из галереи</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-primary transition-all text-2xl font-bold flex items-center justify-center backdrop-blur-sm"
            title="Закрыть (Esc)"
          >
            ✕
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) => prev === null ? null : (prev - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-primary transition-all text-2xl font-bold flex items-center justify-center backdrop-blur-sm"
            title="Предыдущая (←)"
          >
            ‹
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) => prev === null ? null : (prev + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-primary transition-all text-2xl font-bold flex items-center justify-center backdrop-blur-sm"
            title="Следующая (→)"
          >
            ›
          </button>

          <div 
            className="relative max-w-5xl w-full max-h-[90vh] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]}
              alt=""
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
              style={{
                maxHeight: '90vh',
                boxShadow: '0 0 60px 20px rgba(139, 92, 246, 0.5)',
              }}
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes smoke {
          0%, 100% { 
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-20px) scale(1.1);
            opacity: 0.3;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fly-to-folder {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default ArcGalleryHero;