---
outline: deep
---

# Azure

Microsoft's answer to AWS. Azure is Microsoft's cloud computing platform, offering a similarly sprawling catalogue of services - compute, storage, databases, networking and, increasingly, a heavy focus on AI via Azure AI / Foundry. If your organisation already lives inside the Microsoft ecosystem (Office, Active Directory, Teams and friends), Azure tends to be the path of least resistance. The notes below are mostly centred around CLI authentication and Cognitive Services.

## The Basics

Some handy portal links for the `ca-action-sync-dev` resource:

- [Foundry - ca-action-sync-dev](https://ai.azure.com/foundryResource/overview?wsid=/subscriptions/8cb1add0-56ef-4d02-84f2-07d82a286d95/resourceGroups/rg-action-sync-dev/providers/Microsoft.CognitiveServices/accounts/ca-action-sync-dev&tid=b18fd384-7337-4ce8-a686-c4ea2991d36a)
- [Model Deployments](https://ai.azure.com/resource/deployments?wsid=/subscriptions/8cb1add0-56ef-4d02-84f2-07d82a286d95/resourceGroups/rg-action-sync-dev/providers/Microsoft.CognitiveServices/accounts/ca-action-sync-dev&tid=b18fd384-7337-4ce8-a686-c4ea2991d36a)
- [Monitor and track your quota usage](https://ai.azure.com/resource/quota?wsid=/subscriptions/8cb1add0-56ef-4d02-84f2-07d82a286d95/resourceGroups/rg-action-sync-dev/providers/Microsoft.CognitiveServices/accounts/ca-action-sync-dev&tid=b18fd384-7337-4ce8-a686-c4ea2991d36a)

## Azure CLI Authentication

### 1. Install the Azure CLI

[Install Azure CLI (macOS)](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-macos?view=azure-cli-latest)

```bash
brew update && brew install azure-cli
```

Check the install:

```bash
az --version
```

### 2. Sign in

Use `az login` to sign in to your Azure account. This opens a web browser where you can enter your credentials. Once authenticated, the CLI is ready to use.

```bash
az login
```

If you want to authenticate via a code instead (handy for opening in a specific browser), use the device code flow and follow the instructions:

```bash
az login --use-device-code
```

You'll be prompted with something like this:

```text
To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code GFLUJNEX7 to authenticate.
```

After signing in, you'll be asked to pick a tenant and subscription:

```text
Retrieving tenants and subscriptions for the selection...

[Tenant and subscription selection]

No     Subscription name     Subscription ID                       Tenant
-----  --------------------  ------------------------------------  -----------------
[1] *  Azure subscription 1  8cb1add0-56ef-4d02-84f2-07d82a286d95  Default Directory

The default is marked with an *; the default tenant is 'Default Directory' and subscription is 'Azure subscription 1' (8cb1add0-56ef-4d02-84f2-07d82a286d95).

Select a subscription and tenant (Type a number or Enter for no changes): 1

Tenant: Default Directory
Subscription: Azure subscription 1 (8cb1add0-56ef-4d02-84f2-07d82a286d95)
```

Show the currently logged in account:

```bash
az account show
```

### 3. Service principal authentication

For automated scripts or applications, you'll usually want to authenticate with a service principal rather than an interactive login. Create one with:

```bash
az ad sp create-for-rbac --name <your-service-principal-name> --role Contributor --scopes /subscriptions/<your-subscription-id>
```

This outputs a JSON object containing the `appId`, `password`, and `tenant` values, which you can then use to authenticate.

### 4. Set environment variables

You can expose the service principal credentials as environment variables to use them in your scripts:

```bash
export AZURE_CLIENT_ID=<appId>
export AZURE_SECRET=<password>
export AZURE_TENANT=<tenant>
```

### 5. Use Azure Key Vault

For storing sensitive information like keys and secrets, consider using Azure Key Vault. Create a vault and store secrets with:

```bash
az keyvault create --name <your-keyvault-name> --resource-group <your-resource-group> --location <your-location>
az keyvault secret set --vault-name <your-keyvault-name> --name <your-secret-name> --value <your-secret-value>
```

These steps will help you set up and manage authentication for the Azure CLI effectively.

## Cognitive Services Account

Often when you destroy via Terraform you need to purge the resources before you can recreate them:

```bash
az cognitiveservices account purge --location eastus2 --resource-group rg-action-sync-dev --name ca-action-sync-dev
```

List deleted cognitive services accounts:

```bash
az cognitiveservices account list-deleted
```

### What is a Cognitive Services account?

A **Cognitive Services account** is the Azure resource type `Microsoft.CognitiveServices/accounts`. All of the AI services (OpenAI, Speech, Language, etc.) are "Cognitive Services accounts" under the hood.

In Azure, this account is the resource that represents "your" AI service. It's the thing that:

- Has a unique URL (endpoint) that your app calls.
- Has API keys that prove your app is allowed to use that endpoint.
- Is the billing and identity boundary - usage is tracked and billed to this account, and access is controlled here.

So when we say "set up a Cognitive Services account", we mean: create this one resource in Azure that gives you an endpoint and keys to call AI models (like OpenAI, or others that Azure hosts).

Useful docs:

- [What is a Cognitive Services account?](https://learn.microsoft.com/en-us/azure/ai-services/multi-service-resource) - explains the account as the single entry point for using Azure AI services, how it's created in a resource group, and how you get an endpoint and keys.
- [Quickstart: Create a Cognitive Services resource](https://learn.microsoft.com/en-us/azure/ai-services/multi-service-resource) - creating "a resource" in the portal is exactly creating one of these accounts; Terraform does the same thing in code.

In short: a Cognitive Services account is the one Azure resource that gives you an endpoint + keys to call AI.

### Cognitive Services vs Foundry

**Foundry** is a use of that same resource type with `kind = "AIServices"`. So a "Foundry account" is a Cognitive Services account created with `kind = "AIServices"`, used for Microsoft Foundry / AI Studio (model catalog, deployments like Claude, playground, etc.).

So Foundry is a Cognitive Services account (same resource type), but one with a specific kind and purpose. Other kinds (e.g. `OpenAI`, `CognitiveServices`) are also Cognitive Services accounts, but they don't behave as "Foundry" and don't support the same deployment model.

### Why do we need to set it up?

Your app doesn't talk to "OpenAI" or "Claude" directly - it talks to Azure, and Azure needs to know:

- **Who is calling?** → The account (identified by endpoint + API key).
- **What are they allowed to use?** → The models you deploy under that account (e.g. a "Claude" deployment, an "embeddings" deployment).

So the flow is:

1. You create one Cognitive Services account → Azure gives you one endpoint and one set of keys.
2. You create deployments on that account → each deployment is "this model, at this name" (e.g. `claude`, `text-embedding-3-small`). Your app then calls the same endpoint but specifies which deployment name to use for chat vs embeddings.
3. Your app uses the env vars:
   - **Endpoint + key** = "where to call" and "how to authenticate" (both come from the account).
   - **Model / deployment names** = "which deployment to use" for chat and for embeddings (from the deployments).

Without the account, there is no endpoint or key for your app to use. So we set up the Cognitive Services account (and then deployments) so that Azure can give you the endpoint, keys and deployment names your app expects.
