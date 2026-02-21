C:.
│   .env
│   package-lock.json
│   package.json
│   README.md
│   server.js
│
└───src
    │   app.js
    │
    ├───config
    │       db.js
    │       passport.js
    │
    ├───controllers
    │       admin.controller.js
    │       auth.controller.js
    │       oauth.controller.js
    │       post.controller.js
    │       public.controller.js
    │       user.controller.js
    │
    ├───middleware
    │       adminAuth.js
    │       auth.js
    │       errorHandler.js
    │       validate.js
    │
    ├───models
    │       otp.js
    │       post.js
    │       refreshToken.js
    │       user.js
    │
    ├───routes
    │       admin.routes.js
    │       auth.routes.js
    │       post.routes.js
    │       public.routes.js
    │       user.routes.js
    │
    ├───services
    │       auth.service.js
    │       email.service.js
    │       oauth.service.js
    │       otp.service.js
    │       post.service.js
    │       public.service.js
    │       user.service.js
    │
    └───utils
            authValidator.js
            postValidator.js