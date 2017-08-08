importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);

// this has to be an attribute name, and appear in the advanced configuration property
// attributeCollection.authenticationContextAttributes so that it is made available
// from CBA authorization policy
var param = context.get(Scope.SESSION, "urn:ibm:security:asf:cba:attribute", "transferAmount");

IDMappingExtUtils.traceString("Received a transfer amount of: " + param);

if(param != null && param != "") {
    var message = "You have a pending transaction amount of: $" + param;

    success.setValue(true);
    context.set(Scope.SESSION, "urn:ibm:security:asf:demo", "prompt", message);
    context.set(Scope.SESSION, "urn:ibm:security:asf:mmfa", "extras", '{"type": "transaction"}');
}
