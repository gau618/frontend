import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../constants/api";

export default function AdminTemplates() {
  const [questions, setQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    role: "",
    level: "Junior",
    type: "technical",
    techstack: "",
    questionIds: [],
    style: "professional",
    tone: "neutral",
    difficulty: "medium",
  });
  const [assign, setAssign] = useState({ templateId: "", userId: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [qRes, tRes, cRes] = await Promise.all([
        apiFetch("/api/v1/admin/questions"),
        apiFetch("/api/v1/admin/templates"),
        apiFetch("/api/v1/admin/candidates"),
      ]);
      const [qData, tData, cData] = await Promise.all([
        qRes.json().catch(() => ({})),
        tRes.json().catch(() => ({})),
        cRes.json().catch(() => ({})),
      ]);
      if (!qRes.ok || !qData.success) throw new Error(qData.message || "Error");
      if (!tRes.ok || !tData.success) throw new Error(tData.message || "Error");
      if (!cRes.ok || !cData.success) throw new Error(cData.message || "Error");
      setQuestions(qData.data || []);
      setTemplates(tData.data || []);
      setUsers(cData.data || []);
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name: form.name,
        role: form.role,
        level: form.level,
        type: form.type,
        techstack: form.techstack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        questionIds: form.questionIds,
        aiBehavior: {
          style: form.style,
          tone: form.tone,
          difficulty: form.difficulty,
        },
        isPublic: false,
      };
      const res = await apiFetch("/api/v1/admin/templates", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Error");
      setForm({
        name: "",
        role: "",
        level: "Junior",
        type: "technical",
        techstack: "",
        questionIds: [],
        style: "professional",
        tone: "neutral",
        difficulty: "medium",
      });
      load();
    } catch (e) {
      setError(e.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const onAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!assign.templateId || !assign.userId)
        throw new Error("Select template & user");
      const res = await apiFetch(
        `/api/v1/admin/templates/${assign.templateId}/assign`,
        { method: "POST", body: { userId: assign.userId } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Error");
      setAssign({ templateId: "", userId: "" });
      alert("Interview created and assigned");
    } catch (e) {
      setError(e.message || "Failed to assign template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h3>Templates</h3>
      <form onSubmit={onCreate} style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="Template name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          required
        />
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
          >
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="technical">technical</option>
            <option value="behavioral">behavioral</option>
            <option value="mixed">mixed</option>
          </select>
        </div>
        <input
          placeholder="Tech stack (comma separated)"
          value={form.techstack}
          onChange={(e) =>
            setForm((f) => ({ ...f, techstack: e.target.value }))
          }
        />
        <div>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>
            Select Questions
          </div>
          <div
            style={{
              display: "grid",
              gap: 4,
              maxHeight: 180,
              overflow: "auto",
              border: "1px solid #e5e7eb",
              padding: 8,
              borderRadius: 8,
            }}
          >
            {questions.map((q) => (
              <label key={q._id} style={{ display: "flex", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.questionIds.includes(q._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((f) => ({
                      ...f,
                      questionIds: checked
                        ? Array.from(new Set([...(f.questionIds || []), q._id]))
                        : (f.questionIds || []).filter((id) => id !== q._id),
                    }));
                  }}
                />
                <span>{q.text}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="AI style"
            value={form.style}
            onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
          />
          <input
            placeholder="AI tone"
            value={form.tone}
            onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
          />
          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm((f) => ({ ...f, difficulty: e.target.value }))
            }
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Template"}
        </button>
      </form>

      <h4>Assign Template</h4>
      <form
        onSubmit={onAssign}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <select
          value={assign.templateId}
          onChange={(e) =>
            setAssign((a) => ({ ...a, templateId: e.target.value }))
          }
        >
          <option value="">Select template</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={assign.userId}
          onChange={(e) => setAssign((a) => ({ ...a, userId: e.target.value }))}
        >
          <option value="">Select candidate</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.fullName} ({u.username})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !assign.templateId || !assign.userId}
        >
          Assign
        </button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </section>
  );
}
