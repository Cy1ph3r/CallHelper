#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Seed the database with test cases for alternative solutions feature.
"""

from agent.mongo_helper import get_collection
from datetime import datetime, timezone

def seed_database():
    """Clear existing data and insert test cases."""
    collection = get_collection()
    
    # Clear existing data
    print("Clearing existing data...")
    result = collection.delete_many({})
    print(f"Deleted {result.deleted_count} existing cases")
    
    # Test cases with overlapping keywords for "تفعيل"
    test_cases = [
        {
            "CaseID": "TEST-001",
            "Category": "تفعيل الحساب",
            "SubCategory": "مشاكل تقنية",
            "Priorty": "عالي",
            "MainKeywords": ["تفعيل", "حساب"],
            "ExtraKeywords": ["مشكلة", "خطأ"],
            "NegativeKeywords": [],
            "ResponseText": "**الحل الأول:** لتفعيل الحساب، يرجى التواصل مع قسم الدعم التقني وإرسال نسخة من الترخيص.",
            "FallbackText": "في حال استمرار المشكلة، تواصل مع المشرف المباشر.",
            "Why": "هذا الحل يناسب حالات تفعيل الحساب الأساسية",
            "LastUpdated": datetime.now(timezone.utc)
        },
        {
            "CaseID": "TEST-002",
            "Category": "تفعيل النظام",
            "SubCategory": "صلاحيات",
            "Priorty": "متوسط",
            "MainKeywords": ["تفعيل", "نظام"],
            "ExtraKeywords": ["حساب", "صلاحيات"],
            "NegativeKeywords": [],
            "ResponseText": "**الحل الثاني:** يمكن تفعيل النظام من خلال لوحة التحكم الرئيسية > الإعدادات > تفعيل الخدمات.",
            "FallbackText": "تواصل مع مدير النظام للحصول على المساعدة.",
            "Why": "هذا الحل مخصص لتفعيل النظام عبر لوحة التحكم",
            "LastUpdated": datetime.now(timezone.utc)
        },
        {
            "CaseID": "TEST-003",
            "Category": "تفعيل الخدمة",
            "SubCategory": "اشتراكات",
            "Priorty": "عالي",
            "MainKeywords": ["تفعيل"],
            "ExtraKeywords": ["خدمة", "اشتراك", "حساب"],
            "NegativeKeywords": [],
            "ResponseText": "**الحل الثالث:** لتفعيل الخدمة، تأكد من سداد الرسوم المطلوبة، ثم قم بتفعيل الاشتراك من قائمة الخدمات.",
            "FallbackText": "راجع قسم المحاسبة للتحقق من حالة السداد.",
            "Why": "يستخدم هذا الحل عندما تكون المشكلة متعلقة بالاشتراكات والرسوم",
            "LastUpdated": datetime.now(timezone.utc)
        },
        {
            "CaseID": "TEST-004",
            "Category": "مشاكل التفعيل العامة",
            "SubCategory": "استفسارات",
            "Priorty": "منخفض",
            "MainKeywords": ["مشكلة"],
            "ExtraKeywords": ["تفعيل", "حساب", "نظام"],
            "NegativeKeywords": [],
            "ResponseText": "**الحل الرابع:** للمساعدة في أي مشكلة تفعيل، يمكنك مراجعة دليل المستخدم أو التواصل مع الدعم الفني.",
            "FallbackText": "أرسل تذكرة دعم فني للحصول على المساعدة.",
            "Why": "حل عام لجميع مشاكل التفعيل",
            "LastUpdated": datetime.now(timezone.utc)
        },
        {
            "CaseID": "TEST-005",
            "Category": "تعديل البيانات",
            "SubCategory": "معلومات شخصية",
            "Priorty": "متوسط",
            "MainKeywords": ["تعديل", "بيانات"],
            "ExtraKeywords": ["تغيير", "تحديث"],
            "NegativeKeywords": ["تفعيل"],
            "ResponseText": "**حل تعديل البيانات:** يمكنك تعديل البيانات من خلال صفحة الملف الشخصي.",
            "FallbackText": "تواصل مع خدمة العملاء لتعديل البيانات.",
            "Why": "هذا الحل خاص بتعديل البيانات فقط وليس التفعيل",
            "LastUpdated": datetime.now(timezone.utc)
        }
    ]
    
    # Insert test cases
    print(f"\nInserting {len(test_cases)} test cases...")
    for case in test_cases:
        result = collection.insert_one(case)
        print(f"✅ Inserted: {case['CaseID']} - {case['Category']}")
    
    print(f"\n🎉 Database seeded successfully with {len(test_cases)} test cases!")
    print("\nTest scenarios:")
    print("1. Search for 'تفعيل' → Should return 4 alternatives (TEST-001, TEST-002, TEST-003, TEST-004)")
    print("2. Search for 'تفعيل حساب' → Should return 3 alternatives with different scores")
    print("3. Search for 'مشكلة تفعيل' → Should return multiple matches")
    print("4. Search for 'تعديل بيانات' → Should return only TEST-005 (TEST-001 to TEST-004 excluded)")
    print("\nNOTE: TEST-005 has 'تفعيل' as a negative keyword, so it won't appear in تفعيل searches!")

if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
