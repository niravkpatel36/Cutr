const LoaderPage = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      {/* Loader wheel */}
      <div className="loading loading-ring loading-lg"></div>
      <h1 className="text-lg mt-4">{message}</h1>
    </div>
  );
};

export default LoaderPage;
