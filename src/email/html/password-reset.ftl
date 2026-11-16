<#ftl output_format="HTML">
<#import "ragstudio-layout.ftl" as layout>
<#-- Sent by "Forgot password?" on the sign in page. -->
<@layout.emailLayout hero="hero-key.png"; part>
<#if part == "body">
  <h1 class="rs-title" style="margin:0 0 10px;font-size:32px;line-height:38px;font-weight:800;color:#111111;">${msg("ragstudioResetTitle")}</h1>
  <p class="rs-lead" style="margin:0 0 28px;font-size:17px;line-height:26px;color:#555555;">
    <#if (user.firstName)?has_content>${msg("ragstudioResetGreeting", user.firstName)}<#else>${msg("ragstudioResetGreetingNoName")}</#if>
  </p>
  <@layout.button href=link label=msg("ragstudioResetButton") />
  <@layout.linkChips expires=linkExpirationFormatter(linkExpiration) />
<#else>
  ${msg("ragstudioResetIgnore")}
</#if>
</@layout.emailLayout>
