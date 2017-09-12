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

const app = express();

app.use(express.static('app'))

app.get('/api/:search', (req, res) => {
  const search = req.params.search;

  getNames(search)
  .then((names) => {
    res.status(200)
        .send(names)
        .end();
    })
});

function test (search) {
    return search
}



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
    const sqlQuery = "SELECT name as value, name as display FROM test1.products where substr(name, 0, @slen) = @search LIMIT 5;";

    // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
    const options = {
      query: sqlQuery,
      useLegacySql: false, // Use standard SQL syntax for queries.
      parameterMode: "NAMED",
      maxResults: 5,
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
        return results[0]
      })
//      .then((results) => {
//        const rows = results[0];
//        console.log('Rows:');
//        rows.forEach((row) => console.log(row));
//      })
//      .catch((err) => {
//        console.error('ERROR:', err);
//      });

//      return "names"
}









// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


// [END app]
