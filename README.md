# Table of Contents

- [(root) (1 files)](#root)
- [controllers (2 files)](#controllers)
- [helpers (4 files)](#helpers)
- [middlewares (1 files)](#middlewares)
- [models (2 files)](#models)
- [routes (4 files)](#routes)
# (root)

## List of files

- [app.js](#appjs)

[Back to top](#table-of-contents)

## [app.js](app.js)

### Web application using Express.js for note management and PDF processing with OpenAI integration.

The `app.js` file is the main entry point for an Express.js web application designed to manage notes and process PDF files. It begins by setting up essential middleware, including logging with Morgan, parsing cookies, and handling JSON requests. The application uses environment variables for configuration, such as database connection strings and API keys, which are loaded using `dotenv`.

The application connects to a MongoDB database using Mongoose, ensuring a robust data management layer. It defines directories for storage, temporary files, and uploads, creating them if they do not exist, to organize file handling operations.

A crucial feature of this application is a cron job scheduled to run every minute, which processes contexts stored in the database. It fetches contexts marked as not yet extracted, reads PDF files associated with these contexts, and extracts text using the `pdf-parse` library. The extracted text is then summarized using OpenAI's GPT-3.5-turbo model, with the summaries and original text stored back in the database, marking the contexts as processed.

The application sets up routing using Express routers. The root path is handled by `indexRouter`, serving the homepage, while `apiRouter` manages authentication and note-related operations. Cross-origin requests are enabled using CORS middleware, ensuring the application can interact with clients from different origins.

Error handling is standardized using utility functions from `apiResponse`, providing consistent feedback for various HTTP responses, including not found and unauthorized errors. The application is modular, with clear separation of concerns, making it maintainable and scalable for future development.

[Back to (root)](#root) | [Back to top](#table-of-contents)

# controllers

## List of files

- [controllers\AuthController.js](#controllersauthcontrollerjs)
- [controllers\NotesController.js](#controllersnotescontrollerjs)

[Back to top](#table-of-contents)

## [controllers\AuthController.js](controllers\AuthController.js)

### A comprehensive authentication controller for user registration, login, OTP verification, and email confirmation.

The `AuthController.js` file is a key component of an authentication system, providing essential functionalities for user management in a Node.js application. It leverages several dependencies to handle user registration, login, OTP verification, and resending confirmation emails.

The `register` function facilitates user registration by validating and sanitizing input fields such as first name, last name, email, and password. It checks for existing users to prevent duplicate registrations and hashes the password for secure storage. An OTP is generated using a utility function and sent to the user's email for account confirmation via a mailer utility. The user's data is then saved in a MongoDB database using a Mongoose model.

The `login` function allows users to authenticate by verifying their email and password. It checks if the user's account is confirmed and active before generating a JWT token for session management, ensuring secure access to protected resources.

The `verifyConfirm` function handles OTP verification for account confirmation. It checks if the provided OTP matches the one stored in the database and updates the user's status to confirmed if successful.

The `resendConfirmOtp` function allows users to request a new OTP if they haven't confirmed their account yet. It generates a new OTP, sends it via email, and updates the user's record in the database.

Throughout the controller, standardized API responses are used to ensure consistent communication with clients, utilizing utility functions for success and error handling. This setup provides a robust framework for managing user authentication and account verification processes.

[Back to controllers](#controllers) | [Back to top](#table-of-contents)

## [controllers\NotesController.js](controllers\NotesController.js)

### A controller for managing notes, recording speech, generating PDFs, and interacting with OpenAI's API.

The `NotesController.js` file is responsible for handling various operations related to notes within an Express application. It utilizes several dependencies to facilitate these operations, including Mongoose for database interactions, Multer for file uploads, and Axios for making HTTP requests to external APIs.

The `createContext` function allows users to create a new note by uploading a file and providing a unique identifier (UUID). It checks for the existence of a context with the same UUID to prevent duplicates and stores the file path in the database using the `Context` model.

The `recordSpeech` function records speech transcripts associated with a given UUID. It appends the provided transcript to a text file stored in the server's storage directory, ensuring that speech data is preserved for future reference.

The `generatePDF` function generates a PDF document from markdown content stored in the database. It retrieves the content using the UUID, converts it to a PDF using the `markdownpdf` library, and sends the PDF file as a response to the client.

The `chatWithPDF` function interacts with OpenAI's API to provide intelligent responses based on lecture notes stored in the database. It sends the notes and a user-provided message to the API, which returns a response generated by the GPT-3.5 model. This functionality enables users to query their notes and receive contextually relevant answers.

Overall, the `NotesController.js` file provides a comprehensive set of features for managing notes, enhancing user interaction through speech recording, PDF generation, and AI-driven chat capabilities.

[Back to controllers](#controllers) | [Back to top](#table-of-contents)

# helpers

## List of files

- [helpers\apiResponse.js](#helpersapiresponsejs)
- [helpers\utility.js](#helpersutilityjs)
- [helpers\mailer.js](#helpersmailerjs)
- [helpers\constants.js](#helpersconstantsjs)

[Back to top](#table-of-contents)

## [helpers\apiResponse.js](helpers\apiResponse.js)

### Utility functions for standardized API responses in a Node.js application.

The `helpers/apiResponse.js` file provides a set of utility functions designed to standardize API responses in a Node.js application. These functions help streamline the process of sending consistent JSON responses to clients, enhancing both readability and maintainability of the codebase. The module exports several functions, each tailored to handle different types of HTTP responses. 

The `successResponse` function sends a success message with a status code of 200, while `successResponseWithData` extends this by including additional data in the response. For error handling, `ErrorResponse` sends a generic error message with a status code of 500, indicating a server error. The `notFoundResponse` function is used to indicate that a requested resource could not be found, returning a 404 status code. 

For client-side errors, `validationErrorWithData` provides a way to send validation error messages along with relevant data, using a 400 status code. Lastly, `unauthorizedResponse` is used to signal unauthorized access attempts, returning a 401 status code. Each function constructs a JSON object with a `status` and `message` field, ensuring a uniform response structure across the application.

[Back to helpers](#helpers) | [Back to top](#table-of-contents)

## [helpers\utility.js](helpers\utility.js)

### Generates a random number of specified length using digits 1-9.

The `helpers/utility.js` file contains a utility function designed to generate a random number with a specified length. The function, `randomNumber`, constructs a numeric string by iterating over the desired length and selecting random digits from the string "123456789". This ensures that the generated number does not start with zero, maintaining its length integrity. The function returns the constructed numeric string as a number. This utility is useful in scenarios where unique numeric identifiers or codes are needed without leading zeros.

[Back to helpers](#helpers) | [Back to top](#table-of-contents)

## [helpers\mailer.js](helpers\mailer.js)

### A simple email sending utility using Nodemailer.

The `helpers/mailer.js` file is designed to facilitate sending emails through an SMTP server using the Nodemailer library. It sets up a reusable transporter object configured with SMTP settings, which are sourced from environment variables. This includes the host, port, username, and password required for authentication. The `send` function is exported to allow other parts of the application to send emails by specifying the sender's address, recipient(s), subject, and HTML content of the email. The function utilizes the transporter to dispatch the email, leveraging Nodemailer's capabilities to handle the email transmission. This setup provides a straightforward way to integrate email functionality into an application, with flexibility for various SMTP configurations.

[Back to helpers](#helpers) | [Back to top](#table-of-contents)

## [helpers\constants.js](helpers\constants.js)

### Provides configuration constants for admin user and email settings.

The `helpers/constants.js` file defines and exports a set of configuration constants used throughout the application. It includes an `admin` object that specifies default properties such as the name and email address for an administrative user. Additionally, it defines a `confirmEmails` object that contains email settings, like the sender's address for confirmation emails. These constants serve as centralized configuration values, ensuring consistency and ease of maintenance across the codebase. By using this file, developers can easily update or reference key configuration details without hardcoding them in multiple places. This approach enhances the maintainability and scalability of the application.

[Back to helpers](#helpers) | [Back to top](#table-of-contents)

# middlewares

## List of files

- [middlewares\jwt.js](#middlewaresjwtjs)

[Back to top](#table-of-contents)

## [middlewares\jwt.js](middlewares\jwt.js)

### Middleware for JWT authentication in Express

This code defines a middleware function for authenticating JSON Web Tokens (JWT) in an Express application. It utilizes the `express-jwt` library to create a middleware named `authenticate`, which verifies the authenticity of JWTs in incoming HTTP requests. The secret key used for token verification is retrieved from an environment variable `JWT_SECRET`, ensuring that sensitive information is not hardcoded into the application. By exporting the `authenticate` middleware, it can be easily integrated into various routes within the Express application, providing a layer of security by ensuring that only requests with valid tokens are processed. This setup is crucial for protecting endpoints that require user authentication and authorization.

[Back to middlewares](#middlewares) | [Back to top](#table-of-contents)

# models

## List of files

- [models\UserModel.js](#modelsusermodeljs)
- [models\ContextModel.js](#modelscontextmodeljs)

[Back to top](#table-of-contents)

## [models\UserModel.js](models\UserModel.js)

### UserModel.js defines a Mongoose schema for user data with validation and a virtual full name property.

The `UserModel.js` file is responsible for defining a Mongoose schema for managing user data within a MongoDB database. It utilizes Mongoose, a popular ODM (Object Data Modeling) library for MongoDB and Node.js, to structure and enforce data validation for user-related information. The schema includes fields for `firstName`, `lastName`, `email`, `password`, `isConfirmed`, `confirmOTP`, `otpTries`, and `status`. Each field is defined with specific data types and validation rules, such as marking fields as required and setting default values where applicable.

Additionally, the schema includes a virtual property, `fullName`, which concatenates the `firstName` and `lastName` fields to provide a complete name representation without storing it in the database. This virtual property is accessible like a regular field but is computed dynamically. The schema also automatically manages timestamps, recording the creation and update times for each user document. The module exports the compiled Mongoose model, allowing it to be used throughout the application for creating, reading, updating, and deleting user records. This setup is crucial for maintaining consistent and reliable user data management in applications.

[Back to models](#models) | [Back to top](#table-of-contents)

## [models\ContextModel.js](models\ContextModel.js)

### Mongoose schema defines a context model for storing book-related data.

This code defines a Mongoose schema and model for managing book-related data within a MongoDB database. The schema, named `BookSchema`, includes fields for `uuid`, `text`, `file`, `extracted`, and `condensedInformation`. The `uuid` and `file` fields are mandatory, ensuring each document has a unique identifier and associated file path. The `extracted` field is a boolean that defaults to `false`, indicating whether information has been extracted from the book. The `text` and `condensedInformation` fields are optional, allowing for additional data storage if needed. The schema also includes automatic timestamping, which records the creation and update times for each document. The model is exported as "Context", making it accessible for use in other parts of the application to interact with the database. This setup is particularly useful for applications that need to manage and process large volumes of book data efficiently.

[Back to models](#models) | [Back to top](#table-of-contents)

# routes

## List of files

- [routes\index.js](#routesindexjs)
- [routes\api.js](#routesapijs)
- [routes\auth.js](#routesauthjs)
- [routes\notes.js](#routesnotesjs)

[Back to top](#table-of-contents)

## [routes\index.js](routes\index.js)

### Express router serving the home page with a title.

The `routes/index.js` file is an Express.js module that sets up a basic route for the home page of a web application. It utilizes the Express Router to define a single GET route at the root URL path ("/"). When a request is made to this path, the server responds by rendering an "index" view, passing an object with a title property set to "Express". This setup is typical for serving a homepage in an Express application, providing a starting point for further development of the application's routing logic. The module exports the router, making it available for inclusion in the main application file where it can be used to handle incoming requests to the root URL.

[Back to routes](#routes) | [Back to top](#table-of-contents)

## [routes\api.js](routes\api.js)

### Express app routing for authentication and note management.

The `routes/api.js` file is a central routing module in an Express application that integrates two primary routers: `authRouter` and `noteRouter`. It imports these routers from the `auth.js` and `notes.js` files, respectively. The `authRouter` handles routes related to user authentication, such as registration, login, OTP verification, and resending verification emails. Meanwhile, the `noteRouter` manages routes for note-related operations, including creating note contexts, recording speech transcripts, generating PDFs from markdown content, and interacting with OpenAI's API for note queries. By using `app.use()`, the `api.js` file mounts these routers under the `/auth` and `/notes` paths, effectively organizing the application's routing structure. This modular approach facilitates the management of authentication and note functionalities, ensuring a clean and maintainable codebase. The module exports the configured Express application, allowing it to be easily integrated into the main server setup.

[Back to routes](#routes) | [Back to top](#table-of-contents)

## [routes\auth.js](routes\auth.js)

### A simple Express router for handling authentication-related HTTP requests.

The `routes/auth.js` file is an Express router module that defines and handles HTTP routes related to user authentication in a Node.js application. It imports the `AuthController` from the `controllers/AuthController.js` file, which provides the core functionalities for user registration, login, OTP verification, and resending confirmation emails. This router sets up four main POST routes: `/register`, `/login`, `/verify-otp`, and `/resend-verify-otp`. Each route corresponds to a specific function in the `AuthController`, facilitating user registration, authentication, OTP verification for account confirmation, and resending OTPs for email verification. By exporting this router, the application can easily integrate these authentication routes into its main server setup, ensuring a modular and organized approach to handling user authentication processes.

[Back to routes](#routes) | [Back to top](#table-of-contents)

## [routes\notes.js](routes\notes.js)

### A router for handling note-related operations in an Express application.

The `routes/notes.js` file defines an Express router that manages various endpoints related to note operations within the application. It imports the `NotesController` from the `controllers/NotesController.js` file, which contains the logic for handling requests. The router sets up four POST routes, each corresponding to a specific functionality provided by the `NotesController`. The `/createContext` route allows users to create a new note context by uploading a file and ensuring no duplicate UUIDs exist. The `/recordSpeech` route facilitates the recording of speech transcripts associated with a note. The `/generatePDF` route enables the generation of a PDF document from markdown content stored in the database. Lastly, the `/chatWithPDF` route provides an interface for interacting with OpenAI's API, allowing users to query their notes and receive AI-generated responses. This router is essential for directing requests to the appropriate controller functions, thereby supporting the application's note management features.

[Back to routes](#routes) | [Back to top](#table-of-contents)

