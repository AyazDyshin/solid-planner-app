import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";

export interface Note {
  id: number | null;
  title: string | null;
  content: string | null;
  category: string | null;
  url: string;
  access: Record<string, AccessModes> | null;
  shareList?: Record<string, AccessModes>;
  //  [key: string]: string | number;
}

export interface Habit {
  id: number | null;
  title: string | null;
  content: string | null;
  startDate: Date | null;
  lastCheckInDate: Date | null;
  recurrence: string | null;
  bestStreak: number | null;
  prevBestStreak: number | null;
  prevLastCheckIn: Date | null;
  currentStreak: number | null;
  url: string | null;
  stat: boolean | null;
  category: string | null;
  access: Record<string, AccessModes> | null;
  shareList?: Record<string, AccessModes>;
  custom?: number[] | number | null;
}
export type withCategory = object & { category: string | null; };

export type fetcher = (((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>)) | undefined;

export type accessObject = { read: boolean, append: boolean, write: boolean };

export enum voc {
  Habit = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#Habit",
  accessType = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#accessType",
  defaultFolder = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#defaultFolder"
}

export enum otherV {
  category = "http://dbpedia.org/ontology/category",

}