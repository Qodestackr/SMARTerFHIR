import { EMR, instanceOfEmr } from "../Launcher/SmartLaunchHandler";
import { EMR_ENDPOINTS } from "./BaseClient";
import CernerClient from "./CernerClient";
import EpicClient from "./EpicClient";
import SubClient from "../FhirClient"
import { JWT, instanceOfJWT } from "./ClientFactory";
import ECWClient from "./ECWClient";
import AthenaPracticeClient from "./AthenaPracticeClient";
import AthenaClient from "./AthenaClient";

/**
* The function `getEndpointsForEmr` returns the endpoints for a given EMR type, such as Epic, Cerner, or SMART.
* @param {EMR} emrType - The `emrType` parameter is of type `EMR`, which is an enumeration representing different types of Electronic Medical Record (EMR)
* systems. The possible values for `emrType` are `EMR.EPIC`, `EMR.CERNER`, `EMR.SMART`,
* @returns an object of type EMR_ENDPOINTS.
*/

export function getEndpointsForEmr(emrType: EMR): EMR_ENDPOINTS {
  switch (emrType) {
    case EMR.EPIC:
      return EpicClient.getEndpoints();
    case EMR.CERNER:
      return CernerClient.getEndpoints();
    case EMR.ECW:
      return ECWClient.getEndpoints();
    case EMR.ATHENAPRACTICE:
      return AthenaPracticeClient.getEndpoints();
    case EMR.ATHENA:
      return AthenaClient.getEndpoints();
    case EMR.SMART:
    case EMR.NONE:
    default:
      throw new Error(`Endpoints not found for EMR type: ${emrType}`);
  }
}

/**
 * The function `getEMRType` determines the type of Electronic Medical Record (EMR) based on the provided client or token.
 * @param {SubClient | JWT} client - The parameter `clientOrToken` can be either a `SubClient` object or a JWT (JSON Web Token).
 * @returns the type of Electronic Medical Record (EMR) based on the input parameter. The possible return values are EMR.CERNER, EMR.SMART, EMR.EPIC, or EMR.NONE.
*/
export function getEMRType(clientOrToken: SubClient | JWT): EMR {
  function isClient(input: object): input is SubClient {
    return (input as SubClient).state.serverUrl !== undefined;
  }
  const EMR_MAPPING = [
    { substring: "cerner", emr: EMR.CERNER },
    { substring: "smarthealthit", emr: EMR.SMART },
    { substring: "epic", emr: EMR.EPIC },
    { substring: "ecw", emr: EMR.ECW },
    { substring: "platform.athenahealth.com", emr: EMR.ATHENA },
    { substring: "fhirapi.athenahealth.com", emr: EMR.ATHENAPRACTICE }
  ];

  if (isClient(clientOrToken)) {
    const serverUrl = clientOrToken.state.serverUrl;
    for (const { substring, emr } of EMR_MAPPING) {
      if (serverUrl.includes(substring)) {
        return emr;
      }
    }
  } else {
    if ("epic.eci" in clientOrToken) {
      return EMR.EPIC;
    }
  }

  return EMR.NONE;
}


/**
 * The function `getEmrTypeFromObject` takes an object as input and returns the corresponding EMR type if the object is of type JWT or EMR, otherwise it throws an
 * error.
 * @param {unknown} object - The `object` parameter is of type `unknown`, which means it can be any type. It is used as input to determine the EMR (Electronic
 * Medical Record) type. The function checks if the `object` is an instance of JWT (JSON Web Token) or EMR, and returns
 * @returns an EMR (Electronic Medical Record) object.
 */
export function getEmrTypeFromObject(object: unknown): EMR {
  if (instanceOfJWT(object)) return getEMRType(object)
  if (instanceOfEmr(object)) return (object as EMR)
  throw new Error('Invalid object type.')
}
