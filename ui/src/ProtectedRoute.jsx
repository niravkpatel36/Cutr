import { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import LoaderPage from "./pages/LoaderPage.jsx";

const ProtectedRoute = ({ element: Component, pin, ...rest }) => {
  const { shortUrl } = useParams();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const verifyPin = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/analytics?short_url=${shortUrl}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pin: pin }),
          },
        );
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      }
    };

    verifyPin();

    return () => {
      abortController.abort();
    };
  }, [shortUrl, pin]);

  if (isAuthorized === null) {
    return <LoaderPage message={"Loading"} />;
  }
  if (!isAuthorized) {
    return <Navigate to="/404" state={{ authFail: true }} />;
  }

  return <Component {...rest} analyticsData={analyticsData} />;
};

export default ProtectedRoute;
