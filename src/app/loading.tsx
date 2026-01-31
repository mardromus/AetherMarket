import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-[100]">
            <div className="relative flex flex-col items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full w-24 h-24 animate-ping opacity-20" />

                {/* Spinner */}
                <Loader2 className="w-16 h-16 text-primary animate-spin" />

                {/* Text */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <p className="text-primary font-mono font-bold tracking-[0.2em] text-lg animate-pulse">
                        INITIALIZING
                    </p>
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>
        </div>
    );
}
