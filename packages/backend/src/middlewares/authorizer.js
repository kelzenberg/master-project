import apiKeyAuth from '@vpriem/express-api-key-auth';

export const authorizer = apiKeyAuth(/^API_KEY_/);
