import { ChatGroq } from "@langchain/groq"
import { createCalendarEvents, getCalendarEvents } from "./tools.js";

const tools:any = [createCalendarEvents, getCalendarEvents];

const model = new ChatGroq({
    model: 'openai/gpt-oss-120b',
    temperature: 0,
}).bindTools(tools);