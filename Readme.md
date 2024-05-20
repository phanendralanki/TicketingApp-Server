# Algorithm For User Registration
1. Get user details from frontend
2. check if user already exists: username,email
3. create user object - create entry in db
4. remove password and refreshToken field from response
5. check for user creation.
6. return res

# Algorithm For User Login
1. Get the data from frontend
2. find the user with the email id or username
3. check the password
4. Generate access and refresh Token
5. send cookie - access and refresh Token