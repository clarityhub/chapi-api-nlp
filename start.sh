#!/bin/bash

docker build ./fixtures/docker/local -t clarityhub-api-nlp

docker run \
    -it \
    --rm \
    --publish 8010:8000 \
    --publish 4010:4000 \
    --network=clarityhub-network \
    --mount src="$(pwd)",target=/server,type=bind \
    --network-alias clarityhub-api-nlp \
    --name clarityhub-api-nlp \
    clarityhub-api-nlp