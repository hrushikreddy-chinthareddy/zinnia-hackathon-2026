import { Policy } from "@deps/models/policy/sor-policy";

import { mockPolicy } from "./sor-policy";
import { mockPolicy as mockIulPolicy } from "./sor-policy-iul";

export const getMockPolicy = (isIul = false): Policy => {
    if (isIul) {
        return mockIulPolicy;
    }

    return mockPolicy;
}
