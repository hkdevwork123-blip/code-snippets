---
outline: deep
---

# AWS

The sprawling cloud empire that started life as an online bookshop's side project and now quietly runs a huge chunk of the internet. AWS (Amazon Web Services) is Amazon's cloud computing platform, offering hundreds of services spanning compute, storage, databases, networking, machine learning and just about everything else you can think of.

## The Basics

### Management Console

A browser-based GUI for AWS. Through the console you can manage compute, storage and other resources running on AWS infrastructure. It exposes a wide variety of services.

### ARNs - Amazon Resource Names

ARNs uniquely identify AWS resources. An ARN is required when you need to specify a resource unambiguously across all of AWS - in IAM policies, RDS tags, API calls, etc. Sometimes they're created after the resource (you'll see this with export values in Terraform).

They follow a set format, though some services omit the Region, account ID, or both, so check which format is appropriate for each resource:

- **Partition** - group of AWS regions:
  - `aws` - AWS Regions
  - `aws-cn` - China Regions
  - `aws-us-gov` - AWS GovCloud (US) Regions
- **Service** - resource/product, e.g. Amazon S3 = `s3`
- **Region** - region code, e.g. Europe (Ireland) = `eu-west-1`
- **Account ID** - ID of the AWS account that owns the resource (no hyphens)
- **Resource ID** - the resource identifier: a name, ID, or resource path, e.g. `user/Bob` for an IAM user or `instance/i-1234567890abcdef0` for an EC2 instance

**Paths in ARNs** are a simple way of grouping/allocating resources to multiple users/instances. For example, in an IAM policy you can specify all IAM users under the path `product_1234` using a wildcard.

## IAM - Identity Access Manager

Provides secured access control for all AWS services. Use IAM to create users and groups, assigning specific permissions and policies.

### Getting Started

