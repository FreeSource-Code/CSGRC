/**
 * Cybersecurity GRC Book Portal - TypeScript Data Models & Interfaces
 */

export interface ChapterTopic {
  id: number;
  number: string;
  title: string;
}

export interface Editor {
  id: string;
  number: string;
  name: string;
  role: string;
  department: string;
  university: string;
  country: string;
  flag: string;
  email: string;
}

export interface DeadlineMilestone {
  phase: string;
  name: string;
  dateStr: string;
  targetDate: Date;
  active: boolean;
}

export interface SubmissionDraft {
  author: string;
  email: string;
  affiliation: string;
  topic: string;
  title: string;
  abstract: string;
  keywords?: string;
}
