
import React, { useState, useEffect, useCallback } from 'react';
import { Restaurant, Coordinates } from './types';
import { SUPPORTED_LANGUAGES, UI_TEXT } from './constants';
import { fetchRestaurants, fetchRestaurantsByQuery } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector.tsx';
import RestaurantList from './components/RestaurantList.tsx';
import Loader from './components/Loader.tsx';
import ErrorDisplay from './components/ErrorDisplay.tsx';

const App: React.FC = () => {
  const [language, setLanguage] = useState<string>('en');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [uiText, setUiText] = useState(UI_TEXT['en']);
  const [manualLocation, setManualLocation] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  useEffect(() => {
    setUiText(UI_TEXT[language] || UI_TEXT['en']);
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const handleFindRestaurants = useCallback(() => {
    setLoading(true);
    setError(null);
    setRestaurants([]);
    setShowManualInput(false);

    if (!navigator.geolocation) {
      setError(uiText.locationNotSupported);
      setShowManualInput(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        try {
          const fetchedRestaurants = await fetchRestaurants(latitude, longitude, language);
          setRestaurants(fetchedRestaurants);
        } catch (err) {
          setError(uiText.fetchError);
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError(uiText.locationPermissionDenied);
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError(uiText.locationUnavailable);
            break;
          case geoError.TIMEOUT:
            setError(uiText.locationTimeout);
            break;
          default:
            setError(uiText.locationError);
            break;
        }
        setShowManualInput(true);
        setLoading(false);
      }
    );
  }, [language, uiText]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocation.trim()) {
      setError(uiText.manualLocationError);
      return;
    }
    setLoading(true);
    setError(null);
    setRestaurants([]);
    try {
      const fetchedRestaurants = await fetchRestaurantsByQuery(manualLocation, language);
      setRestaurants(fetchedRestaurants);
    } catch (err) {
      setError(uiText.fetchError);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              {uiText.title}
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">{uiText.subtitle}</p>
        </header>

        <main>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 p-4 bg-gray-800/50 rounded-lg shadow-lg backdrop-blur-sm">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
              languages={SUPPORTED_LANGUAGES}
            />
            <button
              onClick={handleFindRestaurants}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 rounded-md font-semibold text-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-800 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? uiText.loadingButton : uiText.findButton}
            </button>
          </div>
          
          <div className="mt-6">
            {error && <ErrorDisplay message={error} />}

            {showManualInput && !loading && (
              <div className="mt-6 p-6 bg-gray-800/50 rounded-lg shadow-lg backdrop-blur-sm text-center">
                <p className="text-lg text-gray-300 mb-4">{uiText.manualLocationPrompt}</p>
                <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder={uiText.manualLocationPlaceholder}
                    className="w-full sm:w-80 px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-md focus:outline-none focus:bg-gray-600 focus:border-indigo-500 text-lg text-white"
                    aria-label={uiText.manualLocationPlaceholder}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-green-600 rounded-md font-semibold text-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-green-800 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {uiText.searchButton}
                  </button>
                </form>
              </div>
            )}

            {loading && <Loader message={uiText.loaderMessage} />}
            
            {!loading && !error && restaurants.length === 0 && !showManualInput && (
                 <div className="text-center text-gray-500 py-16">
                    <p className="text-xl">{uiText.welcomeMessage}</p>
                </div>
            )}
            {restaurants.length > 0 && <RestaurantList restaurants={restaurants} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
