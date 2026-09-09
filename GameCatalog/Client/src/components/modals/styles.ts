export const cartmodalstyles={

    modalcontainer:`
        fixed 
        inset-0 
        z-[100] 
        overflow-hidden 
        transition-all 
        duration-500
    `,

    backdrop:`
        absolute 
        inset-0 
        bg-black/60 
        backdrop-blur-sm 
        transition-opacity 
        duration-500
    `,

    slidingpanel:`
        absolute 
        inset-y-0 
        right-0 
        w-full 
        max-w-md 
        bg-zinc-950 
        border-l 
        border-zinc-800 
        p-8 
        shadow-2xl 
        flex 
        flex-col 
        transition-transform 
        duration-500 
        ease-out 
        transform
    `,

    headerblock:`
        flex 
        items-center 
        justify-between 
        border-b 
        border-zinc-900 
        pb-4
    `,

    headertext:`
        text-xl 
        font-black 
        uppercase 
        tracking-wider 
        text-white
    `,

    closebutton:`
        text-zinc-400 
        hover:text-white 
        font-bold 
        text-lg
    `,

    cartcard:`
        flex-1 
        overflow-y-auto 
        no-scrollbar 
        py-6 
        space-y-4
    `,

    cartempty:`
        text-center 
        text-zinc-500 
        text-sm 
        mt-12 
        py-4
    `,

    cardcontent:`
        flex 
        items-center 
        gap-4 
        bg-zinc-900/50 
        p-4 
        rounded-xl 
        border 
        border-zinc-900 
        group
    `,

    cardthumbnail:`
        w-12 
        h-16 
        bg-zinc-900 
        rounded-md 
        overflow-hidden 
        flex-shrink-0 
        border 
        border-zinc-800 
        p-1 
        flex 
        items-center 
        justify-center
    `,

    cardthumbnailimage:`
        h-full 
        object-contain
    `,

    metadetailscontainer:`
        flex-1 
        min-w-0
    `,

    metadetailstext:`
        text-white 
        text-xs 
        font-bold 
        uppercase 
        truncate 
        tracking-wide
    `,

    metadetailsquantity:`
        text-zinc-500 
        text-[11px] 
        mt-1
    `,

    removecart:`
        text-zinc-600 
        hover:text-red-500 
        text-xs 
        px-2 
        transition-colors
    `,

    utilitydrawer:`
        border-t 
        border-zinc-900 
        pt-6 
        mt-auto 
        space-y-4
    `,

    totalreadout:`
        flex 
        items-center 
        justify-between 
        text-sm 
        uppercase 
        font-black 
        tracking-wider
    `,

    clearcartbutton:`
        "px-4 
         py-3 
         border 
         border-zinc-800 
         text-zinc-400 
         hover:text-white 
         hover:bg-zinc-900 
         text-xs 
         font-black 
         uppercase 
         rounded-xl 
         transition-all 
         duration-200"
    `,

    checkoutbutton:`
        flex-1 
        py-3 
        bg-[#E01E93] 
        hover:bg-white 
        hover:text-black 
        disabled:bg-zinc-800 
        disabled:text-zinc-500 
        text-white 
        text-xs 
        font-black 
        uppercase 
        rounded-xl 
        transition-all 
        duration-300 
        shadow-lg 
        shadow-[#E01E93]/10
    `,

    
}

