export default function VehicleCard({ vehicle }) {
  return (
    <div className="card">
      <h4>{vehicle.make} {vehicle.model}</h4>
      <p>{vehicle.year}</p>
      <p>{vehicle.licensePlate}</p>
    </div>
  );
}
