import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "./Logo";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? "U";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Logo to="/dashboard" />
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold"
            title={user?.email ?? ""}
          >
            {initials}
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};
