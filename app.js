/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START app]
const express = require('express');
const memjs = require('memjs');

const app = express();

// [START client]
// Environment variables are defined in app.yaml.
//var MEMCACHE_URL = null
//
//if (process.env.USE_GAE_MEMCACHE) {
//    MEMCACHE_URL = `${process.env.GAE_MEMCACHE_HOST}:${process.env.GAE_MEMCACHE_PORT}`;
//} else {
//
//}
const MEMCACHE_URL = '104.198.232.129:11211';
console.log(`MEMCACHE_URL: ${MEMCACHE_URL}`)
const mc = memjs.Client.create(MEMCACHE_URL);
// [END client]


app.use(express.static('app'))

app.get('/api/:search', (req, res, next) => {
    const search = req.params.search.toString();
    mc.get(search, (err, value) => {
        if (err) {
          next(err);
          return;
        }
        if (value) {
          console.log(value.toString('utf-8'))
          res.status(200).send(value.toString('utf-8'));
          return;
        }
        console.log(search)

        getNames(search)
        .then((names) => {
            console.log("Cache Miss.");
            console.log(names);
            console.log(search)
            mc.set(search, names, {expires:86400});
            return names;
        })
        .then((names) => {
            res.status(200)
                .send(names)
                .end();
        })
    });
});

let job;

// Runs the query as a job
function getNames (search) {
    // Imports the Google Cloud client library
    const BigQuery = require('@google-cloud/bigquery');

    // The project ID to use, e.g. "your-project-id"
    const projectId = "strange-passage-420";

    // Instantiates a client
    const bigquery = BigQuery({
      projectId: projectId
    });

    // The SQL query to run, e.g. "SELECT * FROM publicdata.samples.natality LIMIT 5;"
    const sqlQuery = "SELECT name as value, name as display FROM test1.products where lower(substr(name, 0, @slen)) = lower(@search) LIMIT 10;";

    // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
    const options = {
      query: sqlQuery,
      useLegacySql: false, // Use standard SQL syntax for queries.
      parameterMode: "NAMED",
      queryParameters: [
        {
          "name": "search",
          "parameterType": {
            "type": "STRING"
          },
          "parameterValue": {
            "value": search
          }
        },
        {
          "name": "slen",
          "parameterType": {
            "type": "INTEGER"
          },
          "parameterValue": {
            "value": search.length
          }
        }
      ]
    };
    return bigquery
      .startQuery(options)
      .then((results) => {
        job = results[0];
        console.log(`Job ${job.id} started.`);
        return job.promise();
      })
      .then((results) => {
        // Get the job's status
        return job.getMetadata();
      })
      .then((metadata) => {
        // Check the job's status for errors
        const errors = metadata[0].status.errors;
        if (errors && errors.length > 0) {
          throw errors;
        }
      })
      .then(() => {
        console.log(`Job ${job.id} completed.`);
        return job.getQueryResults();
      })
      .then((results) => {
        console.log(results)
        return JSON.stringify(results[0])
      })
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


// [END app]
