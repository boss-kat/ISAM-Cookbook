importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);

// user must already be authenticated - it's an error if not.
var username = context.get(Scope.REQUEST,
		"urn:ibm:security:asf:request:token:attribute", "username");

/*
 * This header must ONLY be set on the /stepup junction that points to the
 * runtime. We use it as a cheap way to enforce that this SetAuthenticationLevel
 * mechanism is not invoked via the standard runtime junction.
 */
var userlong = context.get(Scope.REQUEST,
		"urn:ibm:security:asf:request:header", "iv-user-l");

IDMappingExtUtils.traceString("username from existing token: " + username);
IDMappingExtUtils.traceString("iv-user-l from header: " + userlong);

if (username != null && username.length() > 0 && userlong != null
		&& userlong.length() > 0) {
	success.setValue(true);
	context.set(Scope.SESSION,
			"urn:ibm:security:asf:response:token:attributes",
			"AUTHENTICATION_LEVEL", "1");
} else {
	success.setValue(false);
	page.setValue("/authsvc/authenticator/setauthenticationlevel/error.html")
}
