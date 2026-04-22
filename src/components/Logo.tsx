import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ to = "/" }: { to?: string }) => (
  <Link to={to} className="flex items-center gap-2 group">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
      <Briefcase className="h-4 w-4" strokeWidth={2.5} />
    </span>
    <span className="font-display text-lg font-bold tracking-tight">
      Career<span className="text-gradient">Match</span>
    </span>
  </Link>
);
