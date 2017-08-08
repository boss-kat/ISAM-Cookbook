importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);

/*
 * This rule is to be used within an InfoMap authentication mechanism to
 * determine the username for initiating MMFA authentication. If you are already
 * logged in, we will use that username, otherwise we will look in the incoming
 * request for a username. If neither are present, that's an error and the HTML
 * page associated with this InfoMap will be returned. It just tells you you've
 * invoked the mechanism in error.
 *
 * You should never use this mechanism in production without addition protection
 * to ensure that the username is coming frmo a trusted source. For our
 * demonstration scenario it provides a convenient way to front the MMFA
 * Authenticator in initiate mode to provide a "hello world" example for MMFA.
 */

// try getting username from already authenticated user first
var username = context.get(Scope.REQUEST,
		"urn:ibm:security:asf:request:token:attribute", "username");
IDMappingExtUtils.traceString("username from existing token: " + username);
if (username == null) {
	username = context.get(Scope.REQUEST,
			"urn:ibm:security:asf:request:parameter", "username");
	IDMappingExtUtils.traceString("username from request: " + username);
}

// username is required

if (username != null && username != "") {
	// also setup a login message to display on the phone
	context.set(Scope.SESSION, "urn:ibm:security:asf:demo", "prompt",
			"Please log me in: " + username);

	// this session attribute type is *required* for the MMFA authentication
	// mechanism to work properly
	context.set(Scope.SESSION,
			"urn:ibm:security:asf:response:token:attributes", "username",
			username);

	// need this for test EPAC point of contact type
	context.set(Scope.SESSION,
			"urn:ibm:security:asf:response:token:attributes",
			"AUTHENTICATION_LEVEL", "1");

	success.setValue(true);
}
