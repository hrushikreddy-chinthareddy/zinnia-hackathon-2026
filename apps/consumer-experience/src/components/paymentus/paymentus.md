## Building the SSO Token

From the paymentus documentation the following token parameters are accepted for building the SSO token:

| Parameter Name | Required | Description |
| --- | --- | --- |
| `token` | N | Tokenized profile value for a previously created payment method. When a token is present then the user will be editing an existing payment method instead of adding. |
| `ownerId` | N | Unique identifier indicating to whom the payment method belongs (email address mapping to loginId used to retrieve profile). If not provided then the payment method is anonymous and will not be retrievable via our List Profiles API. |
| `externalId` | N | Optional via configuration. This parameter adds a unique identifier to a newly created tokenized payment method. Future attempts to use the payment method will require the encrypted form of this value. |
| `postMessagePmDetailsOrigin` | Y | URL where the payment method token will be posted to. If a redirect is not provided, bypass can be used to present a page with a message to the user. |
| `lang` | N | 2 to 5 letter language (e.g. en, fr, or es_us). |
| `firstName` | N | Will be used to prepopulate card holder name field |
| `lastName` | N | Will be used to prepopulate card holder name field |
| `email` | N | User’s email address |
| `timestamp` | Y | milliseconds since January 1, 1970, 00:00:00 GMT |
| `externalReference` | N | A custom reference number to be returned in the post-back |
| `cvv` | N | [true|false] - Hide CVV field when not required for validation |
| `ignoreCase` | N | [true|false] - Used to override standard case sensitivity settings. If true then letter casing of ownerId will be preserved in resulting wallet owner’s loginId. |
| `nickname` | N | [true|false] - Used to hide the optional nickname field. If false, then the nickname field will be hidden. Note field only applies if we enable client configuration to show the nickname by default. |
| `primaryPM` | N | [true|false] - Used to hide the optional primary payment method checkbox. If false, then the primary PM checkbox will be hidden. Note field only applies if we enable client configuration to show the primary PM checkbox by default. |
| `paymentTypeCode` | N | Payment Type Configured by Paymentus. Passed when using PayPal with multiple MIDs and depends on the merchant ID configured for PayPal. |
| `pmCategory` | Y | see mappings below |

NOTE!!!! That in the paymentus documentation, the postMessagePmDetailsOrigin is referred to as postbackUrl, however, in the farmers examples, they are using postMessagePmDetailsOrigin so in order to match their implementation, we are going with the postMessagePmDetailsOrigin

### pmCategory options

### pmCategory options

| pmCategory | Description |
| --- | --- |
| CC | Credit Card |
| DC | Debit Card |
| DD | E-Check |
| PD | ATM Card |
| CP_POS | Card Present |
| AP | Apple Pay |
| GP | Google Pay |
| PAYPAL_ACCOUNT | PayPal |
| PAYPAL_CREDIT | PayPal Credit |
| VENMO | Venmo |
| AMAZON_PAY | Amazon Pay |
| WALMART_PAY | Walmart Pay |

## Encrypting the token
From Paymentus:

The token will be constructed as a set of key=value pairs separated by a semicolon (;), the resultant string will be encrypted with AES and a pre-shared secret key, the resultant output will then be converted into a string with HEX character encoding.
The following AES cipher attributes should be used to construct the token:
 Rijndael cipher
 Electronic Code Book mode (ECB) / Galois Counter Mode (GCM)
 No built in padding (such as PKCS)
 Resultant encrypted buffer should be manually padded with spaces to achieve the total length a multiple of 32. That is: length(encrypted padded string) mod 32 = 0
For example, instantiate the cipher and initialize it using Java standard SunJCE cryptological library the code would contain: Cipher cipher = Cipher.getInstance("Rijndael/ECB/NoPadding", "SunJCE");

