import { useNavigate, useLocation } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authFail = location.state?.authFail || false;

  const handleGoHome = () => {
    navigate("/");
  };

  const renderMessage = () => {
    if (authFail) {
      return "Invalid PIN or the page does not exist.";
    } else {
      return "Aw, snap! Page does not exist.";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-error">404</h1>
        <p className="text-lg mt-4">{renderMessage()}</p>
        <button className="btn btn-primary mt-6" onClick={handleGoHome}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
