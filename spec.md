# Access Monitor App Specification

## Overview

A NextJS web application using shadcn/ui for the frontend and SQlite for the database. The app monitors access requests coming from a third-party app via POST API calls (containing the user's name). It evaluates the request against business logic—using hardcoded blacklists, dynamic blocked/allowed lists for both names and slugs, and a slug conversion process—and logs the access history. An admin dashboard provides verification queue management and allows modifications to the allowed and blocked lists. The app also supports receiving and storing messages from users.

## Functional Requirements

### API Endpoints

- **Endpoint:** `/api/access`

  - **Method:** POST
  - **Payload:** JSON object with a key `name`
  - **Response:**
    - Returns either `"allow"` or `"block"`
    - Includes reasoning for blocks if applicable
  - **Monitoring:**
    - All requests are logged to a dedicated access log file

- **Endpoint:** `/api/messages`
  - **Method:** POST
  - **Payload:** JSON object with keys `name` and `messages` (array of strings)
  - **Response:**
    - Success: Returns JSON with `success: true` and `count` of processed messages
    - Failure: Returns error details and appropriate status code
  - **Monitoring:**
    - All requests are logged to a dedicated messages log file

### API Logic

1. **Blacklist Check:**
   - Check if the supplied `name` contains any hardcoded blacklisted word(s) (case insensitive).
2. **Name Blocked List Check:**
   - Verify if the `name` exists in the blocked names list (case insensitive).
3. **Slug Conversion & Blocked List Check:**
   - Convert the `name` to a slug by trimming, converting to lowercase, and removing all special characters and spaces without adding hyphens.
   - Check if the generated slug is in the blocked slugs list (case insensitive).
4. **Name Allowed List Check:**
   - If the name is not explicitly blocked, check if it is in the allowed names list (case insensitive).
5. **Slug Allowed List Check:**
   - If the slug is not explicitly blocked, check if it is in the allowed slugs list (case insensitive).
6. **Queue for Verification:**
   - If no explicit allow/block decision can be made, respond with `"allow"` by default and add the name (and slug) to a verification queue.
7. **Message Handling:**
   - Messages are stored with the user's name, slug, content, and timestamp.
   - No access checking is performed for messages.
   - Multiple messages can be submitted in a single request.

### Data Persistence

- **Database:** SQlite
- **Tables:**

  1. **access_history**
     - `id` (primary key, auto-increment)
     - `name` (text)
     - `slug` (text)
     - `access_time` (timestamp)
     - `result` (text; either "allow" or "block")
     - `reason` (text; description of block reason if applicable)
  2. **blocked_names**
     - `id` (primary key)
     - `value` (text; user name that is blocked)
  3. **blocked_slugs**
     - `id` (primary key)
     - `value` (text; user slug that is blocked)
  4. **allowed_names**
     - `id` (primary key)
     - `value` (text; user name that is allowed)
  5. **allowed_slugs**
     - `id` (primary key)
     - `value` (text; user slug that is allowed)
  6. **verification_queue**
     - `id` (primary key)
     - `name` (text)
     - `slug` (text)
     - `queued_at` (timestamp)
     - `status` (enum; e.g., pending, reviewed)
  7. **messages**
     - `id` (primary key, auto-increment)
     - `name` (text)
     - `slug` (text)
     - `content` (text)
     - `created_at` (timestamp)

- **Log Files:**
  1. **access.log**
     - JSON records of each access API request
     - Includes timestamp, method, URL, IP address, and request body
  2. **messages.log**
     - JSON records of each messages API request
     - Includes timestamp, method, URL, IP address, and request body

### Home Page

- **Features:**
  1. **Access Checker:**
     - Form to test if a name would be allowed or blocked based on current rules.
  2. **Message Sender:**
     - Form to send test messages to the system.
     - Includes fields for name and message content.

### Admin Dashboard

- **Views:**
  1. **Verification Queue:**
     - Display all pending verification items with columns for name, slug, and timestamp.
     - Provide options to add the name to the blocked names list, the slug to the blocked slugs list, the name to the allowed names list, or the slug to the allowed slugs list.
     - Allow admins to edit the slug before adding it to a list if needed.
  2. **List Management:**
     - Separate tabs for blocked and allowed lists.
     - Each tab shows both name and slug lists separately.
     - Forms for adding new entries to any of the four lists.
     - Options to remove entries from any list.
  3. **Messages:**
     - Display all messages in a table, sorted by most recent first.
     - Shows user name, slug, message content, and timestamp.
     - Accessible from the admin navigation menu.
  4. **API Logs:**
     - Interface to view API request logs for both endpoints.
     - Configurable to show the last N log entries.
     - Separate tabs for access and messages logs.
     - Displays timestamp, HTTP method, IP address, and full request body.
- **Interactions:**
  - Ability to mark items in the verification queue as reviewed, and directly add the name/slug (or its variation) to either list as needed.
  - Functionality to see a preview of how a name will be converted to a slug when adding to name lists.

## Non-Functional Requirements

- **Performance:** Ensure the API and UI are responsive even as the access history grows.
- **Code Quality:** Maintain a modular structure to facilitate future enhancements and testing.
- **UI/UX:** Leverage shadcn/ui for a consistent and modern look, especially on the admin dashboard.
- **Case Sensitivity:** All comparisons (blacklist, blocked lists, allowed lists) are case insensitive.
- **Monitoring:** Log all API requests for auditing and debugging purposes.

## Development Notes

- **Slug Generation:** Convert names to slugs by removing all special characters and spaces, and making everything lowercase, without adding hyphens.
- **Testing:** Include unit tests for the access API endpoint and utility functions (e.g., slug conversion, list checks).
- **Deployment:** Ensure the SQlite file is correctly handled in production (e.g., using a persistent volume or backing up data).
- **Logs Directory:** The application creates a `logs` directory at the root level to store all API request logs.
