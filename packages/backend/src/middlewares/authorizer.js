import basicAuth from 'express-basic-auth';

const userCredentials = {
  moderator: { username: process.env.MODERATOR_USERNAME, password: process.env.MODERATOR_PASSWORD },
  student: { username: process.env.STUDENT_USERNAME, password: process.env.STUDENT_PASSWORD },
};

export const authorizer = roleCallback => (username, password) => {
  const isAuthenticatedForAnyRole = Object.entries(userCredentials).map(([key, value]) => {
    const userMatches = basicAuth.safeCompare(username, value.username);
    const passwordMatches = basicAuth.safeCompare(password, value.password);

    if (userMatches && passwordMatches) {
      roleCallback(key);
      return true;
    }

    return false;
  });

  return isAuthenticatedForAnyRole.includes(true);
};
