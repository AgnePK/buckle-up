import { loadMapsAPI, isGoogleMapsLoaded } from '@/Maps/loadMapsAPI';

// Mock for the document.createElement
const originalCreateElement = document.createElement;

describe('Google Maps API Integration', () => {
  // Cleanup after each test
  afterEach(() => {
    jest.resetAllMocks();
    document.createElement = originalCreateElement;
    delete (window as any).google;
  });

  describe('isGoogleMapsLoaded function', () => {
    test('returns false when Google Maps is not loaded', () => {
      delete (window as any).google;
      expect(isGoogleMapsLoaded()).toBe(false);
    });

    test('returns true when Google Maps is loaded', () => {
      (window as any).google = { maps: {} };
      expect(isGoogleMapsLoaded()).toBe(true);
    });
  });

  describe('loadMapsAPI function', () => {
    test('resolves immediately if Maps API is already loaded', async () => {
      // Mock Maps is already loaded
      (window as any).google = { maps: {} };
      
      // Simply verify it resolves
      await expect(loadMapsAPI()).resolves.toBeUndefined();
    });

    test('creates script element with correct attributes', () => {
      // Create a mock script object
      const mockScript = {
        src: '',
        async: false,
        defer: false,
        id: '',
        onload: null,
        onerror: null
      };
      
      // Mock document.createElement
      document.createElement = jest.fn().mockImplementation((tag) => {
        if (tag === 'script') {
          return mockScript;
        }
        return originalCreateElement.call(document, tag);
      });
      
      // Mock document.head.appendChild
      document.head.appendChild = jest.fn();
      
      // Start loading process (don't await)
      loadMapsAPI();
      
      // Verify script properties
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(document.head.appendChild).toHaveBeenCalled();
      
      // We don't need to check the actual URLs since that depends on environment variables
      // Just verify that the script has the required attributes
      expect(mockScript.async).toBe(true);
      expect(mockScript.defer).toBe(true);
      expect(mockScript.id).toBe('google-maps-script');
    });
  });
});