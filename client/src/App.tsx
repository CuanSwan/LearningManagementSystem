import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth.js";
import { RequireAuth } from "./components/RequireAuth.js";
import { RequireRole } from "./components/RequireRole.js";
import { TopBar } from "./components/TopBar.js";
import { AdminCourseDetail } from "./pages/AdminCourseDetail.js";
import { AdminCourseList } from "./pages/AdminCourseList.js";
import { AdminModuleEditor } from "./pages/AdminModuleEditor.js";
import { AdminUsers } from "./pages/AdminUsers.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { StudentCatalog } from "./pages/StudentCatalog.js";
import { StudentCourse } from "./pages/StudentCourse.js";
import { StudentModule } from "./pages/StudentModule.js";

function Layout() {
  return (
    <>
      <TopBar />
      <Outlet />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<StudentCatalog />} />
            <Route path="/courses/:courseId" element={<StudentCourse />} />
            <Route path="/courses/:courseId/modules/:moduleId" element={<StudentModule />} />

            <Route element={<RequireRole roles={["admin", "super_admin"]} />}>
              <Route path="/admin" element={<AdminCourseList />} />
              <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
              <Route path="/admin/modules/:moduleId" element={<AdminModuleEditor />} />
            </Route>

            <Route element={<RequireRole roles={["super_admin"]} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
