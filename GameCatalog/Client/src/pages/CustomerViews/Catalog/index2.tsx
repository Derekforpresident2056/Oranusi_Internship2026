import { useState } from 'react';
import gamesData from '../../../data/data.json';
import { catalogstyles as catalogstyle } from './styles';

export default function CustomerCatalog() {
  // 1. Manage the active slide with state
  const [activeSlide, setActiveSlide] = useState(0);
  const newReleases = gamesData.filter(game => game.tags.includes('new-release'));

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

      <div className="h-20 w-full bg-green-300 mb-5"></div>

      <div className="h-50 w-full mb-30 ">
        
        <div className=" overflow-x-auto flex gap-[3%] no-scrollbar">
        {newReleases.map((game) => (
          <a 
            key={game.id} 
            href={game.link}
            className="group relative max-w-[25%] min-w-[25%] h-[90%] rounded-2xl bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/5 flex-shrink-0 overflow-hidden"
          >
            {/* Background Card Image */}
            <img 
              src={game.image} 
              alt={game.title} 
              className="absolute inset-0 w-fit h-fit object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Smooth Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 z-0 transition-transform duration-700 ease-out group-hover:scale-105"></div>

            {/* Title container positioned beautifully at the bottom */}
            <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-center justify-end text-center z-10">
              <h3 className="text-xl font-black uppercase tracking-wider text-white drop-shadow-md group-hover:text-emerald-400 transition-colors duration-300">
                {game.title}
              </h3>
            </div>
          </a>
        ))}
        </div>
      </div>

      <div className="h-100 w-full bg-green-300">
        
      </div>




    </div>
  );
}