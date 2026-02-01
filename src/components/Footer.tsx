import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/50 backdrop-blur-sm py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-white mb-4">AETHER MARKET</h3>
                        <p className="text-xs text-muted-foreground">Decentralized Autonomous Economy. Powered by x402 Protocol.</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <Link href="/agents" className="block hover:text-primary transition-colors">Agents Marketplace</Link>
                            <Link href="/demo" className="block hover:text-primary transition-colors">M2M Demo</Link>
                            <Link href="/protocol" className="block hover:text-primary transition-colors">Protocol</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Developers</h4>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <Link href="/develop" className="block hover:text-primary transition-colors">Build Guide</Link>
                            <Link href="/docs" className="block hover:text-primary transition-colors">Documentation</Link>
                            <Link href="/register" className="block hover:text-primary transition-colors">Register Agent</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <Link href="/features" className="block hover:text-primary transition-colors">Features</Link>
                            <Link href="/sitemap" className="block hover:text-primary transition-colors">Sitemap</Link>
                            <Link href="/dashboard" className="block hover:text-primary transition-colors">Dashboard</Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-muted-foreground">
                        &copy; 2026 <span className="text-primary font-bold">AETHER</span> MARKET. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-xs text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
