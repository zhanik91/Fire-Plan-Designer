
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

const rawData = `DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast A_s6-fKkh
DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast k4AbsbJN
DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast eaqUJ3EBr
DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast smg-VSU6
DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast XvV!2VEk
DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast I6?9Gh_8r
DISTRICT DISTRICT ДЧС г.Алл УЧС Алата dist_g_aln h6Zy?S?w
DISTRICT DISTRICT ДЧС г.Алл УЧС Алма dist_g_aln f-EZFZwYN
DISTRICT DISTRICT ДЧС г.Алл УЧС Ауэзс dist_g_aln SNfwCNCi
DISTRICT DISTRICT ДЧС г.Алл УЧС Боста dist_g_aln ?h?TR_wn
DISTRICT DISTRICT ДЧС г.Алл УЧС Жеть dist_g_aln v7Pcw$?U
DISTRICT DISTRICT ДЧС г.Алл УЧС Меде dist_g_aln %hdy!MU
DISTRICT DISTRICT ДЧС г.Алл УЧС Науры dist_g_aln EBKanVRc
DISTRICT DISTRICT ДЧС г.Алл УЧС Туркс dist_g_aln wqtzGbQq
DISTRICT DISTRICT ДЧС г.Шы УЧС Абай dist_g_shy LVWn4525
DISTRICT DISTRICT ДЧС г.Шы УЧС Аль-Ф dist_g_shy kReL3ejGL
DISTRICT DISTRICT ДЧС г.Шы УЧС Енбеш dist_g_shy SignpesYR
DISTRICT DISTRICT ДЧС г.Шы УЧС Туран dist_g_shy zE@?24dD
DISTRICT DISTRICT ДЧС г.Шы УЧС район dist_g_shy 7ZQM3@5
DISTRICT DISTRICT ДЧС Акмо УЧС город dist_akmo ibH22B38E
DISTRICT DISTRICT ДЧС Акмо ОЧС Жарк dist_akmo g?98-MTJu
DISTRICT DISTRICT ДЧС Акмо ОЧС Акко dist_akmo UG4CFVUfg
DISTRICT DISTRICT ДЧС Акмо ОЧС Арша dist_akmo UhsY3jCFS
DISTRICT DISTRICT ДЧС Акмо ОЧС Астр dist_akmo @*FNR*5S
DISTRICT DISTRICT ДЧС Акмо ОЧС Атба dist_akmo HH*xnuKU
DISTRICT DISTRICT ДЧС Акмо ОЧС район dist_akmo uj9%g!%m
DISTRICT DISTRICT ДЧС Акмо ОЧС Була dist_akmo c5?tH%l78
DISTRICT DISTRICT ДЧС Акмо ОЧС Бура dist_akmo m64afvcm
DISTRICT DISTRICT ДЧС Акмо ОЧС Егин dist_akmo _-%ujp8ff
DISTRICT DISTRICT ДЧС Акмо ОЧС Ерей dist_akmo kcGW#SsA
DISTRICT DISTRICT ДЧС Акмо ОЧС Есил dist_akmo _mVoAU8
DISTRICT DISTRICT ДЧС Акмо ОЧС Жакс dist_akmo pNPHTHjZ
DISTRICT DISTRICT ДЧС Акмо ОЧС Зере dist_akmo Pnjpy?gj
DISTRICT DISTRICT ДЧС Акмо ОЧС Корг dist_akmo DvEtJTeCK
DISTRICT DISTRICT ДЧС Акмо ОЧС город dist_akmo Xei9n!_*2
DISTRICT DISTRICT ДЧС Акмо УЧС Санд dist_akmo K6n8VL?u
DISTRICT DISTRICT ДЧС Акмо УЧС город dist_akmo QPLq_Viu
DISTRICT DISTRICT ДЧС Акмо ОЧС Цели dist_akmo ?cV@FAR5
DISTRICT DISTRICT ДЧС Акмо ОЧС Шорт dist_akmo pQcBERV
DISTRICT DISTRICT ДЧС Актю УЧС город dist_aktob !QTRisKMK
DISTRICT DISTRICT ДЧС Актю ОЧС Айте dist_aktob QrmKWBg
DISTRICT DISTRICT ДЧС Актю ОЧС Алги dist_aktob %vWt%W
DISTRICT DISTRICT ДЧС Актю ОЧС Байг dist_aktob 7YraGL4@
DISTRICT DISTRICT ДЧС Актю ОЧС Ирги dist_aktob XZJ7n7#JJ
DISTRICT DISTRICT ДЧС Актю ОЧС Карг dist_aktob j@5PYvuv
DISTRICT DISTRICT ДЧС Актю ОЧС Кобд dist_aktob 455WzdBr
DISTRICT DISTRICT ДЧС Актю ОЧС Март dist_aktob XuVsHACs
DISTRICT DISTRICT ДЧС Актю ОЧС Муга dist_aktob zh?eNFAV
DISTRICT DISTRICT ДЧС Актю ОЧС Теми dist_aktob y88!ngZ8
DISTRICT DISTRICT ДЧС Актю ОЧС Уилс dist_aktob 8UY2c?nM
DISTRICT DISTRICT ДЧС Актю ОЧС Хром dist_aktob 6@@$Nq5
DISTRICT DISTRICT ДЧС Актю ОЧС Шалк dist_aktob JJSk-YLKdE`;

