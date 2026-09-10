import { useState } from "react";
import { BrowserRouter, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { resetDemoData } from "./api.js";
import { DisplayPreferenceChooser } from "./components/DisplayPreferenceChooser.js";
import { AdminCourseDetail } from "./pages/AdminCourseDetail.js";
import { AdminCourseList } from "./pages/AdminCourseList.js";
import { AdminModuleEditor } from "./pages/AdminModuleEditor.js";
import { StudentCatalog } from "./pages/StudentCatalog.js";
import { StudentCourse } from "./pages/StudentCourse.js";
import { StudentModule } from "./pages/StudentModule.js";
import { DisplayPreferenceProvider, useDisplayPreference } from "./displayPreference.js";

function PrototypeHeader({ onReset }: { onReset: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  function handleReset() {
    resetDemoData();
    onReset();
    navigate(location.pathname.startsWith("/admin") ? "/admin" : "/", { replace: true });
  }

  return (
    <header className="prototype-banner">
      <span>
        <strong>Prototype build</strong> — for design review only. Course content edits are saved in this browser;
        student progress and display choice reset each new browser session.
      </span>
      <nav className="prototype-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Student view
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
          Admin view
        </NavLink>
      </nav>
      <button type="button" onClick={handleReset}>
        Reset demo data
      </button>
    </header>
  );
}

function StudentLayout() {
  const { mode, loading, choose } = useDisplayPreference();

  if (loading) return <p>Loading...</p>;
  if (mode === null) return <DisplayPreferenceChooser onChoose={choose} />;

  return (
    <>
      <div className="display-toggle" role="group" aria-label="Lesson display">
        <button type="button" className={mode === "vertical" ? "active" : ""} onClick={() => choose("vertical")}>
          List
        </button>
        <button type="button" className={mode === "carousel" ? "active" : ""} onClick={() => choose("carousel")}>
          Carousel
        </button>
      </div>
      <Outlet />
    </>
  );
}

function StudentSection() {
  return (
    <DisplayPreferenceProvider>
      <StudentLayout />
    </DisplayPreferenceProvider>
  );
}

export function App() {
  // Bumping this key remounts every routed page, forcing a fresh fetch from the
  // (just-reseeded) mock api instead of relying on a real browser reload.
  const [resetKey, setResetKey] = useState(0);

  return (
    <BrowserRouter>
      <PrototypeHeader onReset={() => setResetKey((k) => k + 1)} />
      <Routes key={resetKey}>
        <Route element={<StudentSection />}>
          <Route path="/" element={<StudentCatalog />} />
          <Route path="/courses/:courseId" element={<StudentCourse />} />
          <Route path="/courses/:courseId/modules/:moduleId" element={<StudentModule />} />
        </Route>

        <Route path="/admin" element={<AdminCourseList />} />
        <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
        <Route path="/admin/modules/:moduleId" element={<AdminModuleEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
