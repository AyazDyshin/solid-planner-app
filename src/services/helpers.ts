import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { Habit } from "../components/types";
import {
    isSameDay, isSameWeek, isSameMonth, isSameYear, differenceInCalendarDays, getDay, format,
    differenceInCalendarWeeks, differenceInCalendarMonths, differenceInCalendarYears
} from 'date-fns';

//function that extracts main part from the user's webId
export const modifyWebId = (webId: string): string => {
    const arr = webId.split("/");
    const updArr = [...arr.slice(0, 3)];
    return `${updArr.join("/")}/`;
}

export const getIdPart = (url: string) => {
    const arr = url.split("/");
    return arr[arr.length - 1];
}

export function capitalizeFirstLetter(string: string | null) {
    if (string === null) {
        return 'Null';
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getNumberFromDay = (day: string) => {
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
    }
}
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

export const setStreaks = (habit: Habit) => {
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

const checkWeekDay = (habit: Habit) => {
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
const habitUpdBest = (habit: Habit) => {
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

export const checkArrayOverlap = (arr1: number[], arr2: number[]) => {
    if (arr1.sort().join(',') === arr2.sort().join(',')) {
        return true;
    }
    return false;
}

export const getHabitsToday = (allHab: Habit[]) => {
    const allHabits = allHab;
    const today = new Date();
    const habitsToday = allHabits.filter((habit) => {
        console.log("this is habit");
        console.log(habit);
        let toCheckDate = habit.lastCheckInDate ? habit.lastCheckInDate : habit.startDate;
        if (!toCheckDate) {
            habit.startDate = new Date();
            toCheckDate = habit.startDate;
        }
        if (toCheckDate === null) {
            throw new Error("error: on of the habits doesn't have an assigned start date");
        }
        console.log("this is toCheckDate");
        console.log(toCheckDate);
        if (!habit.stat) {
            console.log("here 0");
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
            console.log("here 1");
            if (habit.currentStreak && habit.currentStreak !== 0) {
                if (habit.recurrence === "daily") {
                    console.log("here 2");
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
                    console.log("here 3");

                    if (isSameDay(toCheckDate, today)) return true;

                    else {
                        console.log("here 4");
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

export const constructDate = (date: Date | null) => {
    if (!date) return "no date"
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return (`${day}.${month}.${year}`);
}
//  adds '/' to Url's end if it is missing
export const updUrlForFolder = (url: string) => {
    if (url.charAt(url.length - 1) !== '/') return url += '/'
    return url;
}

export const extractCategories = <T extends { category: string | null; }>(arrOfEntries: T[]) => {
    const arrayOfCategories: string[] = [];

    arrOfEntries.map((entry) => {
        const categoryOfCurrEntry = entry.category;
        if (categoryOfCurrEntry && !arrayOfCategories.includes(categoryOfCurrEntry)) arrayOfCategories.push(categoryOfCurrEntry);
    });
    return arrayOfCategories;
}

export const filterByCategory = <T extends { category: string | null; }>(arrOfEntries: T[], categoryFilter: string) => {
    let ret: T[] = [];
    if (categoryFilter === 'without category') {
        ret = arrOfEntries.filter((entry) => entry.category === null);
    }
    else {
        ret = arrOfEntries.filter((entry) => entry.category === categoryFilter);
    }
    return ret;
}

export const filterByAccess = <T extends { category: string | null; access: Record<string, AccessModes> | null; shareList?: Record<string, AccessModes>; }>
    (arrOfEntries: T[],
        accessFilter: string) => {
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