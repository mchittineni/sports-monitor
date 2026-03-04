import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useSportsStore } from '../store/sportsStore'

interface MapComponentProps {
  onCountrySelect: (countryName: string) => void
}

export default function MapComponent({ onCountrySelect }: MapComponentProps) {
  const geoJsonRef = useRef(null)
  const { liveEvents } = useSportsStore()

  const onEachCountry = (feature: any, layer: L.Layer) => {
    const countryName = feature.properties.name
    const countryCode = feature.properties.iso_a2

    // Find events for this country
    const countryEvents = liveEvents.filter(
      (e) => e.country_code === countryCode
    )

    // Color map based on activity
    const intensity = countryEvents.length
    const color =
      intensity > 5
        ? '#ef4444'
        : intensity > 2
          ? '#f97316'
          : intensity > 0
            ? '#eab308'
            : '#6b7280'

    const geoJsonFeature = layer as any
    geoJsonFeature.setStyle({
      fillColor: color,
      weight: 2,
      opacity: 0.7,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.5,
    })

    layer.on('click', () => {
      onCountrySelect(countryName)
      geoJsonFeature.setStyle({
        weight: 3,
        color: '#3b82f6',
      })
    })

    layer.bindPopup(
      `<div class="text-sm">
        <strong>${countryName}</strong><br/>
        Events: ${intensity}
      </div>`
    )
  }

  useEffect(() => {
    // Load GeoJSON when component mounts
    const loadGeoJSON = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_countries.geojson'
        )
        const data = await response.json()
        if (geoJsonRef.current) {
          L.geoJSON(data, { onEachFeature: onEachCountry }).addTo(
            (geoJsonRef.current as any)._leaflet_map
          )
        }
      } catch (error) {
        console.error('Failed to load GeoJSON:', error)
      }
    }

    loadGeoJSON()
  }, [])

  return (
    <MapContainer
      ref={geoJsonRef}
      center={[20, 0]}
      zoom={2}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}
