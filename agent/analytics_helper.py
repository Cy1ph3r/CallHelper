# -*- coding: utf-8 -*-
"""
analytics_helper.py
Analytics and logging system for Call Helper
Tracks all interactions and provides dashboard metrics
"""

from datetime import datetime, timedelta
from pymongo import MongoClient, DESCENDING
import os

# MongoDB connection
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["callhelper"]
logs_collection = db["interaction_logs"]


def log_interaction(
    interaction_type,  # "resolve" or "chat"
    user_type,
    query,
    success,
    response_time=None,
    matched_case_id=None,
    error_message=None
):
    """
    Log an interaction to MongoDB
    
    Args:
        interaction_type: Type of interaction ("resolve" or "chat")
        user_type: Type of user (e.g., "umrah", "external")
        query: The user's query/issue
        success: Boolean indicating if a match was found
        response_time: Time taken to process (in milliseconds)
        matched_case_id: ID of the matched case (if any)
        error_message: Error message (if any)
    """
    try:
        log_entry = {
            "timestamp": datetime.utcnow(),
            "interaction_type": interaction_type,
            "user_type": user_type,
            "query": query,
            "success": success,
            "response_time_ms": response_time,
            "matched_case_id": matched_case_id,
            "error_message": error_message,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "hour": datetime.utcnow().hour
        }
        logs_collection.insert_one(log_entry)
        return True
    except Exception as e:
        print(f"Failed to log interaction: {e}")
        return False


def get_dashboard_stats():
    """
    Get overall statistics for the dashboard
    Returns: dict with total queries, success rate, etc.
    """
    try:
        now = datetime.utcnow()
        today = now.strftime("%Y-%m-%d")
        week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        month_ago = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        
        # Total queries
        total_queries = logs_collection.count_documents({})
        
        # Today's queries
        today_queries = logs_collection.count_documents({"date": today})
        
        # This week's queries
        week_queries = logs_collection.count_documents({"date": {"$gte": week_ago}})
        
        # This month's queries
        month_queries = logs_collection.count_documents({"date": {"$gte": month_ago}})
        
        # Success rate
        successful = logs_collection.count_documents({"success": True})
        success_rate = (successful / total_queries * 100) if total_queries > 0 else 0
        
        # Average response time
        pipeline = [
            {"$match": {"response_time_ms": {"$ne": None}}},
            {"$group": {"_id": None, "avg_time": {"$avg": "$response_time_ms"}}}
        ]
        avg_result = list(logs_collection.aggregate(pipeline))
        avg_response_time = avg_result[0]["avg_time"] if avg_result else 0
        
        # User type breakdown
        user_type_pipeline = [
            {"$group": {"_id": "$user_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        user_types = list(logs_collection.aggregate(user_type_pipeline))
        
        return {
            "total_queries": total_queries,
            "today_queries": today_queries,
            "week_queries": week_queries,
            "month_queries": month_queries,
            "success_rate": round(success_rate, 2),
            "avg_response_time_ms": round(avg_response_time, 2),
            "user_type_breakdown": user_types
        }
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return {
            "total_queries": 0,
            "today_queries": 0,
            "week_queries": 0,
            "month_queries": 0,
            "success_rate": 0,
            "avg_response_time_ms": 0,
            "user_type_breakdown": []
        }


def get_recent_queries(limit=10):
    """
    Get recent queries with their results
    Args:
        limit: Number of recent queries to return
    Returns: list of recent query logs
    """
    try:
        queries = list(logs_collection.find(
            {},
            {
                "_id": 0,
                "timestamp": 1,
                "user_type": 1,
                "query": 1,
                "success": 1,
                "matched_case_id": 1,
                "response_time_ms": 1
            }
        ).sort("timestamp", DESCENDING).limit(limit))
        
        # Convert datetime to string for JSON serialization
        for q in queries:
            if "timestamp" in q:
                q["timestamp"] = q["timestamp"].isoformat()
        
        return queries
    except Exception as e:
        print(f"Error getting recent queries: {e}")
        return []


def get_popular_queries(limit=10):
    """
    Get most common queries
    Args:
        limit: Number of popular queries to return
    Returns: list of popular queries with counts
    """
    try:
        pipeline = [
            {"$group": {"_id": "$query", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit},
            {"$project": {"_id": 0, "query": "$_id", "count": 1}}
        ]
        return list(logs_collection.aggregate(pipeline))
    except Exception as e:
        print(f"Error getting popular queries: {e}")
        return []


def get_hourly_activity():
    """
    Get activity breakdown by hour for today
    Returns: list of activity counts per hour
    """
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        pipeline = [
            {"$match": {"date": today}},
            {"$group": {"_id": "$hour", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}},
            {"$project": {"_id": 0, "hour": "$_id", "count": 1}}
        ]
        
        hourly_data = list(logs_collection.aggregate(pipeline))
        
        # Fill in missing hours with 0
        result = []
        hour_map = {item["hour"]: item["count"] for item in hourly_data}
        for hour in range(24):
            result.append({"hour": hour, "count": hour_map.get(hour, 0)})
        
        return result
    except Exception as e:
        print(f"Error getting hourly activity: {e}")
        return []


def get_daily_trends(days=7):
    """
    Get daily query trends for the past N days
    Args:
        days: Number of days to get trends for
    Returns: list of daily counts
    """
    try:
        start_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        
        pipeline = [
            {"$match": {"date": {"$gte": start_date}}},
            {"$group": {"_id": "$date", "total": {"$sum": 1}, "successful": {"$sum": {"$cond": ["$success", 1, 0]}}}},
            {"$sort": {"_id": 1}},
            {"$project": {"_id": 0, "date": "$_id", "total": 1, "successful": 1}}
        ]
        
        return list(logs_collection.aggregate(pipeline))
    except Exception as e:
        print(f"Error getting daily trends: {e}")
        return []
