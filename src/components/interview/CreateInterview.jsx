import React, { useEffect, useState } from "react";
import { apiFetch } from "../constants/api";
import { useNavigate } from "react-router-dom";

export default function CreateInterview() {
  const [form, setForm] = useState({
    role: "",
    level: "Junior",
    type: "technical",
    techstack: "",
    amount: 5,
    company: "",
    jobDescription: "",
    resumeIds: [],
  });
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/v1/vapi/gemini", {
        method: "POST",
        body: form,
      });
      if (res.status === 401) {
        navigate("/auth");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create interview");
      }
      navigate(`/interviewPage/${data.data._id}`);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/v1/resume/mine");
        if (res.ok) {
          const data = await res.json();
          setResumes(data?.data || []);
        }
      } catch {}
    })();
  }, []);

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 480 }}
    >
      <h3>Create Interview</h3>
      <label>
        Company (optional)
        <input
          name="company"
          value={form.company}
          onChange={onChange}
          placeholder="Acme Inc."
        />
      </label>
      <label>
        Job description (paste highlights)
        <textarea
          name="jobDescription"
          value={form.jobDescription}
          onChange={onChange}
          placeholder="Key responsibilities, requirements..."
          rows={4}
        />
      </label>
      <label>
        Select resumes to tailor questions (optional)
        <div
          style={{
            maxHeight: 160,
            overflow: "auto",
            border: "1px solid #e5e7eb",
            padding: 8,
            borderRadius: 8,
          }}
        >
          {resumes.length === 0 ? (
            <div style={{ color: "#6b7280" }}>No resumes uploaded.</div>
          ) : (
            resumes.map((r) => (
              <label
                key={r._id}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <input
                  type="checkbox"
                  checked={form.resumeIds.includes(r._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((f) => ({
                      ...f,
                      resumeIds: checked
                        ? Array.from(new Set([...(f.resumeIds || []), r._id]))
                        : (f.resumeIds || []).filter((id) => id !== r._id),
                    }));
                  }}
                />
                <span>
                  {r.originalName}{" "}
                  {Number.isInteger(r.slot) ? `(slot ${r.slot})` : ""}
                </span>
              </label>
            ))
          )}
        </div>
      </label>
      <label>
        Role
        <input
          name="role"
          value={form.role}
          onChange={onChange}
          placeholder="Software Engineer"
          required
        />
      </label>
      <label>
        Level
        <select name="level" value={form.level} onChange={onChange}>
          <option>Junior</option>
          <option>Mid</option>
          <option>Senior</option>
        </select>
      </label>
      <label>
        Type
        <select name="type" value={form.type} onChange={onChange}>
          <option value="technical">technical</option>
          <option value="behavioral">behavioral</option>
          <option value="mixed">mixed</option>
        </select>
      </label>
      <label>
        Tech stack (comma separated)
        <input
          name="techstack"
          value={form.techstack}
          onChange={onChange}
          placeholder="React, Node.js, MongoDB"
          required
        />
      </label>
      <label>
        Number of questions
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={onChange}
          min={1}
          max={20}
        />
      </label>
      <div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create interview"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
