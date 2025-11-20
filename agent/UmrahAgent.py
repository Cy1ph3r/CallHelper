from .SmartAgent import SmartAgent
from .mongo_helper import get_collection


class UmrahAgent(SmartAgent):
    def __init__(self):
        super().__init__()
        try:
            # Connect to MongoDB collection
            self.collection = get_collection()
            self.data_source_error = None
        except Exception as e:
            self.collection = None
            self.data_source_error = e
            self.log_error(e)

    def is_supported_user(self, user_type: str) -> bool:
    
        user_type = self.preprocess(user_type)
        return ("شركة عمره" in user_type) or ("وكيل خارجي" in user_type)

    def find_best_row(self, issue_text: str):
        """
        Find the best matching case for the given issue text.
        Returns: (best_case_dict, status_message)
        """
        matches = self.find_all_matches(issue_text)
        if matches:
            return matches[0], self.message("success")
        return None, self.message("no_match")
    
    def find_all_matches(self, issue_text: str, limit=5):
        """
        Find all matching cases ranked by score.
        Returns: list of matching cases sorted by score (highest first)
        """
        if self.collection is None:
            print("[DEBUG] Collection is None")
            return []

        original_issue = issue_text
        issue_text = self.preprocess(issue_text)
        print(f"[DEBUG] Original issue: '{original_issue}'")
        print(f"[DEBUG] Preprocessed issue: '{issue_text}'")

        if not issue_text:
            print("[DEBUG] Empty issue text after preprocessing")
            return []

        try:
            # Fetch all documents from MongoDB
            cases = list(self.collection.find({}))
            print(f"[DEBUG] Found {len(cases)} total cases in database")
            
            if not cases:
                return []

            scored_cases = []

            for case in cases:
                score = 0
                case_id = case.get("CaseID", "Unknown")

                # Keywords are already stored as lists in MongoDB
                main_keywords = case.get("MainKeywords", [])
                extra_keywords = case.get("ExtraKeywords", [])
                neg_keywords = case.get("NegativeKeywords", [])
                
                print(f"[DEBUG] Checking case {case_id}:")
                print(f"  MainKeywords: {main_keywords}")
                print(f"  ExtraKeywords: {extra_keywords}")
                print(f"  NegativeKeywords: {neg_keywords}")

                # 1) لو كلمة ماتتطابق → نستبعد السطر (negative keywords)
                if neg_keywords:
                    skip_case = False
                    for kw in neg_keywords:
                        # Keywords are already preprocessed (lowercase) in MongoDB
                        if kw and kw in issue_text:
                            skip_case = True
                            print(f"  ❌ Skipped due to negative keyword: {kw}")
                            break
                    if skip_case:
                        continue

                # 2) الكلمات الرئيسية (MainKeywords) - allow partial word matches
                if main_keywords:
                    for kw in main_keywords:
                        # Keywords are already preprocessed
                        if kw:
                            # Check for exact word match or as substring
                            words_in_issue = issue_text.split()
                            # Check if keyword or any word in issue starts with keyword
                            if kw in issue_text or any(w.startswith(kw[:3]) if len(kw) >= 3 else w == kw for w in words_in_issue):
                                score += 2
                                print(f"  ✓ MainKeyword matched: '{kw}' (+2 points)")

                # 3) الكلمات الإضافية (ExtraKeywords) - more lenient matching
                if extra_keywords:
                    for kw in extra_keywords:
                        if kw:
                            if kw in issue_text or any(w.startswith(kw[:3]) if len(kw) >= 3 else w == kw for w in issue_text.split()):
                                score += 1
                                print(f"  ✓ ExtraKeyword matched: '{kw}' (+1 point)")

                print(f"  Final score: {score}")
                if score > 0:
                    # Add match score to the case
                    case["MatchScore"] = score
                    scored_cases.append(case)
                    print(f"  ✅ Case {case_id} added with score {score}")
                else:
                    print(f"  ⚠️ Case {case_id} not added (score = 0)")

            # Sort by score (highest first) and return top matches
            scored_cases.sort(key=lambda x: x["MatchScore"], reverse=True)
            print(f"\n[DEBUG] Final results: {len(scored_cases)} matching cases")
            for i, case in enumerate(scored_cases[:limit]):
                print(f"  {i+1}. {case.get('CaseID')} - Score: {case.get('MatchScore')}")
            return scored_cases[:limit]
            
        except Exception as e:
            self.log_error(e)
            return []
