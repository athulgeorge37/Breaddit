const { verify } = require("jsonwebtoken");

// this function is called every time
// a user tries to make a request to the rest api
const validate_request = (request, response, next) => {
    // passing the web_access_token through the request header
    const web_access_token = request.header("web_access_token");

    // if no access token was passed, user is not logged in
    if (!web_access_token) {
        response.json({
            error: "User is not logged in",
            web_access_token: web_access_token,
        });
    }

    try {
        // verify helps retrieve the data this web token corresponds to using the same secret
        const valid_web_access_token = verify(
            web_access_token,
            process.env.WEB_TOKEN_SECRET
        );

        if (valid_web_access_token) {
            // ensuring the that user_id is now past throught the request
            request.user_id = valid_web_access_token.user_id;
            // to use the user_id at an endpoint, write: const user_id = request.user_id
            request.role = valid_web_access_token.role;

            // when trying to sign_out we need to know the login id to update the correct field
            request.login_id = valid_web_access_token.login_id;

            // if web token is valid,
            // execute the next function,
            // the actual api request

            return next();
        }
    } catch (e) {
        return response.json({
            error: e,
        });
    }
};

const validate_role = (request, response, next) => {
    // passing the web_access_token through the request header
    const web_access_token = request.header("web_access_token");

    // console.log({ web_access_token });

    // if no access token was passed, user is not logged in
    if (!web_access_token || web_access_token === "null") {
        // response.json({
        //     error: "User is not logged in",
        //     web_access_token: web_access_token
        // })
        request.role = "public_user";
        return next();
    }

    try {
        // verify helps retrieve the data this web token corresponds to using the same secret
        const valid_web_access_token = verify(
            web_access_token,
            process.env.WEB_TOKEN_SECRET
        );

        if (valid_web_access_token) {
            // ensuring the that user_id is now past throught the request
            request.user_id = valid_web_access_token.user_id;
            // to use the user_id at an endpoint, write: const user_id = request.user_id
            request.role = valid_web_access_token.role;

            // when trying to sign_out we need to know the login id to update the correct field
            request.login_id = valid_web_access_token.login_id;

            // if web token is valid,
            // execute the next function,
            // the actual api request

            return next();
        }
    } catch (e) {
        return response.json({
            error: e,
        });
    }
};

// exporting this function to be used at our rest api endpoints
module.exports = { validate_request, validate_role };
