const cedar = require('@cedar-policy/cedar-wasm/nodejs');

const POLICY = `
permit (
    principal,
    action == Action::"ReadPatientSummary",
    resource
)
when {
    context.connectionStatus == "ACTIVE" &&
    context.consentedCategories.contains("PRACTICE_HISTORY")
};
`;

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    // In reality, practitionerId comes from JWT
    const practitionerId = event.headers?.['x-practitioner-id'] || 'prac_123';
    
    // MOCK DB FETCH: Verify if there is an active connection and what consent was granted
    // We mock this for the MVP demo:
    const mockConnectionContext = {
      connectionStatus: "ACTIVE",
      consentedCategories: ["PRACTICE_HISTORY", "FUNCTIONAL_IMPACT"]
    };

    // Use Cedar to evaluate the authorization request
    const entities = [
      {
        uid: { type: "User", id: practitionerId },
        attrs: {},
        parents: []
      },
      {
        uid: { type: "Action", id: "ReadPatientSummary" },
        attrs: {},
        parents: []
      },
      {
        uid: { type: "Patient", id: userId },
        attrs: {},
        parents: []
      }
    ];

    const result = cedar.isAuthorized({
      principal: { type: "User", id: practitionerId },
      action: { type: "Action", id: "ReadPatientSummary" },
      resource: { type: "Patient", id: userId },
      context: mockConnectionContext,
    }, POLICY, entities);

    if (result.decision === 'Allow') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Authorization successful',
          patientId: userId,
          summary: "Across the selected period, the patient logged 4 response-prevention attempts. Social functioning was selected as affected in 1 entry."
        })
      };
    } else {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'CONSENT_REQUIRED',
          message: 'This data category has not been authorized for this practitioner.'
        })
      };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error evaluating Cedar policy' })
    };
  }
};
