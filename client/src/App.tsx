import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth.js";
import { AccessibilityMenu } from "./components/AccessibilityMenu.js";
import { DisplayPreferenceChooser } from "./components/DisplayPreferenceChooser.js";
import { RequireAuth } from "./components/RequireAuth.js";
import { RequireRole } from "./components/RequireRole.js";
import { TopBar } from "./components/TopBar.js";
import { DisplayPreferenceProvider, useDisplayPreference } from "./displayPreference.js";
import { Account } from "./pages/Account.js";
import { AdminAssignments } from "./pages/AdminAssignments.js";
import { AdminCourseDetail } from "./pages/AdminCourseDetail.js";
import { AdminCourseList } from "./pages/AdminCourseList.js";
import { AdminModuleEditor } from "./pages/AdminModuleEditor.js";
import { AdminNewModule } from "./pages/AdminNewModule.js";
import { AdminLearningPathDetail } from "./pages/AdminLearningPathDetail.js";
import { AdminLearningPathList } from "./pages/AdminLearningPathList.js";
import { AdminUsers } from "./pages/AdminUsers.js";
import { Home } from "./pages/Home.js";
import { LearningPathDetail } from "./pages/LearningPathDetail.js";
import { LearningPaths } from "./pages/LearningPaths.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { StudentCatalog } from "./pages/StudentCatalog.js";
import { StudentCourse } from "./pages/StudentCourse.js";
import { StudentModule } from "./pages/StudentModule.js";

function LayoutInner() {
  const { mode, loading, choose } = useDisplayPreference();

  if (loading) return <p>Loading...</p>;
  if (mode === null) return <DisplayPreferenceChooser onChoose={choose} />;

  return (
    <div className="app-shell">
      <TopBar />
      <Outlet />
      <AccessibilityMenu />
    </div>
  );
}

function Layout() {
  return (
    <DisplayPreferenceProvider>
      <LayoutInner />
    </DisplayPreferenceProvider>
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
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/learning-paths/:pathId" element={<LearningPathDetail />} />
            <Route path="/courses" element={<StudentCatalog />} />
            <Route path="/courses/:courseId" element={<StudentCourse />} />
            <Route path="/courses/:courseId/modules/:moduleId" element={<StudentModule />} />

            <Route element={<RequireRole roles={["admin", "super_admin"]} />}>
              <Route path="/admin" element={<AdminCourseList />} />
              <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
              <Route path="/admin/modules/new" element={<AdminNewModule />} />
              <Route path="/admin/modules/:moduleId" element={<AdminModuleEditor />} />
              <Route path="/admin/learning-paths" element={<AdminLearningPathList />} />
              <Route path="/admin/learning-paths/:pathId" element={<AdminLearningPathDetail />} />
              <Route path="/admin/assignments" element={<AdminAssignments />} />
            </Route>

            <Route element={<RequireRole roles={["admin", "super_admin"]} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
