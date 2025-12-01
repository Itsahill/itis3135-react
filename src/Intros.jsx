import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./intros.css";

export default function Intros() {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = "https://dvonb.xyz/api/2025-fall/itis-3135/students?full=1";
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        console.log("Intros fetched data:", data);
        // normalize: API may return an array or an object with 'students' or 'data'
        let normalized = [];
        if (Array.isArray(data)) normalized = data;
        else if (Array.isArray(data.students)) normalized = data.students;
        else if (Array.isArray(data.data)) normalized = data.data;
        else normalized = data;
        if (!cancelled) setStudents(normalized || []);
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  function renderValue(val) {
    if (val == null) return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      // detect image URLs (file extensions or data URIs)
      const isImageUrl = /(^data:image\/)|\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(trimmed);
      if (isImageUrl) {
        return (
          <img src={trimmed} alt="student media" className="student-image" />
        );
      }
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return (
          <a className="card-link" href={trimmed} target="_blank" rel="noopener noreferrer">
            {trimmed}
          </a>
        );
      }
      return <span className="card-text">{trimmed}</span>;
    }
    if (Array.isArray(val)) return <pre className="json-dump">{JSON.stringify(val, null, 2)}</pre>;
    if (typeof val === "object") return <pre className="json-dump">{JSON.stringify(val, null, 2)}</pre>;
    return <span>{String(val)}</span>;
  }

  useEffect(() => {
    console.log("Intros mounted");
    return () => console.log("Intros unmounted");
  }, []);

  // helpers to build a stable key for each student for URLs
  const keyFor = (student, idx) => {
    if (!student) return `s-${idx}`;
    const email = student.email || student.username || student.id || null;
    if (email && typeof email === "string") return String(email).split("@")[0];
    // if name is an object (first/middle/last/preferred), build a slug from the preferred or full name
    const nameVal = student.name;
    if (nameVal && typeof nameVal === "string") return nameVal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `s-${idx}`;
    if (nameVal && typeof nameVal === "object") {
      const pref = nameVal.preferred || nameVal.preferredName || nameVal.preferred_name || null;
      const first = nameVal.first || nameVal.given || null;
      const last = nameVal.last || nameVal.surname || nameVal.family || null;
      const base = pref || `${first || ""} ${last || ""}`.trim() || nameVal.toString();
      return String(base).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `s-${idx}`;
    }
    return `s-${idx}`;
  };

  const formatName = (student, idx) => {
    if (!student) return `Student ${idx + 1}`;
    const nameVal = student.name || student.fullname || student.displayName || student.title || null;
    if (!nameVal) return student.email || student.username || `Student ${idx + 1}`;
    if (typeof nameVal === "string") return nameVal;
    if (typeof nameVal === "object") {
      // prefer a preferred name if present
      const pref = nameVal.preferred || nameVal.preferredName || nameVal.preferred_name || null;
      if (pref) return pref;
      const first = nameVal.first || nameVal.given || "";
      const middle = nameVal.middleInitial || nameVal.middle || "";
      const last = nameVal.last || nameVal.surname || nameVal.family || "";
      return `${first} ${middle ? middle + ' ' : ''}${last}`.trim() || `Student ${idx + 1}`;
    }
    return String(nameVal);
  };

  const params = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(null);

  // when students load or param changes, set the current index
  useEffect(() => {
    if (!students) return;
    if (!params || !params.id) {
      setCurrentIndex(0);
      return;
    }
    const id = params.id;
    // find matching student by key or by index
    let found = -1;
    if (Array.isArray(students)) {
      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const st = s.student || s.fields || s || {};
        if (keyFor(st, i) === id) {
          found = i;
          break;
        }
        // also allow numeric index in URL
        if (String(i) === id) {
          found = i;
          break;
        }
      }
    }
    setCurrentIndex(found >= 0 ? found : 0);
  }, [students, params]);

  function goToIndex(i) {
    if (!Array.isArray(students) || i < 0 || i >= students.length) return;
    const s = students[i];
    const st = s.student || s.fields || s || {};
    const key = keyFor(st, i);
    setCurrentIndex(i);
    // update URL so the view is shareable
    navigate(`/intros/${encodeURIComponent(key)}`, { replace: false });
  }

  function goPrev() {
    if (currentIndex == null) return;
    const next = Math.max(0, currentIndex - 1);
    goToIndex(next);
  }

  function goNext() {
    if (currentIndex == null) return;
    const next = Math.min(students.length - 1, currentIndex + 1);
    goToIndex(next);
  }

  // build the grid content outside of JSX to avoid nested ternary expressions
  const gridContent = (() => {
    // if no students or not an object/array, nothing to show
    if (!students) return null;

    // single-student view when we have an array and a selected index
    if (Array.isArray(students) && currentIndex != null) {
      const s = students[currentIndex];
      const student = s.student || s.fields || s || {};
      const name = formatName(student, currentIndex);
      const email = student.email || student.username || student.id || null;
      const photo = student.photo || student.avatar || student.image || student.picture || null;

      return (
        <div className="card card--full">
          <div className="controls">
            <div className="left">
              <button onClick={() => { navigate('/intros'); }} style={{ marginRight: 8 }}>Back to list</button>
              <button onClick={goPrev} disabled={currentIndex === 0} style={{ marginRight: 8 }}>Prev</button>
              <button onClick={goNext} disabled={currentIndex === students.length - 1}>Next</button>
            </div>
            <div style={{ fontSize: "0.9rem", color: "#333" }}>{currentIndex + 1} of {students.length}</div>
          </div>

          <article className="card">
            <header>
              {photo ? (
                <img src={photo} alt={name} />
              ) : (
                <div className="initials">
                  <strong>{(name || "?").slice(0, 1)}</strong>
                </div>
              )}
              <div>
                <h3 style={{ margin: 0 }}>{name}</h3>
                {email && <div style={{ fontSize: "0.95rem", color: "#444" }}>{email}</div>}
              </div>
            </header>

            <div style={{ marginTop: "0.75rem", fontSize: "0.95rem" }}>
              {Object.keys(student).map((k) => (
                <div key={k} style={{ marginBottom: 6 }}>
                  <strong style={{ textTransform: "capitalize" }}>{k}:</strong>{" "}
                  {renderValue(student[k])}
                </div>
              ))}
            </div>
          </article>
        </div>
      );
    }

    // list view when students is an array but no selected index
    if (Array.isArray(students)) {
      return students.map((s, idx) => {
        const student = s.student || s.fields || s || {};
        const name = formatName(student, idx);
        const keyId = keyFor(student, idx);
        return (
          <article key={keyId} className="card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              { (student.photo || student.avatar || student.image || student.picture) && (
                <img src={student.photo || student.avatar || student.image || student.picture} alt={name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
              ) }
              <h3 style={{ marginTop: 0 }}>{name}</h3>
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => goToIndex(idx)}>Open</button>
            </div>
          </article>
        );
      });
    }

    // object/JSON dump view
    if (students && typeof students === "object") {
      return (
        <pre className="json-dump">{JSON.stringify(students, null, 2)}</pre>
      );
    }

    return null;
  })();

  return (
    <section>
      <h2>Student Introductions</h2>
      {loading && <p>Loading student data…</p>}
      {error && (
        <p style={{ color: "crimson" }}>Error loading data: {error}</p>
      )}

      {!loading && !error && (!students || students.length === 0) && (
        <p>No student data found.</p>
      )}

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {Array.isArray(students) && currentIndex != null ? (
          // single-student view
          (() => {
            const s = students[currentIndex];
            const student = s.student || s.fields || s || {};
            const name = formatName(student, currentIndex);
            const email = student.email || student.username || student.id || null;
            const photo = student.photo || student.avatar || student.image || student.picture || null;

            return (
              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <button onClick={() => { navigate('/intros'); }} style={{ marginRight: 8 }}>Back to list</button>
                    <button onClick={goPrev} disabled={currentIndex === 0} style={{ marginRight: 8 }}>Prev</button>
                    <button onClick={goNext} disabled={currentIndex === students.length - 1}>Next</button>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#333" }}>{currentIndex + 1} of {students.length}</div>
                </div>

                  <article style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: 8, background: "#fff", color: "#000", overflowWrap: "break-word", wordBreak: "break-word" }}>
                  <header style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {photo ? (
                      <img src={photo} alt={name} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 96, height: 96, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                        <strong>{(name || "?").slice(0, 1)}</strong>
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0 }}>{name}</h3>
                      {email && <div style={{ fontSize: "0.95rem", color: "#444" }}>{email}</div>}
                    </div>
                  </header>

                  <div style={{ marginTop: "0.75rem", fontSize: "0.95rem" }}>
                    {Object.keys(student).map((k) => (
                      <div key={k} style={{ marginBottom: 6 }}>
                        <strong style={{ textTransform: "capitalize" }}>{k}:</strong>{" "}
                        {renderValue(student[k])}
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            );
          })()
        ) : (
          // list or JSON dump if not array
          Array.isArray(students) ? (
            students.map((s, idx) => {
              const student = s.student || s.fields || s || {};
              const name = formatName(student, idx);
                const keyId = keyFor(student, idx);
              return (
                  <article key={keyId} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: 8, background: "#fff", color: "#000", overflowWrap: "break-word", wordBreak: "break-word" }}>
                  <h3 style={{ marginTop: 0 }}>{name}</h3>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => goToIndex(idx)}>Open</button>
                  </div>
                </article>
              );
            })
          ) : (
            students && typeof students === "object" && (
              <pre style={{ gridColumn: "1/-1", background: "#fff", color: "#000", padding: 12 }}>{JSON.stringify(students, null, 2)}</pre>
            )
          )
        )}
      </div>
    </section>
  );
}