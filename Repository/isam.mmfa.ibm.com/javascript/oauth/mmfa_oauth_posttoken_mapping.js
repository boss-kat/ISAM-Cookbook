importPackage(Packages.com.tivoli.am.fim.trustserver.sts);
importPackage(Packages.com.tivoli.am.fim.trustserver.sts.uuser);
importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.IDMappingExtUtils);
importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.OAuthMappingExtUtils);
importClass(Packages.com.tivoli.am.fim.trustserver.sts.utilities.MMFAMappingExtUtils);
importClass(Packages.com.ibm.security.access.httpclient.HttpClient);
importClass(Packages.com.ibm.security.access.httpclient.HttpResponse);
importClass(Packages.com.ibm.security.access.httpclient.Headers);
importClass(Packages.com.ibm.security.access.httpclient.Parameters);
importClass(Packages.java.util.ArrayList);
importClass(Packages.java.util.HashMap);

/**
 * This mapping rule shows 2 examples: the Client Credentials scenario and HTTP
 * Client demo.
 */

/**
 * This is an example of how you could do attribute association with a given
 * state ID for the Client Credentials scenario.
 *
 * To enable this demo, change the "cc_demo" variable to "true".
 */

var cc_demo = false;

if (cc_demo) {

	var state_id = null;
	var request_type = null;
	var grant_type = null;
	var temp_attr = null;

	// The state id handle
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("state_id", "urn:ibm:names:ITFIM:oauth:state");
	if (temp_attr != null && temp_attr.length > 0) {
		state_id = temp_attr[0];
	}

	// The request type - if none available assume 'resource'
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("request_type", "urn:ibm:names:ITFIM:oauth:request");
	if (temp_attr != null && temp_attr.length > 0) {
		request_type = temp_attr[0];
	} else {
		request_type = "resource";
	}

	// The grant type
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("grant_type", "urn:ibm:names:ITFIM:oauth:body:param");
	if (temp_attr != null && temp_attr.length > 0) {
		grant_type = temp_attr[0];
	}

	if (request_type == "access_token" && grant_type == "client_credentials" && state_id != null) {

		/* Manipulate extra attributes */

		// Associate an extra attribute key-value pair to the authorization
		// grant
		OAuthMappingExtUtils.associate(state_id, "special_id", "sp_" + state_id);

		// Get the extra attribute keys of all extra attributes associated with
		// the authorization grant
		var attrKeyArray = OAuthMappingExtUtils.getAssociationKeys(state_id);
		if (attrKeyArray != null) {
			// Disassociate an extra attribute
			OAuthMappingExtUtils.disassociate(state_id, "special_id");
			// Associate another extra attribute
			OAuthMappingExtUtils.associate(state_id, "friendly_name", "phone client");
		}

		// Put extra attributes into stsuu context attributes
		attrKeyArray = OAuthMappingExtUtils.getAssociationKeys(state_id);
		if (attrKeyArray != null) {
			for ( var i = 0; i < attrKeyArray.length; i++) {
				stsuu.addContextAttribute(new Attribute(attrKeyArray[i], "urn:ibm:names:ITFIM:oauth:response:attribute", OAuthMappingExtUtils.getAssociation(state_id, attrKeyArray[i])));
			}
		}
	}
}

/**
 * The following is a HTTP Client example.
 *
 * This is an example of how you could do use the HTTP client to do HTTP GET and
 * POST requests.
 *
 * To enable this demo, change the "httpclient_demo" variable to "true" and make
 * the appropriate modifications to the host name and other parameters of the
 * httpGet and httpPost methods.
 */

var httpclient_demo = false;

