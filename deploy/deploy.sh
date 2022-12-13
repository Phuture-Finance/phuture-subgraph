#!/bin/bash

cd /app

ls

cd repoPath/subgraphs/core

ls

until $(curl --output /dev/null --silent --head --fail http://localhost:8040); do
    printf '.'
    sleep 5
done

make cdcreate && make subgraphdeploy
