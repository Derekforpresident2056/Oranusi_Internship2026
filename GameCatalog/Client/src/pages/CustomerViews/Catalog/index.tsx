import { useState, useEffect } from 'react';
import { catalogstyles as catalogstyle } from './styles';

interface Game {
  _id: string;
  title: string;
  image: string;
  link: string;
  tags: string[]; // Keep tags interface so we can filter on them
}

export default function CustomerCatalog() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // 1. Store the complete list of games fetched from MongoDB
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 3. Filter locally for the 'new-release' tag exactly like your JSON setup did
  const newReleases = allGames.filter((game) => Array.isArray(game.tags) && game.tags.includes('new-release'));

  const nintendo = allGames.filter((game) => Array.isArray(game.tags) && game.tags.includes('nintendo'));

  const slides = [
    {
      id: 0,
      title: "Majestic Mountains",
      description: "Explore the breathtaking views of the great outdoors.",
      bgImage: "/images/DS1.jpg",
    },
    {
      id: 1,
      title: "Misty Forests",
      description: "Get lost in the serene whispers of nature.",
      bgImage: "/images/MK11.png"
    },
    {
      id: 2,
      title: "Serene Rivers",
      description: "Follow the peaceful flow of winding waters.",
      bgImage: "/images/FC26.jpg"
    },
  ];

  console.log("Nintendo games found:", nintendo);
  console.log("Raw games from database:", allGames);
  
  return (
    <div className={catalogstyle.pagecontainer}>
      <div className={catalogstyle.slideframe}>
        
        {/* SLIDES CONTAINER (Unchanged) */}
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
                <div className={catalogstyle.TextBgOverlay}></div>
                <div className={catalogstyle.TextContainer}>
                  <h2 className={catalogstyle.SlideTextHeader}> {slide.title} </h2>
                  <p className={catalogstyle.SlideTextParagraph}> {slide.description} </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TRACKER DOTS (Unchanged) */}
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
        <p className={catalogstyle.SlideTextHeader}>The Latest Releases,<span className="text-[#E01E93]"> JUST FOR YOU</span></p>
      </div>

      {/* NEW RELEASES BIT - FILTERED FROM ALL LIVE MONGO DATA */}
      <div className="h-100 w-full mb-10">
        <div className="overflow-x-auto flex gap-[3%] no-scrollbar p-5">
          {loading ? (
            <div className="text-white text-lg p-6 animate-pulse">Loading items...</div>
          ) : (
            newReleases.map((game) => (
              <a 
                key={game._id} 
                href={game.link}
                className="group relative max-w-[25%] min-w-[25%] h-90 rounded-2xl bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#E01E93] flex-shrink-0 overflow-hidden"
              >
                {/* Background Card Image */}
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="absolute inset-0 w-full h-[90%] object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Smooth Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 z-0 transition-transform duration-700 ease-out group-hover:scale-105"></div>

                {/* Title container */}
                <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-center justify-end text-center z-10">
                  <h3 className="text-xl font-black uppercase tracking-wider text-white drop-shadow-md group-hover:text-[#E01E93] transition-colors duration-300">
                    {game.title}
                  </h3>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      <div className="h-20 w-full">
        <p className={catalogstyle.SlideTextHeader}>Our Services,<span className="text-[#E01E93]"> WE OFFER </span></p>
      </div>

      <div className={catalogstyle.ServiceContainer}>
        <div className={catalogstyle.ServiceBlocks}></div>
        <div className={catalogstyle.ServiceBlocks}></div>
        <div className={catalogstyle.ServiceBlocks}></div>
        <div className={catalogstyle.ServiceBlocks}></div>
        <div className={catalogstyle.ServiceBlocks}></div>
        <div className={catalogstyle.ServiceBlocks}></div>
        <div className={catalogstyle.ServiceBlocks}></div>
      </div>

      <div className="h-20 w-full">
        <p className={catalogstyle.SlideTextHeader}>Nintendo's Finest, <span className="text-[#E01E93]">JUST FOR YOU</span></p>
      </div>

      <div className="h-100 w-full mb-10">
        <div className="overflow-x-auto flex gap-[3%] no-scrollbar p-5">
          {loading ? (
            <div className="text-white text-lg p-6 animate-pulse">Loading items...</div>
          ) : (
            nintendo.map((game) => (
              <a 
                key={game._id} 
                href={game.link}
                // Added 'flex flex-col justify-end' to help handle structural layout cleanly as it expands
                className="group relative w-[12.5%] h-50 rounded-2xl bg-zinc-900 border border-zinc-800/80 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#E01E93] flex-shrink-0 overflow-hidden hover:w-[20%] flex flex-col justify-end"
              >
              {/* Background Card Image */}
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-105"
                />

              {/* Smooth Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 z-0 transition-transform duration-700 ease-out group-hover:scale-105"></div>

              {/* Content Container (Title + Buttons) */}
              <div className="relative w-full p-4 flex flex-col items-center text-center z-10 space-y-3 bg-gradient-to-t from-black via-black/60 to-transparent pt-10">
    
                {/* Title (Shrunk text size slightly to give buttons breathing room) */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-md group-hover:text-[#E01E93] transition-colors duration-300">
                  {game.title}
                </h3>

                {/* HIDDEN ACTIONS DRAWER - Pops up on group-hover */}
                <div className="w-full flex items-center justify-center gap-2 opacity-100 max-h-0 pointer-events-none translate-y-10 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:max-h-12 group-hover:pointer-events-auto group-hover:translate-y-0">
      
                  {/* Add To Cart Button */}
                  <button 
                  onClick={(e) => {
                    e.preventDefault(); // Prevents clicking the button from activating the <a> link anchor navigation
                    console.log("Added to cart:", game.title);
                    }}
                  className="flex-1 py-1.5 px-2 bg-[#E01E93] text-white text-[10px] font-black uppercase rounded-lg hover:bg-white hover:text-black transition-colors duration-200 shadow-md"
                  >
                    + Cart
                  </button>

                  {/* Wishlist Button */}
                  <button 
                  onClick={(e) => {
                    e.preventDefault(); // Prevents parent link navigation
                    console.log("Wishlisted:", game.title);
                    }}
                  className="py-1.5 px-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold rounded-lg hover:bg-zinc-700 hover:text-white transition-colors duration-200"
                  aria-label="Add to wishlist"
                  >
                    ♥
                  </button>

                </div>
              </div>
            </a>
            ))
          )}
        </div>
      </div>


    </div>
  );
}