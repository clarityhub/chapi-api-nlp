# CHAPI Clarity Hub NLP API

Manages to embed two complete tensorflow models into a lambda.

## Prerequisites

Make sure you have CHAPI API Gateway installed and running.

## 🚀 Getting Started

Make sure you have Docker installed and running

```bash
sh ./start.sh
```

You can now access the following:

* API: `GET https://api.clarityhub.app/nlp/health`

## Authentication

The Clarity Hub NLP API uses Authorization Bearer tokens. Every API
request must contain an Authorize HTTP header with a token.

Access tokens are specific to your user.

```bash
$ curl \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d "@conversation.txt" \
  'https://api.clarityhub.io/nlp
```

Normally, you will use "Basic Auth" where the user name is your API Access Key ID and you password is the API Acess Key Secret. On local, your password must be your Organization ID. Local development will skip the Authorization check and pass through the Organization ID as if it checked your key.

## Serverless Resources

### S3 Bucket

There is an S3 Bucket named `ml.clarityhub.io` where the `/data` folder in this repo is copied to. It is being manually copied over right now.

## API

See `https://api.clarityhub.app/nlp/swagger` for the Swagger API.
