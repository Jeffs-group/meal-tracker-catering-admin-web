import React, { useState } from "react";
import { Drawer, Button } from "@/components/ui";
import { QrCodeSvg } from "@/components/ui/QrCodeSvg";
import { RejectRegistrationModal } from "./RejectRegistrationModal";
import { RevokePassModal } from "./RevokePassModal";
import {
  ShieldCheck,
  XCircle,
  QrCode,
  AlertTriangle,
  Paperclip,
  Camera,
  Mail,
  Download,
  Lock,
  Info,
  RotateCcw,
  MinusCircle,
  CheckCircle,
} from "lucide-react";
import { formatDateTimeIST } from "@/utils/formatDate";
import {
  useRegistrantDetail,
  useApproveRegistrant,
  useRejectRegistrant,
  useRevokeApproval,
  useReopenVerification,
  useResendPasscode,
} from "@/hooks";

export interface RegistrantReviewModalProps {
  registrantId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrantReviewModal: React.FC<RegistrantReviewModalProps> = ({
  registrantId,
  isOpen,
  onClose,
}) => {
  const { data: detail, isLoading } = useRegistrantDetail(registrantId);
  const approveMutation = useApproveRegistrant();
  const rejectMutation = useRejectRegistrant();
  const revokeMutation = useRevokeApproval();
  const reopenMutation = useReopenVerification();
  const resendMutation = useResendPasscode();

  const [notification, setNotification] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  if (!isOpen) return null;

  const showNotificationMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDownloadBadge = () => {
    if (!detail) return;
    const regId = detail.accreditation?.registrantId || detail.registrantId;

    const badgeContent = `
========================================
JEFFS GROUP - MEAL TRACKER ACCREDITATION
========================================
REGISTRANT: ${detail.fullName}
ROLE: ${detail.roleTitle}
REGISTRANT ID: ${regId}
FRANCHISE / DIVISION: ${detail.attributes.franchiseAndDivision}
CONTACT: ${detail.attributes.contactNumber}
EMAIL: ${detail.attributes.emailAddress}
MEAL PREFERENCE: ${detail.attributes.mealPreference}
STATUS: ${detail.status} (Active QR Access)
ISSUED: ${detail.verifiedAt || "03 Nov 2026, 14:30 IST"}
========================================
Scan QR code at venue catering gates.
`;

    const blob = new Blob([badgeContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Accreditation_Badge_${regId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotificationMsg("Accreditation Badge downloaded successfully!");
  };

  const handleResendEmail = async () => {
    if (!detail) return;
    try {
      await resendMutation.mutateAsync(detail.id);
      showNotificationMsg(
        `Digital accreditation email resent to ${detail.attributes.emailAddress}`,
      );
    } catch {
      showNotificationMsg("Failed to resend accreditation email.");
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    try {
      await approveMutation.mutateAsync(detail.id);
      showNotificationMsg("Registrant approved successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReject = async (
    category: string,
    remarks: string,
    sendEmail: boolean,
  ) => {
    if (!detail) return;
    try {
      await rejectMutation.mutateAsync({
        id: detail.id,
        reason: `${category}: ${remarks}`,
      });
      setIsRejectModalOpen(false);
      showNotificationMsg(
        sendEmail
          ? `Application rejected and notification dispatched to ${detail.attributes.emailAddress}.`
          : "Application rejected.",
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmRevoke = async (reason: string, notes: string) => {
    if (!detail) return;
    try {
      await revokeMutation.mutateAsync({
        id: detail.id,
        reason: `${reason}${notes ? ` - ${notes}` : ""}`,
      });
      setIsRevokeModalOpen(false);
      showNotificationMsg(
        "Accreditation pass revoked and catering gates access deactivated.",
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReopen = async () => {
    if (!detail) return;
    try {
      await reopenMutation.mutateAsync(detail.id);
      showNotificationMsg(
        "Application re-opened for re-evaluation and verification.",
      );
    } catch (err) {
      console.error(err);
    }
  };

  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    revokeMutation.isPending ||
    reopenMutation.isPending;

  const registrantDisplayId =
    detail?.accreditation?.registrantId ||
    detail?.registrantId ||
    "CK-2026-099";
  const qrPayload =
    detail?.accreditation?.qrValue || `${registrantDisplayId}|MEAL_PASS`;

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        width="w-full max-w-full sm:max-w-[460px] md:max-w-[480px]"
        headerIndicator={
          detail?.status === "APPROVED" ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-50 border border-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227]" />
            </span>
          ) : undefined
        }
        title="Registrant Details"
        subtitle={
          detail ? (
            detail.status === "APPROVED" ? (
              <span>
                {detail.applicationId} • Verified on{" "}
                {detail.verifiedAt || "03 Nov 2026, 14:30 IST"}
              </span>
            ) : detail.status === "REJECTED" ? (
              <span>
                Application ID: {detail.applicationId} • Logged on{" "}
                {formatDateTimeIST(detail.submittedAt)}
              </span>
            ) : (
              <span>
                Application ID: {detail.applicationId} • Submitted on{" "}
                {formatDateTimeIST(detail.submittedAt)}
              </span>
            )
          ) : null
        }
        footer={
          detail ? (
            <div className="flex flex-col gap-2.5">
              {/* Notification alert banner */}
              {notification && (
                <div className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs flex items-center justify-between animate-in fade-in">
                  <span>{notification}</span>
                  <button
                    type="button"
                    onClick={() => setNotification(null)}
                    className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {detail.status === "APPROVED" ? (
                /* Approved Footer */
                <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 px-3.5 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 rounded-lg flex-1 sm:flex-initial"
                  >
                    Close Drawer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRevokeModalOpen(true)}
                    disabled={isMutating}
                    className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-300 hover:bg-rose-50 hover:text-rose-700 rounded-lg flex-1 sm:flex-initial"
                    leftIcon={<MinusCircle className="h-3.5 w-3.5 text-rose-600" />}
                  >
                    Revoke Approval / Deactivate Pass
                  </Button>
                </div>
              ) : detail.status === "REJECTED" ? (
                /* Rejected Footer */
                <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 px-3.5 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 rounded-lg flex-1 sm:flex-initial"
                  >
                    Close Drawer
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReopen}
                    isLoading={reopenMutation.isPending}
                    disabled={isMutating}
                    className="h-8 px-4 text-xs font-semibold shadow-xs rounded-lg flex-1 sm:flex-initial"
                    leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  >
                    Re-Open & Re-Verify
                  </Button>
                </div>
              ) : (
                /* Pending Footer */
                <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="h-8 px-3.5 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 rounded-lg flex-1 sm:flex-initial"
                  >
                    Close Drawer
                  </Button>
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRejectModalOpen(true)}
                      disabled={isMutating}
                      className="h-8 px-3 text-xs font-semibold text-rose-600 border-rose-300 hover:bg-rose-50 rounded-lg"
                      leftIcon={<XCircle className="h-3.5 w-3.5" />}
                    >
                      Reject Registration
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApprove}
                      isLoading={approveMutation.isPending}
                      disabled={isMutating}
                      className="h-8 px-4 text-xs font-semibold shadow-xs rounded-lg"
                      leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                    >
                      Approve Registration
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null
        }
      >
        {isLoading || !detail ? (
          <div className="py-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#C9A227] border-r-transparent align-[-0.125em]" />
            <p className="mt-2 text-xs text-slate-500 font-medium">
              Loading registrant profile verification...
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* 1. TOP STATUS BANNER */}
            {detail.status === "APPROVED" ? (
              /* Approved Banner */
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        APPROVED & MEAL-ELIGIBLE
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-semibold text-emerald-800">
                        Active Access
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-emerald-700 leading-relaxed">
                      Administrative sign-off completed by{" "}
                      <strong className="font-bold text-emerald-900">
                        {detail.verifiedBy || "Alex Morgan"}
                      </strong>
                      . Digital accreditation generated and meal tokens activated
                      for tournament access.
                    </p>
                  </div>
                </div>
              </div>
            ) : detail.status === "REJECTED" ? (
              /* Rejected Banner */
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#BE123C] text-white shrink-0 mt-0.5">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                      REGISTRATION REJECTED
                    </h4>
                    <p className="mt-0.5 text-[11px] text-rose-600/90 leading-relaxed">
                      Application rejected during administrative verification.
                      Accreditation badge withheld and venue meal allotment
                      revoked until valid credentials are submitted.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Pending Banner */
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                        PENDING ADMINISTRATIVE REVIEW
                      </span>
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-semibold text-amber-800">
                        Under Review
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-amber-800 leading-relaxed">
                      Application documents and identity credentials require
                      verification before catering accreditation can be issued.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RECORDED REJECTION REASON (When REJECTED) */}
            {detail.status === "REJECTED" && (
              <div className="rounded-lg border border-rose-100 bg-[#FFF5F5] p-3">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>RECORDED REJECTION REASON</span>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    PRIMARY CATEGORY
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-slate-900">
                    {detail.rejectionInfo?.primaryCategory ||
                      "Incompatible / Blurry Photo Identification"}
                  </p>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    ADMIN REMARKS & FINDINGS
                  </span>
                  <div className="mt-1 rounded-md border border-rose-100 bg-white p-2 text-[11px] text-slate-700 leading-relaxed shadow-2xs">
                    &ldquo;
                    {detail.rejectionInfo?.adminRemarks ||
                      detail.rejectionReason ||
                      "Uploaded portrait does not comply with official accreditation criteria (photo resolution < 600px and face partially obscured). Government ID name does not match submitted name."}
                    &rdquo;
                  </div>
                </div>
              </div>
            )}

            {/* 3. APPLICANT PHOTO CARD (Proportionate compact avatar) */}
            <div className="rounded-lg border border-slate-100 bg-[#F8F9FA] p-3">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                APPLICANT PHOTO
              </h5>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
                  <img
                    src={detail.photo.previewUrl}
                    alt={detail.fullName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {detail.fullName}
                  </h4>
                  <p className="text-xs font-semibold text-[#9B7415] mt-0.5">
                    {detail.roleTitle}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1 truncate">
                      <Paperclip className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>
                        {detail.photo.fileName} • {detail.photo.fileSize}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <Camera className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{detail.photo.dimensions}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PROFILE ATTRIBUTES GRID */}
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                PROFILE ATTRIBUTES
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-100/90 bg-[#F8F9FA] p-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Franchise & Division
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {detail.attributes.franchiseAndDivision}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100/90 bg-[#F8F9FA] p-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Registrant Type
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {detail.attributes.registrantTypeLabel}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100/90 bg-[#F8F9FA] p-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Contact Number
                  </span>
                  <p className="mt-0.5 font-mono text-xs font-bold text-slate-900 truncate">
                    {detail.attributes.contactNumber}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100/90 bg-[#F8F9FA] p-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Email Address
                  </span>
                  <p className="mt-0.5 font-mono text-xs font-bold text-slate-900 truncate">
                    {detail.attributes.emailAddress}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100/90 bg-[#F8F9FA] p-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Meal Preferred
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {detail.attributes.mealPreference}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100/90 bg-[#F8F9FA] p-2.5">
                  <span className="text-[10px] font-medium text-slate-400 block">
                    Date of Birth
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {detail.attributes.dateOfBirth}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. ACCREDITATION & MEAL TOKEN CARD (QR CODE ONLY - PASSCODE REMOVED) */}
            <div className="rounded-lg border border-slate-100 bg-[#F8F9FA] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-[#C9A227]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                    ACCREDITATION & MEAL TOKEN
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                    detail.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      detail.status === "APPROVED"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {detail.status === "APPROVED" ? "Active QR" : "Inactive QR"}
                </span>
              </div>

              {/* Inner White Box */}
              <div className="mt-2.5 rounded-lg border border-slate-200/70 bg-white p-3 shadow-2xs">
                <div className="flex items-center gap-4">
                  {/* Visual QR Code Block */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="p-1 rounded-md border border-slate-200 bg-white shadow-2xs">
                      <QrCodeSvg
                        value={qrPayload}
                        size={76}
                        fgColor={
                          detail.status === "APPROVED" ? "#0F172A" : "#64748B"
                        }
                      />
                    </div>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-slate-400 text-center">
                      SCAN AT GATE
                    </span>
                  </div>

                  {/* Accreditation Metadata (Passcode removed) */}
                  <div className="flex-1 min-w-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        REGISTRANT ID
                      </span>
                      <p className="font-mono text-sm font-bold text-slate-900 tracking-wide mt-0.5">
                        {registrantDisplayId}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Mail className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>
                        Sent:{" "}
                        {detail.accreditation?.sentTime || "Today 14:31 IST"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inner action buttons row */}
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBadge}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="h-3 w-3 text-slate-500" />
                  <span>Download Badge PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendMutation.isPending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#9B7415] hover:bg-slate-200/50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Mail className="h-3 w-3 text-[#C9A227]" />
                  <span>Resend Email</span>
                </button>
              </div>
            </div>

            {/* 6. FOOTNOTE DISCLAIMER */}
            <div className="flex items-start gap-1.5 pt-0.5">
              {detail.status === "APPROVED" ? (
                <>
                  <Lock className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Approved records are locked from re-evaluation.
                    Administrative override required to alter.
                  </p>
                </>
              ) : detail.status === "REJECTED" ? (
                <>
                  <Info className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Applicant has been notified to re-submit updated documents.
                  </p>
                </>
              ) : (
                <>
                  <Info className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Upon approval, digital accreditation and gate pass will be
                    automatically issued to the registrant.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Reject Modal (Figma 14-9885) */}
      <RejectRegistrationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        registrant={detail || null}
        onConfirmReject={handleConfirmReject}
        isSubmitting={rejectMutation.isPending}
      />

      {/* Revoke Pass Modal (Figma 14-10053) */}
      <RevokePassModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        registrant={detail || null}
        onConfirmRevoke={handleConfirmRevoke}
        isSubmitting={revokeMutation.isPending}
      />
    </>
  );
};

export default RegistrantReviewModal;
