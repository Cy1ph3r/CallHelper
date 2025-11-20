"""
Smart Chatbot for Call Helper
Handles conversation flows and context management
"""

import uuid
from datetime import datetime, timedelta

# Store conversation sessions (in production, use Redis or database)
conversations = {}

class ChatSession:
    def __init__(self, session_id):
        self.session_id = session_id
        self.context = {}
        self.last_activity = datetime.now()
        self.history = []
    
    def update_activity(self):
        self.last_activity = datetime.now()
    
    def add_message(self, role, content):
        self.history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now()
        })
    
    def set_context(self, key, value):
        self.context[key] = value
    
    def get_context(self, key, default=None):
        return self.context.get(key, default)


def get_or_create_session(session_id=None):
    """Get existing session or create new one"""
    if session_id and session_id in conversations:
        session = conversations[session_id]
        session.update_activity()
        return session
    
    # Create new session
    new_id = session_id or str(uuid.uuid4())
    session = ChatSession(new_id)
    conversations[new_id] = session
    return session


def clean_old_sessions():
    """Remove sessions older than 1 hour"""
    cutoff = datetime.now() - timedelta(hours=1)
    to_remove = [
        sid for sid, session in conversations.items()
        if session.last_activity < cutoff
    ]
    for sid in to_remove:
        del conversations[sid]


# FAQ Database
FAQ_RESPONSES = {
    "التأشيرات": {
        "keywords": ["تأشيرة", "فيزا", "visa", "تأشير"],
        "response": """أنا هنا لمساعدتك بشأن التأشيرات! 

يمكنني مساعدتك في:
• حالة التأشيرة
• الرفض والموافقة
• الإلغاء والتعديل
• مشاكل الطباعة

ما المشكلة بالتحديد؟""",
        "quick_replies": [
            "التأشيرة تحت المعالجة",
            "تأشيرة مرفوضة",
            "إلغاء تأشيرة",
            "تعديل بيانات"
        ]
    },
    "الصلاحيات": {
        "keywords": ["صلاحية", "صلاحيات", "دور", "أدوار", "permissions", "وصول"],
        "response": """حياك الله! مشاكل الصلاحيات شائعة.

أغلب المشاكل تكون:
• المستخدم غير مضاف
• الدور غير مفعّل
• الصلاحية ناقصة

قبل ما نكمل، تأكد من:
1. المستخدم مضاف في النظام
2. الدور الصحيح ممنوح له
3. الدور يحتوي على الصلاحية المطلوبة

هل تأكدت من هذه النقاط؟""",
        "quick_replies": [
            "تأكدت والمشكلة باقية",
            "كيف أتحقق من الأدوار؟",
            "المستخدم غير ظاهر"
        ]
    },
    "بيانات الحجاج": {
        "keywords": ["حاج", "حجاج", "بيانات", "معلومات", "pilgrim", "data"],
        "response": """تمام، بيانات الحجاج...

وش المشكلة بالضبط؟
• بيانات ناقصة؟
• خطأ في البيانات؟
• مشكلة في التحديث؟
• عدم ظهور البيانات؟

حدد المشكلة عشان أقدر أساعدك أفضل.""",
        "quick_replies": [
            "بيانات ناقصة",
            "خطأ في البيانات",
            "لا تظهر البيانات"
        ]
    },
    "الحصة": {
        "keywords": ["حصة", "quota", "أعداد", "عدد"],
        "response": """موضوع الحصة والأعداد...

عادة المشاكل تكون:
• الحصة ممتلئة
• خطأ في احتساب الأعداد
• تجاوز الحد المسموح

وش بالضبط المشكلة اللي واجهتك؟""",
        "quick_replies": [
            "الحصة ممتلئة",
            "خطأ في الأعداد",
            "كيف أزيد الحصة؟"
        ]
    }
}

# Common issues and solutions
COMMON_SOLUTIONS = {
    "تحت المعالجة": """إذا التأشيرة باقية تحت المعالجة أكثر من 24 ساعة:

✓ غالباً تحتاج تدخل القسم التقني
✓ تأكد من عدم وجود مشاكل في البيانات
✓ راجع حالة الطلب في النظام

هل مر أكثر من 24 ساعة؟""",
    
    "مرفوضة": """التأشيرة المرفوضة لها سببين رئيسيين:

📌 **سبب الرفض:**
ترجع للجهة المصدرة (وزارة الخارجية/السفارة)

💰 **الرسوم:**
• رسوم التأشيرة: غير مستردة
• التأمين والخدمات: قابلة للاسترداد الجزئي
• النسبة تختلف حسب الحالة

لا تعطي رقم محدد للعميل!""",
    
    "الصلاحية باقية": """لو كل شيء مضبوط والصلاحية ما زالت ما تشتغل:

جرّب هالحل:
1. احذف الدور من المستخدم
2. أضف الدور من جديد
3. أحياناً النظام يعلّق ويحتاج refresh

غالباً تنحل بهالطريقة. جرب وخبرني!""",
    
    "كيف أتحقق": """للتحقق من الأدوار والصلاحيات:

1. روح إدارة المستخدمين
2. اختر المستخدم
3. شوف الأدوار المفعلة
4. تأكد الدور الصحيح موجود
5. اضغط على الدور وشوف الصلاحيات

واضحة؟"""
}


def get_smart_response(message, session):
    """Generate intelligent response based on context and message"""
    message_lower = message.lower()
    
    # Check if continuing a topic
    current_topic = session.get_context("current_topic")
    
    # Check FAQ first
    for topic, data in FAQ_RESPONSES.items():
        for keyword in data["keywords"]:
            if keyword in message_lower:
                session.set_context("current_topic", topic)
                return {
                    "response": data["response"],
                    "quick_replies": data["quick_replies"],
                    "needs_db": False
                }
    
    # Check common solutions
    for key, solution in COMMON_SOLUTIONS.items():
        if key in message:
            quick_replies = ["هل ساعدني هذا؟", "أحتاج توضيح أكثر", "العودة للبداية"]
            return {
                "response": solution,
                "quick_replies": quick_replies,
                "needs_db": False
            }
    
    # If no FAQ match, search database
    return {
        "response": None,
        "quick_replies": None,
        "needs_db": True
    }


def get_welcome_message():
    """Get welcome message with options"""
    return {
        "response": """مرحباً! أنا رفيق، مساعدك الذكي 🤖

أنا هنا لمساعدتك في حل المشاكل التقنية بسرعة.

اختر الموضوع اللي تحتاج مساعدة فيه:""",
        "quick_replies": [
            "التأشيرات",
            "الصلاحيات",
            "بيانات الحجاج",
            "الحصة"
        ]
    }


def handle_feedback(feedback, session):
    """Handle user feedback"""
    if "ساعدني" in feedback or "نعم" in feedback or "إيه" in feedback:
        return {
            "response": """ممتاز! يسعدني إني قدرت أساعدك 😊

في أي شيء ثاني؟""",
            "quick_replies": [
                "نعم، سؤال آخر",
                "لا، شكراً"
            ]
        }
    else:
        return {
            "response": """عذراً إذا ما كانت الإجابة واضحة.

تبغاني:
• أوضح لك أكثر؟
• أوصلك بموظف؟
• نرجع للبداية؟""",
            "quick_replies": [
                "وضح لي أكثر",
                "تحدث مع موظف",
                "العودة للبداية"
            ]
        }
