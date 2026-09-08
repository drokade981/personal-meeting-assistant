import { tool } from "@langchain/core/tools";
import z from "zod";
import { google } from "googleapis";
import dotenv from "dotenv";
import { ca } from "zod/locales";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN as string,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN as string,
});
const calendar = google.calendar({version: 'v3', auth: oauth2Client});

// type EventData = {    
//     summary: string;
//     start: {
//         dateTime: string;
//         timeZone: string;
//     };
//     end: {
//         dateTime: string;
//         timeZone: string;
//     };
//     attendees: attendees[];
// };
type EventData = z.infer<typeof createEventSchema>;
type attendees= [
        email: string,
        displayName: string
];
const createEventSchema = z.object({
    summary: z.string().describe('The title of the event'),
    start: z.object({
        dateTime: z.string().describe('The date time of start of the event.'),
        timeZone: z.string().describe('Current IANA timezone string.'),
    }),
    end: z.object({
        dateTime: z.string().describe('The date time of end of the event.'),
        timeZone: z.string().describe('Current IANA timezone string.'),
    }),
    attendees: z.array(
        z.object({
            email: z.string().describe('The email of the attendee'),
            displayName: z.string().describe('Then name of the attendee.'),
        })
    ),
});

export const createCalendarEvents = tool(
    async(eventData) => {
        const {summary, start, end, attendees} = eventData as EventData;
        // google calendar logic
        const response = await calendar.events.insert({
            calendarId: 'primary',
            conferenceDataVersion: 1,
            requestBody: {
                summary,
                start,
                end,
                attendees,
                conferenceData: {
                    createRequest: {
                        requestId: `meet-${Date.now()}`,
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet',
                        },
                    },
                },
            }
        });
        if (response.status === 200) {
            return 'Event created successfully!';
        }
        return `Failed to create event`;
    },
    {
        name : 'create_calendar_events',
        description : 'Create a new calendar event',
        schema: createEventSchema,
            
    });
    


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