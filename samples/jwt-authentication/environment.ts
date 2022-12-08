export const environment = {
  auth: {
    secret: "SuperSecretKey",
    expiresIn: "15s",
    claims: {
      username: "@CoolUsername",
      role: "AuthorizedRole",
    },
  },
};
