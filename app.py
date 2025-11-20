from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_cors import CORS
import os
import math
import time
from datetime import datetime, timezone

from Logic import get_agent_for_user
from agent.mongo_helper import get_all_cases, get_case_by_id, insert_case, update_case, delete_case
from agent.chatbot import (
    get_or_create_session, get_welcome_message, get_smart_response,
    handle_feedback, clean_old_sessions
)
from agent.analytics_helper import (
    log_interaction, get_dashboard_stats, get_recent_queries,
    get_popular_queries, get_hourly_activity, get_daily_trends
)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
CORS(app)

# Home page
@app.get("/")
def index():
    return render_template("index.html")


def _safe_val(v):
    if v is None:
        return None
    try:
        if isinstance(v, float) and math.isnan(v):
            return None
    except Exception:
        pass
    return v


@app.post("/search")
def search():
    """Handle form submissions from HTML (AJAX)"""
    try:
        name = (request.form.get("caller_name") or "").strip()
        user_type = (request.form.get("caller_type") or "").strip()
        issue = (request.form.get("issue_description") or "").strip()
        
        # Get advanced filters
        activation = (request.form.get("activation") or "").strip()
        registration = (request.form.get("registration") or "").strip()
        request_status = (request.form.get("request_status") or "").strip()

        if not user_type or not issue:
            return jsonify({"error": "الرجاء ملء جميع الحقول المطلوبة"}), 400

        agent = get_agent_for_user(user_type)
        if agent is None:
            return jsonify({"error": "نوع الجهة غير مدعوم"}), 400

        best_row, status_msg = agent.find_best_row(issue)
        if best_row is None:
            return jsonify({"result": f"لم يتم العثور على حل مناسب\n\n{status_msg}"})

        # Format the result
        response_text = _safe_val(best_row.get("ResponseText")) or "لا توجد حلول متاحة"
        case_id = _safe_val(best_row.get('CaseID')) or "غير متوفر"
        category = _safe_val(best_row.get('Category')) or "غير متوفر"
        
        result = f"""اسم العميل: {name}
رقم الحالة: {case_id}
الفئة: {category}

الحل:
{response_text}"""
        
        # Add advanced filter info if provided
        if activation or registration or request_status:
            filters = "\n\nالفلاتر المتقدمة:"
            if activation:
                filters += f"\n- حالة التفعيل: {activation}"
            if registration:
                filters += f"\n- حالة التسجيل: {registration}"
            if request_status:
                filters += f"\n- حالة الطلب: {request_status}"
            result += filters
        
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": f"حدث خطأ غير متوقع: {str(e)}"}), 500


@app.post("/api/chat")
def api_chat():
    """Smart chatbot endpoint with conversation flows"""
    try:
        # Clean old sessions periodically
        clean_old_sessions()
        
        data = request.get_json(force=True) or {}
        message = (data.get("message") or "").strip()
        user_type = (data.get("user_type") or "شركة عمرة").strip()
        is_first = data.get("is_first", False)
        session_id = data.get("session_id")
        
        # Get or create session
        session = get_or_create_session(session_id)
        
        # Welcome message
        if is_first or not message:
            result = get_welcome_message()
            return jsonify({
                "success": True,
                "response": result["response"],
                "quick_replies": result["quick_replies"],
                "session_id": session.session_id
            })
        
        # Add user message to history
        session.add_message("user", message)
        
        # Check for feedback responses
        if "ساعد" in message or "نعم" in message or "إيه" in message or "لا" in message or "تحدث مع موظف" in message:
            result = handle_feedback(message, session)
            session.add_message("bot", result["response"])
            return jsonify({
                "success": True,
                "response": result["response"],
                "quick_replies": result["quick_replies"],
                "session_id": session.session_id
            })
        
        # Get smart response (check FAQ and common solutions first)
        smart_result = get_smart_response(message, session)
        
        if not smart_result["needs_db"]:
            # FAQ or common solution found
            session.add_message("bot", smart_result["response"])
            return jsonify({
                "success": True,
                "response": smart_result["response"],
                "quick_replies": smart_result["quick_replies"],
                "session_id": session.session_id
            })
        
        # If no FAQ match, search database
        agent = get_agent_for_user(user_type)
        if agent is None:
            result = get_welcome_message()
            return jsonify({
                "success": True,
                "response": result["response"],
                "quick_replies": result["quick_replies"],
                "session_id": session.session_id
            })
        
        best_row, status_msg = agent.find_best_row(message)
        
        if best_row is None:
            response_text = "عذراً، لم أجد إجابة دقيقة في قاعدة البيانات.\n\nهل يمكنك إعادة صياغة السؤال أو اختيار موضوع من القائمة؟"
            quick_replies = [
                "العودة للبداية",
                "تحدث مع موظف"
            ]
        else:
            response_text = _safe_val(best_row.get("ResponseText")) or "لا توجد معلومات متاحة"
            category = _safe_val(best_row.get("Category"))
            if category:
                response_text = f"📌 **{category}**\n\n{response_text}"
            
            quick_replies = [
                "هل ساعدني هذا؟",
                "أحتاج مزيد من المساعدة",
                "العودة للبداية"
            ]
        
        session.add_message("bot", response_text)
        
        return jsonify({
            "success": True,
            "response": response_text,
            "quick_replies": quick_replies,
            "session_id": session.session_id
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "response": "حدث خطأ، الرجاء المحاولة مرة أخرى",
            "quick_replies": ["العودة للبداية"]
        }), 500


