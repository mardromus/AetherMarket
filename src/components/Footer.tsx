export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/50 backdrop-blur-sm py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    &copy; 2024 <span className="text-primary font-bold">AETHER</span> MARKET. Decentralized Autonomous Economy.
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-primary transition-colors">Terms</a>
                    <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="hover:text-primary transition-colors">Docs</a>
                </div>
            </div>
        </footer>
    );
}
