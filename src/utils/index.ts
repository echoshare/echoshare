import { LocationQueryValue } from "vue-router";

export function resolveQueryUID(
    queryUID: LocationQueryValue | LocationQueryValue[]
) {
    if (typeof queryUID === "string") {
        return queryUID;
    } else if (Array.isArray(queryUID)) {
        return String(queryUID[0]);
    } else {
        return String(queryUID);
    }
}
