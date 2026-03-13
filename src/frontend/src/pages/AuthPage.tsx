import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { StudentProfile } from "../backend";
import { useActor } from "../hooks/useActor";

interface AuthPageProps {
  onAdminLogin: () => void;
  onStudentLogin: (profile: StudentProfile) => void;
}

const GRADE_OPTIONS = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Reading Level A",
  "Reading Level B",
  "Reading Level C",
  "Reading Level D",
  "Reading Level E",
];

export default function AuthPage({
  onAdminLogin,
  onStudentLogin,
}: AuthPageProps) {
  const { actor } = useActor();

  // Student login
  const [sLoginUser, setSLoginUser] = useState("");
  const [sLoginPass, setSLoginPass] = useState("");
  const [sLoginLoading, setSLoginLoading] = useState(false);

  // Student register
  const [regName, setRegName] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regGrade, setRegGrade] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Admin login
  const [aUser, setAUser] = useState("");
  const [aPass, setAPass] = useState("");
  const [aLoading, setALoading] = useState(false);

  async function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    setSLoginLoading(true);
    try {
      const profile = await actor.loginStudent(sLoginUser, sLoginPass);
      toast.success(`Welcome back, ${profile.name}!`);
      onStudentLogin(profile);
    } catch (err: any) {
      toast.error(err?.message || "Login failed. Check your credentials.");
    } finally {
      setSLoginLoading(false);
    }
  }

  async function handleStudentRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    if (!regGrade) {
      toast.error("Please select a grade/reading level.");
      return;
    }
    setRegLoading(true);
    try {
      await actor.registerStudent(regName, regUser, regPass, regGrade);
      toast.success("Account created! Please log in.");
      setRegName("");
      setRegUser("");
      setRegPass("");
      setRegGrade("");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    setALoading(true);
    try {
      const ok = await actor.loginAdmin(aUser, aPass);
      if (ok) {
        toast.success("Welcome, Alayna!");
        onAdminLogin();
      } else {
        toast.error("Invalid admin credentials.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Admin login failed.");
    } finally {
      setALoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background hero-gradient flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-6 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-700 text-foreground leading-tight">
            Tech Talk
            <span className="block text-primary"> With Alayna</span>
          </h1>
          <p className="mt-3 text-muted-foreground font-body text-lg">
            Your gateway to learning resources
          </p>
        </motion.div>
      </header>

      {/* Auth Card */}
      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-elevated border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-2xl text-foreground">
                Sign In
              </CardTitle>
              <CardDescription>
                Choose how you'd like to access the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="student-login">
                <TabsList className="w-full mb-6 bg-muted">
                  <TabsTrigger
                    value="student-login"
                    className="flex-1 text-xs sm:text-sm"
                    data-ocid="auth.student_login.tab"
                  >
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Student Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="student-register"
                    className="flex-1 text-xs sm:text-sm"
                    data-ocid="auth.student_register.tab"
                  >
                    Register
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin-login"
                    className="flex-1 text-xs sm:text-sm"
                    data-ocid="auth.admin_login.tab"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                {/* Student Login */}
                <TabsContent value="student-login">
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="sl-username">Username</Label>
                      <Input
                        id="sl-username"
                        value={sLoginUser}
                        onChange={(e) => setSLoginUser(e.target.value)}
                        placeholder="Enter your username"
                        required
                        data-ocid="auth.username.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sl-password">Password</Label>
                      <Input
                        id="sl-password"
                        type="password"
                        value={sLoginPass}
                        onChange={(e) => setSLoginPass(e.target.value)}
                        placeholder="Enter your password"
                        required
                        data-ocid="auth.password.input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={sLoginLoading}
                      data-ocid="auth.submit_button"
                    >
                      {sLoginLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {sLoginLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Student Register */}
                <TabsContent value="student-register">
                  <form onSubmit={handleStudentRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Your full name"
                        required
                        data-ocid="auth.name.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        value={regUser}
                        onChange={(e) => setRegUser(e.target.value)}
                        placeholder="Choose a username"
                        required
                        data-ocid="auth.username.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="Choose a password"
                        required
                        data-ocid="auth.password.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-grade">Grade / Reading Level</Label>
                      <select
                        id="reg-grade"
                        value={regGrade}
                        onChange={(e) => setRegGrade(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        data-ocid="auth.grade.input"
                      >
                        <option value="">Select grade/reading level</option>
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={regLoading}
                      data-ocid="auth.submit_button"
                    >
                      {regLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {regLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Admin Login */}
                <TabsContent value="admin-login">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary mb-2">
                      Admin access is restricted to authorized personnel only.
                    </div>
                    <div>
                      <Label htmlFor="a-username">Admin Username</Label>
                      <Input
                        id="a-username"
                        value={aUser}
                        onChange={(e) => setAUser(e.target.value)}
                        placeholder="Username"
                        required
                        data-ocid="auth.username.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="a-password">Admin Password</Label>
                      <Input
                        id="a-password"
                        type="password"
                        value={aPass}
                        onChange={(e) => setAPass(e.target.value)}
                        placeholder="Password"
                        required
                        data-ocid="auth.password.input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={aLoading}
                      data-ocid="auth.submit_button"
                    >
                      {aLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {aLoading ? "Authenticating..." : "Admin Sign In"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
