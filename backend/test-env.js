import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("TEST KEY =", process.env.LINGODOTDEV_API_KEY);
