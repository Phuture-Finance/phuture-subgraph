#!/bin/bash

cd /app

ls

cd repoPath/subgraphs/mvp

ls

sleep 60

make cdcreate && make subgraphdeploy

#sleep infinity
