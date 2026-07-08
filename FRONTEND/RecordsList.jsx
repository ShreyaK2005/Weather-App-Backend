import { exportRecordUrl } from "../api/client";

export default function RecordsList({ records, onUpdate, onDelete }) {

  if (!records || records.length === 0) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Saved Records
          </h2>

          <p>No records found.</p>
        </div>
    );
  }

  return (

      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

          <h2 className="text-2xl font-bold mb-6">
              Saved Records
          </h2>

          <div className="overflow-x-auto">

              <table className="w-full border-collapse min-w-[650px]">

          <thead>

          <tr className="border-b">

            <th className="p-3">Location</th>
            <th className="p-3">Start</th>
            <th className="p-3">End</th>
            <th className="p-3">Actions</th>

          </tr>

          </thead>

          <tbody>

          {records.map((r) => (

              <tr key={r.id} className="border-b text-center">

                <td className="p-3">
                  {r.resolved_name}
                </td>

                <td className="p-3">
                  {r.start_date}
                </td>

                <td className="p-3">
                  {r.end_date}
                </td>

                <td className="p-3 flex flex-col md:flex-row justify-center gap-2">

                  <button
                      onClick={() => onUpdate(r)}
                      className="bg-yellow-500 text-white px-3 py-2 rounded"
                  >
                    Update
                  </button>

                  <button
                      onClick={() => onDelete(r.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded"
                  >
                    Delete
                  </button>

                  <a
                      href={exportRecordUrl(r.id, "pdf")}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 text-white px-3 py-2 rounded"
                  >
                    Export PDF
                  </a>

                </td>

              </tr>

          ))}

          </tbody>

        </table>

          </div>

      </div>

  );

}
