# Frontend-Backend API Integration Guide

## Overview
Your React frontend is now fully integrated with the Flask backend API. This guide explains how to set it up and use it.

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:

```env
VITE_API_URL=http://localhost:5000
```

**For different environments:**
- **Development**: `http://localhost:5000`
- **Production**: `https://your-production-domain.com`

### 2. Install Dependencies

Make sure you have axios installed (it's required for API calls):

```bash
npm install axios
```

### 3. Start Backend & Frontend

**Terminal 1 - Backend:**
```bash
python app.py
# or with gunicorn
gunicorn app:app
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Architecture

### API Service Layer
Located in `src/services/api.ts`, this provides:

- **resolveIssue()** - Generate responses for issues (POST `/api/resolve`)
- **sendChatMessage()** - Send chat messages (POST `/api/chat`)
- **getChatWelcome()** - Get welcome message (POST `/api/chat`)
- **searchSolution()** - Search for solutions (POST `/search`)
- **checkApiHealth()** - Check API availability (GET `/`)

### Custom Hooks

#### useResolve()
For resolving issues with API:

```typescript
const { resolve, loading, error, result, reset } = useResolve();

// Call resolve
await resolve({
  name: 'محمد',
  user_type: 'umrah',
  issue: 'مشكلة في التسجيل'
});

// Access results
if (result?.success) {
  console.log(result.match?.response_text);
}
```

#### useChat()
For managing chat conversations:

```typescript
const {
  sendMessage,
  initChat,
  messages,
  sessionId,
  loading,
  error,
  reset,
  quickReplies
} = useChat('شركة عمرة');

// Initialize chat
await initChat();

// Send message
await sendMessage('السلام عليكم');

// Access chat data
console.log(messages); // Array of chat messages
console.log(quickReplies); // Suggested replies
```

### Error Handling

The `src/utils/errorHandler.ts` provides utilities:

- **handleApiError()** - Parse any error into standardized format
- **getErrorMessage()** - Get Arabic user-friendly error message
- **logError()** - Log error with context
- **isRetryableError()** - Check if error can be retried

Example:
```typescript
try {
  await resolve({ ... });
} catch (error) {
  const message = getErrorMessage(error);
  // Display to user: "البيانات المرسلة غير صحيحة..."
}
```

## Features Integrated

### CallHelper Component (`src/features/CallHelper/`)
✅ **API Integration Complete**

- Connects to `/api/resolve` endpoint
- Sends customer name, entity type, and issue
- Displays generated response from backend
- Alternative format generation
- Loading states and error handling
- Rafeeq AI chat integration

**State Management:**
- `customerName` - Customer name input
- `entityType` - Selected entity type (umrah/external)
- `problemSummary` - Issue description
- `generatedText` - API response display
- `apiError` - Error messages
- `resolveLoading` - Loading indicator

### LiveIndicators Component (`src/features/LiveIndicators/`)
⚠️ **Backend endpoint not yet created**

To integrate, you need to create an API endpoint in your backend that returns dashboard statistics:

**Suggested endpoint:**
```python
@app.get("/api/statistics")
def get_statistics():
    """Get dashboard statistics"""
    return jsonify({
        "daily_cases": 247,
        "confirmed_statements": 64,
        "most_repeated_issues": 23,
        "general_issues": 156,
        # ... more stats
    })
```

Then use in component:
```typescript
const [stats, setStats] = useState(null);

useEffect(() => {
  fetch('/api/statistics')
    .then(r => r.json())
    .then(setStats);
}, []);
```

## API Response Types

### ResolveResponse
```typescript
{
  success: boolean;
  message: string;
  customer?: string;
  user_type?: string;
  match?: {
    case_id: string | null;
    category: string | null;
    subcategory: string | null;
    priority: string | null;
    score: number | null;
    response_text: string | null;
    fallback: string | null;
    why: string | null;
    last_updated: string | null;
  }
}
```

### ChatResponse
```typescript
{
  success: boolean;
  response: string;
  quick_replies: string[];
  session_id: string;
}
```

## Debugging

### View API Requests
Browser console shows all API requests and responses:
```
[API Request] POST /api/resolve
[API Response] 200 /api/resolve
```

### Check Backend Connection
```typescript
import { checkApiHealth } from './services/api';

// In component
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  checkApiHealth().then(setIsConnected);
}, []);
```

### Environment Check
Access current API URL:
```typescript
import { getApiBaseUrl } from './services/api';

console.log(getApiBaseUrl()); // Shows configured URL
```

## Common Issues

### CORS Errors
Make sure your backend has CORS enabled:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This is already in app.py
```

### API Connection Failed
- Check backend is running: `http://localhost:5000` (or your configured URL)
- Verify `VITE_API_URL` in `.env` matches backend URL
- Check browser console for error details

### Empty Responses
- Make sure issue description matches database keywords
- Check backend database has case entries for your user type
- Review backend logs for query errors

## Next Steps

1. **Create .env file** with your API URL
2. **Test the CallHelper** by submitting a form
3. **Check browser console** for any errors
4. **Review backend logs** for request details
5. **Create statistics endpoint** for LiveIndicators

## File Structure
```
src/
├── services/
│   ├── api.ts           # API client with all methods
│   └── index.ts         # Export all services
├── hooks/
│   ├── useResolve.ts    # Issue resolution hook
│   ├── useChat.ts       # Chat management hook
│   └── index.ts         # Export all hooks
├── utils/
│   └── errorHandler.ts  # Error handling utilities
├── types/
│   └── api.ts          # TypeScript interfaces
└── features/
    ├── CallHelper/     # Integrated with API
    └── LiveIndicators/ # Ready for integration
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Review backend logs for API issues
3. Verify environment configuration
4. Check API documentation in `src/services/api.ts`
