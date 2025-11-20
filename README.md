# Call Helper

A smart customer support assistant that helps agents find the best solutions to customer issues by searching through a knowledge base stored in Excel.

## Features

- 🔍 **Smart Search**: Matches customer issues with solutions using keyword matching
- 🎯 **Multi-Agent Support**: Different agents for Umrah, Hajj (External), and Hajj (Local) services
- 🌐 **Web Interface**: Clean, modern UI with English as default (Arabic support included)
- 📊 **Excel-Based Knowledge**: Easy to update solutions via Excel spreadsheet
- 🚀 **Flask Backend**: RESTful API for integration with other systems

## Project Structure

```
Call-helper-main/
├── agent/
│   ├── SmartAgent.py       # Base agent with error logging and validation
│   ├── UmrahAgent.py        # Agent for Umrah-related issues
│   ├── HajjExAgent.py       # (Future) Agent for external Hajj
│   └── HajjLoAgent.py       # (Future) Agent for local Hajj
├── templates/
│   └── index.html           # Web UI
├── static/
│   └── style.css            # Styles
├── CallHelper_Data.xlsx     # Knowledge base with issues and solutions
├── Logic.py                 # Core business logic
├── app.py                   # Flask web application
└── requirements.txt         # Python dependencies
```

## Setup

### 1. Prerequisites

- Python 3.8 or higher
- Virtual environment (included as `.venv`)

### 2. Activate Virtual Environment

```bash
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Prepare Knowledge Base

Edit `CallHelper_Data.xlsx` and fill in the `ResponseText` column with actual solutions. The file has three sheets:
- `Callhelper.Umrah` - For Umrah-related issues
- `Callhelper.HajjEx` - For external Hajj issues
- `Callhelper.HajjLocal` - For local Hajj issues

Each row should have:
- **MainKeywords**: Primary keywords to match (comma-separated)
- **ExtraKeywords**: Additional keywords for better matching
- **NegativeKeywords**: Keywords that exclude this solution
- **ResponseText**: The solution to provide to the agent
- **Category**: Classification of the issue
- **SubCategory**: More specific classification

## Usage

### Command Line Interface

Run the CLI version for testing:

```bash
python Logic.py
```

You'll be prompted for:
1. Customer name
2. User type (e.g., "شركة عمرة" or "وكيل خارجي")
3. Issue description

### Web Application

#### Start the server:

```bash
export FLASK_APP=app.py
flask run
```

Or simply:

```bash
python app.py
```

#### Access the web interface:

Open your browser and navigate to: `http://localhost:5000`

#### API Endpoint:

**POST** `/api/resolve`

Request body:
```json
{
  "name": "Customer Name",
  "user_type": "شركة عمرة",
  "issue": "تعديل اسم المفوض"
}
```

Response (success):
```json
{
  "success": true,
  "message": "تمت معالجة الطلب بنجاح",
  "customer": "Customer Name",
  "user_type": "شركة عمرة",
  "match": {
    "case_id": "CH-UM-001",
    "category": "تحديث البيانات",
    "subcategory": "تحديث بيانات المفوض",
    "priority": "High",
    "score": 8,
    "response_text": "Solution details here...",
    "fallback": null,
    "why": null,
    "last_updated": null
  }
}
```

## How It Works

1. **Agent Selection**: The system selects the appropriate agent based on user type
2. **Keyword Matching**: The agent searches the Excel database using keyword scoring:
   - Main keywords: +2 points each
   - Extra keywords: +1 point each
   - Negative keywords: Excludes the solution
3. **Best Match**: Returns the solution with the highest score
4. **Fallback**: If no match found, prompts for more details

## Error Logging

Errors are automatically logged to `agent_logs.txt` with timestamps. The system tracks error frequency and can send email alerts when errors repeat (configure email settings in `SmartAgent.py`).

## Development Notes

### Fixed Issues

- ✅ Corrected pandas version in requirements.txt (2.2.3)
- ✅ Fixed beautifulsoup4 typo
- ✅ Removed duplicate dependencies
- ✅ Fixed UmrahAgent.py NameError in exception handling
- ✅ Corrected Excel sheet name: `Callhelper.Umrah` (lowercase 'h')
- ✅ Updated column reference from `Response` to `ResponseText`
- ✅ Created complete Flask application with CORS support
- ✅ Built web interface with modern, accessible design
- ✅ Added NaN handling for Excel data

### Current Limitations

- Only Umrah agent is fully implemented
- Excel data needs ResponseText values to be populated
- Email alerting requires configuration

## Future Enhancements

- Implement HajjExAgent and HajjLoAgent
- Add machine learning for better matching
- Implement full Arabic language UI toggle
- Add user authentication
- Export conversation logs
- Analytics dashboard

## Testing

Test the API with curl:

```bash
curl -X POST http://localhost:5000/api/resolve \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","user_type":"شركة عمرة","issue":"تعديل اسم خطأ"}'
```

## Contributing

When adding new solutions to the Excel file:
1. Use clear, specific keywords in MainKeywords
2. Add common variations in ExtraKeywords
3. Use NegativeKeywords to prevent false matches
4. Always fill in ResponseText with complete solutions
5. Test the matching with sample issues

## License

Internal use only.
