import { tool } from "@langchain/core/tools";
import z from "zod";

export const createCalendarEvents = tool(
    async() => {
        // google calendar logic
        return 'the meeting has been created';
    },
    {
        name : 'create_calendar_events',
        description : 'Create a new calendar event',
        schema: z.object({
            // query: z.string().describe('The details of the event to create'),
        })
    }
)

export const getCalendarEvents = tool(
    async() => {
        // google calendar logic
        return JSON.stringify([
            {
                title: 'Meeting with John',
                description: 'This is a meeting with John',
                start: '2026-09-25T10:00:00',
                end: '2026-09-25T11:00:00',
                location: 'Gmeet'
            },
            {
                title: 'Meeting with Jane',
                description: 'This is a meeting with Jane',
                start: '2026-10-02T10:00:00',
                end: '2026-10-02T11:00:00',
                location: 'Gmeet'
            }
        ])
        
    },
    {
        name : 'get_calendar_events',
        description : 'Fetch existing calendar events',
        schema: z.object({
            // query: z.string().describe('The details of the event to create'),
        })
    }
)