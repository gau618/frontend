// Deprecated: replaced by Profile page
export default function UploadResume() { return null; }

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../constants/api";
import { useNavigate } from "react-router-dom";

export default function UploadResume() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const refresh = async () => {
    const res = await apiFetch("/api/v1/resume/mine");
    if (res.ok) {
      const data = await res.json();
  setList(data?.data || []);
    }
  };

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("resume", file);
      const res = await apiFetch("/api/v1/resume/upload", {
        method: "POST",
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body?.message || "Upload failed");
        return;
      }
      setFile(null);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Upload Résumé</h2>
      <form onSubmit={onSubmit}>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || busy} style={{ marginLeft: 8 }}>
          Upload
        </button>
      </form>
      <hr />
      <h3>My Résumés</h3>
      {list.length === 0 ? (
        <p>No resumes uploaded yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {list.map((r) => (
            <div key={r._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{r.originalName}</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>
                {(r.size / 1024).toFixed(1)} KB • {new Date(r.createdAt).toLocaleString()}
              </div>
              {Array.isArray(r.skills) && r.skills.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Skills:</strong> {r.skills.slice(0, 15).join(', ')}
                </div>
              )}
              {Array.isArray(r.education) && r.education.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <strong>Education:</strong>
                  <ul style={{ margin: '4px 0 0 16px' }}>
                    {r.education.slice(0, 3).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(r.experience) && r.experience.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <strong>Experience:</strong>
                  <ul style={{ margin: '4px 0 0 16px' }}>
                    {r.experience.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
