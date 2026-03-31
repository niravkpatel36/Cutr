import { useState, useEffect, useCallback } from "react";
import AlertComponent from "../components/Alert.jsx";
import UrlInputForm from "../components/UrlInputForm.jsx";
import UrlList from "../components/UrlList.jsx";
import PinModal from "../components/PinModal.jsx";
import { handleGenerate, handleDelete, showTemporaryAlert } from "../handlers";
import { useNavigate } from "react-router-dom";

const Home = ({ setPin }) => {
  const [url, setUrl] = useState("");
  const [custom, setCustom] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [urls, setUrls] = useState([]);
  const [removedUrls, setRemovedUrls] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState("");
  const [pin, setLocalPin] = useState("");
  useNavigate();
  useEffect(() => {
    const storedUrls = JSON.parse(localStorage.getItem("urls"));
    if (storedUrls) {
      setUrls(storedUrls);
    }
  }, []);

  const handleDeleteClick = useCallback((url) => {
    if (!url) {
      showTemporaryAlert(
        "Please enter a URL for deletion.",
        "warning",
        setAlert,
      );
      return;
    }
    setDeleteUrl(url);
    setDeleteModal(true);
  }, []);

  const handleAnalyticsClick = useCallback((url) => {
    if (!url) {
      showTemporaryAlert(
        "Please enter a URL for analytics.",
        "warning",
        setAlert,
      );
      return;
    }
    setDeleteUrl(url);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDeleteModal(false);
    setLocalPin("");
  }, []);

  const handleConfirmDelete = useCallback(() => {
    handleDelete(deleteUrl, pin, urls, setUrls, setAlert).then(
      handleCloseModal,
    );
  }, [deleteUrl, pin, urls, setUrls, setAlert, handleCloseModal]);

  const handleRemoveUrl = useCallback((shortURL) => {
    setRemovedUrls((prev) => [...prev, shortURL]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AlertComponent
        alert={alert}
        onClose={() => setAlert({ show: false, message: "", variant: "" })}
      />

      <h1 className="text-4xl font-bold mb-8 text-center">Cutr ✄</h1>

      <UrlInputForm
        url={url}
        setUrl={setUrl}
        handleGenerate={() =>
          handleGenerate(
            url,
            setUrl,
            urls,
            setUrls,
            setAlert,
            custom,
            customKey,
            setCustomKey,
          )
        }
        handleDeleteClick={handleDeleteClick}
        handleAnalyticsClick={handleAnalyticsClick}
        custom={custom}
        setCustom={setCustom}
        customKey={customKey}
        setCustomKey={setCustomKey}
      />

      <UrlList
        urls={urls.filter((urlObj) => !removedUrls.includes(urlObj.shortURL))}
        handleDelete={(shortURL, pin) =>
          handleDelete(shortURL, pin, urls, setUrls, setAlert)
        }
        handleRemoveUrl={handleRemoveUrl}
        setPin={setPin}
      />

      <PinModal
        show={deleteModal}
        handleClose={handleCloseModal}
        url={deleteUrl}
        pin={pin}
        setPin={setLocalPin}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Home;
