import { tool } from "@langchain/core/tools";
import z from "zod";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
const calendar = google.calendar({version: 'v3', auth: oauth2Client});


export const createCalendarEvents = tool(
    async() => {
        // google calendar logic
        return 'the meeting has been created';
    },
    {
        name : 'create_calendar_events',
        description : 'Create a new calendar event',
        schema: z.object({
            query: z.string().describe('The details of the event to create'),
        })
    }
)

type Params = {
    q: string;
    timeMin?: string;
    timeMax?: string;
};

export const getCalendarEvents = tool(
    async(params) => {

        console.log(params);
        const { q, timeMin, timeMax } = params as Params;
        
        // google calendar logic
        try {   
            // google calendar logic
            const response = await calendar.events.list({
                calendarId: 'primary',
                q,                
                timeMin: (new Date()).toUTCString(),
                timeMax: timeMax,
                // showDeleted: false,
                // singleEvents: true,
                maxResults: 3,
                // orderBy: 'startTime',
            } as any);
            

            const result = response.data.items?.map((event) => {
                return {
                    id: event.id,
                    summary: event.summary,
                    description: event.description,
                    location: event.location,
                    start: event.start,
                    end: event.end,
                    attendees: event.attendees,
                    creator: event.creator,
                    organizer: event.organizer,
                    status: event.status,
                    meetingLink: event.hangoutLink,
                    eventType: event.eventType,
                };
            });
            console.log('response', result);
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        }
        return 'Failed to connect to Google Calendar.';
        
    },
    {
        name : 'get_calendar_events',
        description : 'Fetch existing calendar events',
        schema: z.object({
            q: z.string().describe('The query to be used to get events from google calendar. It can be one of these values: summary, description, location, attendees display name, attendees email, organiser\'s name, organiser\'s email'),
            timeMin: z.string().optional().describe('The minimum start time of the events to fetch in UTC format'),
            timeMax: z.string().optional().describe('The maximum end time of the events to fetch in UTC format'),
        })
    }
)