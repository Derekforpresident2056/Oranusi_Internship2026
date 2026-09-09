import { useState, useEffect} from 'react';
import { dashboardstyles as dashstyle } from './styles';
import WelcomeModal from './modals/WelcomeModal';


// 1. Move your image data to a clean, manageable array
const GAME_CARDS = [
  { id: 1, img: '/images/Monster-Hunter-Wilds-Cover-Art-Digital.png', alt: 'Monster Hunter Wilds' },
  { id: 2, img: '/images/CodeVein.png', alt: 'Code Vein' },
  { id: 3, img: '/images/DS3.png', alt: 'Dark Souls 3' },
];

// Tripling the array dynamically to fill out your continuous scrolling rows
const ROW_DATA = [...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS, ...GAME_CARDS];

export default function CustomerDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trigger modal on page load
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  
  // Reusable card rendering component to keep code DRY
  const renderRowCards = () => (
    ROW_DATA.map((card, index) => (
      <div 
        key={`${card.id}-${index}`} 
        className={dashstyle.RowCards} 
        style={{ backgroundImage: `url('${card.img}')` }}
      >
        <div className={dashstyle.CardImage} style={{ backgroundImage: "inherit" }}></div>
        <div className={dashstyle.cardImageEffect} style={{ backgroundImage: "inherit" }}></div>
      </div>
    ))
  );

  

  return (
    <div className={`${dashstyle.Parallax3d} relative min-h-screen overflow-hidden bg-zinc-950 text-white`}>
      
         
      {/* Bottom Right: Reopen Welcome/Info */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-4 right-4 z-40 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2 px-3 text-sm rounded-full shadow-md border border-zinc-700 transition-all active:scale-95"
      >
        Open Menu ☰
      </button>


      {/* --- PARALLAX BACKGROUND GRID --- */}
      <div className={dashstyle.ColorShadow1}></div>

      <div className={dashstyle.Parallax3d_Container}>
        <div className={dashstyle.FastRow}>
          {renderRowCards()}
        </div>

        <div className={dashstyle.SlowRow}>
          {renderRowCards()}
        </div>

        <div className={dashstyle.FastRowRev}>
          {renderRowCards()}
        </div>
      </div>      
      
      <div className={dashstyle.ColorShadow2}></div>



      <WelcomeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
    </div>


  );
}
