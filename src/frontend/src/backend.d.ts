import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface StudentProfile {
    username: string;
    password: string;
    name: string;
    grade: string;
    registeredAt: Time;
}
export type Time = bigint;
export interface PDFEntry {
    id: bigint;
    title: string;
    grade: string;
    blobId: ExternalBlob;
    uploadedAt: Time;
}
export interface Message {
    id: bigint;
    content: string;
    sentAt: Time;
}
export interface UserProfile {
    username: string;
    name: string;
    grade: string;
    registeredAt: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(content: string): Promise<void>;
    addPDF(title: string, grade: string, blobId: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMessage(id: bigint): Promise<void>;
    deletePDF(id: bigint): Promise<void>;
    getAllMessages(): Promise<Array<Message>>;
    getAllPDFs(): Promise<Array<PDFEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPDFsByGrade(grade: string): Promise<Array<PDFEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(username: string, password: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    loginAdmin(username: string, password: string): Promise<boolean>;
    loginStudent(username: string, password: string): Promise<StudentProfile>;
    registerStudent(name: string, username: string, password: string, grade: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePDF(id: bigint, title: string, grade: string, blobId: ExternalBlob): Promise<void>;
}
