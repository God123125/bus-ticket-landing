import {
  Bus,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl hero-gradient text-primary-foreground">
              <Bus className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">GreenBus</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Fast, safe and reliable bus tickets across the region.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Blog</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +855 12 345 678
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              hello@greenbus.co
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Phnom Penh, Cambodia
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Follow</h4>
          <div className="flex gap-3">
            {[Globe, MessageCircle, Share2].map((Icon, i) => (
              <div
                key={i}
                className="grid h-9 w-9 place-items-center rounded-full bg-background border border-border card-hover"
              >
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GreenBus. All rights reserved.
      </div>
    </footer>
  );
}