async function seed() {
  console.log("Seeding users...");
  const lines = rawData.split('\n');

  // Create a default admin user first if needed, or just these users.
  // The username in the file looks like 'dist_g_ast', which repeats.
  // Wait, the username column in the image was column 5.
  // The provided text has spaces.
  // Example: DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast A_s6-fKkh
  // 1: DISTRICT (Level)
  // 2: DISTRICT (Role)
  // 3-4-5-6?: "ДЧС г.Аст УЧС район" (Region/Unit - seems split by spaces)
  // Second to last: username
  // Last: password

  // Actually, looking at the image provided earlier or the text dump:
  // "DISTRICT DISTRICT ДЧС г.Аст УЧС район dist_g_ast A_s6-fKkh"
  // It seems like:
  // Level: DISTRICT
  // Role: DISTRICT
  // Region: "ДЧС г.Аст"
  // Unit: "УЧС район"
  // Username: "dist_g_ast"
  // Password: "..."

  // BUT the username "dist_g_ast" is repeated on multiple lines!
  // This violates the UNIQUE constraint on username.
  // Maybe they are different users with same prefix? No, the text says "dist_g_ast" exactly.
  // Wait, look at the suffix of the lines.
  // "dist_g_ast A_s6-fKkh"
  // "dist_g_ast k4AbsbJN"
  // They have different passwords.
  // This implies either:
  // 1. The username is NOT unique in the source system (bad).
  // 2. The username column in the image is just a prefix or a shared account name, and maybe they use different credentials for different people sharing the account? Unlikely.
  // 3. I am misinterpreting the columns.

  // Let's look at the image text again.
  // Row 1: dist_g_ast ...
  // Row 2: dist_g_ast ...

  // If the username is identical, I cannot create unique users with the same username in my schema.
  // I will append an index to the username to make them unique for now, e.g. dist_g_ast_1, dist_g_ast_2.
  // OR, maybe the "Region/Unit" part makes them distinct?
  // "ДЧС г.Аст УЧС район" is on multiple lines too.

  // Let's just append an index to duplicates.

  const seenUsernames = new Map<string, number>();

  for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(' ');
      const password = parts.pop();
      const usernameBase = parts.pop();
      const role = parts[1]; // DISTRICT
      const level = parts[0]; // DISTRICT

      // The middle part is Region + Unit. Hard to split exactly without more info.
      // "ДЧС г.Аст УЧС район" -> Region: "ДЧС г.Аст", Unit: "УЧС район" ?
      // Let's just join the rest as "RegionUnit".
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
              region: regionUnit, // Storing combined for now
              unit: ""
          });
          console.log(`Created user: ${username}`);
      } catch (e) {
          console.error(`Failed to create ${username}:`, e);
      }
  }
}

seed().catch(console.error);