if (httpclient_demo) {

	/* HttpClient */
	var hr = new HttpResponse();
	var headers = new Headers();
	var params= new Parameters();
	headers.addHeader("x-header-1", "header_value");
	params.addParameter("param1", "param1_value");

	/**
	 * Minimal HTTP GET and POST
	 */

	// httpGet(String url)
	hr = HttpClient.httpGet("http://yourHostName/");

	if (hr != null) {
		IDMappingExtUtils.traceString("code: " + hr.getCode()); // output to
		// trace
		IDMappingExtUtils.traceString("body: " + hr.getBody());
		var headerKeys = hr.getHeaderKeys();
		if (headerKeys != null) {
			for ( var i = 0; i < headerKeys.length; i++) {
				var headerValues = hr.getHeaderValues(headerKeys[i]);
				for ( var j = 0; j < headerValues.length; j++) {
					IDMappingExtUtils.traceString("header: " + headerKeys[i] + "=" + headerValues[j]);
				}
			}
		}
	}

	// httpPost(String url, Map parameters)
	hr = HttpClient.httpPost("http://yourHostName/", params);
	if (hr != null) {
		IDMappingExtUtils.traceString("code: " + hr.getCode());
		IDMappingExtUtils.traceString("body: " + hr.getBody());
		headerKeys = hr.getHeaderKeys();
		if (headerKeys != null) {
			for ( var i = 0; i < headerKeys.length; i++) {
				var headerValues = hr.getHeaderValues(headerKeys[i]);
				for ( var j = 0; j < headerValues.length; j++) {
					IDMappingExtUtils.traceString("header: " + headerKeys[i] + "=" + headerValues[j]);
				}
			}
		}
	}

	/**
	 * HTTPS vs HTTP
	 *
	 * For HTTPS, using the minimal httpGet and httpPost methods will assume the
	 * default trust store (util.httpClient.defaultTrustStore in Advanced
	 * Configuration panel). Alternatively, you can use the full httpGet and
	 * httpPost methods to specify the connection parameters, giving null to any
	 * field that is not required.
	 */

	/**
	 * httpGet(String url, Map headers, String httpsTrustStore, String
	 * basicAuthUsername,String basicAuthPassword, String clientKeyStore,String
	 * clientKeyAlias);
	 */
	hr = HttpClient.httpGet("https://yourHostName/", null, null, "admin", "password", null, null);
	if (hr != null) {
		// output to trace
		IDMappingExtUtils.traceString("code: " + hr.getCode());
		IDMappingExtUtils.traceString("body: " + hr.getBody());
		headerKeys = hr.getHeaderKeys();
		if (headerKeys != null) {
			for ( var i = 0; i < headerKeys.length; i++) {
				var headerValues = hr.getHeaderValues(headerKeys[i]);
				for ( var j = 0; j < headerValues.length; j++) {
					IDMappingExtUtils.traceString("header: " + headerKeys[i] + "=" + headerValues[j]);
				}
			}
		}
	}

	/**
	 * httpPost(String url, Map headers, Map parameters,String httpsTrustStore,
	 * String basicAuthUsername,String basicAuthPassword, String
	 * clientKeyStore,String clientKeyAlias);
	 */
	hr = HttpClient.httpPost("https://yourHostName/", null, params, null, null, null, "client_keystore", "myKeyAlias");
	if (hr != null) {
		IDMappingExtUtils.traceString("code: " + hr.getCode());
		IDMappingExtUtils.traceString("body: " + hr.getBody());
		headerKeys = hr.getHeaderKeys();
		if (headerKeys != null) {
			for ( var i = 0; i < headerKeys.length; i++) {
				var headerValues = hr.getHeaderValues(headerKeys[i]);
				for ( var j = 0; j < headerValues.length; j++) {
					IDMappingExtUtils.traceString("header: " + headerKeys[i] + "=" + headerValues[j]);
				}
			}
		}
	}
}

/** Delete Token from cache
 * This is an example of how you could do delete a token from the cache given the token ID
 *
 * To enable this demo, change the "deleteToken_demo" variable to "true".
 */

var deleteToken_demo = false;

if (deleteToken_demo) {
	var request_type = null;
	var grant_type = null;
	var access_token_id = null;
	var refresh_token_id =null;
	var temp_attr = null;

	//request type
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("request_type", "urn:ibm:names:ITFIM:oauth:request");
	if (temp_attr != null && temp_attr.length > 0) {
		request_type = temp_attr[0];
	} else {
		request_type = "resource";
	}

	// The grant type
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("grant_type", "urn:ibm:names:ITFIM:oauth:body:param");
	if (temp_attr != null && temp_attr.length > 0) {
		grant_type = temp_attr[0];
	}

	//access_token_id
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("access_token_id", "urn:ibm:names:ITFIM:oauth:response:metadata");
	if (temp_attr != null && temp_attr.length > 0) {
		access_token_id = temp_attr[0];
	}

	//refresh_token_id
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("refresh_token_id", "urn:ibm:names:ITFIM:oauth:response:metadata");
	if (temp_attr != null && temp_attr.length > 0) {
		refresh_token_id = temp_attr[0];
	}

	// Delete Token Scenario when request_type is access token and grant type is password.
	if (request_type == "access_token" && grant_type == "password") {
		if (access_token_id !=null){
				OAuthMappingExtUtils.deleteToken(access_token_id);
		}

		if (refresh_token_id !=null){
				OAuthMappingExtUtils.deleteToken(refresh_token_id);
		}
	}


}

