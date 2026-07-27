---
outline: deep
---

# Terraform

Say goodbye to click ops! Terraform is HashiCorp's infrastructure-as-code (IaC) tool that lets you define your entire cloud setup - servers, databases, networks, permissions and all - in declarative config files rather than provisioning it by hand. You describe the state you want, Terraform works out how to get there, and the same code can spin up, tear down and reliably reproduce environments as many times as you like. It's cloud-agnostic too, so the same workflow covers AWS, Azure, GCP and hundreds of other providers.

## The Basics

### What is it?

Terraform is an infrastructure management tool that lets you provision and manage cloud resources. It's a command line program you run to define and make changes to your infrastructure, but Terraform is also a language that defines those changes.

One thing Terraform is *not* is a config management tool - once you set up a resource you can't really change what's running on it. For that sort of thing you'd use a tool like Puppet.

### Set up

You download it from the site. They have two offerings: a cloud managed service (a GUI-like interface with GitHub integration) and the plain terminal CLI tool.

Since we've got brew we can install directly from the terminal:

```bash
brew tap hashicorp/tap
brew install hashicorp/terraform
```

Check it's installed:

```bash
terraform -help
```

### Setting up AWS for Terraform

Pretty straightforward. Use IAM to create a user called `terraform` and give them admin access via that policy. You can have the user access AWS programmatically only, as this user doesn't need console access.

You'll get an Access Key ID and a Secret Access Key. Create a credentials file to store them. When you save it, make sure it isn't suffixed with `.txt` - it just needs to be named `credentials`. Create a `.aws` folder (`.` hides folders from immediate view; use `ls -a` to see all folders):

```ini
[default]
aws_access_key_id = <YOUR_ACCESS_KEY_ID>
aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>
```

Because it's a hidden folder, Finder won't show it when saving, so save the file then move it: `mv credentials .aws`.

This is how you set credentials for use by the AWS SDK. See the [AWS SDK credentials setup docs](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html). `default` is the terraform user, fine to use for testing.

Then create a folder and start adding Terraform files.

### Initial Deployment

