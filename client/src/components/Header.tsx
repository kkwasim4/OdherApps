import { Link } from "wouter";
import logoImage from "@assets/AF1C8B04-B4D6-41D1-A5A9-BA69AA60BA35_1763307927248.jpg";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1">
            <img src={logoImage} alt="OdherApp Explorer" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold">OdherApp Explorer</h1>
              <p className="text-xs text-muted-foreground">Multi-Chain Intelligence</p>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="https://docs.odherapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
