import createSeasonResolver from "date-season";

let seasonNorth = createSeasonResolver();

export const SEASON_EMOJI =
  seasonNorth(new Date()) == "Spring"
    ? "spring-of-making"
    : seasonNorth(new Date()) == "Summer"
    ? "summer-of-making"
    : seasonNorth(new Date()) == "Winter"
    ? "wom"
    : "aom";