Run `terraform init` (make sure you're in the same directory as the `.tf` files). This initializes Terraform, looks for any `.tf` files, and downloads/installs the plugins it needs for working with AWS.

Run `terraform plan` first, then `terraform apply`, which shows the resource / policy it's going to create and what it's going to do. You'll be prompted to enter `yes` to confirm. Then navigate to the AWS console and there it is.

::: tip
Terraform finds the credentials file automatically and reads the access keys from there - no extra config needed.
:::

### AWS Vault

AWS Vault manages your access keys. This is more secure than storing credentials locally, as it uses your IdP (Okta) and SSO, which can detect contextual information around the sign-in.

One slightly annoying thing: it doesn't let you export a global variable, so you have to declare which account you want to use each time you run a command.

## State

Terraform must store state about your managed infrastructure and configuration. This state maps real-world resources to your configuration, keeps track of metadata, and improves performance for large infrastructures.

```bash
terraform state list
```

State is stored by default in a local file named `terraform.tfstate`, but it can also be stored remotely, which works better in a team environment.

### Setting a backend

Rather than storing the state file locally, set up a *backend* that stores the file in an S3 bucket. Reasons to do this:

- We don't want to store any sensitive values locally.
- A local state file provides no resilience - we'd have problems if the machine holding it died.

### State files and Locks

The lock relates to the state file stored in the remote backend. It ensures only one Terraform operation can modify the state file at a time. When you run a pipeline, Terraform tries to acquire the lock. If it hasn't been released yet, or another process holds it, you'll hit a lock error.

This usually happens when two plans run together - *don't sync master with your branch when a plan is already running*.

To resolve:

1. Your local environment needs access to the state file. `cd` into the relevant environment's directory and run `terraform init` with the relevant AWS credentials for the account:

   ```bash
   aws-vault exec p-data-lake-admin-stg -- terraform init
   ```

   This sets up your local environment to access the state file per the existing backend config.

   ::: warning
   Add `.terraform*` to your `.gitignore`, otherwise you might commit the initialised state to the repo.
   :::

2. Release the lock:

   ```bash
   terraform force-unlock <id>
   ```

   Take the ID from the error message and append it. Add the `aws-vault` prefix as above. `force-unlock` only removes the lock; it does not modify the backend config. You might need an extra `-force` on the command.

**More lock errors:** I had a lock issue where `terraform init` wouldn't run because `experiments = [module_variable_optional_attrs]` had been deprecated. We didn't need it, so the fix was to remove it and `terraform init` again.

I also noticed `terraform.lock.hcl` was being tracked by git. To fix:

```bash
git rm --cached .terraform.lock.hcl
```

Then add `.terraform.lock.hcl` to `.gitignore`.

## Resources & Providers

A *provider* gives you access to resources - it provides a set of possible resources to use (S3 buckets, databases via the Snowflake provider, etc.). You use the provider so Terraform knows where the resources should go: Snowflake, AWS, Azure, and so on. The resource syntax follows a simple structure:

```hcl
resource "aws_s3_bucket" "tf_course" {
  bucket = "my-bucket-name"
}
```

- `resource` - declares we're referencing a resource
- `"aws_s3_bucket"` - the resource type
- `"tf_course"` - the Terraform name for the resource
- then we specify the bucket name

### Versions

We usually set the Terraform version to ensure we always get a version compatible with what we've set up. If you don't specify it, Terraform pulls the latest version each `terraform apply`, which can be bad - some resources may become deprecated with newer versions and break what you've already written.

### Pinning the Provider

A provider is responsible for interacting with a specific infrastructure platform or service (AWS, Azure, GCP). It's the bridge between Terraform and the target platform.

I had an issue with a repo where deploying a change threw errors on the plan even though no Terraform config had changed. This was down to the provider changing. When a provider version is incremented it may introduce breaking changes, deprecate features, or modify resource behaviour. As a result some resources may change - attributes, available variables, config options, even resource types.

**The fix:** go to the resource you're having an issue with (e.g. the [VPC resource docs](https://registry.terraform.io/providers/hashicorp/aws/4.67.0/docs/resources/vpc)). Take the variable from the error log, search the resource docs, and find when the variable is no longer available. Find the most recent version that still contains the variable, then pin the provider in `providers.tf` using version constraints.

## Commands Overview

Run these from the environment folder you wish to deploy to (e.g. `prod` / `stg`):

- `terraform init` - initialize Terraform, look for `.tf` files, download provider plugins
- `terraform plan` - dry run, shows what resources Terraform is going to create
- `terraform apply` - creates the resource
- `terraform destroy` - destroy resources

## Variables

Use a `variables.tf` file to declare values you feed into resources / modules. This gives flexibility: change one variable and have it affect multiple resources, rather than hard-coding the same value in many places.

Sometimes the variable is abstracted throughout the code, so it won't always appear as simply as a basic declaration. Variables are often declared in modules - e.g. using `map` and `object` type variables to define bucket locations.

Sometimes a variable won't be declared until the stack is built. For example, a `segment_data_sources` variable might rely on a `segment_helper` (`app.py`) Python script running and outputting the variables, which are then referenced in a YAML anchors file that runs when commits are pushed for a PR. You could run this locally (`terraform plan`) using the variable in the YAML anchors file, but it's easier to push the commit and let the plan run itself.

## Data Sources

Data sources let us retrieve data from a different resource. It's kind of like an API - we fetch the data, return it, and use it in our configuration.

## Assume Role & Policies

When we create a lambda we also need to create a role the lambda can assume to execute the code. This role needs a trust policy attached that allows `sts:AssumeRole`.

::: warning Key takeaway
There is a difference between **trust policies** and **permission policies**.
:::

- **Trust policy:** a JSON policy document in which you define the principals you trust to assume the role.
- **Permission policy:** a JSON permissions document in which you define what actions and resources the role / user can use.

So for our example lambda, we've added a trust policy so the lambda can assume the role, but we also need a permissions policy for it to actually do anything (reading S3 buckets, etc.).

This comes back to the use of `data` in Terraform - we can generate a policy document using `aws_iam_policy_document`.

::: tip aws_iam_policy vs aws_iam_policy_document
With the *document* you're just defining the policy in JSON format, which you can then attach to an `aws_iam_policy` resource - similar to how we use variables. Good example in the [iam_policy_document docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document).
:::

There are multiple ways to do things, so you don't have to use `aws_iam_policy_document` - you can input the JSON policy directly into the role (though this isn't best practice). See this [StackOverflow example](https://stackoverflow.com/questions/44565879/terraform-error-creating-iam-role-malformedpolicydocument-has-prohibited-fiel).

You can also define a role and policy and then use `aws_iam_role_policy_attachment` to attach a managed IAM policy to an IAM role. See the [iam_role_policy_attachment docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment).

### Issue with log groups

I had an issue with the log groups for a lambda. Two things needed changing:

- Updated the permissions to include `logs:Create*`.
- There's a concept of lambdas being "warm" (still running / active). When I ran it initially, then changed the policy, it stayed active and didn't apply the changes. The fix: go into Configuration -> Environment variables, and just mash the keyboard on both inputs to force a change and redeploy.

## Modules

Modules let us abstract away some of the complexity of creating a resource into a reusable *module*. Rather than re-defining resources, someone can reference a module, making the declaration much more compact. You can reference both local modules and those stored in the Terraform registry. We've added some of our modules to the [Terraform registry](https://registry.terraform.io/modules/Adaptavist/aws-lambda/module/1.13.0).

Under the hood it's exactly the same as specifying a resource, except we use the `module` keyword and some of the code is abstracted away. You may want to package additional resources into your modules which rely on variables that won't be known until the main resource is created.

### Outputs

This is where outputs come in handy. Say we want to create additional configuration based off the ARN of our Lambda - we won't know the ARN until we've created the resource, so we use an output variable and pass that value into the resource / module. We access this value much like a variable, except we specify `module`.

## Meta Arguments

Terraform provides meta arguments that let you do programmatic things with your configuration (e.g. `for_each`, `count`). If you use `for_each` with values that won't be known until the resource is applied, you'll get an error.

One way around this is to run an apply targeting the specified resource:

```bash
terraform apply -target module.stg.some_resource
```

## Debugging Tips

### Using a null resource

```hcl
# resource "null_resource" "debug_output" {
#   provisioner "local-exec" {
#     command = "echo ${module.networking.elasticache_subnet_ids}"
#   }
# }
```

This helps when trying to debug the data type of a variable. Set a null resource and target it to get the variable's data type output:

```bash
aws-vault exec p-data-lake-admin-stg -- terraform apply -target module.stg.null_resource.debug_output
```

### Getting the folder path

Had an issue with relative paths from Terraform. Use this syntax - it will either resolve the issue or give clearer feedback about where it's trying to locate the file from:

```hcl
code_dir = "${path.module}/add_record_to_sqs"
```

### Security groups hanging

There's an issue with removing security groups attached to a lambda deployed within a VPC. It's to do with an ENI being created and associated with the security groups. This creates a dependency on the ENI, which means the security groups can't be deleted until you remove the ENI. You can do this manually via the console: search for EC2, then filter on the lambda to see which ENI is linked to it.
