// Import necessary libraries and styles
import React from "react";
import { MaDesaontainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({ coordinates }) => {
  const { lat, lng } = coordinates;

  return (
    <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden">
      <MaDesaontainer
        center={[lat, lng]}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]}>
          <Popup>
            A pretty popup at lat: {lat}, lng: {lng}
          </Popup>
        </Marker>
      </MaDesaontainer>
    </div>
  );
};

export default Map;
