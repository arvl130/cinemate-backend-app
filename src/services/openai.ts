import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)
const categoryTypes = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Film-Noir",
  "History",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
  "War",
  "Western",
  "Art-house",
  "Black-Comedy",
  "Chick-flick",
  "Cult-classic",
  "Dark-Comedy",
  "Epic",
  // "Erotic",
  "Experimental",
  "Fairy-tale",
  "Film-within-a-film",
  "Futuristic",
  "Gangster",
  "Heist",
  "Historical",
  "Holiday",
  "Indie",
  "Juvenile",
  "Melodrama",
  "Monster",
  "Political",
  "Psychological",
  "Road-movie",
  "Satire",
  "Science-Fiction",
  "Slapstick",
  "Social-issue",
  "Superhero",
  "Surreal",
  "Teen",
  "Vampire",
  "Zombie",
] as const

type CategoryType = (typeof categoryTypes)[number]

export async function getMovieRecommendationsByCategory(
  category: CategoryType
) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Give me 5 ${category} movie recommendations separated by ; formatted: title|year`,
    temperature: 0,
    max_tokens: 100,
  })

  if (response.data.choices[0].text === undefined) return []

  return response.data.choices[0].text
    ?.replace(/\n/g, "")
    .replace(/; /g, ";")
    .split(";")
}

export async function getRandomMovieRecommendations() {
  const randomCategory =
    categoryTypes[Math.floor(Math.random() * categoryTypes.length + 1)]
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Give me 5 ${randomCategory} movie recommendations separated by ; formatted: title|year`,
    temperature: 0,
    max_tokens: 100,
  })

  if (response.data.choices[0].text === undefined) return []

  return response.data.choices[0].text
    ?.replace(/\n/g, "")
    .replace(/; /g, ";")
    .split(";")
}
