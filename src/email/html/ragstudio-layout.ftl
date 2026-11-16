<#ftl output_format="HTML">
<#--
  RAGStudio email frame: logo above the card; in the card a lavender hero
  image, the body and a note under a thin line; Help · Privacy under the card.

  Email clients only support old HTML: tables and inline styles, no flexbox,
  no SVG (Gmail), no CSS variables. Colors are the theme tokens from
  src/index.css, written out. Images are PNGs from this theme's resources,
  drawn by scripts/render-email-images.mjs.

  The caller gives two parts through the loop variable:
    <@layout.emailLayout hero="hero-mail.png"; part>
      <#if part == "body">...<#else>...note...</#if>
    </@layout.emailLayout>
-->
<#macro emailLayout hero>
<#assign img = url.resourcesUrl + "/img/">
<!DOCTYPE html>
<html lang="${locale.language}" dir="${(ltr)?then('ltr','rtl')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
    a { color: #4b3fd1; }
    /* Text sizes: the inline styles are the laptop sizes; phones get a
       smaller scale here (Apple Mail, Gmail app, Outlook app read this). */
    @media (max-width: 620px) {
      .rs-outer { padding: 24px 12px !important; }
      .rs-logo { width: 104px !important; height: 36px !important; }
      .rs-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .rs-body { padding-top: 28px !important; }
      .rs-title { font-size: 24px !important; line-height: 30px !important; }
      .rs-lead { font-size: 15px !important; line-height: 22px !important; margin-bottom: 22px !important; }
      .rs-btn { font-size: 15px !important; padding: 15px 20px !important; }
      .rs-chip { font-size: 12px !important; padding: 6px 10px !important; }
      .rs-note { font-size: 12px !important; line-height: 18px !important; padding-top: 20px !important; }
      .rs-foot { font-size: 12px !important; line-height: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f2f1f8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f1f8;">
  <tr>
    <td class="rs-outer" align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;font-family:Gabarito,ui-sans-serif,system-ui,'Segoe UI',Roboto,Arial,sans-serif;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding:0 0 24px;">
            <img class="rs-logo" src="${img}logo.png" width="122" height="42" alt="ragstudio" style="display:block;border:0;outline:none;">
          </td>
        </tr>

        <!-- Card. The shadow shows in Apple Mail and others; Gmail keeps the border. -->
        <tr>
          <td style="background-color:#ffffff;border:1px solid #e8e7f2;border-radius:24px;overflow:hidden;box-shadow:0 16px 40px rgba(75,63,209,0.08);">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

              <!-- Hero: one image (rings, icon, clock badge) -->
              <tr>
                <td align="center" style="background-color:#f7f6fe;border-bottom:1px solid #ecebf5;border-radius:24px 24px 0 0;overflow:hidden;">
                  <img src="${img}${hero}" width="560" height="196" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;border-radius:24px 24px 0 0;">
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td class="rs-pad rs-body" align="center" style="padding:40px 48px 0;">
                  <#nested "body">
                </td>
              </tr>

              <!-- Note under a thin line -->
              <tr>
                <td class="rs-pad" align="center" style="padding:28px 48px 32px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="rs-note" align="center" style="padding-top:24px;border-top:1px solid #ececea;font-size:14px;line-height:21px;color:#6b6b6b;">
                        <#nested "note">
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Under the card -->
        <tr>
          <td class="rs-foot" align="center" style="padding:28px 16px 0;font-size:13px;line-height:20px;color:#6b6b6b;">
            <a href="${msg("ragstudioHelpUrl")}" target="_blank" style="color:#444444;font-weight:600;text-decoration:none;">${msg("ragstudioHelp")}</a>
            <span style="color:#9a9a96;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            <a href="${msg("ragstudioPrivacyUrl")}" target="_blank" style="color:#444444;font-weight:600;text-decoration:none;">${msg("ragstudioPrivacy")}</a>
            <br>
            <span style="display:inline-block;padding-top:6px;">${msg("ragstudioAddress")}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
</#macro>

<#--
  Black pill button. A table, so Outlook keeps the black background.
-->
<#macro button href label>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" bgcolor="#0b0b0f" style="border-radius:999px;">
      <a class="rs-btn" href="${href}" target="_blank" style="display:block;padding:18px 24px;font-size:16px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${label}</a>
    </td>
  </tr>
</table>
</#macro>

<#--
  The two grey chips under the button: how long the link works (the real
  value from Keycloak's settings) and that it works once.
-->
<#macro linkChips expires>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px auto 0;">
  <tr>
    <td class="rs-chip" style="padding:7px 12px;background-color:#f0f0f4;border-radius:999px;font-size:13px;line-height:16px;font-weight:600;color:#333333;white-space:nowrap;">
      <img src="${url.resourcesUrl}/img/chip-clock.png" width="13" height="13" alt="" style="display:inline-block;vertical-align:-2px;border:0;margin-right:6px;">${msg("ragstudioExpires", expires)}
    </td>
    <td style="width:8px;font-size:0;line-height:0;">&nbsp;</td>
    <td class="rs-chip" style="padding:7px 12px;background-color:#f0f0f4;border-radius:999px;font-size:13px;line-height:16px;font-weight:600;color:#333333;white-space:nowrap;">
      <img src="${url.resourcesUrl}/img/chip-link.png" width="13" height="13" alt="" style="display:inline-block;vertical-align:-2px;border:0;margin-right:6px;">${msg("ragstudioSingleUse")}
    </td>
  </tr>
</table>
</#macro>
