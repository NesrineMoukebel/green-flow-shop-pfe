import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToGetStarted = () => {
    const element = document.getElementById('get-started');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="relative z-50 flex justify-between items-center px-32 py-3 bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0">
      {/* Logo */}
      <div className="flex items-center">
        <img 
          src="/DATA/images/LOGO.png" 
          alt="Bi-Optima Logo" 
          className="h-12 w-auto cursor-pointer" 
          onClick={() => navigate('/')}
        />
      </div>

      {/* Nav Items */}
      <div className="hidden md:flex items-center space-x-8 text-sm">
        
        <button 
          onClick={() => navigate('/single-objective')}
          className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Single-Objective
        </button>
        <button 
          onClick={() => navigate('/multi-objective')}
          className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          Multi-Objective
        </button>
        <Button 
          onClick={scrollToGetStarted}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center"
        >
          Get Started
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

