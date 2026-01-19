import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";
import { SEED_USERS_DATA } from "./seed_data";

export async function seedUsers() {
  console.log("Seeding users from internal list...");
  const lines = SEED_USERS_DATA.split('\n');
  const seenUsernames = new Map<string, number>();

  for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(' ');
      const password = parts.pop();
      const usernameBase = parts.pop();
      const role = parts[1];
      const level = parts[0];
      const regionUnit = parts.slice(2).join(' ');

      if (!usernameBase || !password) continue;

      let username = usernameBase;
      if (seenUsernames.has(usernameBase)) {
          const count = seenUsernames.get(usernameBase)! + 1;
          seenUsernames.set(usernameBase, count);
          username = `${usernameBase}_${count}`;
      } else {
          seenUsernames.set(usernameBase, 1);
      }

      try {
          const existing = await storage.getUserByUsername(username);
          if (!existing) {
             const hashedPassword = await hashPassword(password);
             await storage.createUser({
                  username,
                  password: hashedPassword,
                  role,
                  level,
                  region: regionUnit,
                  unit: ""
             });
          }
      } catch (e) {
          console.error(`Failed to create ${username}:`, e);
      }
  }
}
