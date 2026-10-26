export default function AppointmentCard({ appointment }) {
  return (
    <div className="card">
      <h4>{appointment.customerName}</h4>
      <p>{appointment.vehicle}</p>
      <p>{appointment.time}</p>
    </div>
  );
}
