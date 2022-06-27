import { getStringNoLocale, ThingPersisted } from "@inrupt/solid-client";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { entrypoint } from "rdf-namespaces/dist/hydra";
import { category } from "rdf-namespaces/dist/qu";
import { withCategory } from "../components/types";

//function that extracts main part from the user's webId
export const modifyWebId = (webId: string): string => {
    const arr = webId.split("/");
    const updArr = [...arr.slice(0, 3)];
    return `${updArr.join("/")}/`;
}


//  adds '/' to Url's end if it is missing
export const updUrlForFolder = (url: string) => {
    if (url.charAt(url.length - 1) !== '/') return url += '/'
    return url;
}

export const extractCategories = <T extends { category: string | null; }>(arrOfEntries: T[]) => {
    let arrayOfCategories: string[] = [];

    let categoryArr = arrOfEntries.map((entry) => {
        let categoryOfCurrEntry = entry.category;
        if (categoryOfCurrEntry && !arrayOfCategories.includes(categoryOfCurrEntry)) arrayOfCategories.push(categoryOfCurrEntry);
    });
    return arrayOfCategories;
}

export const filterByCategory = <T extends { category: string | null; }>(arrOfEntries: T[], categoryFilter: string) => {
    let ret = arrOfEntries.filter((entry) => entry.category === categoryFilter);
    return ret;
}

export const filterByAccess = <T extends { category: string | null; access: Record<string, AccessModes> | null; shareList?: Record<string, AccessModes>; }>
    (arrOfEntries: T[],
        accessFilter: string) => {
    console.log("heree");
    console.log(arrOfEntries);
    switch (accessFilter) {
        case "public":
            return arrOfEntries.filter((entry) => {
                return (entry.access) && (entry.access["public"])
            });
        case "private":
            return arrOfEntries.filter((entry) => {
                return (entry.access) && (entry.access["private"])
            })
        case "shared":
            return arrOfEntries.filter((entry) => {
                return (entry.shareList)
            });

        default:
            return [];
    }
}
