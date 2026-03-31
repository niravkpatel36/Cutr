import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoaderPage from "./pages/LoaderPage.jsx";

const RedirectHandler = () => {
  const { shortUrl } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchUrl = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/${shortUrl}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: shortUrl,
              accessTime: new Date(),
              userAgent: navigator.userAgent,
            }),
          },
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          window.location.href = data.url;
        } else {
          navigate("/404");
        }
      } catch (error) {
        navigate("/");
      }
    };
    fetchUrl();

    return () => {
      abortController.abort();
    };
  }, [shortUrl, navigate]);

  return <LoaderPage message={"Redirecting..."} />;
};

export default RedirectHandler;
