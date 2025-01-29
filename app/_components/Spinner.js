function Spinner() {
  return (
    <div className="grid place-items-center w-full h-full">
      <svg viewBox="25 25 50 50" className="spinner">
        <circle className="spinner-circle" r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
  );
}
export default Spinner;
