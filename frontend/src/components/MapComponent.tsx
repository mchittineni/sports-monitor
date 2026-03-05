import { MapContainer, TileLayer } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useSportsStore } from '../store/sportsStore';

/**
 * Props expected by the MapComponent.
 */
interface MapComponentProps {
  onCountrySelect: (countryName: string) => void;
}

// Mapping ISO codes to our event country names
const codeToCountryName: { [key: string]: string } = {
  US: 'USA',
  GB: 'England',
  ES: 'Spain',
  IN: 'India',
  AU: 'Australia',
  RU: 'Russia',
  JP: 'Japan',
};

/**
 * Core React-Leaflet Map component that renders the global interactive map.
 * Loads GeoJSON boundaries, binds click events, and dynamically shades countries based on live events.
 *
 * @param {MapComponentProps} props - The component props.
 * @returns {JSX.Element} The rendered MapContainer.
 */
export default function MapComponent({ onCountrySelect }: MapComponentProps) {
  const mapRef = useRef(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { liveEvents } = useSportsStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMap();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const initializeMap = async () => {
    const mapElement = (mapRef.current as any)?._leaflet_map;
    if (!mapElement) {
      console.error('Map not found');
      return;
    }

    try {
      console.log('Loading GeoJSON...');
      const response = await fetch(
        'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_countries.geojson'
      );
      const geoJsonData = await response.json();
      console.log('Loaded', geoJsonData.features?.length, 'countries');

      // Remove old layer if exists
      if (geoJsonLayerRef.current) {
        mapElement.removeLayer(geoJsonLayerRef.current);
      }

      // Create new GeoJSON layer
      const geoJsonLayer = L.geoJSON(geoJsonData, {
        interactive: true,
        style: (feature) => {
          const code = feature?.properties?.iso_a2;
          const countryName =
            codeToCountryName[code] || feature?.properties?.name;
          const eventCount = liveEvents.filter(
            (e) => e.country === countryName
          ).length;

          return {
            fillColor: getColor(eventCount),
            color: '#fff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.65,
          };
        },
        onEachFeature: (feature, layer) => {
          const code = feature.properties?.iso_a2;
          const originalName = feature.properties?.name;
          const countryName = codeToCountryName[code] || originalName;
          const eventCount = liveEvents.filter(
            (e) => e.country === countryName
          ).length;

          // Make it explicitly clickable
          (layer as any).on('click', function (e: any) {
            console.log('✅ Clicked:', countryName);
            onCountrySelect(countryName);
            highlightFeature(e);
          });
          (layer as any).on('mouseover', (e: any) => {
            e.target.setStyle({
              weight: 2.5,
              color: '#3b82f6',
            });
          });
          (layer as any).on('mouseout', (e: any) => {
            const code = e.target.feature.properties.iso_a2;
            const countryName =
              codeToCountryName[code] || e.target.feature.properties.name;
            const eventCount = liveEvents.filter(
              (e) => e.country === countryName
            ).length;
            e.target.setStyle({
              fillColor: getColor(eventCount),
              weight: 1.5,
              color: '#fff',
            });
          });

          // Bind popup
          const popup = L.popup({ autoClose: true }).setContent(
            `<div class="p-2 text-center"><strong>${originalName}</strong><br/><small>Events: ${eventCount}</small></div>`
          );
          (layer as any).bindPopup(popup);
        },
      });

      geoJsonLayer.addTo(mapElement);
      geoJsonLayerRef.current = geoJsonLayer;
      console.log('✅ Map ready - click on countries!');
    } catch (error) {
      console.error('Failed to load GeoJSON:', error);
    }
  };

  const getColor = (count: number) => {
    if (count > 5) return '#dc2626';
    if (count > 2) return '#f97316';
    if (count > 0) return '#fbbf24';
    return '#d1d5db';
  };

  const highlightFeature = (e: any) => {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      color: '#3b82f6',
      fillOpacity: 0.8,
    });
  };

  // Update colors when events change
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer: L.Layer) => {
        const geoJsonLayer = layer as any;
        if (geoJsonLayer.feature) {
          const code = geoJsonLayer.feature.properties?.iso_a2;
          const countryName =
            codeToCountryName[code] || geoJsonLayer.feature.properties?.name;
          const eventCount = liveEvents.filter(
            (e) => e.country === countryName
          ).length;

          geoJsonLayer.setStyle({
            fillColor: getColor(eventCount),
          });
        }
      });
    }
  }, [liveEvents]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        ref={mapRef}
        center={[20, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-sm z-[999] pointer-events-none">
        <p className="font-semibold">👆 Click any country for events</p>
        <p className="text-xs mt-2">
          🔴 Red = 5+ | 🟠 Orange = 2-5 | 🟡 Yellow = 1+ events
        </p>
      </div>
    </div>
  );
}
