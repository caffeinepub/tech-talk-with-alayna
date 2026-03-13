import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message, PDFEntry } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useAllPDFs() {
  const { actor, isFetching } = useActor();
  return useQuery<PDFEntry[]>({
    queryKey: ["pdfs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPDFs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePDFsByGrade(grade: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PDFEntry[]>({
    queryKey: ["pdfs", "grade", grade],
    queryFn: async () => {
      if (!actor) return [];
      if (!grade || grade === "all") return actor.getAllPDFs();
      return actor.getPDFsByGrade(grade);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPDF() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      grade,
      file,
    }: { title: string; grade: string; file: File }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      await actor.addPDF(title, grade, blob);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });
}

export function useUpdatePDF() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      grade,
      file,
      existingBlob,
    }: {
      id: bigint;
      title: string;
      grade: string;
      file?: File;
      existingBlob: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      let blobToUse = existingBlob;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        blobToUse = ExternalBlob.fromBytes(bytes);
      }
      await actor.updatePDF(id, title, grade, blobToUse);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });
}

export function useDeletePDF() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deletePDF(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.addMessage(content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteMessage(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
