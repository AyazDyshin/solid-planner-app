import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { Habit } from "./types";
import {
    isSameDay, isSameWeek, isSameMonth, isSameYear, differenceInCalendarDays, getDay, format,
    differenceInCalendarWeeks, differenceInCalendarMonths, differenceInCalendarYears
} from 'date-fns';

/**
* function that extracts main part from the user's webId
* @category Other helper functions
* @param   {string} webId webId of the user
* @return  {string} returns main part of the WebID
*/
export const modifyWebId = (webId: string): string => {
    const arr = webId.split("/");
    const updArr = [...arr.slice(0, 3)];
    return `${updArr.join("/")}/`;
}

/**
* gets the ID part of a given url
* @category Other helper functions
* @param   {string} url url to get ID from
* @return  {string} ID part of a url
*/
export const getIdPart = (url: string): string => {
    const arr = url.split("/");
    return arr[arr.length - 1];
}

/**
* Capitalizes first letter of a string
* @category Other helper functions
* @param   {string} string string to capitalize
* @return  {string} capitalized string
*/
export function capitalizeFirstLetter(string: string | null): string {
    if (string === null) {
        return 'Null';
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
* Transforms given day string to corresponding number
* @category Other helper functions
* @param   {string} day day to transform
* @return  {0 | 1 | 2 | 3 | 4 | 5 | 6 | null} number representation of a given date
*/
export const getNumberFromDay = (day: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 | null => {
    switch (day) {
        case "monday":
            return 0;
        case "tuesday":
            return 1;
        case "wednesday":
            return 2;
        case "thursday":
            return 3;
        case "friday":
            return 4;
        case "saturday":
            return 5;
        case "sunday":
            return 6;
        default:
            return null;
    }
}

/**
* Helper function for setting streaks for @see setStreaks function
* @category Other helper functions
* @param   {Habit} habit habit to set streaks for 
* @return  {Habit} habit with updated streaks
*/
const setStreaksDefaultCases = (habit: Habit): Habit => {
    let functionToUse;
    const today = new Date();
    switch (habit.recurrence) {
        case "daily": {
            functionToUse = differenceInCalendarDays;
        }
            break;
        case "weekly": {
            functionToUse = differenceInCalendarWeeks;
        }
            break;
        case "monthly": {
            functionToUse = differenceInCalendarMonths;
        }
            break;
        case "yearly": {
            functionToUse = differenceInCalendarYears;
        }
            break;
        default: {
            functionToUse = differenceInCalendarDays;
        }
    }
    if (!habit.lastCheckInDate) { // habit has current streak>0 but doesn't have last check in 
        habit.lastCheckInDate = today; // means wrong data recording, repair it
        habit.currentStreak = 1;
        habit = habitUpdBest(habit);
        if (!habit.checkInList) habit.checkInList = [today];
        else habit.checkInList.push(today);
        return habit;
    }
    else {
        if (functionToUse(today, habit.lastCheckInDate) > 1) {
            habit.prevLastCheckIn = habit.lastCheckInDate;
            habit.lastCheckInDate = today;
            habit.prevBestStreak = habit.bestStreak;
            habit = habitUpdBest(habit);
            habit.currentStreak = 0;
            if (!habit.checkInList) habit.checkInList = [today];
            else habit.checkInList.push(today);
            return habit;
        }
        else { //if (differenceInCalendarDays(today, habit.lastCheckInDate) <= 0)
            if (!isSameDay(today, habit.lastCheckInDate)) {
                habit.prevLastCheckIn = habit.lastCheckInDate;
                habit.lastCheckInDate = today;
                if (habit.currentStreak) {
                    habit.currentStreak = habit.currentStreak + 1;
                }
                habit.prevBestStreak = habit.bestStreak;
                habit = habitUpdBest(habit);
                if (!habit.checkInList) habit.checkInList = [today];
                else habit.checkInList.push(today);
                return habit;
            }
            else {
                return habit;
            }
        }
    }
}

/**
* Function that updates streaks for a given habit
* @category Other helper functions
* @param   {Habit} habit habit to set streaks for 
* @return  {Habit} habit with updated streaks
*/
export const setStreaks = (habit: Habit): Habit => {
    const today = new Date();
    if (habit.stat) {
        if (!habit.currentStreak || habit.currentStreak === 0) { // case for when habit is checked, but doesn't have current streak
            habit.currentStreak = 1;
            if (!habit.bestStreak || habit.bestStreak === 0) {
                habit.bestStreak = 1;
            }
            habit.lastCheckInDate = today;
            if (!habit.checkInList) habit.checkInList = [today];
            else habit.checkInList.push(today);
            return habit;
        }
        else { //case for when habit is checked but has current streak >0 
            switch (habit.recurrence) {
                case "daily":
                case "weekly":
                case "monthly":
                case "yearly":
                    {
                        return setStreaksDefaultCases(habit);
                    }
                case "custom": {
                    if (!habit.lastCheckInDate) { // habit has current streak>0 but doesn't have last check in 
                        habit.lastCheckInDate = today; // means wrong data recording, repair it
                        habit.currentStreak = 1;
                        habit = habitUpdBest(habit);
                        if (!habit.checkInList) habit.checkInList = [today];
                        else habit.checkInList.push(today);
                        return habit;
                    }
                    else {
                        if (typeof habit.custom === 'number') {
                            if (differenceInCalendarDays(today, habit.lastCheckInDate) === habit.custom - 1) {
                                habit.prevLastCheckIn = habit.lastCheckInDate;
                                habit.lastCheckInDate = today;
                                habit.currentStreak = habit.currentStreak + 1;
                                habit.prevBestStreak = habit.bestStreak;
                                habit = habitUpdBest(habit);
                                if (!habit.checkInList) habit.checkInList = [today];
                                else habit.checkInList.push(today);
                                return habit;
                            }
                            else if (isSameDay(today, habit.lastCheckInDate)) {
                                return habit;
                            }
                            else { //wrong data recorded shouldn't be set to true
                                habit.stat = false;
                                return habit;
                            }
                        }
                        else if (!habit.custom) {
                            habit.custom = null;
                            habit.recurrence = "daily";
                            return habit;
                        }
                        else {
                            if (checkWeekDay(habit)) {
                                if (isSameDay(today, habit.lastCheckInDate)) {
                                    return habit;
                                }
                                else {
                                    habit.prevLastCheckIn = habit.lastCheckInDate;
                                    habit.lastCheckInDate = today;
                                    habit.currentStreak = habit.currentStreak + 1;
                                    habit.prevBestStreak = habit.bestStreak;
                                    habit = habitUpdBest(habit);
                                    if (!habit.checkInList) habit.checkInList = [today];
                                    else habit.checkInList.push(today);
                                    return habit;
                                }
                            }
                            else { //wrong data recorded shouldn't be set to true
                                habit.stat = false;
                                return habit;
                            }
                        }
                    }
                }
                default: {
                    return habit;
                }
            }
        }
    }
    else {
        if (habit.lastCheckInDate && isSameDay(habit.lastCheckInDate, today)) {
            if (habit.checkInList) habit.checkInList = habit.checkInList.filter(date => date !== habit.lastCheckInDate);
            habit.lastCheckInDate = habit.prevLastCheckIn;
            habit.bestStreak = habit.prevBestStreak;
            habit.prevLastCheckIn = null;
            habit.prevBestStreak = null;
            if (habit.currentStreak) {
                if (habit.currentStreak <= 1) {
                    habit.currentStreak = 0;
                }
                else {
                    habit.currentStreak = habit.currentStreak - 1;
                }
            }

            return habit;
        }
        return habit;
    }
}

/**
* Function that returns true if a habit has a custom set to week days
* @category Other helper functions
* @param   {Habit} habit habit to check
* @return  {boolean | undefined} true if a given habit has custom set to week days, false or undefined otherwise
*/
const checkWeekDay = (habit: Habit): boolean | undefined => {
    const today = new Date();
    if (habit.custom && !(typeof habit.custom === 'number')) {
        const todayWeek = getDay(today);
        const updArr = habit.custom.map((weekDay) => {
            if (weekDay === todayWeek) return true;
        });
        if (updArr) {
            if (updArr.length !== 0) {
                return true;
            }
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

/**
* Helper function for setting streaks for @see setStreaks function, updates best streaks of a habits
* @category Other helper functions
* @param   {Habit} habit habit to update best streak for 
* @return  {Habit} habit with updated best streak
*/
const habitUpdBest = (habit: Habit): Habit => {
    if (habit.bestStreak && habit.currentStreak) {
        if (habit.currentStreak > habit.bestStreak) {
            habit.bestStreak = habit.currentStreak;
        }
    }
    else {
        habit.bestStreak = habit.currentStreak;
    }
    return habit;
}

/**
* function that check if two number arrays overlap
* @category Other helper functions
* @param   {Array} arr1 first array to check
* @param   {Array} arr2 second array to check
* @return  {boolean} true if arrays overlap, false otherwise 
*/
export const checkArrayOverlap = (arr1: number[], arr2: number[]): boolean => {
    if (arr1.sort().join(',') === arr2.sort().join(',')) {
        return true;
    }
    return false;
}

/**
* Filters given habits array to get habits to show today
* @category Other helper functions
* @param   {Array} allHab habit array to filter
* @return  {Array} habits array with habits to show today
*/
export const getHabitsToday = (allHab: Habit[]): Habit[] => {
    const allHabits = allHab;
    const today = new Date();
    const habitsToday = allHabits.filter((habit) => {
        let toCheckDate = habit.lastCheckInDate ? habit.lastCheckInDate : habit.startDate;
        if (!toCheckDate) {
            habit.startDate = new Date();
            toCheckDate = habit.startDate;
        }
        if (toCheckDate === null) {
            throw new Error("error: on of the habits doesn't have an assigned start date");
        }
        if (!habit.stat) {
            if (habit.currentStreak && habit.currentStreak !== 0) {
                if (habit.recurrence === "daily") {
                    if (differenceInCalendarDays(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
                else if (habit.recurrence === "weekly") {
                    if (differenceInCalendarWeeks(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
                else if (habit.recurrence === "monthly") {
                    if (differenceInCalendarMonths(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
                else if (habit.recurrence === "yearly") {
                    if (differenceInCalendarYears(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
            }

            if (habit.recurrence === "custom") {
                if (typeof habit.custom === 'number') {
                    if (differenceInCalendarDays(today, toCheckDate) > habit.custom) {
                        if (habit.currentStreak) {
                            habit = habitUpdBest(habit);
                            habit.currentStreak = 0;
                        }
                    }
                    if (isSameDay(toCheckDate, today) || (habit.lastCheckInDate) && differenceInCalendarDays(today, toCheckDate) === habit.custom) {
                        return true;
                    }
                }
                else if (habit.custom && typeof habit.custom !== 'number') {
                    const updCustom: number[] = habit.custom;
                    const todayWeek = getDay(today);
                    if (!isSameDay(today, toCheckDate)) {
                        if (differenceInCalendarDays(today, toCheckDate) > 7) {
                            habit = habitUpdBest(habit);
                            habit.currentStreak = 0;
                        }
                        else {
                            const arrOfDaysBetween = [];
                            const lastCheckInWeekDay = getDay(toCheckDate);
                            if (lastCheckInWeekDay - todayWeek > 0) {
                                for (let i = lastCheckInWeekDay + 1; i < todayWeek; i++) {
                                    arrOfDaysBetween.push(i);
                                }
                            }
                            else {
                                let incrementLastCheckIn = lastCheckInWeekDay + 1;
                                while (incrementLastCheckIn !== todayWeek) {
                                    if (incrementLastCheckIn === 7) incrementLastCheckIn = 0;
                                    arrOfDaysBetween.push(incrementLastCheckIn);
                                    incrementLastCheckIn++;
                                }
                            }
                            if (checkArrayOverlap(arrOfDaysBetween, habit.custom)) {
                                habit = habitUpdBest(habit);
                                habit.currentStreak = 0;
                            }
                        }
                    }
                    const updArr = updCustom.filter((weekDay) => {
                        if (weekDay === todayWeek) return true;
                    });
                    if (updArr) {
                        if (updArr.length !== 0) {
                            return true;
                        }
                    }
                }
                else {
                    habit.recurrence = "daily";
                }
            }
            else {
                return true;
            }
        }
        else {
            if (habit.currentStreak && habit.currentStreak !== 0) {
                if (habit.recurrence === "daily") {
                    if (differenceInCalendarDays(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
                else if (habit.recurrence === "weekly") {
                    if (differenceInCalendarWeeks(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
                else if (habit.recurrence === "monthly") {
                    if (differenceInCalendarMonths(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
                else if (habit.recurrence === "yearly") {
                    if (differenceInCalendarYears(toCheckDate, today) > 1) {
                        habit = habitUpdBest(habit);
                        habit.currentStreak = 0;
                    }
                }
            }
            switch (habit.recurrence) {
                case "daily": {

                    if (isSameDay(toCheckDate, today)) return true;

                    else {
                        habit.stat = false;
                        return true;
                    }
                }
                case "weekly": {
                    if (isSameWeek(toCheckDate, today)) return true;
                    else {
                        habit.stat = false;
                        return true;
                    }
                }
                case "monthly": {
                    if (isSameMonth(toCheckDate, today)) return true;
                    else {
                        habit.stat = false;
                        return true;
                    }
                }
                case "yearly": {
                    if (isSameYear(toCheckDate, today)) return true;
                    else {
                        habit.stat = false;
                        return true;
                    }
                }
                case "custom": {
                    if (typeof habit.custom === 'number') {
                        if (differenceInCalendarDays(today, toCheckDate) >= habit.custom) {
                            habit.stat = false;
                            return true;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        if (!isSameDay(toCheckDate, today)) {
                            const todayWeek = getDay(today);
                            const updArr = habit.custom?.filter((weekDay) => {
                                if (weekDay === todayWeek) {
                                    return true;
                                }
                            });
                            if (updArr) {
                                if (updArr.length !== 0) {
                                    habit.stat = false;
                                    return true;
                                }
                            }
                        }
                        else {
                            const todayWeek = getDay(today);
                            const updArr = habit.custom?.filter((weekDay) => {
                                if (weekDay === todayWeek) {
                                    return true;
                                }
                            });
                            if (updArr) {
                                if (updArr.length !== 0) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    return habitsToday;
}

/**
* construct a string from a given date in the following format: dd.mm.yyyy
* @category Other helper functions
* @param   {Date | null} date date to construct a string from
* @return  {string} date in a string format: dd.mm.yyyy
*/
export const constructDate = (date: Date | null): string => {
    if (!date) return "no date"
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return (`${day}.${month}.${year}`);
}

/**
* adds '/' to Url's end if it is missing
* @category Other helper functions
* @param   {string} url url to check 
* @return  {string} updated url
*/
export const updUrlForFolder = (url: string): string => {
    if (url.charAt(url.length - 1) !== '/') return url += '/'
    return url;
}

/**
* Extracts an array of unique categories from a given array of entries
* @category Other helper functions
* @param   {Array} arrOfEntries array of entries to extract categories from must have a category property
* @return  {Array} array of unique categories
*/
export const extractCategories = <T extends { category: string | null; }>(arrOfEntries: T[]) => {
    const arrayOfCategories: string[] = [];

    arrOfEntries.map((entry) => {
        const categoryOfCurrEntry = entry.category;
        if (categoryOfCurrEntry && !arrayOfCategories.includes(categoryOfCurrEntry)) arrayOfCategories.push(categoryOfCurrEntry);
    });
    return arrayOfCategories;
}

/**
* filters an array of entries to only return entries with a given category
* @category Other helper functions
* @param   {Array} arrOfEntries array of entries to filter entries must have category as a property
* @param   {string} categoryFilter a category to look for
* @return  {Array} an array of entries with a given category
*/
export const filterByCategory = <T extends { category: string | null; }>(arrOfEntries: T[], categoryFilter: string): T[] => {
    let ret: T[] = [];
    if (categoryFilter === 'without category') {
        ret = arrOfEntries.filter((entry) => entry.category === null);
    }
    else {
        ret = arrOfEntries.filter((entry) => entry.category === categoryFilter);
    }
    return ret;
}

/**
* filters an array of entries to only return entries with a given access right
* @category Other helper functions
* @param   {Array} arrOfEntries array of entries to filter entries must have category as a property
* @param   {string} accessFilter an access right to look for
* @return  {Array} an array of entries with a given access right
*/
export const filterByAccess = <T extends { category: string | null; access: Record<string, AccessModes> | null; shareList?: Record<string, AccessModes>; }>
    (arrOfEntries: T[],
        accessFilter: string): T[] => {
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

/**
* extracts check ins from habit into an array of objects with title, date and color to pass to calendar component
* @category Other helper functions
* @param   {Habits} habit habit to transform
* @return  {Array} returns an array objects each representing a given habit's check in
*/
export const checkInsToObj = (habit: Habit): { title: string; date: string; backgroundColor: string; }[] => {
    if (habit.checkInList) {
        const arrToRet: { title: string; date: string; backgroundColor: string; }[] = [];
        habit.checkInList.forEach((checkIn) => {
            const dateVal = format(checkIn, "yyyy-MM-dd");
            arrToRet.push({ title: `${habit.title}`, date: dateVal, backgroundColor: habit.color });
        });
        return arrToRet;
    }
    else {
        return [];
    }
}