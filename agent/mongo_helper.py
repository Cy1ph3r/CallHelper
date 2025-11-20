# -*- coding: utf-8 -*-
"""
agent/mongo_helper.py
MongoDB helper functions for CRUD operations on the CallHelper database.
"""

import os
import logging
from typing import Dict, Any, List, Optional
from pymongo import MongoClient
from pymongo.collection import Collection
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Configuration with environment variable support
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "callhelper_db")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION", "umrah_cases")


def get_collection() -> Collection:
    """Get the MongoDB collection for cases."""
    try:
        client = MongoClient(MONGO_URI)
        return client[DB_NAME][COLLECTION_NAME]
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


def get_all_cases() -> List[Dict[str, Any]]:
    """Retrieve all cases, sorted by CaseID."""
    try:
        coll = get_collection()
        return list(coll.find({}).sort("CaseID", 1))
    except Exception as e:
        logger.error(f"Failed to retrieve all cases: {e}")
        return []


def get_case_by_id(case_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single case by its CaseID."""
    try:
        coll = get_collection()
        return coll.find_one({"CaseID": case_id})
    except Exception as e:
        logger.error(f"Failed to retrieve case {case_id}: {e}")
        return None


def insert_case(case_data: Dict[str, Any]):
    """Insert a new case into the database."""
    try:
        coll = get_collection()
        # Ensure LastUpdated is set
        if "LastUpdated" not in case_data or case_data["LastUpdated"] is None:
            case_data["LastUpdated"] = datetime.now(timezone.utc)
        result = coll.insert_one(case_data)
        logger.info(f"Inserted case {case_data.get('CaseID')}")
        return result
    except Exception as e:
        logger.error(f"Failed to insert case: {e}")
        raise


def update_case(case_id: str, case_data: Dict[str, Any]):
    """Update an existing case by its CaseID."""
    try:
        coll = get_collection()
        # Update LastUpdated timestamp
        case_data["LastUpdated"] = datetime.now(timezone.utc)
        result = coll.update_one({"CaseID": case_id}, {"$set": case_data}, upsert=False)
        logger.info(f"Updated case {case_id}")
        return result
    except Exception as e:
        logger.error(f"Failed to update case {case_id}: {e}")
        raise


def delete_case(case_id: str):
    """Delete a case by its CaseID."""
    try:
        coll = get_collection()
        result = coll.delete_one({"CaseID": case_id})
        logger.info(f"Deleted case {case_id}")
        return result
    except Exception as e:
        logger.error(f"Failed to delete case {case_id}: {e}")
        raise
