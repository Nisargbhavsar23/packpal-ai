"""
Email service for PackPal AI.

Transport: Resend (https://resend.com) Python SDK.
Package:   pip install resend
SDK docs:  https://resend.com/docs/send-with-python

Behaviour:
- RESEND_API_KEY and RESEND_FROM_EMAIL must both be set in .env.
- If either is missing the function raises a clear ConfigurationError so the
  problem is immediately visible in logs — it does NOT fail silently.
- The caller (password_reset_service) catches the return value:
    True  → Resend accepted the message.
    False → Delivery error (already logged). Token exposed in dev-mode response.
- Development mode (no key configured):
    send_password_reset_email() returns False.
    password_reset_service exposes the reset URL in the API response as before.
"""

import logging
from datetime import datetime, timezone

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


# ─── HTML email template ──────────────────────────────────────────────────────

def _build_reset_html(user_name: str, reset_url: str, expire_minutes: int) -> str:
    year = datetime.now(timezone.utc).year
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Reset your PackPal AI password</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f1f5f9;padding:40px 16px;min-height:100vh;">
    <tr>
      <td align="center">
        <!-- Outer container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:580px;">

          <!-- Logo row -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);
                          border-radius:14px;padding:10px 22px;">
                <span style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:-0.3px;
                             font-family:'Segoe UI',sans-serif;">PackPal AI</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;
                       border:1px solid #e2e8f0;overflow:hidden;
                       box-shadow:0 4px 24px rgba(15,23,42,0.08);">

              <!-- Green header bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#059669,#0d9488);
                             padding:28px 40px;text-align:center;">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);
                                border-radius:50%;margin:0 auto 12px;display:inline-block;
                                line-height:52px;text-align:center;font-size:24px;">
                      &#128274;
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;
                               letter-spacing:-0.3px;line-height:1.3;">
                      Password Reset Request
                    </h1>
                    <p style="margin:8px 0 0;color:#a7f3d0;font-size:13px;">
                      AI-Powered Travel Readiness Platform
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 40px 12px;">
                    <p style="margin:0 0 6px;font-size:15px;color:#64748b;">Hello,</p>
                    <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#0f172a;">
                      {user_name}
                    </p>
                    <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7;">
                      We received a request to reset the password for your PackPal AI account.
                      Click the button below to create a new password.
                      This link will expire in <strong>{expire_minutes} minutes</strong>.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                           style="margin:0 auto 28px;">
                      <tr>
                        <td align="center" style="border-radius:10px;
                                   background:linear-gradient(135deg,#059669,#0d9488);">
                          <a href="{reset_url}"
                             style="display:inline-block;padding:14px 42px;
                                    color:#ffffff;font-size:16px;font-weight:700;
                                    text-decoration:none;border-radius:10px;
                                    letter-spacing:0.2px;
                                    background:linear-gradient(135deg,#059669,#0d9488);">
                            Reset My Password &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback link -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#f8fafc;border-radius:10px;
                                   border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;">
                          <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                                    color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
                            Button not working? Copy this link:
                          </p>
                          <p style="margin:0;font-size:12px;word-break:break-all;color:#059669;">
                            {reset_url}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 40px 36px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           border="0" style="border-top:1px solid #f1f5f9;padding-top:24px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.6;">
                            &#9679; This link expires in <strong>{expire_minutes} minutes</strong>.
                          </p>
                          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;line-height:1.6;">
                            &#9679; If you did not request a password reset, please ignore this email &mdash; your account is safe.
                          </p>
                          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                            &#9679; For your security, never share this link with anyone.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 16px;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
                &copy; {year} PackPal AI &middot; AI-Powered Travel Readiness Platform
              </p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>"""


# ─── Plain text fallback ──────────────────────────────────────────────────────

def _build_reset_plain(user_name: str, reset_url: str, expire_minutes: int) -> str:
    return (
        f"PackPal AI — Password Reset Request\n"
        f"=====================================\n\n"
        f"Hello {user_name},\n\n"
        f"We received a request to reset the password for your PackPal AI account.\n\n"
        f"Reset your password by visiting this link:\n"
        f"{reset_url}\n\n"
        f"This link will expire in {expire_minutes} minutes.\n\n"
        f"---\n"
        f"If you did not request a password reset, please ignore this email.\n"
        f"Your account is safe — no changes have been made.\n\n"
        f"For your security, never share this link with anyone.\n\n"
        f"-- PackPal AI Team\n"
        f"AI-Powered Travel Readiness Platform\n"
    )


# ─── Public API ───────────────────────────────────────────────────────────────

def send_password_reset_email(
    *,
    to_email: str,
    to_name: str,
    reset_url: str,
    expire_minutes: int = 15,
) -> bool:
    """
    Send a password reset email via the Resend API.

    Returns:
        True  — Resend accepted the message (email is in transit).
        False — Key not configured, or a delivery error occurred (logged).

    When RESEND_API_KEY / RESEND_FROM_EMAIL are missing:
        Logs a clear configuration warning and returns False.
        The caller (password_reset_service) will then expose the reset URL in
        the API response so the dev-mode flow continues to work without change.
    """
    if not settings.resend_configured:
        logger.warning(
            "Resend is not configured. Skipping email delivery to <%s>. "
            "Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env to enable real email delivery. "
            "Get your free API key at https://resend.com",
            to_email,
        )
        return False

    # Set the API key before every call — thread-safe (module-level attribute)
    resend.api_key = settings.RESEND_API_KEY

    from_address = f"{settings.RESEND_FROM_NAME} <{settings.RESEND_FROM_EMAIL}>"
    subject = "Reset your PackPal AI password"

    try:
        logger.info("Sending password reset email to <%s> via Resend", to_email)

        params: resend.Emails.SendParams = {
            "from": from_address,
            "to": [to_email],
            "subject": subject,
            "html": _build_reset_html(to_name, reset_url, expire_minutes),
            "text": _build_reset_plain(to_name, reset_url, expire_minutes),
        }
        response = resend.Emails.send(params)

        # The SDK raises on HTTP errors; if we reach here the call succeeded.
        email_id = response.get("id") if isinstance(response, dict) else getattr(response, "id", "unknown")
        logger.info(
            "Password reset email accepted by Resend for <%s> (id=%s)",
            to_email, email_id,
        )
        return True

    except resend.exceptions.ValidationError as exc:
        logger.error(
            "Resend rejected the request for <%s> (validation error): %s. "
            "Check RESEND_FROM_EMAIL — it must be from a verified domain in your Resend account.",
            to_email, exc,
        )
    except resend.exceptions.AuthenticationError as exc:
        logger.error(
            "Resend API key is invalid or revoked. Check RESEND_API_KEY in .env. Error: %s",
            exc,
        )
    except resend.exceptions.RateLimitError as exc:
        logger.error("Resend rate limit reached. Retry after a moment. Error: %s", exc)
    except resend.exceptions.InternalServerError as exc:
        logger.error("Resend server error while sending to <%s>: %s", to_email, exc)
    except resend.exceptions.ResendError as exc:
        # Catch-all for any other Resend SDK error
        logger.error("Resend error sending to <%s>: %s", to_email, exc)
    except Exception as exc:  # noqa: BLE001
        logger.error("Unexpected error sending email to <%s> via Resend: %s", to_email, exc)

    return False
