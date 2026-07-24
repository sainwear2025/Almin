import re
with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# 1. Update provider
content = content.replace('provider = "postgresql"', 'provider = "mongodb"')

# 2. Update primary keys
content = re.sub(r'id\s+String\s+@id\s+@default\(cuid\(\)\)', 'id String @id @default(auto()) @map("_id") @db.ObjectId', content)

# 3. Update foreign keys to @db.ObjectId
# Matches something like: customerId String or assignedToId String?
# and ensures we append @db.ObjectId before any other directives or just at the end of the type
content = re.sub(r'(\w+Id)\s+String(\?)?', r'\1 String\2 @db.ObjectId', content)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)
