// handlers.js
export const showTemporaryAlert = (message, variant, setAlert) => {
  setAlert({ show: true, message, variant });
  setTimeout(() => setAlert({ show: false, message: "", variant: "" }), 5000); // Dismiss after 5 seconds
};

const serverDomain = import.meta.env.VITE_SERVER_DOMAIN;

export const handleGenerate = async (
  url,
  setUrl,
  urls,
  setUrls,
  setAlert,
  custom,
  customKey,
  setCustomKey,
) => {
  if (!url) {
    showTemporaryAlert(
      "Please enter a URL before generating.",
      "warning",
      setAlert,
    );
    return;
  }

  const response = await fetch(`${serverDomain}/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
      ...(custom && { customKey: customKey, custom: true }),
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    showTemporaryAlert(errorMessage, "danger", setAlert);
  } else {
    const data = await response.json();
    const newUrl = {
      shortURL: data.shortURL,
      pin: data.pin,
      originalUrl: url,
    };
    const updatedUrls = [newUrl, ...urls];
    setUrls(updatedUrls);
    localStorage.setItem("urls", JSON.stringify(updatedUrls)); // Save updated list to localStorage

    setUrl("");
    setCustomKey("");
    showTemporaryAlert("URL shortened successfully.", "success", setAlert);
  }
};

export const handleDelete = async (
  deletedUrl,
  pin,
  urls,
  setUrls,
  setAlert,
) => {
  const response = await fetch(`${serverDomain}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: deletedUrl,
      pin: pin,
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    showTemporaryAlert(errorMessage, "danger", setAlert);
  } else {
    // Remove the deleted URL from state and localStorage
    const updatedUrls = urls.filter((urlObj) => urlObj.shortURL !== deletedUrl);
    setUrls(updatedUrls);
    localStorage.setItem("urls", JSON.stringify(updatedUrls)); // Update localStorage

    showTemporaryAlert("URL deleted successfully.", "success", setAlert);
  }
};
