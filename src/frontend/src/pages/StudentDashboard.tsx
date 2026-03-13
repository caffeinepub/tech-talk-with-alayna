import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ExternalLink,
  FileText,
  LogOut,
  MessageCircle,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { StudentProfile } from "../backend";
import {
  useAllMessages,
  useAllPDFs,
  usePDFsByGrade,
} from "../hooks/useQueries";

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

interface StudentDashboardProps {
  profile: StudentProfile;
  onLogout: () => void;
}

export default function StudentDashboard({
  profile,
  onLogout,
}: StudentDashboardProps) {
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");

  const { data: allPdfs, isLoading: allLoading } = useAllPDFs();
  const { data: filteredByGrade, isLoading: gradeLoading } =
    usePDFsByGrade(selectedGrade);
  const { data: messages, isLoading: messagesLoading } = useAllMessages();

  const isLoading = selectedGrade === "all" ? allLoading : gradeLoading;
  const sourcePdfs =
    selectedGrade === "all" ? (allPdfs ?? []) : (filteredByGrade ?? []);

  const displayPdfs = sourcePdfs.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(search.toLowerCase()) ||
      pdf.grade.toLowerCase().includes(search.toLowerCase()),
  );

  function openPDF(url: string) {
    window.open(url, "_blank", "noopener noreferrer");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-700 text-foreground leading-none">
                Tech Talk With Alayna
              </h1>
              <p className="text-xs text-muted-foreground">
                Welcome, {profile.name} · {profile.grade}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            data-ocid="nav.logout_button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-10">
        {/* PDFs Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="font-display text-xl">
                  Learning Materials
                </CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search PDFs by title or grade..."
                    className="pl-9"
                    data-ocid="student.pdf.search_input"
                  />
                </div>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger
                    className="w-full sm:w-52"
                    data-ocid="student.pdf.grade.select"
                  >
                    <SelectValue placeholder="Filter by grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  data-ocid="student.pdf.loading_state"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                  ))}
                </div>
              ) : !displayPdfs.length ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="student.pdf.empty_state"
                >
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No PDFs found{search ? ` for "${search}"` : ""}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayPdfs.map((pdf, idx) => (
                    <motion.button
                      key={String(pdf.id)}
                      onClick={() => openPDF(pdf.blobId.getDirectURL())}
                      className="card-hover text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer w-full"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      data-ocid={
                        idx === 0
                          ? "student.pdf.item.1"
                          : `student.pdf.item.${idx + 1}`
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm leading-snug truncate">
                            {pdf.title}
                          </p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {pdf.grade}
                          </Badge>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Messages Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <CardTitle className="font-display text-xl">
                Messages from Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="student.message.loading_state"
                >
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !messages?.length ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="student.message.empty_state"
                >
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No messages from your teacher yet.</p>
                </div>
              ) : (
                <div className="space-y-3" data-ocid="student.message.list">
                  {[...messages].reverse().map((msg, idx) => (
                    <motion.div
                      key={String(msg.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl border border-border bg-primary/5 border-l-4 border-l-primary"
                    >
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(
                          Number(msg.sentAt / 1_000_000n),
                        ).toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}
