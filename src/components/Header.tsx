import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Transaction Analysis' }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 glow-primary">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">FinShield</span>
            <span className="text-xs text-muted-foreground">{title}</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="text-foreground font-medium">{user.username}</span>
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
