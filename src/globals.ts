/**
 * This file can be used to store global variables that you need to access across multiple places.
 * We've put a few here that we know you will need.
 * Fill in the blank for each one
 */
export const MY_BU_ID = "U81066856";
export const BASE_API_URL = "https://dscs519-assessment.azurewebsites.net/api";
// You can get this from Piazza
export const TOKEN = "fKZTwhwT1DV64q_JzG6sYoShfq-cJbPwBgjIMOImYSTiAzFuv4-H5g==";
// This is a helper function to generate the headers with the x-functions-key attached
export const GET_DEFAULT_HEADERS = () => {
  var headers = new Headers();
  // You will need to add another header here
  // If you do not, the API will reject your request (:
  headers.append('accept', 'application/json')
  headers.append('x-functions-key', TOKEN)
  return headers;
};
