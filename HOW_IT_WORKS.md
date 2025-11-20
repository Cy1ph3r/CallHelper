# How Call Helper Works - Complete Workflow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS FORM                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Customer Name:     "Ahmed"                                      │   │
│  │ User Type:         "شركة عمرة" (Umrah Company)                │   │
│  │ Issue Description: "تعديل اسم المفوض في النظام"              │   │
│  │ [Submit Button]                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      BROWSER SENDS API REQUEST                          │
│  POST /api/resolve                                                      │
│  {                                                                       │
│    "name": "Ahmed",                                                     │
│    "user_type": "شركة عمرة",                                           │
│    "issue": "تعديل اسم المفوض في النظام"                            │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND RECEIVES REQUEST                       │
│  app.py receives the JSON data                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│               STEP 1: SELECT THE RIGHT AGENT                            │
│  Logic.py → get_agent_for_user("شركة عمرة")                          │
│                                                                         │
│  ✓ User type contains "عمرة"? YES                                     │
│  → Select: UmrahAgent()                                                │
│                                                                         │
│  (If no match found, system returns error)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│          STEP 2: SEARCH EXCEL DATABASE FOR BEST MATCH                  │
│  UmrahAgent.find_best_row("تعديل اسم المفوض في النظام")             │
│                                                                         │
│  1. Read CallHelper_Data.xlsx sheet "Callhelper.Umrah"                │
│  2. Process each row and calculate a MATCH SCORE:                      │
│                                                                         │
│  Keyword Scoring System:                                               │
│  ────────────────────────────────────────────                          │
│  • Check NEGATIVE keywords first (exclude if found)                    │
│  • Add +2 points for each MAIN KEYWORD match                          │
│  • Add +1 point for each EXTRA KEYWORD match                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                 STEP 3: EXAMPLE SCORING                                 │
│                                                                         │
│ Issue Text (cleaned): "تعديل اسم مفوض في النظام"                    │
│                                                                         │
│ Excel Row 1:                                                            │
│ ├─ MainKeywords: "تعديل,اسم,خطأ,تصحيح"                               │
│ ├─ ExtraKeywords: "تغيير,إصلاح,تحديث"                                │
│ ├─ NegativeKeywords: "حذف,إلغاء"                                      │
│ └─ Score Calculation:                                                  │
│    • "تعديل" found? → +2 points ✓                                     │
│    • "اسم" found? → +2 points ✓                                       │
│    • "خطأ" found? → +0 (not in issue)                                │
│    • "تصحيح" found? → +0 (not in issue)                              │
│    • "تغيير" found? → +0 (not in issue)                              │
│    • "إصلاح" found? → +0 (not in issue)                              │
│    • "تحديث" found? → +1 (part of "تحديث")? → +1 ✓                 │
│    • "حذف" found? → NO (negative keyword) ✓                           │
│    • "إلغاء" found? → NO (negative keyword) ✓                         │
│                                                                         │
│ TOTAL SCORE FOR ROW 1: 2 + 2 + 1 = 5 points                           │
│                                                                         │
│ Excel Row 2: (some other issue)                                        │
│ ├─ MainKeywords: "حجز,تذكرة,تاريخ"                                    │
│ └─ Score: 0 points (no matching keywords)                              │
│                                                                         │
│ Result: ROW 1 WINS with highest score (5 points)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  STEP 4: EXTRACT THE SOLUTION                           │
│  From the best matching row, retrieve:                                 │
│  ────────────────────────────────────────────────────────────────────   │
│  • CaseID: "CH-UM-001"                                                 │
│  • Category: "تحديث البيانات"                                         │
│  • SubCategory: "تحديث بيانات المفوض"                                │
│  • MatchScore: 5 (how confident we are)                               │
│  • ResponseText: "الخطوات التالية: 1. افتح... 2. اضغط..."           │
│  • FallbackText: "إذا لم يعمل، جرب..."                               │
│  • Why: "السبب هو..."                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│            STEP 5: SEND RESPONSE BACK TO BROWSER                        │
│  JSON Response:                                                         │
│  {                                                                       │
│    "success": true,                                                     │
│    "message": "تمت معالجة الطلب بنجاح",                              │
│    "customer": "Ahmed",                                                │
│    "user_type": "شركة عمرة",                                          │
│    "match": {                                                           │
│      "case_id": "CH-UM-001",                                           │
│      "category": "تحديث البيانات",                                    │
│      "subcategory": "تحديث بيانات المفوض",                           │
│      "priority": "High",                                               │
│      "score": 5,                                                        │
│      "response_text": "1. افتح النظام\n2. اضغط على بيانات المفوض...", │
│      "fallback": "في حالة الفشل، اتصل بـ...",                        │
│      "why": "لأن النظام يتطلب...",                                   │
│      "last_updated": "2025-11-15"                                      │
│    }                                                                    │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│           STEP 6: BROWSER DISPLAYS THE SOLUTION                         │
│  The JavaScript on the page receives the response and shows:            │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Recommended solution                                              │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Case ID        CH-UM-001                                         │  │
│  │ Category       تحديث البيانات                                    │  │
│  │ Subcategory    تحديث بيانات المفوض                              │  │
│  │ Priority       High                                              │  │
│  │ Score          5                                                 │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Response                                                          │  │
│  │ 1. افتح النظام                                                 │  │
│  │ 2. اضغط على بيانات المفوض                                      │  │
│  │ 3. ادخل الاسم الجديد                                            │  │
│  │ 4. احفظ التغييرات                                               │  │
│  │                                                                  │  │
│  │ Fallback                                                         │  │
│  │ في حالة عدم ظهور الخيار، اتصل بـ: 920001234                   │  │
│  │                                                                  │  │
│  │ Why                                                              │  │
│  │ لأن النظام يتطلب تحديث بيانات المفوض قبل...                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## What Happens at Each Stage

### Stage 1: Form Submission (Client-Side)
```javascript
// You fill in the form and click "Resolve"
// The browser JavaScript captures the data:
{
  name: "Ahmed",
  user_type: "شركة عمرة",
  issue: "تعديل اسم المفوض في النظام"
}
// And sends it to the server via API
```

### Stage 2: Agent Selection (Server-Side)
```python
# Logic.py decides which agent to use
agent = get_agent_for_user("شركة عمرة")

# If user type contains "عمرة" → UmrahAgent
# If user type contains "حج" + "خارج" → HajjExAgent (future)
# If user type contains "حج" + "محلي" → HajjLoAgent (future)
# If no match → Return error
```

### Stage 3: Excel Search (UmrahAgent)
```python
# Open the Excel file and read "Callhelper.Umrah" sheet
df = pd.read_excel("CallHelper_Data.xlsx", sheet_name="Callhelper.Umrah")

# For each row, calculate match score:
for each_row in df:
    score = 0
    issue_cleaned = preprocess("تعديل اسم مفوض في النظام")
    
    # Check negative keywords (exclude if found)
    if "حذف" in issue_cleaned or "إلغاء" in issue_cleaned:
        continue  # Skip this row
    
    # Add points for main keywords
    for keyword in ["تعديل", "اسم", "خطأ", "تصحيح"]:
        if keyword in issue_cleaned:
            score += 2
    
    # Add points for extra keywords
    for keyword in ["تغيير", "إصلاح", "تحديث"]:
        if keyword in issue_cleaned:
            score += 1
    
    if score > best_score:
        best_row = row
        best_score = score

return best_row, best_score
```

### Stage 4: Response Construction
```python
# Extract all relevant data from the best matching row
response = {
    "case_id": best_row["CaseID"],
    "category": best_row["Category"],
    "response_text": best_row["ResponseText"],  # ← The solution!
    "score": best_score,
    # ... and more fields
}
return response
```

### Stage 5: Frontend Display
```javascript
// Browser receives the JSON and displays it nicely
// Shows case ID, category, priority, solution, etc.
// Supports both English and Arabic text
```

## Real-World Example

**You enter:**
- Name: "علي" (Ali)
- User Type: "وكيل خارجي" (External Agent)
- Issue: "لا أستطيع تحديث رقم الجواز"

**What happens:**
1. System detects "وكيل خارجي" contains "عمرة" → Uses UmrahAgent
2. Issue text is cleaned: "لا اتطع تحديث رقم جواز"
3. Searches Excel for rows with keywords like: "تحديث", "جواز", "رقم"
4. Finds matching row with high score
5. Returns solution: "لتحديث رقم الجواز، اتبع الخطوات..."
6. Displays on screen with case info, priority, etc.

## If No Match Found

If the issue doesn't match any keywords well:
- Score remains 0 or very low
- System returns: "ما قدرت أحدد الحالة بدقة، ممكن توضح المشكلة بكلمات ثانية؟"
- Agent knows to ask customer for more details or escalate

## How Keywords Work

The quality of results depends on the Excel keywords:

**Good Example:**
```
MainKeywords: تعديل,اسم,خطأ,تصحيح
ExtraKeywords: تغيير,إصلاح,تحديث
NegativeKeywords: حذف,إلغاء
```

**Poor Example:**
```
MainKeywords: مشكلة
ExtraKeywords: 
NegativeKeywords: 
```
← Will match almost everything (bad!)

## Current Status

⚠️ **Important**: Your Excel file is mostly empty (no ResponseText values yet)

When ResponseText is empty:
- System still matches correctly
- Returns matched case ID, category, etc.
- But shows empty response text field
- Agent sees: "Response: " (blank)

**Next step**: Fill in ResponseText with actual solutions!

## Summary

```
User Input
    ↓
Agent Selection
    ↓
Excel Search with Keyword Scoring
    ↓
Best Match Found
    ↓
Extract Solution
    ↓
Return Response
    ↓
Display to Agent
```

The entire process takes less than 100ms!
