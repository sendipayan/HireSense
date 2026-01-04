export function template(otp: string) {
  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="padding:22px 24px 10px 24px;">
                <h2 style="margin:0;color:#111;font-size:20px;font-weight:700;">
                  Your verification code
                </h2>
                <p style="margin:10px 0 0 0;color:#555;font-size:14px;line-height:20px;">
                  Use the code below to complete your verification.  
                  This code helps us confirm it is really you.
                </p>
              </td>
            </tr>

            <!-- OTP Box -->
            <tr>
              <td align="center" style="padding:18px 24px;">
                <div style="
                  background:#f1f5ff;
                  border:1px solid #d9e3ff;
                  border-radius:8px;
                  padding:14px 18px;
                  display:inline-block;
                ">
                  <span style="font-size:28px;letter-spacing:6px;font-weight:700;color:#1e3a8a;">
                    ${otp}
                  </span>
                </div>
                <p style="margin:10px 0 0 0;font-size:12px;color:#666;">
                  Expires in 5 minutes
                </p>
              </td>
            </tr>

            <!-- Security Note -->
            <tr>
              <td style="padding:0 24px 20px 24px;">
                <p style="color:#444;font-size:13px;line-height:19px;margin:0;">
                  Do not share this code with anyone. We will never ask you for it
                  over phone or chat. If you did not request this verification,
                  you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:14px 24px 18px 24px;color:#999;font-size:11px;text-align:center;">
                This message was sent automatically. Replies are not monitored.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`;
}
