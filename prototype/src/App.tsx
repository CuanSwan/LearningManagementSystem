import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { resetDemoData } from "./api.js";
import { AdminCourseDetail } from "./pages/AdminCourseDetail.js";
import { AdminCourseList } from "./pages/AdminCourseList.js";
import { AdminModuleEditor } from "./pages/AdminModuleEditor.js";

function PrototypeBanner() {
  return (
    <div className="prototype-banner">
      <span>
        <strong>Prototype build</strong> — admin view only, for internal testing. Changes are saved in your browser
        only and aren't shared with anyone else.
      </span>
      <button type="button" onClick={resetDemoData}>
        Reset demo data
      </button>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <PrototypeBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminCourseList />} />
        <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
        <Route path="/admin/modules/:moduleId" element={<AdminModuleEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
