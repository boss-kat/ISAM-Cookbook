importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);
importPackage(Packages.com.ibm.security.access.scimclient);

/*
 * This rule is to be used within an InfoMap authentication mechanism to
 * determine the username for initiating MMFA authentication from the current
 * request and construct a prompt.
 *
 * It also checks what authenticators the user has registered (via SCIM), and
 * will prompt for fingerprint if the user has it registered, otherwise
 * user_presence.
 */

// this variable changes how we do user lookups of SCIM data
var users_in_scim_user_registry = false;

function computeIDForUsername(username) {
	return ScimClient.computeIDForUsername(username);
}

function getSCIMQueryURL(uname) {
	var attributes = "urn:ietf:params:scim:schemas:extension:isam:1.0:MMFA:Authenticator:userPresenceMethods,urn:ietf:params:scim:schemas:extension:isam:1.0:MMFA:Authenticator:authenticators,urn:ietf:params:scim:schemas:extension:isam:1.0:MMFA:Authenticator:fingerprintMethods";

	/*
	 * If the user is guaranteed to be in the SCIM user registry, you can use this
	 */
	var result = null;
	if (users_in_scim_user_registry) {
		result = "/Users?filter=userName%20eq%20"+username+"&attributes=" +attributes;
	} else {
		// in case they're not, let's construct the user URL by computed ID
		result = "/Users/"+computeIDForUsername(uname)+"?attributes=" + attributes;
	}

	IDMappingExtUtils.traceString("getSCIMQueryURL("+uname+") : " + result);
	return result;
}

function getSCIMUserRecordFromResults(jobj) {
	var result = null;

	// if we did a filter search, we'll get back search results
	if (users_in_scim_user_registry) {
		if (jobj['totalResults'] != null && jobj['totalResults'] == 1) {
				result = jobj.Resources[0];
		}
	} else {
		// if we did a encoded user search, then we get back just the user object or an error
		if (jobj['meta'] != null) {
			result = jobj;
		}
	}
	return result;
}


// username must be present as already authenticated user (this is a step-up
// login)
var username = context.get(Scope.REQUEST,
		"urn:ibm:security:asf:request:token:attribute", "username");
IDMappingExtUtils.traceString("username from existing token: " + username);

var result = false;

if (username != null && username != "") {
	// login message to display
	context.set(Scope.SESSION, "urn:ibm:security:asf:demo", "prompt",
			"Please log me in: " + username);
	context.set(Scope.SESSION, "urn:ibm:security:asf:demo", "username",
			username);

	/*
	 * determine whether or not we will force touchid or user_presence based on
	 * which authenticators the user has registered
	 */
	var scimConfig = context.get(Scope.SESSION, "urn:ibm:security:asf:policy", "scimConfig");
	if (scimConfig != null) {
		var resp = ScimClient.httpGet(scimConfig, getSCIMQueryURL(username));
		if (resp != null && resp.getCode() == 200) {
			var respJson = JSON.parse(resp.getBody());
			IDMappingExtUtils.traceString("SCIM resp: "+respJson.totalResults);
			IDMappingExtUtils.traceString("SCIM resp: "+resp.getBody());

			var userObj = getSCIMUserRecordFromResults(respJson);
			if (userObj != null) {
				IDMappingExtUtils.traceString("Found a user with : "+JSON.stringify(userObj));

				var mmfaData = userObj['urn:ietf:params:scim:schemas:extension:isam:1.0:MMFA:Authenticator'];

				if (mmfaData != null) {
					var authenticators = mmfaData.authenticators;
					var userPresenceMethods = mmfaData.userPresenceMethods;
					var fingerprintMethods = mmfaData.fingerprintMethods;
					var mmfaResponsePolicy = null;

					IDMappingExtUtils.traceString("authenticators : "+JSON.stringify(authenticators));
					IDMappingExtUtils.traceString("userPresenceMethods : "+JSON.stringify(userPresenceMethods));
					IDMappingExtUtils.traceString("fingerprintMethods : "+JSON.stringify(fingerprintMethods));


					if (fingerprintMethods != null && fingerprintMethods.length > 0) {
						mmfaResponsePolicyURI = "urn:ibm:security:authentication:asf:mmfa_response_fingerprint";
					} else if (userPresenceMethods != null && userPresenceMethods.length > 0) {
						mmfaResponsePolicyURI = "urn:ibm:security:authentication:asf:mmfa_response_userpresence";
					}
					if (mmfaResponsePolicyURI != null) {
						IDMappingExtUtils.traceString("Using MMFA response policy : "+ mmfaResponsePolicyURI);
						context.set(Scope.SESSION, "urn:ibm:security:asf:demo", "policyURI", mmfaResponsePolicyURI);
						result = true;
					} else {
						macros.put("@ERROR_MESSAGE@","No supported authentication methods registered");
					}
				} else {
					macros.put("@ERROR_MESSAGE@","No registered mobile multi-factor authenticators");
				}
			} else {
				macros.put("@ERROR_MESSAGE@","Missing SCIM data");
			}
		} else {
			macros.put("@ERROR_MESSAGE@","bad SCIM response");
		}
	} else {
		macros.put("@ERROR_MESSAGE@","Missing SCIM configuration - does the authentication policy include SCIM Endpoint Configuration?");
	}
} else {
	macros.put("@ERROR_MESSAGE@","Missing username");
}

success.setValue(result);
