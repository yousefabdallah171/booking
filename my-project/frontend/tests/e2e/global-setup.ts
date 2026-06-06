import path from "path";

export const ADMIN_AUTH_FILE = path.join(__dirname, "../../playwright/.auth/admin.json");
export const CLIENT_AUTH_FILE = path.join(__dirname, "../../playwright/.auth/client.json");

export default async function globalSetup() {
  // Future-phase specs may import the auth file constants from here.
}
