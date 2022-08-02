#!/bin/bash

set -e

docker build ./fixtures/docker/local -t clarityhub-api-nlp

docker run \
    -it \
    --rm \
    --publish 8000:8000 \
    --publish 4000:4000 \
    --network=clarityhub-network \
    --mount src="$(pwd)",target=/server,type=bind \
    --network-alias clarityhub-api-nlp \
    --name clarityhub-api-nlp \
    --entrypoint "test" \
    clarityhub-api-nlp

echo $?