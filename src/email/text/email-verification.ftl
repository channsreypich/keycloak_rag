<#ftl output_format="plainText">
<#-- Plain text version of the verification email, for clients that do not show HTML. -->
${msg("ragstudioVerifyTitle")}

<#if (user.firstName)?has_content>${msg("ragstudioVerifyGreeting", user.firstName)}<#else>${msg("ragstudioVerifyGreetingNoName")}</#if>

${msg("ragstudioVerifyButton")}:
${link}

${msg("ragstudioExpires", linkExpirationFormatter(linkExpiration))} · ${msg("ragstudioSingleUse")}

${msg("ragstudioVerifyIgnore")}

--
${msg("ragstudioHelp")}: ${msg("ragstudioHelpUrl")}
${msg("ragstudioAddress")}
