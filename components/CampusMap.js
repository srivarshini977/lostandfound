'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Fix for default Leaflet icons
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper to generate approximate coords from string location (simulation)
// In a real app, you'd geocode the address
const getCoords = (locString, index) => {
    // Center of an arbitrary "Campus" (lat/lng)
    const baseLat = 12.9716;
    const baseLng = 77.5946; // Bangalore approx

    // Deterministic pseudo-random offset based on char codes
    const offset = locString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;

    // Spread them out a bit
    return [
        baseLat + (Math.sin(offset) * 0.01) + (index * 0.002),
        baseLng + (Math.cos(offset) * 0.01) + (index * 0.002)
    ];
};

export default function CampusMap({ items }) {
    if (typeof window === 'undefined') return null;

    return (
        <MapContainer center={[12.9716, 77.5946]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {items.map((item, idx) => {
                const position = getCoords(item.lastSeenLocation || 'Unknown', idx);
                return (
                    <Marker key={item._id} position={position} icon={icon}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm mb-1">{item.itemName}</h3>
                                <p className="text-xs text-gray-500 mb-2">{item.lastSeenLocation}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.reportType === 'lost' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {item.reportType}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
