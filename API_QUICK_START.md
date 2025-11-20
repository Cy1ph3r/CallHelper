# 🚀 API Integration Quick Start

## 1️⃣ Setup (2 minutes)

```bash
# Copy environment file
cp .env.example .env

# Install axios (if not installed)
npm install axios
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

## 2️⃣ Run Both Servers

**Backend:**
```bash
python app.py
# Visit: http://localhost:5000
```

**Frontend:**
```bash
npm run dev
# Visit: http://localhost:5173
```

## 3️⃣ Test the Integration

1. Go to "Call Helper" tab in the app
2. Fill in the form:
   - اسم العميل: Enter any name
   - نوع الجهة: Select "شركة عمرة" or "وكيل خارجي"
   - وصف المشكلة: Enter an issue description
3. Click "توليد الصيغة" button
4. Check your browser console for API logs

## 📁 What Was Created

```
src/
├── services/api.ts          ← All API calls
├── hooks/useResolve.ts      ← Issue resolution
├── hooks/useChat.ts         ← Chat management
├── types/api.ts             ← TypeScript types
├── utils/errorHandler.ts    ← Error handling
└── features/
    └── CallHelper/          ← Fully integrated
```

## 🔌 API Endpoints Used

| Endpoint | Method | Feature |
|----------|--------|---------|
| `/api/resolve` | POST | Generate responses |
| `/api/chat` | POST | Chat messages |
| `/` | GET | Health check |

## 💻 Usage Examples

### Resolve an Issue
```typescript
import { useResolve } from './hooks';

function MyComponent() {
  const { resolve, loading, error } = useResolve();
  
  const handleClick = async () => {
    await resolve({
      name: 'محمد',
      user_type: 'umrah',
      issue: 'مشكلة التسجيل'
    });
  };
  
  return <button onClick={handleClick}>{loading ? '...' : 'Generate'}</button>;
}
```

### Chat Integration
```typescript
import { useChat } from './hooks';

function ChatComponent() {
  const { sendMessage, messages, initChat } = useChat();
  
  useEffect(() => {
    initChat(); // Initialize on mount
  }, [initChat]);
  
  const send = async () => {
    await sendMessage('السلام عليكم');
  };
  
  return (
    <div>
      {messages.map(msg => <p key={msg.timestamp}>{msg.content}</p>)}
      <button onClick={send}>Send</button>
    </div>
  );
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API not connecting | Check `VITE_API_URL` in `.env`, ensure backend is running |
| CORS error | Backend already has CORS enabled |
| No response text | Database may not have matching cases, check backend logs |
| Chat not working | Initialize with `initChat()` before sending messages |

## 📚 Full Documentation

See `FRONTEND_INTEGRATION_GUIDE.md` for:
- Detailed API documentation
- TypeScript interfaces
- Error handling examples
- Debugging tips
- Common issues

## ✅ What's Ready

- ✅ CallHelper - Full API integration
- ✅ Error handling - Arabic error messages
- ✅ Loading states - Smooth UX
- ✅ Chat foundation - Ready for Rafeeq
- ✅ Type safety - Full TypeScript support

## ⚠️ What's Next

- ⚠️ LiveIndicators - Needs backend statistics endpoint
- ⚠️ Rafeeq chat - Ready to be implemented
- ⚠️ Advanced modes - Optional feature expansion

## 🆘 Need Help?

1. Check browser **Console** (F12) for API request logs
2. Check backend **Terminal** for request logs
3. Read `FRONTEND_INTEGRATION_GUIDE.md`
4. Review `src/services/api.ts` for all available methods
