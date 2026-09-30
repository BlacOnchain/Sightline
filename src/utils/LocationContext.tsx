import React, { createContext, useContext, useState, useEffect } from 'react';

// Simplified region mapping based on common coordinate ranges
// Real implementation requires a reverse geocoding API service.
export const detectRegionFromCoords = (lat: number, lng: number): 'Nigeria' | 'Global' => {
  // Rough bounding box for Nigeria
  if (lat >= 4 && lat <= 14 && lng >= 2 && lng <= 15) {
    return 'Nigeria';
  }
  return 'Global';
};

interface LocationContextType {
  region: 'Nigeria' | 'Global' | 'Detecting';
  error: string | null;
}

const LocationContext = createContext<LocationContextType>({ region: 'Detecting', error: null });

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = useState<'Nigeria' | 'Global' | 'Detecting'>('Detecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setRegion('Global');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = detectRegionFromCoords(position.coords.latitude, position.coords.longitude);
        setRegion(detected);
      },
      (err) => {
        let errorMessage = 'Unknown location error';
        if (err && typeof err === 'object') {
          if ('message' in err && typeof (err as any).message === 'string') {
            errorMessage = (err as any).message;
          } else if ('code' in err) {
            errorMessage = `Geolocation error code: ${(err as any).code}`;
          }
        }
        // Check if error is due to permissions policy
        const isPermissionError = 
          errorMessage.toLowerCase().includes('permissions policy') || 
          errorMessage.toLowerCase().includes('permission denied');

        if (isPermissionError) {
          console.info('Geolocation access restricted by policy, defaulting to Global.');
        } else {
          console.error('Geolocation failed:', errorMessage);
        }
        
        setError(errorMessage);
        setRegion('Global'); // Default fallback
      }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ region, error }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
