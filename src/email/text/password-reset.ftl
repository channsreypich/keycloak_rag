<#ftl output_format="plainText">
<#-- Plain text version of the password reset email. -->
${msg("ragstudioResetTitle")}

<#if (user.firstName)?has_content>${msg("ragstudioResetGreeting", user.firstName)}<#else>${msg("ragstudioResetGreetingNoName")}</#if>

${msg("ragstudioResetButton")}:
${link}

${msg("ragstudioExpires", linkExpirationFormatter(linkExpiration))} · ${msg("ragstudioSingleUse")}

${msg("ragstudioResetIgnore")}

--
${msg("ragstudioHelp")}: ${msg("ragstudioHelpUrl")}
${msg("ragstudioAddress")}
