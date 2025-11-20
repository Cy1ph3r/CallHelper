#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test the find_all_matches function with different queries.
"""

from agent.UmrahAgent import UmrahAgent

def test_alternatives():
    """Test finding alternatives with different queries."""
    agent = UmrahAgent()
    
    print("=" * 70)
    print("TESTING ALTERNATIVE SOLUTIONS FEATURE")
    print("=" * 70)
    
    # Test 1: Search for "تفعيل" - should return 4 matches
    print("\n\n🔍 TEST 1: Searching for 'تفعيل'")
    print("-" * 70)
    matches = agent.find_all_matches("تفعيل", limit=5)
    print(f"\nFound {len(matches)} matches:")
    for i, match in enumerate(matches, 1):
        print(f"{i}. {match.get('CaseID')} - Score: {match.get('MatchScore')} - {match.get('Category')}")
    
    # Test 2: Search for "تفعيل حساب" - should return matches with higher scores
    print("\n\n🔍 TEST 2: Searching for 'تفعيل حساب'")
    print("-" * 70)
    matches = agent.find_all_matches("تفعيل حساب", limit=5)
    print(f"\nFound {len(matches)} matches:")
    for i, match in enumerate(matches, 1):
        print(f"{i}. {match.get('CaseID')} - Score: {match.get('MatchScore')} - {match.get('Category')}")
    
    # Test 3: Search for "مشكلة تفعيل"
    print("\n\n🔍 TEST 3: Searching for 'مشكلة تفعيل'")
    print("-" * 70)
    matches = agent.find_all_matches("مشكلة تفعيل", limit=5)
    print(f"\nFound {len(matches)} matches:")
    for i, match in enumerate(matches, 1):
        print(f"{i}. {match.get('CaseID')} - Score: {match.get('MatchScore')} - {match.get('Category')}")
    
    # Test 4: Search for "تعديل بيانات" - should only return TEST-005
    print("\n\n🔍 TEST 4: Searching for 'تعديل بيانات'")
    print("-" * 70)
    matches = agent.find_all_matches("تعديل بيانات", limit=5)
    print(f"\nFound {len(matches)} matches:")
    for i, match in enumerate(matches, 1):
        print(f"{i}. {match.get('CaseID')} - Score: {match.get('MatchScore')} - {match.get('Category')}")
    
    print("\n" + "=" * 70)
    print("TESTS COMPLETED")
    print("=" * 70)

if __name__ == "__main__":
    try:
        test_alternatives()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
