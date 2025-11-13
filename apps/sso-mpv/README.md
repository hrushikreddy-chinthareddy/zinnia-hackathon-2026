# What is this app?

- This application is for authenticating users via sso with an IDP connection through the zinnia consumer experience auth0 application. This means that the auth0 set up of this app uses consumer experience tokens and upon successful authentication, the user will be redirected to MyPolicyView with an active session.

## Getting Started

- Update /etc/hosts file with `http://sso.mypolicyview.local:{port}`
- `npm install`
- `npm dev`

## Testing locally

Add this `DEBUG=express-openid-connect:* node index.js` to include debug logs in local server

# Carriers + Connections

- All carriers will need to include the connection value in their url as a query string `connection={case_sensitive_name_of_connection_from_auth0}`
- To see currently supported connections go to `apps/sso-mpv/utils.js`

# Logging in

1. Start the SSO app
2. Start MPV
3. Go to `http://sso.mypolicyview.local:3000/?connection=FNWL-Consumer-Okta`
4. Login as user `team-xd@zinnia.com`
5. Bother another dev to learn what the password is.
6. Login and send the verification code to team-xd
7. Go to `https://outlook.office.com/mail/team-xd@zinnia.com/`
8. Use the code from the team-xd inbox to login.
