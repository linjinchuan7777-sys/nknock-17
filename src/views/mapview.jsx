import React, { useEffect, useRef, useState } from 'react';

const MapView = ({
  spots = [],
  role = 'visitor',
  onAddSpot,
  onDeleteSpot
}) => {
  const [activeSpotId, setActiveSpotId] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const isAdmin = role === 'admin';

  // Expose delete function to window so Leaflet popup HTML onclick can call it
  useEffect(() => {
    window.deleteMapSpot = (spotId) => {
      if (confirm("確定要刪除這個地圖景點嗎？")) {
        if (onDeleteSpot) {
          onDeleteSpot(spotId);
        }
      }
    };
    return () => {
      delete window.deleteMapSpot;
    };
  }, [onDeleteSpot]);

  // Initialize Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map
      mapInstanceRef.current = window.L.map(mapContainerRef.current).setView([23.9739, 120.9820], 8);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.invalidateSize();
    }

    return () => {
      // Keep instance alive or clean up on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when spots change
  useEffect(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear old markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    spots.forEach(spot => {
      const marker = L.marker([spot.lat, spot.lng]).addTo(map);
      
      const deleteBtn = isAdmin 
        ? `<br><button class="btn btn-danger" style="padding: 2px 6px; font-size: 11px; margin-top: 6px; width: 100%; cursor: pointer;" onclick="window.deleteMapSpot('${spot.id}')"><i class="fa-solid fa-trash"></i> 刪除景點</button>` 
        : "";

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size:12px; min-width: 140px;">
          <strong style="font-size: 13px; color: var(--text-dark);">${spot.name}</strong>
          <p style="color: var(--text-light); margin: 6px 0 0 0; line-height: 1.4;">${spot.desc}</p>
          ${deleteBtn}
        </div>
      `);

      marker.spotId = spot.id;
      markersRef.current.push(marker);
    });
  }, [spots, isAdmin]);

  const handleSpotClick = (spot) => {
    setActiveSpotId(spot.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([spot.lat, spot.lng], 13);
      const marker = markersRef.current.find(m => m.spotId === spot.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const handleAddSpotClick = () => {
    let defaultLat = 23.9739;
    let defaultLng = 120.9820;
    
    // Get center of map if exists
    if (mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      defaultLat = parseFloat(center.lat.toFixed(4));
      defaultLng = parseFloat(center.lng.toFixed(4));
    }
    
    if (onAddSpot) {
      onAddSpot(defaultLat, defaultLng);
    }
  };

  return (
    <div id="map-view" className="view-panel" style={{ display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--primary-dark)' }}>
          <i className="fa-solid fa-map-location-dot"></i> 外出足跡地圖
        </h3>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={handleAddSpotClick} style={{ fontSize: '11px', padding: '4px 12px' }}>
            <i className="fa-solid fa-plus"></i> 新增足跡標記
          </button>
        )}
      </div>

      <div className="map-view-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '15px' }}>
        {/* Spot List */}
        <div 
          className="map-spot-list" 
          id="map-spot-list" 
          style={{ 
            background: 'rgba(255,255,255,0.6)', 
            border: '1px solid rgba(255,255,255,0.8)', 
            borderRadius: '12px', 
            padding: '10px', 
            maxHeight: '400px', 
            overflowY: 'auto' 
          }}
        >
          {spots.length > 0 ? (
            spots.map(spot => (
              <div 
                key={spot.id} 
                className={`map-spot-item ${activeSpotId === spot.id ? 'active' : ''}`}
                onClick={() => handleSpotClick(spot)}
                style={{ 
                  padding: '10px', 
                  borderRadius: '8px', 
                  marginBottom: '8px', 
                  cursor: 'pointer',
                  background: activeSpotId === spot.id ? 'rgba(0,168,232,0.1)' : 'rgba(255,255,255,0.4)',
                  border: activeSpotId === spot.id ? '1px solid rgba(0,168,232,0.3)' : '1px solid transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div className="map-spot-name" style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-dark)' }}>{spot.name}</div>
                <div className="map-spot-desc" style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {spot.desc}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px', fontSize: '12px' }}>
              目前尚無記錄的足跡景點。
            </div>
          )}
        </div>

        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          id="leaflet-map-container" 
          style={{ 
            height: '400px', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 1
          }}
        ></div>
      </div>
    </div>
  );
};

export default MapView;
