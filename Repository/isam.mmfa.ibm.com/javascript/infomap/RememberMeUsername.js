importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);

/*
* If we already know the username, skip this infomap altogether.
* If we don't prompt for it, as well as offer the "remember me" feature.
*/

var username = context.get(Scope.REQUEST, "urn:ibm:security:asf:request:token:attribute", "username");
IDMappingExtUtils.traceString("username from existing token: " + username);

if (username != null) {
	// username already authenticated, skip this infomap
	success.setValue(true);
} else {
	// check for username in request
	username = context.get(Scope.REQUEST, "urn:ibm:security:asf:request:parameter", "username");
	IDMappingExtUtils.traceString("username from request: " + username);
	if (username != null) {
		// check for rememberme in request
		var rememberme = context.get(Scope.REQUEST, "urn:ibm:security:asf:request:parameter", "rememberme");
		IDMappingExtUtils.traceString("rememberme from request: " + rememberme);

		// set username to login, and if we have rememberme, include that in the cred as well
		context.set(Scope.SESSION, "urn:ibm:security:asf:response:token:attributes", "username", username);
		if (rememberme != null) {
			context.set(Scope.SESSION, "urn:ibm:security:asf:response:token:attributes", "rememberme", rememberme);
		}

		// set AUTHENTICATION_LEVEL to 0, since this is used in the step-up login scenario
		context.set(Scope.SESSION, "urn:ibm:security:asf:response:token:attributes", "AUTHENTICATION_LEVEL", "0");

		success.setValue(true);
	} else {
		// send back the username page
		success.setValue(false);
	}
}
