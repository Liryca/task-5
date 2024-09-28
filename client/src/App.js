import React, { useEffect, useState, useRef } from "react";
import { getUsers } from "./api";
import { useDebounce } from "@uidotdev/usehooks";
import "./App.css";

const App = () => {
  const [region, setRegion] = useState("sk");
  const [errorCount, setErrorCount] = useState(0);
  const [seed, setSeed] = useState(0);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isError, setIsError] = useState("");
  const [message, setMessage] = useState("");
  const observer = useRef();

  const debounceSeed = useDebounce(seed, 500);
  const debounceErrorCount = useDebounce(errorCount, 500);
  const lastDataElementRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getUsers(
          region,
          debounceErrorCount,
          debounceSeed,
          page
        );

        if (response.data.length > 0) {
          setData((prev) => [...prev, ...response.data]);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [region, debounceErrorCount, debounceSeed, page]);

  useEffect(() => {
    if (isLoading) return;

    if (lastDataElementRef.current) {
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      observer.current.observe(lastDataElementRef.current);
    }

    return () => {
      if (observer.current && lastDataElementRef.current) {
        observer.current.unobserve(lastDataElementRef.current);
      }
    };
  }, [isLoading, hasMore]);

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    if (newRegion !== region) {
      setRegion(newRegion);
      setData([]);
      setPage(1);
      setHasMore(true);
    }
  };

  const handleErrorCountChange = (value) => {
    const numericValue = Number(value);
    if (numericValue >= 0 && numericValue <= 1000) {
      if (numericValue !== errorCount) {
        setErrorCount(numericValue);
        setData([]);
        setPage(1);
        setHasMore(true);
        setMessage("");
      }
    } else {
      setMessage("max value 1000.");
    }
  };

  const handleSeedChange = (value) => {
    const numericValue = Number(value);
    if (numericValue !== seed) {
      setSeed(numericValue);
      setData([]);
      setPage(1);
      setHasMore(true);
    }
  };

  return (
    <div className="container mt-5">
      {isError && (
        <p className="text-center">
          Something went wrong. Error while receiving data
        </p>
      )}
      {!isError && (
        <>
          <div className="d-flex justify-content-between gap-3 flex-wrap p-3">
            <div className="d-flex flex-row align-items-center justify-content-center gap-3">
              <label className="">Region:</label>
              <select
                className="form-select"
                value={region}
                onChange={handleRegionChange}
              >
                <option value="sk">Slovak</option>
                <option value="pl">Poland</option>
                <option value="ua">Ukraine</option>
              </select>
            </div>
            <div className="d-flex flex-row align-items-center gap-3">
              <label className="">Error:</label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="10"
                step="0.25"
                value={errorCount}
                onChange={(e) =>
                  handleErrorCountChange(Math.min(e.target.value, 10))
                }
              />
              <input
                type="number"
                className="form-control mt-2"
                min="0"
                max="1000"
                step="0.25"
                value={errorCount}
                onChange={(e) => handleErrorCountChange(e.target.value)}
              />
              {message && <div class="invalid-feedback">{message}</div>}
            </div>
            <div className="d-flex flex-row align-items-center gap-3">
              <label>Seed:</label>
              <input
                type="number"
                className="form-control"
                value={seed}
                onChange={(e) => handleSeedChange(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                onClick={() =>
                  handleSeedChange(Math.floor(Math.random() * 1000))
                }
              >
                Random
              </button>
            </div>
          </div>
          <div className="data-table">
            <table className="table table-stripedtable table-fixed">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Adress</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {data.map((record, index) => (
                  <tr
                    key={record.randomId}
                    ref={index === data.length - 1 ? lastDataElementRef : null}
                  >
                    <td>{record.id}</td>
                    <td>{record.randomId}</td>
                    <td>{record.fullName}</td>
                    <td>{record.address}</td>
                    <td>{record.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <p className="text-center">Загрузка...</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
