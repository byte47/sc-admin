# Access Monitor App.

NextJS App with shadcn/ui, use SQlite for the database.

The web app monitors access to a third-party App. the third-party app will make API call (POST request with name of the user in body). This app will return 'allow'/'block' based on the logic.

API Logic: check if the name contains any blacklisted word(hardcoded the blacklist), or if the name is part of blocked list, else, convert name to slug by trimming down the name and removing any spaces or special characters, then check if the slug is in the blocked list. Else, check if the user or slug is part of allow list. if the name is not either blocked or allowed explicitly, respond with 'allow' and add that part of a queue for verification.

- store access history in db, including the time of access, allowed/blocked, and reason for block

The web app let the admin user to view the verification queue and add the name or slug to blocklist or allowlist ad needed.
