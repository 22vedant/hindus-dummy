#! /bin/bash
# write a script to seed the local emulator database and storage bucket with initially testing values

echo "Hello, World!"

BASE_URL="http://localhost:3000/v1"
EMAILS=()
TOKENS=()
ID_TOKEN=""
CONTENT_IDS=()
FILE_PATH="$HOME/Downloads/users.drawio.png"

for i in {1..5}
do
    TIMESTAMP=$(date +%s%N)
    PHONE_NUMBER=$(printf "%010d" $((RANDOM % 10000000000)))
    EMAIL="user_${TIMESTAMP}_${i}@example.com"
    EMAILS+=("$EMAIL")
    echo "Creating user $i with email $EMAIL"

    curl "$BASE_URL/users/create" \
      --request POST \
      --header "Content-Type: application/json" \
      --data "{
        \"email\": \"$EMAIL\",
        \"emailVerified\": false,
        \"phoneNumber\": \"+91$PHONE_NUMBER\",
        \"displayName\": \"User $i\",
        \"password\": \"password\",
        \"role\": \"ADMIN\",
        \"subscribedTo\": [\"daily\", \"educational\"]
      }"

    echo "Created user $i"
    echo ""
done

RESPONSE=$(curl -sS "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key" \
  --request POST \
  --header "Content-Type: application/json" \
  --data "{
    \"email\": \"${EMAILS[0]}\",
    \"password\": \"password\",
    \"returnSecureToken\": true
  }")

# Extract idToken
ID_TOKEN=$(echo "$RESPONSE" | sed -n 's/.*"idToken":"\([^"]*\)".*/\1/p')

echo "Authorization Token (valid for 1 hr): $ID_TOKEN"
echo ""

# post /content/create
# C:/Users/Zing6/Downloads/users.drawio.png

API_RESPONSE=$(curl -sS "$BASE_URL/users/api-key-gen" \
    --request GET \
    --header "Authorization: Bearer ${ID_TOKEN}" \
)

API_KEY=$(echo "$API_RESPONSE" | sed -n 's/.*"apiKey":"\([^"]*\)".*/\1/p')

echo "API_KEY (required for almost all admin routes): $API_KEY"

for i in {1..5}
do
    echo "Creating content $i with email ${EMAILS[0]}"
      
    CONTENT_RESPONSE=$(curl -sS "$BASE_URL/content/create" \
      -H "Authorization: Bearer ${ID_TOKEN}" \
      -H "x-api-key: $API_KEY" \
      -F "file=@$FILE_PATH" \
      -F "title=Test Content $i" \
      -F "description=A description written for content $i" \
      -F "language=english" \
      -F "type=educational" \
      -F "hidden=false"
    )

    CONTENT_ID=$(echo "$CONTENT_RESPONSE" | sed -n 's/.*"contentId":"\([^"]*\)".*/\1/p')
    CONTENT_IDS+=("$CONTENT_ID")
    echo ""

done

for i in {1..10}
do
    curl "$BASE_URL/quiz/questions/create" \
    --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer $ID_TOKEN" \
    --header "x-api-key: $API_KEY"\
    --data "{
    \"title\": \"A Test Quiz $i\",
    \"description\": \"A test description for the quiz $i\",
    \"options\": {
        \"A\": \"Option 1\",
        \"B\": \"Option 2\",
        \"C\": \"Option 3\",
        \"D\": \"Option 4\"
    },
    \"correctOption\": \"C\",
    \"explanation\": \"Explain the answer here\",
    \"questionType\": \"educational\",
    \"quizType\": \"educational\"
    }"

    echo ""
done

echo ""

for i in {1..2}
do
    curl "$BASE_URL/quiz/create" \
    --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer $ID_TOKEN" \
    --header "x-api-key: $API_KEY"\
    --data "{
    \"contentId\": \"${CONTENT_IDS[0]}\",
    \"title\": \"A Test Quiz\",
    \"description\": \"A test description for the quiz\",
    \"language\": \"english\",
    \"passingScore\": 4,
    \"maxAttempts\": 5,
    \"quizType\": \"educational\",
    \"numberOfQuestions\": 5
    }"

    echo ""
done