@app.post("/api/resolve")
def api_resolve():
    start_time = time.time()
    try:
        data = request.get_json(force=True) or {}
        name = (data.get("name") or "").strip()
        user_type = (data.get("user_type") or "").strip()
        issue = (data.get("issue") or "").strip()
        get_alternatives = data.get("get_alternatives", False)
        
        app.logger.info(f"\n[API] Received request:")
        app.logger.info(f"  user_type: '{user_type}'")
        app.logger.info(f"  issue: '{issue}'")
        app.logger.info(f"  get_alternatives: {get_alternatives}")

        if not user_type or not issue:
            return jsonify({
                "success": False,
                "message": "Missing required fields: user_type and issue",
            }), 400

        agent = get_agent_for_user(user_type)
        if agent is None:
            log_interaction(
                interaction_type="resolve",
                user_type=user_type,
                query=issue,
                success=False,
                error_message="Unsupported user type"
            )
            return jsonify({
                "success": False,
                "message": "Unsupported user type for now.",
            }), 400

        # Get all matches if alternatives requested
        if get_alternatives:
            all_matches = agent.find_all_matches(issue, limit=5)
            response_time = (time.time() - start_time) * 1000
            
            if not all_matches:
                return jsonify({
                    "success": False,
                    "message": "No matches found",
                    "alternatives": []
                }), 200
            
            # Log first match
            log_interaction(
                interaction_type="resolve",
                user_type=user_type,
                query=issue,
                success=True,
                response_time=response_time,
                matched_case_id=_safe_val(all_matches[0].get("CaseID"))
            )
            
            # Format all matches
            formatted_matches = []
            for match in all_matches:
                formatted_matches.append({
                    "case_id": _safe_val(match.get("CaseID")),
                    "category": _safe_val(match.get("Category")),
                    "subcategory": _safe_val(match.get("SubCategory")),
                    "priority": _safe_val(match.get("Priorty")),
                    "score": _safe_val(match.get("MatchScore")),
                    "response_text": _safe_val(match.get("ResponseText")),
                    "fallback": _safe_val(match.get("FallbackText")),
                    "why": _safe_val(match.get("Why")),
                    "last_updated": _safe_val(match.get("LastUpdated")),
                })
            
            return jsonify({
                "success": True,
                "message": "Found multiple matches",
                "customer": name,
                "user_type": user_type,
                "match": formatted_matches[0],
                "alternatives": formatted_matches
            })
        
        # Original behavior - get best match only
        best_row, status_msg = agent.find_best_row(issue)
        
        response_time = (time.time() - start_time) * 1000  # Convert to ms
        
        if best_row is None:
            log_interaction(
                interaction_type="resolve",
                user_type=user_type,
                query=issue,
                success=False,
                response_time=response_time
            )
            return jsonify({
                "success": False,
                "message": status_msg,
            }), 200

        # Extract fields safely
        case_id = _safe_val(best_row.get("CaseID"))
        
        # Log successful interaction
        log_interaction(
            interaction_type="resolve",
            user_type=user_type,
            query=issue,
            success=True,
            response_time=response_time,
            matched_case_id=case_id
        )
        
        resp = {
            "success": True,
            "message": status_msg,
            "customer": name,
            "user_type": user_type,
            "match": {
                "case_id": case_id,
                "category": _safe_val(best_row.get("Category")),
                "subcategory": _safe_val(best_row.get("SubCategory")),
                "priority": _safe_val(best_row.get("Priorty")),  # note: source typo
                "score": _safe_val(best_row.get("MatchScore")),
                "response_text": _safe_val(best_row.get("ResponseText")),
                "fallback": _safe_val(best_row.get("FallbackText")),
                "why": _safe_val(best_row.get("Why")),
                "last_updated": _safe_val(best_row.get("LastUpdated")),
            }
        }
        return jsonify(resp)

    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        log_interaction(
            interaction_type="resolve",
            user_type=user_type if 'user_type' in locals() else "unknown",
            query=issue if 'issue' in locals() else "unknown",
            success=False,
            response_time=response_time,
            error_message=str(e)
        )
        # Avoid leaking stack trace to clients
        return jsonify({
            "success": False,
            "message": "Internal server error",
        }), 500


# ============================================
# Analytics API Endpoints
# ============================================

@app.get("/api/analytics/stats")
def api_analytics_stats():
    """Get dashboard statistics"""
    try:
        stats = get_dashboard_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/analytics/recent")
def api_analytics_recent():
    """Get recent queries"""
    try:
        limit = request.args.get("limit", 10, type=int)
        queries = get_recent_queries(limit=limit)
        return jsonify(queries)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/analytics/popular")
