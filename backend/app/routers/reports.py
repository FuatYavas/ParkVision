from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import Report, User, ReportType
from app.schemas import ReportCreate, ReportRead
from app.routers.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    report = Report(
        user_id=current_user.id,
        parking_lot_id=report_in.parking_lot_id,
        spot_id=report_in.spot_id,
        report_type=report_in.report_type,
        is_verified=False # Requires verification logic or admin approval
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

@router.get("/", response_model=List[ReportRead])
def read_reports(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    reports = session.exec(select(Report).offset(skip).limit(limit)).all()
    return reports

@router.post("/{report_id}/verify")
def verify_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # In a real app, this would be more complex (e.g. voting system)
    # For now, let's assume any user can "verify" (or maybe just admin)
    report = session.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.is_verified = True
    session.add(report)
    session.commit()
    return {"status": "verified"}
