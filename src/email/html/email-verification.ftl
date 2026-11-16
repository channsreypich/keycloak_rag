<#ftl output_format="HTML">
<#import "ragstudio-layout.ftl" as layout>
<#-- Sent when a new account must verify its email, and by the web app after an email change. -->
<@layout.emailLayout hero="hero-mail.png"; part>
<#if part == "body">
  <h1 class="rs-title" style="margin:0 0 10px;font-size:32px;line-height:38px;font-weight:800;color:#111111;">${msg("ragstudioVerifyTitle")}</h1>
  <p class="rs-lead" style="margin:0 0 28px;font-size:17px;line-height:26px;color:#555555;">
    <#if (user.firstName)?has_content>${msg("ragstudioVerifyGreeting", user.firstName)}<#else>${msg("ragstudioVerifyGreetingNoName")}</#if>
  </p>
  <@layout.button href=link label=msg("ragstudioVerifyButton") />
  <@layout.linkChips expires=linkExpirationFormatter(linkExpiration) />
<#else>
  ${msg("ragstudioVerifyIgnore")}
</#if>
</@layout.emailLayout>
