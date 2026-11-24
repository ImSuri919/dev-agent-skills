---
name: api-contract
description: Pin down the request, response, and error shape of an endpoint before code is written. Use when designing or changing an HTTP API.
---

# api-contract

## Purpose

Write down what a caller can send and what the server promises to return, so the two sides can be built and tested independently.

## When to use

- Designing a new endpoint.
- Changing a response shape or adding a required field.
- Reviewing an API diff for breaking changes.

## Steps

1. Write the method and path, then the job the endpoint does in one sentence.
2. Define authentication and the scope or role required.
3. List request fields with type, whether they are required, and a valid example. State the default for optional fields.
4. Define the success response with exact field names and types. Show a full example.
5. List each failure case with status code, error code, and response body. Cover validation, auth, not found, and conflict.
6. Decide how lists paginate, how writes behave when retried, and how versions are selected.
7. Mark every field as stable or experimental. Mark anything removed or renamed as a breaking change.
8. Turn open questions into a short list with an owner each.

## Output format

A contract block with sections: Endpoint, Auth, Request, Success, Errors, Pagination and retries, Compatibility. End with Open questions. Use examples, not type names alone.

## Avoid

- Describing fields only in prose when an example would settle the shape.
- Returning different error bodies for the same status code.
- Adding a required field to an existing response without calling it breaking.

## Example

Endpoint: POST /v1/orders

Auth: Bearer token, scope orders:write.

Request: {"sku": "A-12", "quantity": 2}, both required.

Success: 201 {"id": "ord_9", "total": 2400, "currency": "INR"}.

Errors: 422 {"code": "invalid_sku", "field": "sku"}, 409 {"code": "out_of_stock"}.

Pagination and retries: not applicable. Idempotency key required on retries.

Compatibility: total is an integer in minor units. Adding fields is stable; renaming is breaking.
