import { AnimatePresence, motion } from "motion/react";

const UrlInputForm = ({ url, setUrl, handleGenerate, handleDeleteClick, custom, setCustom, customKey, setCustomKey }) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleGenerate();
        }
    };

    const handleCheckboxChange = (e) => {
        setCustom(e.target.checked);
        if (!e.target.checked) {
            setCustomKey("");
        }
        e.target.blur();
    }

    return (
        <div className="w-full max-w-2xl mb-8">
            <div className="form-control w-full">
                <div className="flex flex-row items-center">
                    <div className="relative w-full shadow-lg rounded-box ">
                        <label className="input w-full">
                            <input
                                type="url"
                                id="url"
                                placeholder="Enter URL to shorten or <cutr-keyword> for deletion"
                                className="input input-bordered h-10 border-gray-400 rounded-box w-full focus:ring-0 focus:shadow-none focus:outline-none"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <span className="label">
                                <span className="label">Custom</span>
                                <input
                                    type="checkbox"
                                    id="custom"
                                    className="checkbox checkbox-sm border-secondary-content"
                                    checked={custom}
                                    onChange={handleCheckboxChange}
                                    style={{ '--input-color': 'transparent' }}
                                />
                            </span>
                        </label>
                    </div>
                </div>

                <div className="relative mt-2">
                    <AnimatePresence>
                        {custom && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute w-full"
                            >
                                <div className="flex items-center w-full shadow-lg rounded-box ">
                                    <label className="input w-full">
                                        <span className="label">{window.location.origin}/</span>
                                        <input
                                            type="text"
                                            value={customKey}
                                            onChange={(e) => setCustomKey(e.target.value)}
                                            placeholder="<cutr-keyword>"
                                            className="focus:outline-none focus:ring-0"
                                        />
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-14">
                    <p className="label-text-alt text-gray-500 m-2 text-center">
                        After generation, keep your PIN safe if you need to delete the URL in the future.
                    </p>
                    <p className="label-text-alt text-gray-500 m-2 text-center">
                        Add <code className="bg-base-200 px-1 rounded text-pink-600">{`<cutr-keyword>`}</code> from <code className="bg-base-200 px-1 rounded text-pink-600">{window.location.origin}/{`<cutr-keyword>`}</code> for requesting URL deletion from our database.
                    </p>
                </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
                <button
                    className="btn btn-primary shadow-lg"
                    onClick={handleGenerate}
                >
                    Generate
                </button>
                <button
                    className="btn btn-error shadow-lg"
                    onClick={() => handleDeleteClick(url)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default UrlInputForm;