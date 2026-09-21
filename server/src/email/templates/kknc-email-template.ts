/**
 * KKNC Solutions Email Template Engine
 * 
 * Generates email-safe HTML using table-based layouts and inline CSS.
 * Supports automatic light/dark mode via @media (prefers-color-scheme: dark).
 * Light theme is the default; dark theme activates on dark-mode devices.
 * 
 * Compatible with: Gmail, Outlook, Apple Mail, Yahoo Mail, mobile clients.
 */

export interface EmailTemplateData {
  subject: string;
  body: string;
  senderName?: string;
  cta?: {
    enabled: boolean;
    text?: string;
    url?: string;
  };
  logoSrc: string;
  companyName?: string;
  websiteUrl?: string;
  contactEmail?: string;
  phoneNumbers?: string[];
}

// ─── Color System ──────────────────────────────────────────────────────────────

const LIGHT = {
  bg: '#F7F3EA',
  card: '#FFFDF8',
  gold: '#B47A32',
  goldHover: '#9A6828',
  text: '#302D29',
  textSecondary: '#6D675E',
  border: '#E5DED1',
  divider: '#D4C9B8',
  footerBg: '#F0EBE1',
  footerText: '#8A8379',
};

const DARK = {
  bg: '#0B0B0B',
  card: '#111111',
  gold: '#B9863D',
  goldHover: '#C28E45',
  text: '#F4F0E8',
  textSecondary: '#AAA49A',
  border: '#2A2A2A',
  divider: '#333333',
  footerBg: '#0A0A0A',
  footerText: '#777069',
};

// ─── Template Generator ────────────────────────────────────────────────────────

