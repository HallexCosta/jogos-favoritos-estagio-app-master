# Idempotent

![Idempotency](https://miro.medium.com/max/700/1*mDGl28XwDXkMgJqIGDXvwA.png)

## Annotations

### GET

- success -> 200  
The resource has been fetched and is transmitted in the message body.

- error -> 400, 403  
Indicates that the request could be not completed because server supported this request or user not sending anything in header to authenticate

### POST

- success -> 200, 201  
Indicates that the request has succeeded and a new resource has been created as a result.

- error -> 400  
Indicates that the server could not understand the request due to invalid syntax.

### PUT
- success -> 200  
Indicates that the request has succeeded.

- error -> 400  
Indicates that the server could not understand the request due to invalid syntax.

### DELETE

- success -> 200, 204 or 202  
Indicates that the request could be completed "resource deleted successfully"

- error -> 409  
Indicates that the request could not be completed due to a conflict with the current state of the target resource.
This code is used in situations where the user might be able to resolve the conflict and resubmit the request.

References:  
https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses  
https://stackoverflow.com/questions/2342579/http-status-code-for-update-and-delete  
https://stackoverflow.com/questions/25122472/rest-http-status-code-if-delete-impossible  
https://medium.com/@lucasschwenke/idempot%C3%AAncia-uma-boa-pr%C3%A1tica-a-se-utilizar-em-servi%C3%A7os-rest-633c38f4d7c0
