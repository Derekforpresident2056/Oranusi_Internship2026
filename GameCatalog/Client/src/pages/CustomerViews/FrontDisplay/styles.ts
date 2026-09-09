export const dashboardstyles={
   
    Parallax3d:`
        fixed
        inset-0
        bg-[#131520]
        overflow-hidden
        flex
        items-center
        justify-center
    `,

    Parallax3d_Container:`
        absolute 
        top-1/2 
        left-1/2 
        h-[150vh] 
        flex 
        flex-col 
        justify-center 
        opacity-80 
        -translate-x-1/2 
        -translate-y-1/2 
        [perspective:800px] 
        [transform-style:preserve-3d] 
        rotate-y-10 
        -rotate-x-10
    `,

    FastRow:`
        flex 
        translate-x-[0%]
        animate-[runner_7s_linear_infinite]
    `,

    RowCards:`
        group 
        relative 
        flex-none 
        h-[24vh] 
        w-[24vh] 
        m-[clamp(10px,2vw,20px)] 
        rounded-xl 
        bg-cover 
        bg-center 
        transition-all 
        duration-300 
        ease-in-out
    `,

    CardImage:`
        absolute
        inset-0
        z-10 
        bg-cover 
        bg-center 
        rounded-xl 
        transition-all 
        duration-300 
        ease-in-out 
        cursor-pointer 
        group-hover:scale-110
    `,

    cardImageEffect:`
       absolute 
       inset-x-0 
       bottom-[-3vh] 
       top-[3vh] 
       -z-10 
       rounded-full 
       bg-cover 
       bg-center 
       opacity-80 
       blur-[25px] 
       transition-all 
       duration-300 
       ease-in-out 
       group-hover:blur-[35px]
    `,


    SlowRow:`
        flex 
        translate-x-[0%]
        animate-[runner_10s_linear_infinite]
    `,

    FastRowRev:`
        flex 
        translate-x-[0%]
        animate-[revrunner_10s_linear_infinite]
    `,

    ColorShadow1:`
        opacity-70
        bg-[#E01E93]
        h-25
        w-[100%]
        absolute
        top-0
        z-5
        blur-3xl
    `,

    ColorShadow2:`
        opacity-70
        bg-[#1197E8]
        h-25
        w-[100%]
        absolute
        bottom-0
        z-5
        blur-3xl
    `,

    backdrop:`
        fixed 
        inset-0 
        z-50 
        flex 
        items-center 
        justify-center 
        p-4 
        bg-black/70 
        backdrop-blur-sm 
        animate-fadeIn
    `,

    WelcomeModalContainer:`
        relative 
        w-full 
        max-w-lg 
        bg-zinc-900 
        border 
        border-zinc-800 
        p-6 
        rounded-2xl 
        shadow-2xl 
        text-center 
        transform 
        transition-all 
        scale-100
    `,

    CloseButton:`
        absolute
        top-4 
        right-4 
        text-zinc-400 
        hover:text-white 
        text-xl 
        font-bold
    `,

    ModalTitleText:`
        text-2xl 
        font-black 
        tracking-wide 
        text-amber-400 
        mb-2
    `,

    ModalParagraphText:`
        text-zinc-400 
        text-sm 
        mb-6
    `,

    ModalInnerBox:`
        bg-zinc-950/50 
        p-4 
        rounded-xl 
        border 
        border-zinc-800/50 
        text-left 
        space-y-2 
        mb-6 
        text-xs 
        text-zinc-400
    `,

    ModalProceedButton:`
        w-full 
        bg-amber-500 
        hover:bg-amber-400 
        text-black 
        font-bold 
        py-3 
        rounded-xl 
        transition-all 
        shadow-lg 
        shadow-amber-500/20
    `,

}