export function generateEmailHTML(data: EmailTemplateData): string {
  const {
    subject,
    body,
    senderName,
    cta,
    logoSrc,
    companyName = 'KKNC Solutions',
    websiteUrl = 'https://kkncsolutions.dev',
    contactEmail = 'kkncsolutions@gmail.com',
    phoneNumbers = ['+91 9156544002', '+91 9699449842', '+91 8767812762'],
  } = data;

  const year = new Date().getFullYear();
  const displaySender = senderName || 'KKNC Solutions';

  // Build the CTA button HTML (Outlook VML + standard)
  const ctaHtml = cta?.enabled && cta?.text && cta?.url ? `
    <tr>
      <td style="padding: 32px 0 8px 0;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="border-radius: 6px; background-color: ${LIGHT.gold};" class="cta-cell">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(cta.url)}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="13%" strokecolor="${LIGHT.gold}" fillcolor="${LIGHT.gold}">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;">
              ${escapeHtml(cta.text)}
              </center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${escapeHtml(cta.url)}" target="_blank" style="display: inline-block; padding: 14px 36px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff; background-color: ${LIGHT.gold}; border-radius: 6px; text-decoration: none; text-align: center; mso-padding-alt: 0; line-height: 1.2;" class="cta-button">
                ${escapeHtml(cta.text)}
              </a>
              <!--<![endif]-->
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';

  const phoneHtml = phoneNumbers.map(p => 
    `<span style="color: ${LIGHT.footerText}; white-space: nowrap;" class="footer-text">${escapeHtml(p)}</span>`
  ).join('&nbsp;&nbsp;&bull;&nbsp;&nbsp;');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }

    /* iOS blue links */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    /* Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
      .stack-column { display: block !important; width: 100% !important; }
    }

    /* ─── Dark Mode ─────────────────────────────────────────────── */
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: ${DARK.bg} !important; }
      .email-card { background-color: ${DARK.card} !important; border-color: ${DARK.border} !important; }
      .email-header { border-bottom-color: ${DARK.border} !important; }
      .email-title { color: ${DARK.text} !important; }
      .email-text { color: ${DARK.text} !important; }
      .email-text-secondary { color: ${DARK.textSecondary} !important; }
      .email-divider { border-color: ${DARK.divider} !important; }
      .email-footer { background-color: ${DARK.footerBg} !important; border-color: ${DARK.border} !important; }
      .footer-text { color: ${DARK.footerText} !important; }
      .footer-link { color: ${DARK.gold} !important; }
      .cta-cell { background-color: ${DARK.gold} !important; }
      .cta-button { background-color: ${DARK.gold} !important; }
      .gold-text { color: ${DARK.gold} !important; }
      .gold-divider { border-color: ${DARK.gold} !important; }

      /* Gmail Android dark mode */
      u ~ div .email-body { background-color: ${DARK.bg} !important; }
      u ~ div .email-card { background-color: ${DARK.card} !important; }
      u ~ div .email-title { color: ${DARK.text} !important; }
      u ~ div .email-text { color: ${DARK.text} !important; }

      /* Outlook.com dark mode */
      [data-ogsc] .email-body { background-color: ${DARK.bg} !important; }
      [data-ogsc] .email-card { background-color: ${DARK.card} !important; }
      [data-ogsc] .email-title { color: ${DARK.text} !important; }
      [data-ogsc] .email-text { color: ${DARK.text} !important; }
      [data-ogsc] .email-text-secondary { color: ${DARK.textSecondary} !important; }
      [data-ogsc] .email-footer { background-color: ${DARK.footerBg} !important; }
      [data-ogsc] .footer-text { color: ${DARK.footerText} !important; }
      [data-ogsb] .email-body { background-color: ${DARK.bg} !important; }
      [data-ogsb] .email-card { background-color: ${DARK.card} !important; }
    }

    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; word-spacing: normal; background-color: ${LIGHT.bg};" class="email-body">
  <div role="article" aria-roledescription="email" aria-label="${escapeHtml(subject)}" lang="en" style="font-size: 16px; font-size: 1rem; font-size: max(16px, 1rem);">

    <!-- Visually Hidden Preheader -->
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
      ${escapeHtml(subject)} — ${companyName}
      ${'&zwnj;&nbsp;'.repeat(40)}
    </div>

    <!-- Outer Wrapper -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${LIGHT.bg};" class="email-body">
      <tr>
        <td align="center" valign="top" style="padding: 32px 16px;">

          <!-- Email Container -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; margin: 0 auto;">

            <!-- ═══════════════════ HEADER ═══════════════════ -->
            <tr>
              <td style="background-color: ${LIGHT.card}; border: 1px solid ${LIGHT.border}; border-bottom: none; border-radius: 12px 12px 0 0; padding: 36px 40px 28px 40px; text-align: center;" class="email-card email-header email-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding-bottom: 16px;">
                      <img src="${escapeHtml(logoSrc)}" alt="${companyName}" width="64" height="64" style="display: block; width: 64px; height: 64px; margin: 0 auto; border: 0;">
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 16px; font-weight: 400; letter-spacing: 4px; color: ${LIGHT.gold}; text-transform: uppercase; padding-bottom: 4px;" class="gold-text">
                      KKNC SOLUTIONS
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 400; letter-spacing: 2px; color: ${LIGHT.textSecondary}; text-transform: uppercase;" class="email-text-secondary">
                      Software &bull; Design &bull; Intelligence
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Gold Accent Line -->
            <tr>
              <td style="background-color: ${LIGHT.card}; border-left: 1px solid ${LIGHT.border}; border-right: 1px solid ${LIGHT.border}; padding: 0 40px;" class="email-card email-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="border-top: 2px solid ${LIGHT.gold}; font-size: 0; line-height: 0;" class="gold-divider">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ═══════════════════ BODY ═══════════════════ -->
            <tr>
              <td style="background-color: ${LIGHT.card}; border-left: 1px solid ${LIGHT.border}; border-right: 1px solid ${LIGHT.border}; padding: 32px 40px 24px 40px;" class="email-card email-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">

                  <!-- Subject / Title -->
                  <tr>
                    <td style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 24px; font-weight: 400; line-height: 1.35; color: ${LIGHT.text}; padding-bottom: 28px;" class="email-title">
                      ${escapeHtml(subject)}
                    </td>
                  </tr>

                  <!-- Email Body Content -->
                  <tr>
                    <td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: ${LIGHT.text};" class="email-text">
                      ${body}
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  ${ctaHtml}

                </table>
              </td>
            </tr>

            <!-- ═══════════════════ SIGNATURE ═══════════════════ -->
            <tr>
              <td style="background-color: ${LIGHT.card}; border-left: 1px solid ${LIGHT.border}; border-right: 1px solid ${LIGHT.border}; padding: 16px 40px 36px 40px;" class="email-card email-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="border-top: 1px solid ${LIGHT.border}; padding-top: 24px;" class="email-divider">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: ${LIGHT.textSecondary};" class="email-text-secondary">
                            Regards,
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 16px; font-weight: 400; color: ${LIGHT.text}; padding-top: 6px;" class="email-text">
                            ${escapeHtml(displaySender)}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${LIGHT.gold}; padding-top: 2px;" class="gold-text">
                            ${escapeHtml(companyName)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ═══════════════════ FOOTER ═══════════════════ -->
            <tr>
              <td style="background-color: ${LIGHT.footerBg}; border: 1px solid ${LIGHT.border}; border-top: none; border-radius: 0 0 12px 12px; padding: 28px 40px 32px 40px; text-align: center;" class="email-footer email-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 14px; letter-spacing: 2px; color: ${LIGHT.gold}; text-transform: uppercase; padding-bottom: 12px;" class="gold-text">
                      ${escapeHtml(companyName)}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 10px;">
                      <a href="${escapeHtml(websiteUrl)}" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${LIGHT.gold}; text-decoration: none;" class="footer-link">
                        ${escapeHtml(websiteUrl.replace('https://', ''))}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 10px;">
                      <a href="mailto:${escapeHtml(contactEmail)}" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: ${LIGHT.footerText}; text-decoration: none;" class="footer-text">
                        ${escapeHtml(contactEmail)}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding-bottom: 16px;">
                      ${phoneHtml}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="border-top: 1px solid ${LIGHT.border}; font-size: 0; line-height: 0;" class="email-divider">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: ${LIGHT.footerText}; line-height: 1.5;" class="footer-text">
                      &copy; ${year} ${escapeHtml(companyName)}. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
          <!-- /Email Container -->

        </td>
      </tr>
    </table>
    <!-- /Outer Wrapper -->

  </div>
</body>
</html>`;
}

// ─── Utility ───────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
