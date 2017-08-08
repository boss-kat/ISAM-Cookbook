importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);
importClass(Packages.com.tivoli.am.fim.trustserver.sts.uuser.Attribute);
importClass(Packages.com.tivoli.am.fim.trustserver.sts.uuser.Group);

var policyID = context.get(Scope.SESSION, "urn:ibm:security:asf:policy", "policyID");
IDMappingExtUtils.traceString("policyID: " + policyID);

// if we are logging in as scimadmin, and we *might* be using the PAC or EXTUSER EAI strategy, add the adminGroup to stsuu
var username = stsuu.getPrincipalName();
if (username != null && username.equals("scimadmin")) {
	stsuu.addGroup(new Group("adminGroup","",null));
}
