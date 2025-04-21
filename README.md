# Access Monitor App

A NextJS application for monitoring access requests, managing blocked and allowed lists, and providing an admin dashboard for oversight.

## Features

### Access Control

- Monitors access requests coming from third-party app via POST API
- Evaluates requests against business logic
- Logs access history
- Manages blocked and allowed lists for both names and slugs

### Admin Dashboard

- Verification queue management
- List management (blocked/allowed names and slugs)
- Access history viewing
- Database maintenance

## Bulk Import Feature

The Access Monitor App includes a comprehensive bulk import feature for adding multiple items to the access control lists at once.

### Usage

1. Navigate to the Admin Dashboard > Lists
2. Select the "Bulk Import" tab
3. Choose the target list (blocked names, blocked slugs, allowed names, or allowed slugs)
4. Enter items or upload a CSV file
5. Configure import options
6. Click "Import Items"

### Import Methods

#### Text Entry

- Enter items one per line in the text field
- Each line will be processed as a separate item
- Empty lines are automatically ignored

#### CSV Upload

- Upload a CSV file containing the values to import
- If the CSV has headers, the second column will be used (value column)
- For standardized exports (with "list" column), items matching the selected list type will be imported
- CSV preview shows the first 10 lines of the file

### Import Options

#### Skip Duplicates

When enabled, items already in the list will be skipped during import.

#### Validate Items

When enabled, items are validated before import:

- Minimum length (2 characters)
- Maximum length (100 characters)
- For names: valid characters that will generate a non-empty slug

### Results

After import, a detailed summary is displayed:

- Total items processed
- Number of successful imports
- Number of skipped items (duplicates)
- Number of invalid items
- Number of failures
- List of failed items with reasons

### Batch Export

To export all lists at once:

1. Navigate to Admin Dashboard > Lists
2. Click "Export All Lists" button
3. A CSV file will be downloaded containing all lists with their respective types

### Individual List Export

To export a specific list:

1. Navigate to Admin Dashboard > Lists
2. Select the list tab (blocked names, blocked slugs, etc.)
3. Click "Export CSV" button next to the list
4. A CSV file will be downloaded containing the selected list

## API Endpoints

### Access Check

- `POST /api/access` - Check if a name is allowed or blocked
  - Request: `{ "name": "example" }`
  - Response: `{ "result": "allow" | "block", "reason": "..." }`

### Bulk Import

- `POST /api/admin/import` - Import multiple items to a list
  - Request:
    ```json
    {
      "items": ["item1", "item2", "..."],
      "type": "blocked-names" | "blocked-slugs" | "allowed-names" | "allowed-slugs",
      "deduplicateEnabled": true,
      "validateEnabled": true
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Successfully processed X out of Y items",
      "results": {
        "total": 10,
        "processed": 8,
        "skipped": 1,
        "invalid": 1,
        "duplicates": 1,
        "failures": 0,
        "failedItems": [{ "value": "item3", "reason": "Value too short" }]
      }
    }
    ```

## CSV File Format

### Standard Format

```
id,value
1,example1
2,example2
```

### Extended Format (with list type)

```
list,id,value
blocked-names,1,example1
blocked-slugs,2,example2
allowed-names,3,example3
allowed-slugs,4,example4
```

## Development

### Installation

```
pnpm install
```

### Running the development server

```
pnpm dev
```

### Building for production

```
pnpm build
```

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/app/api` - API endpoints
- `/src/components` - Reusable UI components
- `/src/lib` - Core business logic and utilities
- `/data` - Postgres database storage

## Testing

Run the tests:

```bash
npm test
```

## License

MIT

## Database Migrations

This project uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) for managing PostgreSQL schema migrations.

### Running Migrations

- To apply all pending migrations:
  ```sh
  pnpm migrate
  ```
- To apply only the next migration:
  ```sh
  pnpm migrate:up
  ```
- To revert the last migration:
  ```sh
  pnpm migrate:down
  ```

### Creating a New Migration

To create a new migration file:

```sh
npx node-pg-migrate create <migration-name> --migrations-dir migrations
```

Edit the generated file in the `migrations/` directory to define your schema changes.

### Configuration

- The database connection string is read from the `DB_URL` variable in your `.env.local` file.
- All migration files are stored in the `migrations/` directory.

### Notes

- The old schema initialization script (`src/scripts/migrate-db.ts`) is now deprecated. Use the migration system for all schema changes.
- For more details, see the [node-pg-migrate documentation](https://github.com/salsita/node-pg-migrate).
