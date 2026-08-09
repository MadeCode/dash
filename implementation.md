
# Mini Desk Dashboard: Approach & Implementation Plan

## 1. Project Overview

The "Mini Desk Dashboard" is a lightweight, mobile-first web application designed to run in landscape mode on a repurposed smartphone. It acts as a dedicated, distraction-free productivity screen sitting alongside a primary workstation.

### Core Philosophies

-   **Minimalist Aesthetic:** Light theme, subtle off-white backgrounds (`stone-50`), highly readable sans-serif typography (Inter), and thin monochromatic icons (Lucide).
    
-   **Glanceability:** Zero cognitive overload. Information is presented in a strict visual hierarchy.
    
-   **Frictionless Interaction:** Tasks disappear upon completion; the calendar automatically scrolls to the active time block.
    

## 2. Current Prototype State (The Artifact)

The visual and behavioral prototype is complete using Vanilla HTML, JavaScript, and Tailwind CSS (via CDN).

### 2.1 Layout Architecture

-   **Split View:** A precise 55% (Left) / 45% (Right) grid layout tailored for landscape mobile viewports.
    
-   **Left Column:** Dedicated entirely to a vertical list of tasks ("Today's Focus"). Features a hidden scrollbar to maintain a clean aesthetic while supporting overflow.
    
-   **Right Column:** A vertically stacked dashboard featuring:
    
    -   **Top:** Real-time clock and date, paired directly across with current weather and rain probability.
        
    -   **Bottom:** A chronological list of the day's calendar events.
        

### 2.2 Built-In Behaviors & Logic

-   **Task Completion:** Checking a task triggers a 300ms CSS transition (fade out and slide right) before removing the element from the DOM.
    
-   **Live Clock:** JavaScript `setInterval` updates the hours and minutes dynamically.
    
-   **Smart Calendar Auto-Scroll:**
    
    -   Parses event start/end times.
        
    -   Compares events against the current system time to categorize them as `past` (faded, struck through), `current` (highlighted in emerald, pulsing indicator), or `future`.
        
    -   Utilizes `scrollIntoView({ behavior: 'smooth', block: 'center' })` to automatically snap the currently active meeting to the middle of the calendar pane on load.
        
-   **Immersive Mode:** A bottom-right toggle leverages the browser's Fullscreen API to hide mobile browser UI (URL bars, navigation footers).
    

## 3. Implementation Plan (Production via Vercel)

As you transition this prototype into a production-ready application (using your "Antigravity" stack/framework), the next phase involves replacing mock data with live API integrations.

### 3.1 Authentication & Google Cloud Setup

To integrate Google Tasks and Calendar, you must configure OAuth 2.0:

1.  **Google Cloud Console:** Create a new project.
    
2.  **Enable APIs:** Enable `Google Calendar API` and `Google Tasks API`.
    
3.  **OAuth Consent Screen:** Configure as an external app (or internal if tied to a Google Workspace).
    
4.  **Credentials:** Generate a Web Application Client ID and Secret. Add your local and Vercel domain to the "Authorized JavaScript origins" and "Authorized redirect URIs".
    
5.  **Required Scopes:**
    
    -   `https://www.googleapis.com/auth/calendar.readonly`
        
    -   `https://www.googleapis.com/auth/tasks`
        

### 3.2 Data Integration Strategy

#### A. Google Tasks Integration

-   **Fetching:** Query the Google Tasks API (`GET /tasks/v1/lists/{tasklist}/tasks`). Filter out completed tasks so only pending items populate the left column.
    
-   **Mutations (Completing a task):**
    
    -   Implement an **Optimistic UI Update**: When the user taps a task, immediately trigger the CSS fade/remove animation so the UI feels instantly responsive.
        
    -   In the background, send a `PATCH` or `PUT` request to the Google Tasks API to mark the task as `status: 'completed'`.
        

#### B. Google Calendar Integration

-   **Fetching:** Query the Google Calendar API (`GET /calendar/v3/calendars/primary/events`).
    
-   **Parameters:** Set `timeMin` to midnight today and `timeMax` to midnight tomorrow to strictly isolate today's schedule. Set `singleEvents: true` and `orderBy: 'startTime'`.
    
-   **Data Mapping:** Map the Google event payload (specifically `start.dateTime` and `end.dateTime`) into the format expected by the prototype's auto-scroll and highlight logic.
    

#### C. Weather API Integration

-   **Service:** Use a free tier API like OpenWeatherMap or WeatherAPI.
    
-   **Endpoint:** Fetch current weather based on your fixed coordinates or a configured city string.
    
-   **Data Points:** Extract `temp_c` (or `temp_f`) and `precip` (or `pop` - probability of precipitation). Map the API's weather condition codes (e.g., cloudy, sunny, rainy) to the corresponding Lucide icons (`cloud-sun`, `cloud-rain`, `sun`, etc.).
    

### 3.3 State Management & Polling

Because this dashboard will sit open on a desk for hours:

-   **Refresh Cycles:** You cannot rely on page reloads. Implement silent background polling (e.g., every 5 minutes for tasks/calendar, every 15 minutes for weather) to keep the data fresh without disrupting the UI.
    
-   **Auto-Scroll Reset:** Ensure that when the calendar data polls and updates, it re-evaluates the "current" time block and gently scrolls to the new active meeting if the hour has changed.
    

### 3.4 Deployment Prep (Vercel)

-   Setup environment variables in Vercel for your `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `WEATHER_API_KEY`.
    
-   Ensure your framework's auth solution (like NextAuth.js if you are using Next.js) is configured to handle token rotation, as Google access tokens expire after 1 hour.