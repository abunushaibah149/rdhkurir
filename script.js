const apiKeyOpenRoute =
  "5b3ce3597851110001cf6248dd677103559843b6b18aa9af6d71962b";
const tarifPerKilometer = 5000; // Tarif per kilometer dalam Rupiah
const titikPusat = [0.09613569040335188, 99.82434421777727]; // Koordinat titik pusat di Pasaman Barat

let map = L.map("map").setView(titikPusat, 13); // Set titik pusat di peta

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let routingControl = L.Routing.control({
  waypoints: [
    L.latLng(titikPusat[0], titikPusat[1]),
    L.latLng(titikPusat[0], titikPusat[1]), // Dummy waypoint, akan diupdate dengan lokasi pengguna
  ],
  routeWhileDragging: true,
  show: false,
  createMarker: function () {
    return null;
  }, // Menghilangkan penanda waypoint
}).addTo(map);

document.addEventListener("DOMContentLoaded", () => {
  const productSelect = document.getElementById("product");
  const resultDiv = document.getElementById("result");
  const locationInfoDiv = document.getElementById("locationInfo");
  const addressDetailInput = document.getElementById("addressDetail");

  // Gunakan lokasi saat ini
  document
    .getElementById("useCurrentLocation")
    .addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const coordsString = `${latitude}, ${longitude}`;
            locationInfoDiv.textContent = `Lokasi Saat Ini: ${coordsString}`;

            // Update waypoint dengan lokasi pengguna
            updateWaypoint(latitude, longitude);
          },
          (error) => {
            console.error("Error:", error);
            locationInfoDiv.textContent = "Gagal mengambil lokasi saat ini.";
          }
        );
      } else {
        locationInfoDiv.textContent =
          "Geolocation tidak didukung oleh browser ini.";
      }
    });

  // Mengaktifkan pilihan memilih lokasi dari peta
  map.on("click", function (e) {
    const clickedCoords = e.latlng;
    const latitude = clickedCoords.lat;
    const longitude = clickedCoords.lng;
    const coordsString = `${latitude}, ${longitude}`;
    locationInfoDiv.textContent = `Lokasi Dipilih: ${coordsString}`;

    // Update waypoint dengan lokasi yang dipilih dari peta
    updateWaypoint(latitude, longitude);
  });

  // Menghitung tarif dan menampilkan rute ketika tombol diklik
  document.getElementById("calculate").addEventListener("click", () => {
    const locationInfo = locationInfoDiv.textContent;

    if (
      !locationInfo.includes("Lokasi Saat Ini") &&
      !locationInfo.includes("Lokasi Dipilih")
    ) {
      resultDiv.textContent =
        "Silakan gunakan lokasi saat ini atau pilih lokasi dari peta terlebih dahulu.";
      return;
    }

    const coordsString = locationInfo.split(":")[1].trim();
    const clientCoords = coordsString
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    // Hitung jarak menggunakan haversine formula sebagai alternatif
    const distance = haversine(
      titikPusat[0],
      titikPusat[1],
      clientCoords[0],
      clientCoords[1]
    );
    const totalTarif = hitungTarif(distance);

    resultDiv.textContent = `Total Tarif: ${totalTarif} Rupiah (Jarak: ${distance} km)`;

    // Update waypoint dengan lokasi pengguna
    updateWaypoint(clientCoords[0], clientCoords[1]);
  });
});

function updateWaypoint(lat, lng) {
  const newWaypoint = L.latLng(lat, lng);
  routingControl.setWaypoints([
    L.latLng(titikPusat[0], titikPusat[1]),
    newWaypoint,
  ]);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Jarak dalam kilometer
  return d;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function hitungTarif(jarak) {
  return Math.round(jarak * tarifPerKilometer);
}
