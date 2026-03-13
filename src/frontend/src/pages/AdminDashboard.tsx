import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  FileText,
  Loader2,
  LogOut,
  MessageCircle,
  MessageSquarePlus,
  Pencil,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { PDFEntry } from "../backend";
import {
  useAddMessage,
  useAddPDF,
  useAllMessages,
  useAllPDFs,
  useDeleteMessage,
  useDeletePDF,
  useUpdatePDF,
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

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { data: pdfs, isLoading: pdfsLoading } = useAllPDFs();
  const { data: messages, isLoading: messagesLoading } = useAllMessages();
  const addPDF = useAddPDF();
  const updatePDF = useUpdatePDF();
  const deletePDF = useDeletePDF();
  const addMessage = useAddMessage();
  const deleteMessage = useDeleteMessage();

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadGrade, setUploadGrade] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<PDFEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Message
  const [msgContent, setMsgContent] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a PDF file.");
      return;
    }
    if (!uploadGrade) {
      toast.error("Please select a grade.");
      return;
    }
    try {
      await addPDF.mutateAsync({
        title: uploadTitle,
        grade: uploadGrade,
        file: uploadFile,
      });
      toast.success("PDF uploaded successfully!");
      setUploadOpen(false);
      setUploadTitle("");
      setUploadGrade("");
      setUploadFile(null);
      if (uploadFileRef.current) uploadFileRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message || "Upload failed.");
    }
  }

  function openEdit(entry: PDFEntry) {
    setEditEntry(entry);
    setEditTitle(entry.title);
    setEditGrade(entry.grade);
    setEditFile(null);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editEntry) return;
    if (!editGrade) {
      toast.error("Please select a grade.");
      return;
    }
    try {
      await updatePDF.mutateAsync({
        id: editEntry.id,
        title: editTitle,
        grade: editGrade,
        file: editFile || undefined,
        existingBlob: editEntry.blobId,
      });
      toast.success("PDF updated!");
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Update failed.");
    }
  }

  async function handleDeletePDF(id: bigint) {
    try {
      await deletePDF.mutateAsync(id);
      toast.success("PDF deleted.");
    } catch (err: any) {
      toast.error(err?.message || "Delete failed.");
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgContent.trim()) return;
    try {
      await addMessage.mutateAsync(msgContent.trim());
      toast.success("Message sent to students!");
      setMsgContent("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message.");
    }
  }

  async function handleDeleteMessage(id: bigint) {
    try {
      await deleteMessage.mutateAsync(id);
      toast.success("Message deleted.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete message.");
    }
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
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
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
        {/* PDF Management */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="font-display text-xl">
                  PDF Management
                </CardTitle>
              </div>
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-ocid="admin.pdf.upload_button">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                      Upload New PDF
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="upload-title">Title</Label>
                      <Input
                        id="upload-title"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="PDF title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="upload-grade">
                        Grade / Reading Level
                      </Label>
                      <select
                        id="upload-grade"
                        value={uploadGrade}
                        onChange={(e) => setUploadGrade(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select grade/reading level</option>
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="upload-file">PDF File</Label>
                      <Input
                        id="upload-file"
                        type="file"
                        accept="application/pdf"
                        ref={uploadFileRef}
                        onChange={(e) =>
                          setUploadFile(e.target.files?.[0] || null)
                        }
                        required
                        data-ocid="admin.pdf.upload_button"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUploadOpen(false)}
                        data-ocid="admin.pdf.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addPDF.isPending}
                        data-ocid="admin.pdf.submit_button"
                      >
                        {addPDF.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {addPDF.isPending ? "Uploading..." : "Upload"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {pdfsLoading ? (
                <div className="space-y-3" data-ocid="admin.pdf.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !pdfs?.length ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admin.pdf.empty_state"
                >
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-body">
                    No PDFs uploaded yet. Upload your first one!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.pdf.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Grade / Reading Level</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pdfs.map((entry, idx) => (
                        <TableRow
                          key={String(entry.id)}
                          data-ocid="admin.pdf.row"
                        >
                          <TableCell className="font-medium">
                            {entry.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{entry.grade}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(entry.uploadedAt)}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(entry)}
                              data-ocid={
                                idx === 0
                                  ? "admin.pdf.edit_button.1"
                                  : `admin.pdf.edit_button.${idx + 1}`
                              }
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  data-ocid={
                                    idx === 0
                                      ? "admin.pdf.delete_button.1"
                                      : `admin.pdf.delete_button.${idx + 1}`
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete PDF?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{entry.title}
                                    ". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="admin.pdf.cancel_button">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePDF(entry.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-ocid="admin.pdf.confirm_button"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Edit PDF
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="PDF title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-grade">Grade / Reading Level</Label>
                <select
                  id="edit-grade"
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select grade/reading level</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-file">Replace PDF File (optional)</Label>
                <Input
                  id="edit-file"
                  type="file"
                  accept="application/pdf"
                  ref={editFileRef}
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to keep existing file
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  data-ocid="admin.pdf.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePDF.isPending}
                  data-ocid="admin.pdf.save_button"
                >
                  {updatePDF.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {updatePDF.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Messages to Students */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <CardTitle className="font-display text-xl">
                Messages to Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Compose */}
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-3"
              >
                <Label htmlFor="msg-content">Send a New Message</Label>
                <Textarea
                  id="msg-content"
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Write a message to your students..."
                  rows={3}
                  data-ocid="admin.message.textarea"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={addMessage.isPending || !msgContent.trim()}
                    data-ocid="admin.message.submit_button"
                  >
                    {addMessage.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {addMessage.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>

              {/* Messages list */}
              {messagesLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="admin.message.loading_state"
                >
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !messages?.length ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="admin.message.empty_state"
                >
                  <MessageSquarePlus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No messages sent yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...messages].reverse().map((msg, idx) => (
                    <div
                      key={String(msg.id)}
                      className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(
                            Number(msg.sentAt / 1_000_000n),
                          ).toLocaleString()}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                            data-ocid={
                              idx === 0
                                ? "admin.message.delete_button.1"
                                : `admin.message.delete_button.${idx + 1}`
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This message will be removed and students won't
                              see it anymore.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="admin.message.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="bg-destructive text-destructive-foreground"
                              data-ocid="admin.message.confirm_button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
