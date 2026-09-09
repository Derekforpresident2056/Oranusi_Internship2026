import { modalstyles as modalstyle } from './styles';

interface GameDrawerModalProps {
  activeDrawerGame:any;
  onClose: () => void;
}



export default function GameDrawerModal({activeDrawerGame, onClose}: GameDrawerModalProps) {

  

  return(
    <div>
        {/* SLIDE-OVER DRAWER OVERLAY */}
        <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${
            activeDrawerGame ? "pointer-events-auto" : "pointer-events-none"
        }`}>
  
            {/* Dark Backdrop Blur */}
            <div 
                onClick={() => onClose()} // Closes drawer when clicking outside
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
                activeDrawerGame ? "opacity-100" : "opacity-0"
                }`}
            />

                {/* Sliding Content Panel */}
                <div className={`absolute inset-y-0 right-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-8 shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${
                activeDrawerGame ? "translate-x-0" : "translate-x-full"
                }`}>
    
                    {/* Close Button */}
                    <button 
                    onClick={() => onClose()}
                    className="absolute top-5 right-5 text-zinc-400 hover:text-white text-xl font-bold transition-colors"
                    >
                        ✕
                    </button>

                    {/* Render Info dynamically if a game is selected */}
                    {activeDrawerGame && (
                        <div className="flex flex-col h-full mt-6 space-y-6 overflow-y-auto no-scrollbar">
        
                        {/* Game Showcase Image Container */}
                            <div className="w-full h-64 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center p-4">
                                <img 
                                src={activeDrawerGame.image} 
                                alt={activeDrawerGame.title} 
                                className="h-full object-contain rounded-lg"
                                />
                            </div>

                            {/* Info Header */}
                            <div>
                                <span className="text-[10px] bg-[#E01E93]/20 text-[#E01E93] px-2.5 py-1 rounded-full font-black uppercase tracking-widest">
                                    {activeDrawerGame.tags?.[0] || "Catalog Item"}
                                </span>
                                <h2 className="text-2xl font-black uppercase tracking-wider text-white mt-3">
                                    {activeDrawerGame.title}
                                </h2>
                            </div>

                            {/* Placeholder for description fields */}
                            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed border-t border-zinc-900 pt-4">
                                <p className="font-medium text-white text-xs uppercase tracking-wider">Product Overview</p>
                                <p>
                                    {activeDrawerGame.description}
                                </p>
          
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-900 space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-zinc-500">Database Reference Key:</span> <span className="font-mono text-zinc-300">{activeDrawerGame._id}</span></div>
                                    <div className="flex justify-between"><span className="text-zinc-500">Status:</span> <span className="text-emerald-400 font-bold">In Stock</span></div>
                                    <div className="flex justify-between"><span className="text-zinc-500">Target Path:</span> <span className="text-zinc-300">{activeDrawerGame.link}</span></div>
                                </div>
                            </div>

                            {/* Bottom Drawer Actions */}
                            <div className="mt-auto pt-6 border-t border-zinc-900 flex gap-4">
                                <button className="flex-1 py-3 bg-[#E01E93] hover:bg-white hover:text-black text-white text-xs font-black uppercase rounded-xl transition-all duration-300 shadow-lg shadow-[#E01E93]/10">
                                    Instant Purchase
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

        </div>

  );

}