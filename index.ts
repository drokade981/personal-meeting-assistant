import { ChatGroq } from "@langchain/groq";
import readline from "node:readline/promises";
import { createCalendarEvents, getCalendarEvents } from "./tools.js";
import { END, MessagesAnnotation, StateGraph, MemorySaver } from "@langchain/langgraph";
import type { AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt";

dotenv.config();

const checkpointer = new MemorySaver();

const tools:any = [createCalendarEvents, getCalendarEvents];

const model = new ChatGroq({
    model: 'openai/gpt-oss-120b',
    temperature: 0,
}).bindTools(tools);



async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);
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

const app = graph.compile({ checkpointer });

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    let config = { configurable : { thread_id: '1' } };
    while(true) {
        const userInput = await rl.question('You: ');
        if(userInput.toLowerCase() === 'exit') {
            console.log('Exiting...');
            break;
        }
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const currentDateTime = new Date().toLocaleString("sv-SE").replace(',', 'T');
        const result = await app.invoke(
            {
                messages: [
                    {
                        role: 'system', 
                        content: `You are a helpful assistant. 
                        current DateTime: ${currentDateTime}
                        current timezone: ${timezone}`,
                    },
                    { 
                        role: 'user', 
                        content: userInput,
                        // 'create a meeting with chetan(er.devendra.rokade@gmail.com) today at 9PM for ABDM' 
                    },
                ],
            }, config
        );
        console.log('Assistant', result.messages[result.messages.length -1]?.content);
    }
    rl.close();
}

main();