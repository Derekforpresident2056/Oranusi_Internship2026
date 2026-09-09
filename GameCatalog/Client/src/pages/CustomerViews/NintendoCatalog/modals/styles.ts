export const modalstyles={

    pagecontainer:`
        p-6 
        text-white 
        bg-white 
        rounded-lg
    `,

    slideframe:`
        relative 
        w-full 
        h-[500px] 
        overflow-hidden 
        rounded-xl 
        shadow-lg 
        mb-10
    `,

    imageframe:`
        absolute 
        inset-0 
        w-full 
        h-full
        bg-red-500
        z-0
    `,

    slideImage:`
        absolute 
        inset-0 
        w-full
        h-full 
        bg-cover 
        bg-center 
        flex 
        flex-col 
        justify-center 
        items-center 
        text-center 
        p-8 
        transition-all 
        duration-700 
        ease-in-out    
    `,

    TextBgOverlay:`
        absolute 
        inset-0 
        bg-black/40 
        z-0
    `,

    TextContainer:`
        relative 
        z-10 
        text-white 
        max-w-md
    `,

    SlideTextHeader:`
        text-4xl 
        font-bold 
        mb-2 
        drop-shadow-md
    `,

    SlideTextParagraph:`
        text-lg 
        opacity-90 
        drop-shadow
    `,

    ServiceContainer:`
        h-50 
        w-full 
        no-scrollbar 
        p-1 
        gap-5 
        flex 
        overflow-auto
        mb-15
    `,

    ServiceBlocks:`
        h-full 
        w-[15%] 
        bg-slate-700 
        rounded-xl 
        flex-shrink-0
    `,

    GameshelfContainer:`
        w-full 
        mb-10
    `,

    GameshelfScroller:`
        overflow-x-auto 
        flex gap-[3%] 
        no-scrollbar 
        p-5
    `,

    GameCardItem:`
        group relative 
        w-[12.5%] 
        h-50 
        rounded-2xl 
        bg-zinc-900 
        border 
        border-zinc-800/80 
        transition-all 
        duration-500 
        hover:scale-[1.02] 
        hover:shadow-2xl 
        hover:shadow-red-500 
        flex-shrink-0 
        overflow-hidden 
        hover:w-[20%] 
        flex 
        flex-col 
        justify-end
    `,

    GameCardImage:`
        absolute 
        inset-0 
        w-full 
        h-full 
        object-contain 
        p-2 
        transition-transform 
        duration-700 
        ease-out 
        group-hover:scale-105
    `,

    GameCardImageOverlay:`
        absolute 
        inset-0 
        bg-gradient-to-t 
        from-black 
        via-black/40 
        to-transparent 
        opacity-90 z-0 
        transition-transform 
        duration-700 
        ease-out 
        group-hover:scale-105
    `,

    GameContentContainer:`
        relative 
        w-full 
        p-4 
        flex 
        flex-col 
        items-center 
        text-center 
        z-10 
        space-y-3 
        bg-gradient-to-t 
        from-black 
        via-black/60 
        to-transparent 
        pt-10
    `,

    GameCardTitle:`
        text-xs 
        font-bold 
        uppercase 
        tracking-wider 
        text-white 
        drop-shadow-md 
        group-hover:text-red-500 
        transition-colors 
        duration-300
    `,

    GameCardPopup:`
        w-full 
        flex 
        items-center 
        justify-center 
        gap-2 
        opacity-100 
        max-h-0 
        pointer-events-none 
        translate-y-10 
        transition-all 
        duration-500 
        ease-out 
        group-hover:opacity-100 
        group-hover:max-h-12 
        group-hover:pointer-events-auto 
        group-hover:translate-y-0
    `,

    AddToCartButton:`
        flex-1 
        py-1.5 
        px-2 
        bg-red-500 
        text-white 
        text-[10px] 
        font-black 
        uppercase 
        rounded-lg 
        hover:bg-white 
        hover:text-black 
        transition-colors 
        duration-200 
        shadow-md
    `,

    WishlistButton:`
        py-1.5 
        px-2.5 
        bg-zinc-800 
        border 
        border-zinc-700 
        text-zinc-300 
        text-[10px] 
        font-bold 
        rounded-lg 
        hover:bg-zinc-700 
        hover:text-white 
        transition-colors 
        duration-200
    `
        
}

