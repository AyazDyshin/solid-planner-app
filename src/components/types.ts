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
export type fetcher = (((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>)) | undefined;

export type accessObject = { read: boolean, append: boolean, write: boolean };