Best practice before creating policies: set up a user for yourself (don't use the root login for day-to-day work).

- **IAM User** - a resource with associated credentials and permissions. Navigate to the IAM console -> Users. Create a group alongside it.
- **IAM Group** - a collection of IAM users. Attach a policy to the group, then add tags (attributes assigned to the user).

To get the account ID and IAM user sign-in URL, go to the IAM dashboard (right-hand side). You can amend the account alias there too.

### Policies

IAM policies define permissions for entities such as users, groups, and roles. Each policy consists of one or more statements. Acronym to remember all elements: **RECAP** (plus an optional `Principal`):

- **Sid** - Statement ID you can specify (optional)
- **Effect** - allow or deny access to a particular IAM resource
- **Action** - AWS service actions (e.g. S3 list bucket, read/write)
- **Resource** - the AWS services, can be scoped to an ARN
- **Condition** - when a permission is allowed or denied on a resource

::: tip Action warnings
Some actions require companion actions for full permissions, e.g. `s3:CreateJob` and `s3:PutReplicationConfiguration`. To grant everything, the user needs `PassRole` to pass a role to an AWS service. If in doubt, scope down to a few actions (all `List` actions plus `s3:GetObject`).
:::

When scoping resources, you can add permissions at the **object (file) level** to restrict access to a specific object within a bucket - the object ARN replicates the folder structure with `/<file name>` on the end. You can also set request **conditions** (e.g. allow only IAM user `Joe` to access an S3 bucket).

### IAM Role

Similar to an IAM user - an AWS identity with permission policies determining what it can do - but instead of being tied to one person, a role is intended to be *assumable* by anyone or any service that needs it. Roles let entities get credentials for a short duration to do what they need.

Common roles: EC2 instance roles, Lambda function roles, roles for CloudFormation.

Create a role (EC2 example):

1. Go to Roles -> Create role
2. Select AWS service -> EC2 -> Next
3. Assign IAM read-only access (so the EC2 instance can read from IAM)
4. Name it and create

### Policy Simulator

The [IAM Policy Simulator](https://policysim.aws.amazon.com/home/index.jsp) evaluates IAM policies to determine the effective set of permissions without making actual resource calls. A good way to check how conditions affect actions. You can even edit and test a policy here (changes aren't reflected in the console).

To use it:

- Select the user -> policy -> service -> action
- Fill out global settings (condition keys aligned to the policy). If they don't show, go back into the policy, click Apply, and refresh.
- Click the dropdown next to the service and add an ARN if needed
- Click **Run Simulation** - it will be denied or allowed

### MFA

Multi-Factor Authentication combines your password with another key/password-generating device. Should be used for root and IAM users, advised for all accounts.

Virtual MFA devices: Google Authenticator (phone only), Authy (multi-device), U2F Security Key, Hardware Key Fob (incl. GovCloud variant).

Update the password policy in IAM -> Account Settings. To add MFA, go to Security Credentials, use an authenticator app, and enter the MFA codes.

### IAM Security Tools

The ethos is **least privilege** - don't give everyone admin access, and monitor what's being used and the status of credentials.

- **IAM Credentials Report** (account level) - lists all users and the status of their credentials. CSV export.
- **IAM Access Advisor** (user level) - shows service permissions granted to a user and when those services were last accessed. Use it to revise policies.

### IAM Infrastructure

Elements: Resources / Identities / Entities / Principals.

- **Principal** - a person or application that can request an action on an AWS resource. When you issue `AssumeRole`, the principal is the identity whose credentials are being used.
- **Request** - a principal sends a request to AWS via the console, API, or CLI.
- **Authentication** - a principal must be signed in using credentials.
- **Authorization** - you must be allowed to complete the request (correct policies aligned to the user).
- **Actions/operations** - once authenticated and authorized, AWS approves the actions.
- **Resources** - approved operations are performed on the related resources (S3, EC2, etc.).

## Access Keys, CLI and SDK

An access key grants programmatic access to your resources. Two ways to set it up:

- Select "allow programmatic access" when creating the user (generates access + secret key)
- Go to Security Credentials -> "Access keys for CLI, SDK, & API access" -> Generate access key

::: warning
Access keys and secret keys are credentials - never commit them to a repo. Store them in `~/.aws/credentials`, or better, use AWS Vault (below).
:::

- **CLI** - direct access to the public APIs of AWS services from your command shell.
- **SDK** - language-specific APIs (libraries) embedded in your application. Supports JS, Node.js, Python, etc. (`boto3` is the Python SDK).

### Setup

Download from the [AWS CLI install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Check it's installed:

```bash
aws --version
```

Set up a `credentials` and `config` file (like Terraform). This lets you manage multiple accounts and access keys. Add a config file to your `.aws` folder. See the docs for [named profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) and [config files](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

Handy commands:

```bash
export AWS_PROFILE=user1        # set profile so you don't specify it each time
echo $AWS_PROFILE               # check which profile you're using
aws configure list-profiles     # list profiles
aws iam list-users              # list users for the account
```

The CLI permissions match those specified for the user in the console.

### CLI Example - creating a Lambda

Create a simple `index.js` lambda that outputs a few messages. Then create a minimal IAM role that Lambda can assume, defined in a `policy.json` file:

```bash
aws iam create-role \
  --role-name basic-lambda-role \
  --assume-role-policy-document file://policy.json
```

Keep the returned ARN for later, e.g. `arn:aws:iam::<ACCOUNT_ID>:role/basic-lambda-role`.

Zip the `index.js` file (this becomes the deployment package), then use `create-function` to create the Lambda. To invoke and pass JSON you'll need an extra arg:

```bash
--cli-binary-format raw-in-base64-out
```

See this [SO answer](https://stackoverflow.com/questions/64137185/aws-cli-lambda-could-not-parse-request-body-into-json) on why. List functions with `aws lambda list-functions` (set the correct region or you won't see them).

### Cloud Shell

An interactive shell in the console, an alternative to the local CLI. Only available in certain regions, so set your account to the correct one.

## AWS Vault

Open-source tool to manage AWS access keys: [99designs/aws-vault](https://github.com/99designs/aws-vault). By default all data between the AWS CLI and service endpoints is encrypted over HTTPS/TLS.

AWS Vault uses Amazon's STS service to generate temporary credentials via `GetSessionToken` or `AssumeRole`. These expire quickly, reducing the risk of leaking credentials. It's aware of the credentials in your `.aws` folder and adds a layer of security when accessing AWS via the CLI - you need the credentials set properly in the `credentials` file for this to work.

We use it in conjunction with our IdP (Okta) for SSO. Setup:

```bash
brew install --cask aws-vault
```

- Create a `.aws` folder and a `config` file if you haven't already.
- Add the AWS profile to the config. You'll be prompted to add a keychain password at some point.
- Add the `zsh-aws-vault` plugin to your `.zshrc`, e.g. `plugins=(git zsh-autosuggestions zsh-syntax-highlighting zsh-aws-vault)`.
- Check the vault works:

  ```bash
  aws-vault exec p-analytics-admin -- aws sts get-caller-identity
  ave test-hk-admin -- terraform plan    # set the vault account then run a plan
  ```

## S3 - Simple Storage Service

Object storage that stores data as objects (files) within buckets (containers). An object is a file plus metadata describing it.

Bucket rules:

- Globally unique across all of S3
- No uppercase / underscore
- 3-63 characters
- Not an IP address
- Must start with a lowercase letter or number

### Objects

Objects have a **key**, which is the full path within the bucket, composed of a prefix + object name:

```
segment-logs/0j63e307H1/1602720000000/1602754580896.deaf32df5153.fde281a.6c7ef76a-9c4e-4417-a227-4a085deaea22.gz
```

Max object size is 5 TB. If uploading more than 5 GB you must use multi-part upload.

::: tip Epoch partitions
Some data is partitioned by a Unix timestamp. Paste the number into a Unix time converter to get the date, e.g. `1680480000000` == 03/04/23. Note: the timestamp/modified date doesn't always match the date of the data inside - download and check.
:::

### Versioning

- Enabled at the bucket level (bucket -> Properties -> edit versioning)
- Same-key overwrite increments the version (1, 2, 3...)
- Best practice to protect against unintended deletes and enable rollbacks
- Deletes add a **delete marker** you can restore; to fully delete you also delete the marker

### Encryption

Four methods (SSE = Server-Side Encryption):

- **SSE-S3** - keys handled and managed by AWS
- **SSE-KMS** - uses AWS Key Management Service to manage keys
- **SSE-C** - you manage your own encryption keys
- **Client-Side Encryption** - you encrypt before uploading; you fully manage keys and lifecycle

**Encryption in transit (SSL/TLS):** S3 exposes both HTTP (non-encrypted) and HTTPS (encrypted). Use HTTPS - it's mandatory for SSE-C.

### Security & Bucket Policies

- **User-based** - IAM policies (which API calls are allowed for users)
- **Resource-based** - Bucket Policies (bucket-wide, allow cross-account), Object ACLs and Bucket ACLs (finer grain)

An IAM principal can access an S3 object if the user's IAM permissions allow it *or* the resource policy allows it, and there's no explicit deny.

**Other security:** VPC endpoints (for instances without internet), S3 Access Logs (stored in other buckets), CloudTrail logging, MFA Delete on versioned buckets, and Pre-Signed URLs (valid for a limited time).

::: warning Policy generator ARNs
There's an issue where the policy generator won't take ARNs - use `*` to generate, then amend the JSON after. When editing, the resource ARN must be suffixed with `/*` to affect all objects in the bucket.
:::

### S3 Websites

S3 can host websites accessible on the web. You must allow public access to the bucket and create a policy allowing `GetObject`. Create a bucket, set it public, add the policy (suffix the ARN with `/*`), then click the object URL.

### CORS - Cross Origin Resource Sharing

An HTTP header-based mechanism that lets a server indicate origins other than its own from which a browser should permit loading resources.

- An **origin** is a scheme (protocol) + host (domain) + port, e.g. `https://www.example.com` (implied port 443 for HTTPS, 80 for HTTP)
- Same origin: `http://example.com/app1` and `http://example.com/app2`
- Different origins: `http://www.example.com` and `https://otherexample.com`
- Requests aren't fulfilled unless the other origin allows them via CORS headers (`Access-Control-Allow-Origin`)

To add CORS: go to the bucket -> Permissions -> CORS section. Allow the required methods (e.g. `GET`), scoping the resource to `*` or a specific ARN. A `200` response in the Network tab confirms success.

### Event Notifications

Receive notifications when certain events happen in a bucket. Example architecture: file uploaded -> EventBridge rule triggers -> SNS topic -> email subscription.

1. Enable EventBridge on the bucket (Properties -> Amazon EventBridge). Note this differs from plain event notifications.
2. Create the SNS topic (the target for the rule). Optionally restrict publish/subscribe in the Access policy.
3. Create an email subscription within the SNS topic, then confirm via the link in your inbox.
4. Create the EventBridge rule (Rules -> Create rule), define the event pattern, set the target to the SNS topic.
5. Test by uploading a file.

## Lambda

At its core is **serverless computing** - running your application on small amounts of CPU and memory without worrying about the OS, platform, or hardware. Just take your code and run it.

Lambda runs your code on container technology, on underlying EC2 instances created from a common image. Your code should perform a single task or a few simple processes, similar to how you'd write a function.

### Roles and Lambdas

When you create a Lambda you need a minimal IAM role that Lambda can assume. Via the console this is automatic, along with a basic policy named `AWSLambdaBasicExecutionRole..<ID>`. Otherwise create/reuse a role and attach the relevant permissions the Lambda needs.

### Programming Model

The components that make up a Lambda function. The **handler** is the function Lambda calls first:

```javascript
exports.myHandler = function (event, context, callback) {
  // Your code
  callback();
};
```

- **event** - passes event-related data to the handler
- **context** - runtime info (function name, execution time, etc.)
- **callback** - returns data to the caller (the only optional parameter)

## SQS - Simple Queue Service

A fully managed queuing service designed to decouple microservices or distributed applications. Send, store, and receive messages at high volume without infrastructure management. Offers async, message-based communication as opposed to API calls.

Core concepts:

- **Queue** - FIFO holding pool for messages
- **Publishers/Producers (enqueue)** - put messages in the queue
- **Processors/Consumers (dequeue)** - consume messages

::: tip Visibility timeout
Try to match the queue visibility timeout to the Lambda timeout. If the Lambda timeout is *longer* than the queue visibility timeout, a message could reappear and be picked up by another instance before the first finishes. You'll see a plan error like *"Queue visibility timeout: 60 seconds is less than Function timeout: 300 seconds"*.
:::

### Dead Letter Queue (DLQ)

Keeps hold of messages that failed processing by moving them to a separate queue, which you can re-drive later. Set up CloudWatch metric alarms on thresholds for both the SQS and DLQ.

To create a DLQ, create two SQS queues and make one the DLQ. To inspect it: Details -> more dropdown -> "Messages available", then Send and receive -> poll for messages.

::: warning FIFO redrive
There's an issue redriving DLQ messages back to a FIFO source queue (the button is greyed out). Workaround: make the source SQS the DLQ *for the DLQ*. Make sure you set it back afterwards. See [this video](https://www.youtube.com/watch?v=Ef1xQVsARDE).
:::

## SNS vs SQS vs EventBridge

| | SNS | SQS | EventBridge |
|---|---|---|---|
| Type | Pub/sub | Queue for message processing | Pub/sub with rules |
| Delivery | One topic fans out to many subscribers (SQS, Lambda, Email) | A consumer polls the queue; typically a single consumer per message | Rules match events and send to targets |
| Key question | Do other systems care about an event? | Does your system care about an event? | Do other systems care? Good for 3rd-party integration |

**EventBridge note:** you can create multiple rules matching the same event, each with up to 5 targets. Typical approach: one rule per consumer. No extra charge for rule matches; soft limit of 300 rules per bus.

The main takeaway: **SQS is 1:1** - if you point three services at one queue, only one wins the poll. Use SNS to fan out: publish to a topic, then subscribe the queues to the topic.

## AWS Glue

A fully managed ETL service to categorize, clean, enrich, and move data between stores and streams. Consists of the **Glue Data Catalog** (central metadata repository), an ETL engine (generates Python or Scala), and a scheduler. Serverless.

**Glue Crawlers** scan buckets and output them into an Athena table. When a crawler runs it:

- Classifies data (format, schema, properties)
- Groups data into tables or partitions
- Writes metadata to the Data Catalog

Setting up a crawler:

1. Create an IAM role with `AWSGlueServiceRole`. You may need a new policy allowing access to all S3 buckets (the default only allows `aws-glue` prefixes).
2. AWS Glue -> Data Catalog -> Databases (create one)
3. Tables -> Add tables using crawler -> add S3 path with a trailing slash, e.g. `s3://testing-monday-data/`
4. Select the IAM role, the database, and the run rate (on demand for control)
5. Run the crawler
6. For Athena, set a bucket destination for the queries

## EC2 - Elastic Compute Cloud

One of AWS' most popular offerings - infrastructure as a service. Mainly:

- Rent virtual machines (**EC2 instances**)
- Store data on virtual drives (**EBS** - Elastic Block Store volumes)
- Distribute load across machines (**ELB** - Elastic Load Balancer)
- Scale using an **auto-scaling group (ASG)**

Sizing/config options: OS (Linux/Windows/macOS), CPU cores, RAM, storage (network-attached EBS/EFS or EC2 Instance Store), network card, firewall rules (security group), and a bootstrap script (**EC2 User Data** - runs once at first boot).

### Launch Instance

1. EC2 -> Launch instance
2. Select the instance type (storage + CPU)
3. Create a key pair to SSH in (choose `.pem` for anything but Windows 7/8) - it downloads the key
4. Configure network settings - a security group defines the rules (allow RDP for remoting, HTTP for a web server)
5. Configure storage (Volumes)
6. Advanced Details - add a bash script in User Data (e.g. to serve an HTML page), then launch

View instance info in the Instances view. To see a webpage served via the bash script, use the public IPv4 address prefixed with `http://` (most default to HTTPS), e.g. `http://3.250.150.37/`.

::: warning
Stop the instance when finished so you don't pay for compute (only volumes/storage). Actions -> stop/terminate. Stopping an instance may change its public IP.
:::

### Instance Types

Focus on different levels of storage, memory, and compute:

- **General** - diverse workloads, web servers, code repos
- **Compute optimized** - batch processing, media transcoding, gaming servers
- **Memory optimized** - high performance, relational/non-relational DBs, in-memory caches, real-time big-data processing
- **Storage optimized** - high-frequency OLTP, relational and NoSQL DBs, in-memory DB caches (e.g. Redis)

Naming, e.g. `m5.2xlarge`: `m` = instance class, `5` = generation, `2xlarge` = size within the class.

### Security Groups & Ports

Security groups act as a firewall on EC2 instances, regulating access to ports, authorised IP ranges (IPv4/IPv6), and inbound/outbound network flow.

Classic ports to know:

| Port | Use |
|---|---|
| 22 | SSH into Linux / SFTP |
| 21 | FTP |
| 80 | HTTP |
| 443 | HTTPS |
| 3389 | Windows RDP |

`0.0.0.0/0` means any IP. View rules under Network & Security.

::: tip
If you get a timeout accessing your instance, it's likely the security group.
:::

### SSH

Secure Shell - a network protocol for securely accessing a computer over an unsecure network, using a client-server model. Set up with a key pair: a public key on the server, a private key on the client. The client contacts the server with the key pair ID; the server sends an encrypted challenge; the client decrypts it with the private key and returns it to establish the connection.

To SSH into an EC2 instance (no space in the key filename):

```bash
chmod 0400 EC2Tutorial.pem
ssh -i EC2Tutorial.pem ec2-user@63.35.199.149
```

**EC2 Instance Connect** is a browser-based alternative. You may need IPv4 and IPv6 enabled. Click the instance -> Connect.

**EC2 instance roles:** the instance has the AWS CLI installed so you can run AWS commands on it. Never enter your AWS keys into the instance - attach an IAM role instead (Actions -> Security -> Modify IAM Role). Then commands like `aws iam list-users` work.

### Purchasing Options

- **On-Demand** - short workload, predictable pricing, pay per second
- **Reserved (1 & 3 yr)** - long workloads; Convertible Reserved gives flexible instances
- **Savings Plans (1 & 3 yr)** - commit to an amount of usage
- **Spot Instances** - short workloads, cheap, can lose instances (less reliable)
- **Dedicated Hosts** - book an entire physical server, control placement
- **Dedicated Instances** - no other customers share your hardware
- **Capacity Reservations** - reserve capacity in a specific AZ for any duration

### Public vs Private IPs

- **Public IP** - identifiable on the internet, unique across the whole web, easily geo-located
- **Private IP** - only identifiable on a private network, unique within it; two networks can reuse the same range. Machines reach the internet via an internet gateway

By default an EC2 machine has a private IP (internal AWS) and a public IP (WWW). You can only SSH via the public IP; it can change on stop/start.

**Elastic IP** - a fixed public IPv4 you own (as long as you don't delete it), attachable to one instance at a time. Generally not worth using.

### Placement Groups

Control placement of EC2 instances:

- **Cluster** - low-latency group in a single AZ / same rack. Great network (10 Gbps), but if the rack fails, all fail. Use for big data / low-latency apps.
- **Spread** - across underlying hardware (max 7 per AZ). Reduces simultaneous failure risk. Use for high availability / critical apps.
- **Partition** - across many partitions (different racks) within an AZ, scales to 100s of instances. Higher cost. Use for HDFS, HBase, Cassandra, Kafka.

### Elastic Network Interface (ENI)

A logical component in a VPC representing a virtual network card, giving more control over networking. A software-based network interface enabling VMs to connect to a network.

Attributes: primary + secondary private IPv4s, one Elastic IP per private IPv4, one public IPv4, one or more security groups, a MAC address. You can create ENIs independently and move them between instances for failover. Bound to a specific AZ.

### Hibernate

Persists an instance's in-memory state to S3 and shuts down, preserving state. On restart it resumes where it left off - quicker start-up and preserved application state. Use for long-running processing, saving RAM state, and services that take time to initialize.

## Networking & VPC

A **Virtual Private Cloud** lets you launch AWS resources into a virtual network you've defined, closely resembling a traditional data-centre network with AWS's scalable infrastructure.

### Subnets

A subnet is a network inside a network, enabling efficient/organized IP allocation and better traffic management.

- **Public** - allows direct internet communication; public IPs can be assigned; route table directs traffic to an Internet Gateway (IGW)
- **Private** - not directly accessible from the internet; no public IPs; route table sends traffic to a NAT Gateway/instance for indirect internet access. Used for databases, internal apps, and resources needing enhanced security

### CIDR - Classless Inter-Domain Routing

A method for allocating and representing IP address blocks flexibly and efficiently, using space better than classful addressing. This is the `/16` and `/24` you see.

- **Ingress** = inbound traffic, **Egress** = outbound traffic
- `10.0.0.0/16` and `172.31.0.0/16` are private IPv4 ranges usable for VPCs
- `/16` = first 16 bits identify the network, remaining 16 identify the host -> 2^16 = 65,536 addresses
- `/24` = first 24 bits network, remaining 8 host -> 2^8 = 256 addresses
- `/48` is the lowest level you can go to in AWS

Use a tool like [cidr.xyz](https://cidr.xyz/) to see available addresses for a block.

## SDK / boto3

When using the SDK, `boto3` offers two features:

- **Clients** - low-level, map closely to the service API
- **Resources** - higher-level abstractions; the recommended pattern as you don't worry about underlying detail. Code tends to be simpler.

However, Resources aren't available for all services - in those cases you must use a Client.

## CloudWatch

A monitoring and observability service that collects metrics, logs, and events, providing automated actions, real-time insights, and dashboards.

### Searching Log Groups

CloudWatch -> Log groups -> find the group -> "Search all log streams". Use filters (date, etc.) and the search field.

### Logs Insights

More advanced querying via "View in Logs Insights", using a specific [query syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData-discoverable-fields.html). Field types are based on the JSON log fields.

- `fields` - show specific fields, denoted with `@`, e.g. `@message`
- `filter` - your `WHERE` clause

::: warning
Mind the time filter at the top - set it to the period you want.
:::

Find any exceptions (useful when code doesn't log `ERROR` explicitly):

```
fields @timestamp, @message
| filter @message like /(?i)error|exception|traceback|unhandled/
```

Filter on a specific value in `@message`:

```
fields @timestamp, @message
| sort @timestamp desc
| filter @message like 'E-3XF-PFB-ZZQ-2U4'
```

You can save queries and reference them again.

## Kinesis

**Data Stream vs Delivery Stream (Firehose):** a Data Stream is for reading/streaming data *off of*; a Delivery Stream (Firehose) *sends* to cold storage / OpenSearch. In an event-driven architecture, a Lambda reads off a Data Stream; the data is also sent to a Delivery Stream that pushes to S3.

::: tip
Had a Kinesis trigger on a Lambda get spammed by broken data and error continuously. Fix: delete the trigger and re-run the pipeline. Removing and re-adding the trigger cuts off the old data.
:::

## OpenSearch & Elasticsearch

Search, but at scale. Elasticsearch is a distributed, open search and analytics engine for all types of data - textual, numerical, geospatial, structured, and unstructured. Built on Apache Lucene, it's the central component of the Elastic Stack (the ELK Stack: Elasticsearch, Logstash, Kibana), known for its simple REST APIs, distributed nature, speed, and scalability. Amazon OpenSearch Service is the managed AWS offering.

### OpenSearch vs Elasticsearch

OpenSearch is a fork of the Elasticsearch + Kibana codebase that remains under the Apache 2.0 license, created after Elastic moved the ELK stack to a different (closed-source) licensing agreement.

Both are search engines for indexing and searching large amounts of data. The key differences:

- **Community/support** - Elasticsearch is developed by Elastic (a commercial company); OpenSearch is community-driven, led by AWS, focused on a fully open-source engine.
- **Functionality** - very similar, since they share the same core codebase. OpenSearch adds some enhancements not in Elasticsearch, such as distributed tracing support and a more user-friendly management console.

### Kibana

A free, open frontend that sits on top of the Elastic Stack, providing search and data visualization for data indexed in Elasticsearch. It's the charting tool for the stack.

### Viewing Instances

We have a number of instances accessible via Okta (e.g. `analytics-logs`). To open one: click the card -> select **Global**. Then go to the hamburger menu (top left) -> **Discover**, pick a data source, and add filters from the side menu.

Content Formatting has its own OS cluster. From the overview you can see the available **indexes** - an index usually represents a data source (an S3 bucket, a Kinesis stream, etc.). To find out which, check the repo where the cluster is set up (search the cluster name, e.g. `content-formatting` or `segment`).

In the repo's `.bpr.yml` file, look for `TF_VAR_es_s3_data_sources` / `TF_VAR_es_kinesis_data_source` to determine whether the source is S3 or Firehose. The `dig_prod_bulk_loader` is a Lambda for loading S3 files, so its presence also indicates an S3 source.

### Bulk Loading & Backfilling

We can load data via either a **bulk load process** or a **Kinesis delivery stream**. The bulk loader is more self-service and useful for loading specific data into an OpenSearch cluster from different AWS accounts - it gives flexibility since we don't want every source streaming into OS if it's not relevant. Config is set in the `.bpr` file.

If object-create event notifications get removed from an S3 bucket, re-run the pipeline from the last commit/merge for the relevant project, then backfill by "touching" the objects (amend the bucket/prefix as needed):

```bash
#!/bin/bash
s3-touch() {
  aws s3 cp --metadata 'touched=1' --recursive --exclude="*" --include="*" --sse aws:kms "${@:3}" "$1" "$1"
}

s3-touch "s3://cold-storage-content-formatting-prod/events-ndjson/2023/04/" "*"
```

Run it with:

```bash
aws-vault exec p-data-lake-admin-prod -- sh s3touch.sh
```

#### Extending retention

When someone asks to increase an index's retention period:

- Create a bulk loader to load data from the Kinesis cold-storage bucket into a new separate index.
- Set that index's retention policy to 365 days.

### Searching & Debugging

#### Dev Tools queries

Use the Dev Tools console to run queries against indexes - good for checking records are landing in the cluster:

```json
GET /segment-shared-*/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "path.keyword": "/segment/monday/unlimited-sub-items-stg"
          }
        }
      ]
    }
  },
  "size": 20
}
```

#### SQL Engine

You can use SQL in OpenSearch. Go to Dev Tools and run queries against indexes:

```json
POST _plugins/_sql
{
  "query": "select * from segment-shared-*"
}
```

For more complex queries, use dot notation to reach nested fields, starting with `payload`:

```json
POST _plugins/_sql
{
  "query": "select * from stitch-it-segment-new-* WHERE payload.event='Invocation Finished' AND payload.properties.team.uid='01HKN47CSTTFF7PBMSN9P8S3GK'"
}
```

#### Query DSL (Domain Specific Language)

Use Query DSL to search for specific data in an index, and to filter data on dashboards. On a dashboard, click **Edit filter** and enter a DSL query instead of using the basic dropdowns.

Common keywords:

- **`query`** - defines the structure of the DSL
- **`bool`** - combines conditions using Boolean logic
- **`terms`** - term-level queries to search for an exact term (an ID, a value range)
- **`must`** - match/contain the criteria (logical AND)
- **`must_not`** - not match/contain the criteria (logical NOT)

```json
{
  "query": {
    "bool": {
      "filter": [
        {
          "terms": {
            "data.app_id": [
              "10060686",
              "10040179"
            ]
          }
        }
      ]
    }
  }
}
```

### Common Issues

#### DIG data landing in error bucket

When creating a new endpoint, a default (often old) Docker image is used. We manually run processes to update all endpoints in an environment to the latest image. If that step isn't done immediately, ingestion fails at first and works later once endpoints are updated.

To debug, search the Kibana **developer-tools-logs** using the `external-data-ingestion*` index: set the container to match your endpoint, set the logging level to `ERROR`, and adjust the time range. This shows data going through DIG and any errors.

#### Index not showing in dashboard

If a new DIG endpoint's index doesn't appear, it's likely the data volume is much lower than other indexes. The **control visualization** is an experimental feature and can't fetch events with a very small count. Workaround: create a separate visualization with a table view to accommodate low-frequency records.

#### Dark mode

If someone sets dark mode on the dev tools cluster: Stack Management -> Advanced Settings -> search "dark mode".

### Access (Okta Groups)

To grant someone access to OpenSearch, add them to the Okta group mappings. These are per-cluster, so you may need to dig through other `.bpr` files, but the mapping lives there.

## Other Services

### Amazon SES

An email service for sending transactional emails, marketing messages, etc. Check the "mailed-by" detail on an email (click the down arrow) - "mailed-by amazonses.com" means the sender used SES on behalf of their domain.

### SSM Parameter Store

Stores a variety of credentials as SSM params. Params are namespaced by path, e.g. `/dev/...`, so search for them in the relevant AWS account.

### S3 Select

Lets you query data in buckets. Works on gzip files too - just set the correct file settings (e.g. select JSON for JSON).

### Budgets

Search "billing" for the billing dashboard to review monthly bills and set budgets. Some IAM roles/users lack permission to view this - enable via account -> "IAM User and Role Access to Billing information".

## Example App Stack

- **Amplify** - hosting the UI (zip static HTML)
- **API Gateway** - call the Lambda via HTTPS
- **Lambda** - app logic
- **DynamoDB** - store data
- **IAM** - Lambda role
