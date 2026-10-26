/** Navigation projection; canonical candidate source: contracts/vila/vila-navigation.v0.2.0.json */
import navigation from "../../contracts/vila/vila-navigation.v0.2.0.json";
export const vilaNavigation = navigation;
export type VilaSection = "home"|"discover"|"stories"|"missions"|"notebook"|"games"|"coloring"|"emotions"|"adults";
export const vilaSections: ReadonlyArray<{ id: VilaSection; path: string; label: string; kind: string }> = navigation.routes as Array<{ id: VilaSection; path: string; label: string; kind: string }>;
export function getVilaSection(slug: string | undefined) {
 return vilaSections.find(item=>item.path==="/kids/"+slug) ?? null;
}
