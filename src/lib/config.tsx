import dotenv from 'dotenv'
dotenv.config()

export const config = {
    useOllamaInference: false,
    useOllamaEmbeddings: false,
    searchProvider: 'brave', // 'serper', 'google' // 'serper' is the default
    inferenceModel: 'gpt-3.5-turbo', // Groq: 'mixtral-8x7b-32768', 'gemma-7b-it' // OpenAI: 'gpt-3.5-turbo', 'gpt-4' // Ollama 'mistral', 'llama3' etc
    inferenceAPIKey: process.env.OPENAI_API_KEY, // Groq: process.env.GROQ_API_KEY // OpenAI: process.env.OPENAI_API_KEY // Ollama: 'ollama' is the default
    embeddingsModel: 'text-embedding-3-large', // Ollama: 'llama2', 'nomic-embed-text' // OpenAI 'text-embedding-3-small', 'text-embedding-3-large'
    textChunkSize: 1000, // Recommended to decrease for Ollama
    textChunkOverlap: 400, // Recommended to decrease for Ollama
    numberOfSimilarityResults: 4, // Number of similarity results to return per page
    numberOfPagesToScan: 4, // Recommended to decrease for Ollama
    useFunctionCalling: true, // Set to true to enable function calling and conditional streaming UI (currently in beta)
    useRateLimiting: false, // Uses Upstash rate limiting to limit the number of requests per user
    useSemanticCache: false, // Uses Upstash semantic cache to store and retrieve data for faster response times
};