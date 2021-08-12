#!/usr/bin/env python3
from firebase_admin import credentials
from firebase_admin import firestore
import firebase_admin
import random
import sys

cred = credentials.Certificate('key.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

entries_ref = db.collection(u'entries')
entries = entries_ref.stream()

in_mem = []
for entry in entries:
    in_mem.append(entry.to_dict())

if len(sys.argv) == 1:
    print(f'Total number of entries is {len(in_mem)}')
    sys.exit(0)

if len(sys.argv) != 2:
    print("Usage: python3 chicken-dinner.py <number of winners>")
    sys.exit(1)

winners = int(sys.argv[1])
print(f"Drawing {winners} winners")

winners = random.sample(in_mem, winners)

for winner in winners:
    print(f"{winner['displayName']} wins!")
