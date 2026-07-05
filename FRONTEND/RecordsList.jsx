import { useState } from "react";
import { exportRecordUrl } from "../api/client";

/**
 * `records` expected shape (adjust to your DB model):
 * [{ id, location, start_date, end_date, avg_temperature, created_at }, ...]
 */
export default function RecordsList({ records, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  function startEdit(record) {
    setEditingId(record.id);
    setDraft({ location: record.location, start_date: record.start_date, end_date: record.end_date });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  function saveEdit(id) {
    onUpdate(id, draft);
    setEditingId(null);
    setDraft({});
  }

  if (!records || records.length === 0) {
    return (
      <section className="card">
        <h3>Saved records</h3>
        <p className="empty-state">No records saved yet. Add one above.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>Saved records</h3>
      <div className="records-table-wrap">
        <table className="records-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Start</th>
              <th>End</th>
              <th>Avg Temp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                {editingId === r.id ? (
                  <>
                    <td>
                      <input
                        value={draft.location}
                        onChange={(e) =>
                          setDraft({ ...draft, location: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={draft.start_date}
                        onChange={(e) =>
                          setDraft({ ...draft, start_date: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={draft.end_date}
                        onChange={(e) =>
                          setDraft({ ...draft, end_date: e.target.value })
                        }
                      />
                    </td>
                    <td>{r.avg_temperature ?? "—"}</td>
                    <td className="actions">
                      <button onClick={() => saveEdit(r.id)}>Save</button>
                      <button className="secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{r.location}</td>
                    <td>{r.start_date}</td>
                    <td>{r.end_date}</td>
                    <td>{r.avg_temperature ?? "—"}</td>
                    <td className="actions">
                      <button onClick={() => startEdit(r)}>Edit</button>
                      <button
                        className="danger"
                        onClick={() => onDelete(r.id)}
                      >
                        Delete
                      </button>
                      <a
                        className="export-link"
                        href={exportRecordUrl(r.id, "pdf")}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                      <a
                        className="export-link"
                        href={exportRecordUrl(r.id, "csv")}
                        target="_blank"
                        rel="noreferrer"
                      >
                        CSV
                      </a>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
