import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminCourseDetail } from "./pages/AdminCourseDetail.js";
import { AdminCourseList } from "./pages/AdminCourseList.js";
import { AdminModuleEditor } from "./pages/AdminModuleEditor.js";
import { StudentCatalog } from "./pages/StudentCatalog.js";
import { StudentCourse } from "./pages/StudentCourse.js";
import { StudentModule } from "./pages/StudentModule.js";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentCatalog />} />
        <Route path="/courses/:courseId" element={<StudentCourse />} />
        <Route path="/courses/:courseId/modules/:moduleId" element={<StudentModule />} />
        <Route path="/admin" element={<AdminCourseList />} />
        <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
        <Route path="/admin/modules/:moduleId" element={<AdminModuleEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
