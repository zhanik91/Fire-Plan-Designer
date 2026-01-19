
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";
import { SEED_USERS_DATA } from "../server/seed_data";

async function seed() {
  console.log("Seeding users...");
  const lines = SEED_USERS_DATA.split('\n');
  const seenUsernames = new Map<string, number>();

  for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(' ');
      const password = parts.pop();
      const usernameBase = parts.pop();
      const role = parts[1]; // DISTRICT
      const level = parts[0]; // DISTRICT

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

      // Hash password
      const hashedPassword = await hashPassword(password);

      try {
          await storage.createUser({
              username,
              password: hashedPassword,
              role,
              level,
              region: regionUnit,
              unit: ""
          });
          console.log(`Created user: ${username}`);
      } catch (e) {
          console.error(`Failed to create ${username}:`, e);
      }
  }
}

seed().catch(console.error);
