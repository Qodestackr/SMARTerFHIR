import SubClient from "../FhirClient";
import { EMR } from "../Launcher/SmartLaunchHandler";
import { FhirClientResourceWithRequiredType, R4ResourceWithRequiredType } from "../types";
import BaseClient, { EMR_ENDPOINTS } from "./BaseClient";

/**
Represents the CernerClient class, extending the BaseClient.
*/
export default class CernerClient extends BaseClient {
  EMR_TYPE: EMR = EMR.CERNER
  static readonly AUTHORIZE_ENDPOINT = "https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/provider/authorize"
  static readonly TOKEN_ENDPOINT = "https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/token"
  static readonly R4_ENDPOINT = "https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d"

  static getEndpoints(): EMR_ENDPOINTS {
    return BaseClient.constructEndpoints(CernerClient.TOKEN_ENDPOINT, CernerClient.R4_ENDPOINT, CernerClient.AUTHORIZE_ENDPOINT)
  }
  getEndpoints(): EMR_ENDPOINTS {
    throw new Error("Method not implemented.");
  }
  
  /* The `cernerRequestHeaders` property is a constant that represents the headers to be included in the request made by the CernerClient class. In this case, it
specifies that the client accepts the "application/fhir+json" media type. The `readonly` keyword indicates that the property cannot be modified after it is
initialized. */
  readonly cernerRequestHeaders: HeadersInit = {
    Accept: "application/fhir+json",
  };
  /**
   * Creates an instance of CernerClient.
   * @param {SubClient} fhirClientDefault - The default FHIR client to use.
   */
  constructor(fhirClientDefault: SubClient) {
    super(fhirClientDefault);
  }

  /**
   * Hydrates a resource with subject and encounter context.
   * @param {T} resource - The resource to hydrate.
   * @returns {Promise<T>} - A promise resolving to the hydrated resource.
   */
  async hydrateResource<T extends FhirClientResourceWithRequiredType, U extends R4ResourceWithRequiredType>(
    fhirClientResource: T,
    r4Resource: U,
  ) {
    return {
      ...(await super.hydrateResource(fhirClientResource, r4Resource)),
      ...("author" in r4Resource ? {} : await super.createReferenceArrayAuthor()),
    };
  }

  /**
   * The function `requestResource` is an asynchronous function that makes a request for a resource using a resource ID and Cerner request headers.
   * @param {string} resourceID - The resourceID parameter is a string that represents the ID of the resource that you want to request.
   * @returns The `requestResource` function is returning a promise.
   */
  async requestResource(resourceID: string) {
    return super.requestResource(resourceID, {
      headers: this.cernerRequestHeaders,
    });
  }
}
