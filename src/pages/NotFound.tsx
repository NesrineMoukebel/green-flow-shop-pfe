import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 h-screen bg-white border-r border-gray-200 p-6 overflow-y-auto sticky top-0">
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="./DATA/images/LOGO.png" 
                alt="Bi-Optima Logo" 
                className="h-10 w-auto" 
              />
              <CardTitle className="text-lg">Page Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="mb-3">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="mb-3">
                <strong>What you can do:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Check the URL for typos</li>
                <li>Return to the home page</li>
                <li>Use the navigation menu</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
            <a href="/" className="text-blue-500 hover:text-blue-700 underline">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