/** Register a new authenticator
 * This is an example of how you could register a new authenticator given the state ID
 *
 * This functionality is enabled if the client includes scope value "mmfaAuthn" in the grant request.
 */

function isMmfaScopePresent() {
	var scopeAttr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("scope", "urn:ibm:names:ITFIM:oauth:response:attribute");

	if (scopeAttr != null) {
		for (var i = 0; i < scopeAttr.length; i++) {
			if (scopeAttr[i] == "mmfaAuthn") {
				return true;
			}
		}
	}

	return false;
 }

if (isMmfaScopePresent()) {

	IDMappingExtUtils.traceString("stsuu for mmfa is: " + stsuu.toString());

	var request_type = null;
	var grant_type = null;

	// Fetch the request type from the stsuu
	request_type = stsuu.getContextAttributes().getAttributeValuesByNameAndType("request_type", "urn:ibm:names:ITFIM:oauth:request");
	if(request_type != null) {
		request_type = request_type[0];
	}

	// Fetch the grant type from the stsuu
	grant_type = stsuu.getContextAttributes().getAttributeValuesByNameAndType("grant_type", "urn:ibm:names:ITFIM:oauth:body:param");
	if(grant_type != null) {
		grant_type = grant_type[0];
	}

	IDMappingExtUtils.traceString("request_type: " + request_type);
	IDMappingExtUtils.traceString("grant_type: " + grant_type);

	// Check to see if this is a token request (other request types include 'authorize')
	if(request_type != null && request_type == "access_token") {

		var state_id = stsuu.getContextAttributes().getAttributeValueByName("state_id");
		IDMappingExtUtils.traceString("State id: " + state_id);

		var token = stsuu.getContextAttributes().getAttributeValuesByName("push_token");
		var appId = stsuu.getContextAttributes().getAttributeValuesByName("application_id");

		// If this isn't a refresh token request, we we will want to save the new authenticator.
		var authenticatorRegId = null;
		if(grant_type != null && grant_type != "refresh_token") {
			authenticatorRegId = MMFAMappingExtUtils.registerAuthenticator(state_id);
		}

		if (authenticatorRegId != null) {
			// return the authenticator id as an additional OAuth token response
			// attribute
			var attr = new Attribute("authenticator_id", "urn:ibm:names:ITFIM:oauth:response:attribute", authenticatorRegId);
			stsuu.addContextAttribute(attr);
			// provide the display_name so that the username is shown under the account name in IBM Verify
			// we get this from any token associated with the current grant
			var displayName = null;
			var tokens = OAuthMappingExtUtils.getTokens(state_id);
			if (tokens != null && tokens.length > 0) {
				displayName = tokens[0].getUsername();
			}
			if (displayName != null) {
				stsuu.addContextAttribute(new com.tivoli.am.fim.trustserver.sts.uuser.Attribute("display_name" ,"urn:ibm:names:ITFIM:oauth:response:attribute", displayName));
			}
		}

		// On all requests (especially refresh!), we want to update the push token.
		if(token != null) {
			if(appId != null) {
				MMFAMappingExtUtils.savePushToken(state_id, token[0], appId[0]);
			} else {
				MMFAMappingExtUtils.savePushToken(state_id, token[0]);
			}
		} else {
			IDMappingExtUtils.traceString("Push token was null and was not saved.");
		}

		var device_name = stsuu.getContextAttributes().getAttributeValuesByName("device_name");
		if (device_name != null && device_name.length > 0) {
			device_name = device_name[0];
		}
		var device_type = stsuu.getContextAttributes().getAttributeValuesByName("device_type");
		if (device_type != null && device_type.length > 0) {
			device_type = device_type[0];
		}
		var os_version	= stsuu.getContextAttributes().getAttributeValuesByName("os_version");
		if (os_version != null && os_version.length > 0) {
			os_version = os_version[0];
		}
		var fingerprint_support	 = stsuu.getContextAttributes().getAttributeValuesByName("fingerprint_support");
		if (fingerprint_support != null && fingerprint_support.length > 0) {
			fingerprint_support = fingerprint_support[0];
		}
		var front_camera_support = stsuu.getContextAttributes().getAttributeValuesByName("front_camera_support");
		if (front_camera_support != null && front_camera_support.length > 0) {
			front_camera_support = front_camera_support[0];
		}
		var tenant_id = stsuu.getContextAttributes().getAttributeValuesByName("tenant_id");
		if (tenant_id != null && tenant_id.length > 0) {
			tenant_id = tenant_id[0];
		}

		MMFAMappingExtUtils.saveDeviceAttributes(state_id,
				device_name,
				device_type,
				os_version,
				fingerprint_support,
				front_camera_support,
				tenant_id);
	}
}


