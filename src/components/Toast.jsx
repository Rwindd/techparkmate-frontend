export default function Toast({ ico, title, body }) {
  return (
    <div className="toast">
      <div className="toast-ico">{ico}</div>
      <div><div className="toast-t">{title}</div><div className="toast-b">{body}</div></div>
    </div>
  );
}
