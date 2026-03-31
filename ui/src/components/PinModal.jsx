const PinModal = ({
  show,
  handleClose,
  url,
  pin,
  setPin,
  handleConfirmDelete,
}) => {
  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Delete</h3>
        <div className="py-4">
          <p>
            You are about to delete the shortened URL{" "}
            <strong>if it exists</strong>:
            <br />
            <a
              href={window.location.origin + "/" + url}
              className="link link-primary"
            >
              {import.meta.env.VITE_SERVER_DOMAIN}/{url}
            </a>
          </p>
          <p className="mt-4">
            Enter the PIN associated with this shortened URL to confirm
            deletion:
          </p>
          <input
            type="password"
            placeholder="Enter PIN"
            className="input input-bordered w-full mt-2"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={handleConfirmDelete}>
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinModal;
