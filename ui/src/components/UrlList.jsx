import UrlCard from "./UrlCard.jsx";

const UrlList = ({ urls, handleDelete, handleRemoveUrl, setPin }) => {
  if (urls.length === 0) return null;

  return (
    <div className="w-full max-w-3xl p-4 border border-gray-400 rounded-lg overflow-y-auto max-h-[400px]">
      <div className="space-y-4">
        {urls.map((urlObj, index) => (
          <UrlCard
            key={index}
            urlObj={urlObj}
            handleDelete={handleDelete}
            handleRemoveUrl={handleRemoveUrl}
            setPin={setPin}
            margin={
              index === urls.length - 1 || urls.length === 1 ? "" : "mb-4"
            }
          />
        ))}
      </div>
    </div>
  );
};

export default UrlList;
