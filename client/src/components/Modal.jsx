export default function Modal({ title, children }) {
  return (
    <section className="card" role="dialog" aria-modal="true" aria-label={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
