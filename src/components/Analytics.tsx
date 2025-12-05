import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Placeholder for analytics page view tracking
    // e.g., posthog.capture('$pageview')
    console.log(`[Analytics] Page view: ${location.pathname}`);
  }, [location]);

  return null; // This component doesn't render anything
};

export default Analytics;
