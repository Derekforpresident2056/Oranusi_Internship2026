'use client';
import { useState, useEffect } from 'react';
import { catalogstyles as catalogstyle } from './styles';
import GameDrawerModal from './modals/GameDrawerModal';
import { useCart } from '../../../context/CartContext';

interface Game {
  _id: string;
  title: string;
  image: string;
  link: string;
  price: number;
  tags: string[]; // Keep tags interface so we can filter on them
}

export default function CustomerCatalog() {

  const { addToCart } = useCart();

  // 1. Manage the active slide with state
  const [activeSlide, setActiveSlide] = useState(0);

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeDrawerGame, setActiveDrawerGame] = useState<Game | null>(null);

  // 2. Fetch ALL items from your main catalog endpoint
  useEffect(() => {
    // Make sure your backend route sends back the whole collection
    fetch('http://localhost:5000/api/games') 
      .then((res) => res.json())
      .then((data) => {
        setAllGames(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching games catalog:', err);
        setLoading(false);
      });
  }, []);

    const nintendo = allGames.filter((game) => Array.isArray(game.tags) && game.tags.includes('nintendo'));

  const slides = [
    {
      id: 0,
      title: "Majestic Mountains",
      description: "Explore the breathtaking views of the great outdoors.",
      bgImage: "/images/LetsGo.jpg",
    },
    {
      id: 1,
      title: "Misty Forests",
      description: "Get lost in the serene whispers of nature.",
      bgImage: "/images/Gen8startmon.jpg",
    },
    {
      id: 2,
      title: "Serene Rivers",
      description: "Follow the peaceful flow of winding waters.",
      bgImage: "/images/MarioLuigi.jpg"
    },
    {
      id: 3,
      title: "Serene Rivers",
      description: "Follow the peaceful flow of winding waters.",
      bgImage: "/images/Minecraft.jpg"
    },
    {
      id: 4,
      title: "Serene Rivers",
      description: "Follow the peaceful flow of winding waters.",
      bgImage: "/images/SwSh.jpg"
    },
  ];

  return (
    <div className={catalogstyle.pagecontainer}>
      <div className={catalogstyle.slideframe}>
        
        {/* SLIDES CONTAINER */}
        <div className={catalogstyle.imageframe}>
          {slides.map((slide, index) => {
            const isActive = activeSlide === index;
            return (
              <div  
                key={slide.id}
                style={{ backgroundImage: `url('${slide.bgImage}')` }}
                className={`${catalogstyle.slideImage} ${
                  isActive 
                    ? "opacity-100 z-10 scale-100" 
                    : "opacity-0 z-0 scale-75 pointer-events-none"
                }`}
              >
                {/* Dark overlay for text readability */}
                <div className={catalogstyle.TextBgOverlay}></div>
                
                {/* Foreground Text */}
                <div className={catalogstyle.TextContainer}>
                  <h2 className={catalogstyle.SlideTextHeader}> {slide.title} </h2>
                  <p className={catalogstyle.SlideTextParagraph}> {slide.description} </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TRACKER DOTS */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-3 rounded-full transition-all duration-300 ${
                activeSlide === index 
                  ? "bg-white w-8" 
                  : "bg-white/50 w-3 hover:bg-white"
              }`}
            />
          ))}
        </div>

      </div>

      
      <div className="h-20 w-full">
        <p className={`${catalogstyle.SlideTextHeader} text-black`}>Nintendo's Finest, <span className="text-red-500">JUST FOR YOU</span></p>
      </div>

      <div className={catalogstyle.GameshelfContainer}>
        <div className={catalogstyle.GameshelfScroller}>
          {loading ? (
            <div className="text-white text-lg p-6 animate-pulse">Loading items...</div>
          ) : (
            nintendo.map((game) => (
              <div 
                key={game._id} 
                onClick={() => setActiveDrawerGame(game)}
                className={catalogstyle.GameCardItem}
              >
              {/* Background Card Image */}
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className={catalogstyle.GameCardImage}
                />

              {/* Smooth Dark Vignette Overlay */}
                <div className={catalogstyle.GameCardImageOverlay}></div>

              {/* Content Container (Title + Buttons) */}
              <div className={catalogstyle.GameContentContainer}>
    
                {/* Title (Shrunk text size slightly to give buttons breathing room) */}
                <h3 className={catalogstyle.GameCardTitle}>
                  {game.title}
                </h3>

                {/* HIDDEN ACTIONS DRAWER - Pops up on group-hover */}
                <div className={catalogstyle.GameCardPopup}>
      
                  {/* Add To Cart Button */}
                  <button 
                  onClick={(e) => {
                    e.preventDefault(); // Prevents clicking the button from activating the <a> link anchor navigation
                    e.stopPropagation();
                    addToCart(game);
                    console.log(`Added ${game.title} to temporary memory cart.`);
                    }}
                  className={catalogstyle.AddToCartButton}
                  >
                    + Cart
                  </button>

                  {/* Wishlist Button */}
                  <button 
                  onClick={(e) => {
                    e.preventDefault(); // Prevents parent link navigation
                    console.log("Wishlisted:", game.title);
                    }}
                  className={catalogstyle.WishlistButton}
                  aria-label="Add to wishlist"
                  >
                    ♥
                  </button>

                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      <GameDrawerModal
        activeDrawerGame={activeDrawerGame}
        onClose={() => setActiveDrawerGame(null)}
      />
      
    </div>
  );
}