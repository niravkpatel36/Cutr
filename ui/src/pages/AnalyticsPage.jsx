import { QrCode } from "react-qrcode-pretty";
import React from "react";

const AnalyticsPage = ({ analyticsData }) => {
  const { urlDetails, analytics } = analyticsData;

  return (
    <div className="my-8 mx-3 flex flex-col items-center">
      <div className="card w-full max-w-5xl border border-base-300 dark:border-zinc-400 rounded-lg bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <p className="text-lg font-bold text-center">URL Details</p>
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div
              className="flex justify-center items-center border shadow-xl dark:border-gray-200 rounded-lg bg-clip-content mx-3"
              style={{ width: "fit-content" }}
            >
              <QrCode
                value={`${window.location.origin}/${urlDetails.shortURL}`}
                variant={{
                  eyes: "fluid",
                  body: "gravity",
                }}
                color={{
                  eyes: "#605df6",
                  body: "#ff428e",
                }}
                padding={10}
                size={window.innerWidth > 768 ? 150 : 80}
                bgColor="transparent"
                bgRounded
                divider
              />
            </div>
            <div className="flex flex-col p-5 items-start">
              <p>
                Short URL:{" "}
                <a
                  href={window.location.origin + "/" + urlDetails.shortURL}
                  className="link link-secondary"
                >
                  {window.location.origin + "/" + urlDetails.shortURL}
                </a>
              </p>
              <p>
                Redirect URL:
                <a
                  href={urlDetails.url}
                  className="link link-primary font-bold text-justify max-w-full overflow-hidden text-ellipsis line-clamp-3 break-all"
                >
                  {urlDetails.url}
                </a>
              </p>
              <p>
                Creation Date:{" "}
                {new Date(urlDetails.dateCreated).toLocaleString()}
              </p>
              <p>PIN: {urlDetails.pin}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full max-w-5xl">
        <table className="table border border-separate border-base-300 rounded-lg shadow-xl">
          <thead className="hidden md:table-header-group">
            <tr>
              <th>Access Time</th>
              <th>User Agent</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Country</th>
            </tr>
          </thead>
          <thead className="md:hidden text-center">
            <tr>
              <th>Access Log</th>
            </tr>
          </thead>
          <tbody>
            {analytics && analytics.length > 0 ? (
              analytics.map((log, index) => (
                <React.Fragment key={index}>
                  <tr className="md:hidden">
                    <td colSpan="5" className="text-left">
                      <p>
                        <strong>Access Time:</strong>{" "}
                        {new Date(log.accessTime).toLocaleString()}
                      </p>
                      <p>
                        <strong>User Agent:</strong> {log.userAgent}
                      </p>
                      <p>
                        <strong>IP:</strong> {log.ipAddress}
                      </p>
                      <p>
                        <strong>Location:</strong> {log.location}
                      </p>
                      <p>
                        <strong>Country:</strong> {log.country}
                      </p>
                    </td>
                  </tr>
                  <tr className="hidden md:table-row hover:bg-pink-50 dark:hover:bg-pink-700">
                    <td>{new Date(log.accessTime).toLocaleString()}</td>
                    <td>{log.userAgent}</td>
                    <td>{log.ipAddress}</td>
                    <td>{log.location}</td>
                    <td>{log.country}</td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No analytics data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsPage;
