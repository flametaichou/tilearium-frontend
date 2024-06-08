export function removeFromArray<T>(list: T[], obj: T): T[] {
    const index = list.indexOf(obj);

    if (index > -1) {
        list.splice(index, 1);
    }

    return list;
}