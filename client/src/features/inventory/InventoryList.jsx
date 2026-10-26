export default function InventoryList({ items = [] }) {
  return (
    <div className="grid cards">
      {items.map((item) => (
        <div className="card" key={item.sku}>
          <h4>{item.partName}</h4>
          <p>{item.quantity} in stock</p>
        </div>
      ))}
    </div>
  );
}
