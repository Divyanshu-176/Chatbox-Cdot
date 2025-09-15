import React, { useEffect, useState } from 'react';

const QAHistoryTable = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:9090/qa_history')
      .then((response) => response.json())
      .then((data) => {
        const allLogs = data.logs || [];
        setLogs(allLogs);
        setFilteredLogs(allLogs);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Q&A logs:", error);
        setLoading(false);
      });
  }, []);

  // Filter logs whenever the filterDate changes
  useEffect(() => {
    if (filterDate === '') {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log =>
        log.timestamp.startsWith(filterDate)
      );
      setFilteredLogs(filtered);
    }
  }, [filterDate, logs]);

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading Q&A logs...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Q&A History</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Filter by Date:</label>
        <input
          type="date"
          value={filterDate}
          onChange={handleDateChange}
          className="border px-3 py-1 rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Timestamp</th>
              <th className="border px-4 py-2">Question</th>
              <th className="border px-4 py-2">Answer</th>
              <th className="border px-4 py-2">File Names</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No logs found for selected date.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{log.timestamp}</td>
                  <td className="border px-4 py-2">{log.question}</td>
                  <td className="border px-4 py-2">{log.answer}</td>
                  <td className="border px-4 py-2">{log.file_names?.join(', ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QAHistoryTable;
