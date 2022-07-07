import { getStringNoLocale, ThingPersisted } from "@inrupt/solid-client";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { Habit, returnCheckIn, withCategory } from "../components/types";
import {
    isSameDay, isSameWeek, isSameMonth, isSameYear, differenceInCalendarDays, getDay,
    differenceInCalendarWeeks, differenceInCalendarMonths, differenceInCalendarYears, differenceInWeeks, differenceInMonths
} from 'date-fns';
import React from "react";

//function that extracts main part from the user's webId
export const modifyWebId = (webId: string): string => {
    const arr = webId.split("/");
    const updArr = [...arr.slice(0, 3)];
    return `${updArr.join("/")}/`;
}

export const getIdPart = (url: string) => {
    let arr = url.split("/");
    return arr[arr.length - 1];
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
const setStreaksDefaultCases = (habit: Habit): [Habit, returnCheckIn] => {
    let functionToUse;
    let today = new Date();
    let toReturn: returnCheckIn = 0;
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
        toReturn = { action: "add", url: habit.url, date: today };
        habit.currentStreak = 1;
        habit = habitUpdBest(habit);
        return [habit, toReturn];
    }
    else {
        if (functionToUse(today, habit.lastCheckInDate) > 0) {
            habit.prevLastCheckIn = habit.lastCheckInDate;
            habit.lastCheckInDate = today;
            toReturn = { action: "add", url: habit.url, date: today };
            habit.prevBestStreak = habit.bestStreak;
            habit = habitUpdBest(habit);
            habit.currentStreak = 0;
            return [habit, toReturn];
        }
        else { //if (differenceInCalendarDays(today, habit.lastCheckInDate) <= 0)
            if (!isSameDay(today, habit.lastCheckInDate)) {
                habit.prevLastCheckIn = habit.lastCheckInDate;
                habit.lastCheckInDate = today;
                toReturn = { action: "add", url: habit.url, date: today };
                habit.currentStreak = habit.currentStreak! + 1;
                habit.prevBestStreak = habit.bestStreak;
                habit = habitUpdBest(habit);
                return [habit, toReturn];
            }
            else {
                return [habit, 0];
            }
        }
    }
}

export const setStreaks = (habit: Habit): [Habit, returnCheckIn] => {
    let today = new Date();
    let toReturn: returnCheckIn = 0;
    if (habit.stat) {
        if (!habit.currentStreak || habit.currentStreak === 0) { // case for when habit is checked, but doesn't have current streak
            habit.currentStreak = 1;
            if (!habit.bestStreak || habit.bestStreak === 0) {
                habit.bestStreak = 1;
            }
            habit.lastCheckInDate = today;
            toReturn = { action: "add", url: habit.url, date: today };
            return [habit, toReturn];
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
                        toReturn = { action: "add", url: habit.url, date: today };
                        habit.currentStreak = 1;
                        habit = habitUpdBest(habit);
                        return [habit, toReturn];
                    }
                    else {
                        if (typeof habit.custom === 'number') {
                            if (differenceInCalendarDays(today, habit.lastCheckInDate) === habit.custom - 1) {
                                habit.prevLastCheckIn = habit.lastCheckInDate;
                                habit.lastCheckInDate = today;
                                toReturn = { action: "add", url: habit.url, date: today };
                                let b = { action: "add", url: habit.url, date: today };
                                habit.currentStreak = habit.currentStreak + 1;
                                habit.prevBestStreak = habit.bestStreak;
                                habit = habitUpdBest(habit);
                                return [habit, toReturn];
                            }
                            else if (isSameDay(today, habit.lastCheckInDate)) {
                                return [habit, 0];
                            }
                            else { //wrong data recorded shouldn't be set to true
                                habit.stat = false;
                                return [habit, 0];
                            }
                        }
                        else if (!habit.custom) {
                            habit.custom = null;
                            habit.recurrence = "daily";
                        }
                        else {
                            if (checkWeekDay(habit)) {
                                if (isSameDay(today, habit.lastCheckInDate)) {
                                    return [habit, 0];
                                }
                                else {
                                    habit.prevLastCheckIn = habit.lastCheckInDate;
                                    habit.lastCheckInDate = today;
                                    toReturn = { action: "add", url: habit.url, date: today };
                                    habit.currentStreak = habit.currentStreak + 1;
                                    habit.prevBestStreak = habit.bestStreak;
                                    habit = habitUpdBest(habit);
                                    return [habit, toReturn];
                                }
                            }
                            else { //wrong data recorded shouldn't be set to true
                                habit.stat = false;
                                return [habit, 0];
                            }
                        }
                    }
                }
                default: {
                    return [habit, 0];
                }
            }
        }
    }
    else {
        if (habit.lastCheckInDate && isSameDay(habit.lastCheckInDate, today)) {
            toReturn = { action: "delete", url: habit.url, date: habit.lastCheckInDate };
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
            return [habit, toReturn];
        }
        return [habit, 0];
    }
}

const checkWeekDay = (habit: Habit) => {
    let today = new Date();
    if (habit.custom && !(typeof habit.custom === 'number')) {
        let todayWeek = getDay(today);
        let updArr = habit.custom.map((weekDay) => {
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
    let allHabits = allHab;
    let today = new Date();
    let habitsToday = allHabits.filter((habit) => {
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
                    let updCustom: number[] = habit.custom;
                    let todayWeek = getDay(today);
                    if (!isSameDay(today, toCheckDate)) {
                        if (differenceInCalendarDays(today, toCheckDate) > 7) {
                            habit = habitUpdBest(habit);
                            habit.currentStreak = 0;
                        }
                        else {
                            let arrOfDaysBetween = [];
                            let lastCheckInWeekDay = getDay(toCheckDate);
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
                    let updArr = updCustom.filter((weekDay) => {
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
            if (!toCheckDate) {
                throw new Error("habit doesn't have a start date");
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
                            let todayWeek = getDay(today);
                            let updArr = habit.custom?.filter((weekDay) => {
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
                            let todayWeek = getDay(today);
                            let updArr = habit.custom?.filter((weekDay) => {
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
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return (`${day}.${month}.${year}`);
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
