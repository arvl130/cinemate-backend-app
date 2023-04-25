import TMDB from "tmdb-ts"

const { TMDB_ACCESS_TOKEN } = process.env
if (typeof TMDB_ACCESS_TOKEN !== "string")
  throw new Error("Invalid TMDB access token")

export const tmdb = new TMDB(TMDB_ACCESS_TOKEN)