def api_analytics_popular():
    """Get popular queries"""
    try:
        limit = request.args.get("limit", 10, type=int)
        queries = get_popular_queries(limit=limit)
        return jsonify(queries)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/analytics/hourly")
def api_analytics_hourly():
    """Get hourly activity for today"""
    try:
        activity = get_hourly_activity()
        return jsonify(activity)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/analytics/trends")
def api_analytics_trends():
    """Get daily trends"""
    try:
        days = request.args.get("days", 7, type=int)
        trends = get_daily_trends(days=days)
        return jsonify(trends)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================
# Admin Routes for Database Management
# ============================================

def parse_keywords(s):
    """Parse comma/newline-separated keywords into a list."""
    if not s:
        return []
    parts = []
    for line in s.replace("\r", "\n").split("\n"):
        for p in line.split(","):
            t = p.strip().lower()
            if t:
                parts.append(t)
    # Remove duplicates while preserving order
    return list(dict.fromkeys(parts))


@app.route("/admin")
def admin_list():
    """List all cases in the database."""
    try:
        cases = get_all_cases()
        return render_template("admin_list.html", cases=cases)
    except Exception as e:
        flash(f"Error loading cases: {e}", "error")
        return render_template("admin_list.html", cases=[])


@app.route("/admin/add", methods=["GET", "POST"])
def admin_add():
    """Add a new case."""
    if request.method == "POST":
        form = request.form
        data = {
            "CaseID": form.get("CaseID", "").strip(),
            "UserType": form.get("UserType", "").strip(),
            "AccountStatus": form.get("AccountStatus", "").strip(),
            "Category": form.get("Category", "").strip(),
            "SubCategory": form.get("SubCategory", "").strip(),
            "MainKeywords": parse_keywords(form.get("MainKeywords", "")),
            "ExtraKeywords": parse_keywords(form.get("ExtraKeywords", "")),
            "Synonyms": parse_keywords(form.get("Synonyms", "")),
            "NegativeKeywords": parse_keywords(form.get("NegativeKeywords", "")),
            "Priorty": form.get("Priorty", "").strip(),
            "ResponseText": form.get("ResponseText", "").strip(),
            "Why": form.get("Why", "").strip(),
            "FallbackText": form.get("FallbackText", "").strip(),
            "Notes": form.get("Notes", "").strip(),
        }
        
        # Validation
        if not data["CaseID"] or not data["UserType"] or not data["Category"] or not data["MainKeywords"] or not data["ResponseText"]:
            flash("Please fill all required fields: CaseID, UserType, Category, MainKeywords, ResponseText", "error")
            return render_template("admin_form.html", mode="add", data=data)
        
        try:
            insert_case(data)
            flash(f"Case {data['CaseID']} created successfully!", "success")
            return redirect(url_for("admin_list"))
        except Exception as e:
            flash(f"Error creating case: {e}", "error")
            return render_template("admin_form.html", mode="add", data=data)
    
    return render_template("admin_form.html", mode="add", data={})


@app.route("/admin/edit/<case_id>", methods=["GET", "POST"])
def admin_edit(case_id):
    """Edit an existing case."""
    existing = get_case_by_id(case_id)
    if not existing:
        flash("Case not found.", "error")
        return redirect(url_for("admin_list"))
    
    if request.method == "POST":
        form = request.form
        data = {
            "UserType": form.get("UserType", "").strip(),
            "AccountStatus": form.get("AccountStatus", "").strip(),
            "Category": form.get("Category", "").strip(),
            "SubCategory": form.get("SubCategory", "").strip(),
            "MainKeywords": parse_keywords(form.get("MainKeywords", "")),
            "ExtraKeywords": parse_keywords(form.get("ExtraKeywords", "")),
            "Synonyms": parse_keywords(form.get("Synonyms", "")),
            "NegativeKeywords": parse_keywords(form.get("NegativeKeywords", "")),
            "Priorty": form.get("Priorty", "").strip(),
            "ResponseText": form.get("ResponseText", "").strip(),
            "Why": form.get("Why", "").strip(),
            "FallbackText": form.get("FallbackText", "").strip(),
            "Notes": form.get("Notes", "").strip(),
        }
        
        # Validation
        if not data["UserType"] or not data["Category"] or not data["MainKeywords"] or not data["ResponseText"]:
            flash("Please fill all required fields: UserType, Category, MainKeywords, ResponseText", "error")
            return render_template("admin_form.html", mode="edit", data={**existing, **data})
        
        try:
            update_case(case_id, data)
            flash(f"Case {case_id} updated successfully!", "success")
            return redirect(url_for("admin_list"))
        except Exception as e:
            flash(f"Error updating case: {e}", "error")
            return render_template("admin_form.html", mode="edit", data={**existing, **data})
    
    return render_template("admin_form.html", mode="edit", data=existing)


@app.route("/admin/delete/<case_id>", methods=["POST"])
def admin_delete(case_id):
    """Delete a case."""
    try:
        delete_case(case_id)
        flash(f"Case {case_id} deleted successfully!", "success")
    except Exception as e:
        flash(f"Error deleting case: {e}", "error")
    return redirect(url_for("admin_list"))


if __name__ == "__main__":
    # For local development
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
