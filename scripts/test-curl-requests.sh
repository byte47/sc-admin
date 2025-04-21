#!/bin/bash

export BASE_URL="http://localhost:3000"

# Health check
echo "\nGET /api/health"
curl -s -X GET "$BASE_URL/api/health" | jq

# Access check
echo "\nPOST /api/access"
curl -s -X POST "$BASE_URL/api/access" \
  -H "Content-Type: application/json" \
  -d '{"name": "example"}' | jq

# Bulk messages
echo "\nPOST /api/messages"
curl -s -X POST "$BASE_URL/api/messages" \
  -H "Content-Type: application/json" \
  -d '{"name": "example", "messages": ["hello", "world"]}' | jq

# Log a request
echo "\nPOST /api/requests"
curl -s -X POST "$BASE_URL/api/requests" \
  -H "Content-Type: application/json" \
  -d '{"test": "request log"}' | jq

# Access history
echo "\nGET /api/access-history"
curl -s -X GET "$BASE_URL/api/access-history?limit=5" | jq

# Verification queue
echo "\nGET /api/verification-queue"
curl -s -X GET "$BASE_URL/api/verification-queue" | jq

# Add to allowed list
echo "\nPOST /api/lists/allowed"
curl -s -X POST "$BASE_URL/api/lists/allowed" \
  -H "Content-Type: application/json" \
  -d '{"value": "allowedName", "type": "name"}' | jq

# Remove from allowed list (id=1)
echo "\nPOST /api/lists/allowed/remove?id=1"
curl -s -X POST "$BASE_URL/api/lists/allowed/remove?id=1" | jq

# Remove from allowed-names list (id=1)
echo "\nPOST /api/lists/allowed-names/remove?id=1"
curl -s -X POST "$BASE_URL/api/lists/allowed-names/remove?id=1" | jq

# Remove from allowed-slugs list (id=1)
echo "\nPOST /api/lists/allowed-slugs/remove?id=1"
curl -s -X POST "$BASE_URL/api/lists/allowed-slugs/remove?id=1" | jq

# Add to blocked list
echo "\nPOST /api/lists/blocked"
curl -s -X POST "$BASE_URL/api/lists/blocked" \
  -H "Content-Type: application/json" \
  -d '{"value": "blockedName", "type": "name"}' | jq

# Remove from blocked list (id=1)
echo "\nPOST /api/lists/blocked/remove?id=1"
curl -s -X POST "$BASE_URL/api/lists/blocked/remove?id=1" | jq

# Remove from blocked-names list (id=1)
echo "\nPOST /api/lists/blocked-names/remove?id=1"
curl -s -X POST "$BASE_URL/api/lists/blocked-names/remove?id=1" | jq

# Remove from blocked-slugs list (id=1)
echo "\nPOST /api/lists/blocked-slugs/remove?id=1"
curl -s -X POST "$BASE_URL/api/lists/blocked-slugs/remove?id=1" | jq

# Bulk import
echo "\nPOST /api/admin/import"
curl -s -X POST "$BASE_URL/api/admin/import" \
  -H "Content-Type: application/json" \
  -d '{"items": ["item1", "item2"], "type": "blocked-names", "deduplicateEnabled": true, "validateEnabled": true}' | jq

# Admin requests logs
echo "\nGET /api/admin/requests-logs"
curl -s -X GET "$BASE_URL/api/admin/requests-logs" | jq

# Admin DB info
echo "\nGET /api/admin/db/info"
curl -s -X GET "$BASE_URL/api/admin/db/info" | jq

# Chat extraction (MacroDroid screencontent)
echo "\nPOST /api/chat"
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "screencontent": "[in.mohalla.sharechat:id/tv_user_name]: Hima\n[in.mohalla.sharechat:id/tv_message]: Hi.\n[in.mohalla.sharechat:id/tv_message$2]: Hello\n[in.mohalla.sharechat:id/tv_message_time]:  3:16 PM\n[in.mohalla.sharechat:id/tv_message_time$2]:  3:17 PM\n"
  }' | jq
