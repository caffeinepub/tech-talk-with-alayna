import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { StudentProfile } from "./backend";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";

type AppRole = "guest" | "admin" | "student";

interface AuthState {
  role: AppRole;
  studentProfile?: StudentProfile;
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ role: "guest" });

  function handleAdminLogin() {
    setAuth({ role: "admin" });
  }

  function handleStudentLogin(profile: StudentProfile) {
    setAuth({ role: "student", studentProfile: profile });
  }

  function handleLogout() {
    setAuth({ role: "guest" });
  }

  return (
    <>
      {auth.role === "guest" && (
        <AuthPage
          onAdminLogin={handleAdminLogin}
          onStudentLogin={handleStudentLogin}
        />
      )}
      {auth.role === "admin" && <AdminDashboard onLogout={handleLogout} />}
      {auth.role === "student" && auth.studentProfile && (
        <StudentDashboard
          profile={auth.studentProfile}
          onLogout={handleLogout}
        />
      )}
      <Toaster richColors position="top-right" />
    </>
  );
}
