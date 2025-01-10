# Documents Page and Downloading a document

The tax docs vs not tax docs page/component split happens whenever the different properties between the two need to be explicitly called. For the list components, that’s for rendering. For the download routeHandlers that’s when the specific doc download is called. I separated them to try to keep the routeHandler url as close to the actual api call as possible, so that it’s clear you’re explicitly calling a certain type of doc.

```mermaid
graph TD
    A[Annuities Documents Page] --> B[DocumentsView.tsx]
    C[Policies Documents Page] --> B

    B --> D[DocumentsWithPagination.tsx]

    D --> E[DocumentsList.tsx]
    D --> F[DocumentsListTax.tsx]

    E --> G[["pdf-previewer/[coverage]/[lineOfBusiness]/[pinCode]/[policyNumber]/documents/[documentId]/page.tsx"]]
    F --> G

    G --> H[PdfPreviewer.tsx]

    H --> I[["api/documents/tax-docs/[documentId]/download/[fileName]/route.ts"]]
    H --> J[["api/documents/[documentId]/download/[fileName]/route.ts"]]

    I --> K[services/document/index.ts]
    J --> K

    K --> L[getTaxDocumentDownload]
    K --> M[getDocumentDownload]

```
