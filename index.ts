import { ChatGroq } from "@langchain/groq"
import { createCalendarEvents, getCalendarEvents } from "./tools.js";
import { END, MessagesAnnotation, StateGraph  } from "@langchain/langgraph";
import type { AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";

dotenv.config();



const tools:any = [createCalendarEvents, getCalendarEvents];

const model = new ChatGroq({
    model: 'openai/gpt-oss-120b',
    temperature: 0,
}).bindTools(tools);



async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);
    console.log(response);
    return { messages: [response ]};
}

/**
 * Tool Node
 */
const  toolNode = new ToolNode(tools);

/**
 * Conditional Edge
 */
function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) return 'tools';
    return '__end__';
}

/**
 * Build the graph
 */
const graph = new StateGraph(MessagesAnnotation)
    .addNode('assistant', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'assistant')
    .addEdge( 'tools', 'assistant')
    .addConditionalEdges('assistant', shouldContinue, {
        __end__: END,
        tools: 'tools'
    });

const app = graph.compile();

async function main() {
    const result = await app.invoke(
        {
            messages: [
                { role: 'user', content: 'get my all calendar events for september month' },
            ],
        },
    );
    console.log('Assistant', result.messages[result.messages.length -1]);
}

main();