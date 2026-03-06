Deployment Fix Task

The project is already deployed.

Frontend (Vercel)
https://flagger-fawn.vercel.app

Backend (Render)
https://blog-6isi.onrender.com

The problem is that login and API requests from the deployed frontend are not working. Update the codebase so the frontend correctly communicates with the deployed backend in production.

Create a centralized API configuration in the frontend.

Create a file at:

src/config/api.js

Add the following code:

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://blog-6isi.onrender.com
";

export default API_BASE_URL;

Update all API calls in the frontend.

Search the entire frontend codebase for any API calls using:

http://localhost:5000

Replace them so they use the API_BASE_URL constant.

Example change:

Before:
axios.post("http://localhost:5000/api/auth/login
", data)

After:
import API_BASE_URL from "../config/api";

axios.post(${API_BASE_URL}/api/auth/login, data)

Make sure every axios or fetch request uses API_BASE_URL.

Add environment variable support in the frontend.

Create a .env file inside the frontend project with this content:

VITE_API_URL=https://blog-6isi.onrender.com

Ensure the project reads this variable using import.meta.env.VITE_API_URL.

Fix backend CORS configuration.

Ensure the backend allows requests from the deployed frontend.

Install cors if it is not installed.

npm install cors

Then configure CORS in the Express server:

const cors = require("cors");

app.use(cors({
origin: [
"http://localhost:5173",
"https://flagger-fawn.vercel.app
"
],
credentials: true
}));

Ensure the backend uses the dynamic PORT provided by Render.

Update the server start code to:

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(Server running on port ${PORT});
});

Ensure Express JSON middleware exists.

Add this if missing:

app.use(express.json());

Add a simple health route to verify deployment.

app.get("/", (req, res) => {
res.send("Backend running");
});

After implementing these changes, rebuild and redeploy both services.

Push backend changes to GitHub so Render redeploys.

Push frontend changes so Vercel redeploys.

Then verify that requests from https://flagger-fawn.vercel.app
 successfully call the backend at https://blog-6isi.onrender.com/api/
*.