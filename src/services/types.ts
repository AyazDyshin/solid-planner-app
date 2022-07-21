import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
/**
 * Interface that represents a note
 * @category definitions
 * @interface
 */
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

/**
 * Interface that represents a habit
 * @category definitions
 * @interface
 */
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
  checkInList: Date[] | null;
  color: string;
  shareList?: Record<string, AccessModes>;
  custom?: number[] | number | null;
}

/**
 * Interface that represents an app notification 
 * @category definitions
 *
 * @interface
 */
export interface appNotification {
  id: number;
  url: string;
  status: boolean;
  sender: string;
  access: accessObject;
  entryType: string;
}

/**
 * type that represents an object with category
 * @category definitions
 * @typedef
 */
export type withCategory = object & { category: string | null; };

/**
 * type that represents a fetch function
 * @category definitions
 * @typedef
 */
export type fetcher = (((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>)) | undefined;

/**
 * type that represents an access object
 * @category definitions
 * @typedef
 */
export type accessObject = { read: boolean, append: boolean, write: boolean };

/**
 * enum that list vocabulary defined for this application
 * @category definitions
 * @enum
 */
export enum voc {
  Habit = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#Habit",
  //DatesList = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#DatesList",
  accessType = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#accessType",
  defaultFolder = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#defaultFolder",
  recurrence = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#recurrence",
  custom = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#custom",
  lastCheckInDate = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#lastCheckInDate",
  bestStreak = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#bestStreak",
  currentStreak = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#currentStreak",
  checkInDate = "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#checkInDate",
}

/**
 * enum that represents other vocabularies used
 * @category definitions
 * @enum
 */
export enum otherV {
  category = "http://dbpedia.org/ontology/category",
}
