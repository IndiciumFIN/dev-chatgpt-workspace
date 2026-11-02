import { REPORT, PROBE } from "./corpus-entry";

globalThis.__CORPUS__ = { ...REPORT, probe: PROBE };

export { REPORT, PROBE };