var tokenUpdateDemo = false;
if(tokenUpdateDemo) {
	/*
	 * The following snippet of code updates the expiry of an access token
	 * on issue from the token endpoint.
	 *
	 * An example of using this method, would be if different clients
	 * within the same definition wish to have different token lifetimes.
	 *
	 * The "Other Info" field of a client can be used to store this data.
	 * This example assumes a value of
	 * "...,access_token_lifetime=1000,..."
	 *
	 */

	var temp_attr = null;
	var request_type = null;
	var grant_type = null;
	var code = null;
	temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("request_type", "urn:ibm:names:ITFIM:oauth:request");
	if (temp_attr != null && temp_attr.length > 0) {
		request_type = temp_attr[0];
	} else {
		request_type = "resource";
	}

	/*
	 * Check its a request to /token.
	 */
	if (request_type == "access_token") {
		/*
		 * Extract the access token.
		 */
		var access_token_id = null;
		temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("access_token_id", "urn:ibm:names:ITFIM:oauth:response:metadata");
		if (temp_attr != null && temp_attr.length > 0) {
			access_token_id = temp_attr[0];
		}

		if (access_token_id != null) {

			var new_lifetime = 0;
			/*
			 * Lookup client data to get the new lifetime.
			 */
			var client_id = null;
			temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("client_id", "urn:ibm:names:ITFIM:oauth:body:param");
			if (temp_attr != null && temp_attr.length > 0) {
				client_id = temp_attr[0];
			}
			if(client_id != null) {
				var client = OAuthMappingExtUtils.getClient(client_id);
				if (client != null) {
					var other_info = client.getOtherInfo();
					if (other_info != null) {
						var other_info_array = other_info.split(",");
						for (var i = 0; i < other_info_array.length; i++) {
							var keyValue = other_info_array[i].split("=");
							if(keyValue.length > 1){
								var key = keyValue[0];
								var value = keyValue[1];
								if(key.trim() == "access_token_lifetime") {
									var parsed_value = parseInt(value.trim());
									if (!isNaN(parsed_value)) {
										new_lifetime = parsed_value;
									}
								}
							}
						}
					}
				}

			}
			if(new_lifetime != 0) {
				/*
				 * Update the token lifetime. Pass null for date_last_used and enabled, to not update
				 * their value.
				 */
				var is_updated	= OAuthMappingExtUtils.updateToken(access_token_id, new_lifetime, null, null);
				if(is_updated) {
					/*
					 * Update the expires_in field of the token response.
					 */
					IDMappingExtUtils.traceString("Token [" + access_token_id + "] was updated.");
					stsuu.addContextAttribute(new com.tivoli.am.fim.trustserver.sts.uuser.Attribute("expires_in" ,"urn:ibm:names:ITFIM:oauth:response:attribute", new_lifetime));
				} else {
					IDMappingExtUtils.traceString("Token [" + access_token_id + "] was NOT updated.");
				}
			}
		}
	}
}

//
// In case the mobile WebSEAL has been set to use EXTUSER pattern for oauth-auth, make sure scimadmin
// gets made part of the adminGroup.
//
var scimadminOAuthLogin = true;
if (scimadminOAuthLogin) {
	var request_type = "resource";
	var temp_attr = stsuu.getContextAttributes().getAttributeValuesByNameAndType("request_type", "urn:ibm:names:ITFIM:oauth:request");
	if (temp_attr != null && temp_attr.length > 0) {
		request_type = ''+temp_attr[0];
	}
	if (request_type == "resource") {
		var username = stsuu.getContextAttributes().getAttributeValueByName("username");
		IDMappingExtUtils.traceString("scimadminOAuthLogin username: " + username);
		if (username != null && username.equals("scimadmin")) {
			stsuu.addContextAttribute(new com.tivoli.am.fim.trustserver.sts.uuser.Attribute("am-ext-user-groups" ,"urn:ibm:names:ITFIM:oauth:response:attribute", "adminGroup"));
		}
	}
}
