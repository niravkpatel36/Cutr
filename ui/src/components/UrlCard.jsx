import { useState } from "react";
import { QrCode } from "react-qrcode-pretty";
import { useNavigate } from "react-router-dom";

const UrlCard = ({ urlObj, handleDelete, handleRemoveUrl, margin, setPin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Shortened URL",
          text: `Hey there! Check this out: ${window.location.origin}/${urlObj.shortURL}`,
          url: `${window.location.origin}/${urlObj.shortURL}`,
        })
        .catch((error) => console.error("Error sharing", error));
    } else {
      alert("Share not supported on this browser");
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div
      className={`card bg-base-100 shadow-xl ${margin} border border-gray-400 rounded-lg`}
    >
      <div className="card-body flex flex-col md:flex-row items-center relative">
        <button
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => handleRemoveUrl(urlObj.shortURL)}
        >
          ✕
        </button>
        <div
          className="flex justify-center border shadow-xl border-gray-400 rounded-lg bg-clip-content mb-4 md:mb-0"
          onClick={toggleModal}
          role={"dialog"}
          aria-label={"QR Code Modal"}
        >
          <QrCode
            value={`${window.location.origin}/${urlObj.shortURL}`}
            variant={{
              eyes: "fluid",
              body: "gravity",
            }}
            color={{
              eyes: "#605df6",
              body: "#ff428e",
            }}
            padding={10}
            size={150}
            bgColor="transparent"
            bgRounded
            divider
          />
        </div>
        <div className="flex flex-col items-center md:items-start md:ml-4">
          <p className="text-sm text-center md:text-left">
            Shortened:{" "}
            <a
              href={`${window.location.origin}/${urlObj.shortURL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-secondary font-bold"
            >
              {`${window.location.origin}/${urlObj.shortURL}`}
            </a>
            <br />
            Original URL:{" "}
            <a
              href={urlObj.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary font-bold text-justify max-w-full overflow-hidden text-ellipsis line-clamp-3 break-all"
            >
              {urlObj.originalUrl}
            </a>
            PIN: <span className="text-gray-500 font-bold">{urlObj.pin}</span>
          </p>
          <div className="card-actions mt-4 flex justify-center md:justify-start">
            <button
              className="btn btn-info btn-sm"
              onClick={() => {
                localStorage.setItem("pin", urlObj.pin);
                setPin(urlObj.pin);
                navigate(`/analytics/${urlObj.shortURL}`);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              View Analytics
            </button>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Delete URL and analytics"
            >
              <button
                className="btn btn-error btn-circle btn-sm"
                onClick={() => handleDelete(urlObj.shortURL, urlObj.pin)}
                title="Delete URL"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
            <div className="tooltip tooltip-bottom" data-tip="Share URL">
              <button
                className="btn btn-primary btn-circle btn-sm"
                onClick={handleShare}
                title="Share URL"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-end">
              <button
                className="btn btn-sm btn-circle btn-error"
                onClick={toggleModal}
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              <QrCode
                value={`${window.location.origin}/${urlObj.shortURL}`}
                variant={{
                  eyes: "fluid",
                  body: "gravity",
                }}
                color={{
                  eyes: "#605df6",
                  body: "#ff428e",
                }}
                padding={10}
                size={300}
                bgColor="transparent"
                bgRounded
                divider
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlCard;
