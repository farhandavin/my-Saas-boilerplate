# Backend Architecture

We strictly adhere to the **Service-Repository Pattern**. This prevents "Fat Controllers" and ensures the code is maintainable.

## The 3-Layer Flow

Data flows through the application in this specific order:

````mermaid
graph LR
    A[Request] --> B[Router]
    B --> C[Controller]
    C --> D[Service]
    D --> E[Repository]
    E --> F[Database]

    ---
sidebar_position: 2
---

# Backend Architecture

We strictly adhere to the **Service-Repository Pattern**. This prevents "Fat Controllers" and ensures the code is maintainable.

## The 3-Layer Flow

Data flows through the application in this specific order:

```mermaid
graph LR
    A[Request] --> B[Router]
    B --> C[Controller]
    C --> D[Service]
    D --> E[Repository]
    E --> F[Database]
````
