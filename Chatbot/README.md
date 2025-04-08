# Chatbot API (FastAPI)

This is the backend API for the portfolio chatbot built with FastAPI.

## Deployment on Vercel

### Prerequisites

1. Vercel account
2. GROQ API key

### Steps to Deploy

1. Log in to your Vercel account
2. Create a new project and select "Import Git Repository"
3. Point to this repository and specify the Chatbot directory
4. In the project settings, add the following environment variable:
   - `GROQ_API_KEY`: Your GROQ API key

5. Deploy the project
6. Note down the deployment URL (e.g., `https://portfolio-chatbot-api.vercel.app`)

### Connecting to Frontend

1. Update the `.env.production` file in the main project directory:
   ```
   NEXT_PUBLIC_CHATBOT_API_URL=https://your-deployed-api-url
   ```

2. Deploy the frontend Next.js app to Vercel

## Testing

1. Test the API directly:
   ```
   curl -X POST https://your-deployed-api-url/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   ```

2. Test from the frontend:
   ```
   npm run test-api
   ```

## Troubleshooting

- If you encounter CORS issues, check that the CORS middleware is properly configured
- Verify the API key is correctly set in the environment variables
- Ensure the Vercel deployment is completed successfully

## API Endpoints

- POST /chat - Send a message to the chatbot
- GET /chat/history/{conversation_id} - Get chat history for a conversation 