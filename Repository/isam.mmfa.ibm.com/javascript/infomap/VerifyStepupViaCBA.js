importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);

/*
 * This rule is to be used within an InfoMap authentication mechanism to ensure
 * that the authentication policy it is part of has been invoked via CBA "Permit
 * with Authentication", and that the resource it was invoked for is the
 * /stepup/sps/authsvc resource (i.e. we are invoking the CBA policy as the
 * result of stepup authentication and not directly. This prevents directly
 * invoking the MMFA initiate policy.
 */
var cbaResource = context.get(Scope.SESSION,
		"urn:ibm:security:asf:cba:attribute", "resource");
IDMappingExtUtils.traceString("cbaResource: " + cbaResource);

if (cbaResource != null && cbaResource.equals("/stepup/sps/authsvc")) {
	success.setValue(true);
}
