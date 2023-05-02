#!/bin/bash

# Connect to the database using mongosh
mongosh <<EOF

use researchSecureDB;

db.researchdatas.updateOne({title:"What is your hobby"},{ \$set: { "responses.0": "Swimming" } });

exit

EOF