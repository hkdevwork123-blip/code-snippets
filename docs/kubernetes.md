---
outline: deep
---

# Kubernetes

Open source container orchestration tool. Helps manage containerized applications in different deployment environments. The trend from Monilinth to Microservises led to an increased usage of containers and therefore a need to properly manage those containers.

## The Basics

### Architecture

- Cluster -> One master node (Physical or Virtual machine). Master node runs stuff needed to actually make Kubenretes work e.g. API server, Controller Manager, Scheduler, etcd
  - API Server: Entrypoint to K8s cluster
  - Controller Manager: Keeps track of what's happening
  - Scheduler: Ensures Pods placement
  - etcd: Key value store used as backing store for all cluster data
- Worker Nodes (containers of different applications) -> Connected to master node, where each node has a cubelet process running on it. This is where the applications are actually running
- Cubelet: Kubernetes process that makes it possible for the cluster to talk to each other and execute tasks on those nodes

### Core Components

#### Namespaces

- Think of namespaces like folders that organize cluster resources
- They divide cluster resources between multiple users, teams, or projects
- Provide scope for names (same resource names can be used in different namespaces)
- Common examples:
  - `default`: Default namespace for resources
  - `kube-system`: For system components
  - `production`, `staging`: Environment separation

#### Pods

- Smallest deployable units in Kubernetes
- Contains one or more containers
- Share network namespace (can communicate via localhost)
- Share storage volumes
- Are scheduled and run on the same node
- Have unique IP addresses within the cluster
- Are ephemeral (can be replaced with new pods)

#### Services

- Provide stable network endpoints for pods
- Act as load balancers/proxies
- Have consistent ClusterIP that doesn't change
- Route traffic to pods on specified ports
- Enable reliable communication between components

#### Deployments

- Manage the desired state of applications
- Define number of pod replicas
- Handle updates and rollbacks
- Create and manage ReplicaSets

#### ReplicaSets

- Created by Deployments
- Ensure desired number of pod copies are running
- Replace failed pods automatically
- Manage specific pod template versions

The relationship flows like this:

```
Deployment
    └── ReplicaSet
        └── Pod
            └── Application Containers

Service
    └── Routes traffic to Pod(s)
```

### Kubectl

Kubectl is a command line tool for communicating with a Kubernetes cluster's control plane, using the Kubernetes API. Handy cheat sheet here

#### How to connect to the cluster with kubectl?

```bash
brew install kubernetes-cli
```

You will need access to the AWS account and update your AWS config file to include the below.

```
[profile <PROFILE_NAME>]
sso_start_url = https://<YOUR_SSO_PORTAL>.awsapps.com/start
sso_region = us-east-1
region = us-east-1
sso_account_id = <ACCOUNT_ID>
sso_role_name = <SSO_ROLE_NAME>
output = json
```

Initialise a session on the AWS account

```bash
aws-vault exec p-data-tool-sbx
```

Update your kubectl config

> **Important**: You must update your kubectl config each time you switch between AWS accounts. The kubectl configuration is specific to each AWS account and cluster, so this step is required whenever you change accounts to ensure you're connecting to the correct cluster.

The `aws eks update-kubeconfig` command updates your kubeconfig file with the necessary credentials and cluster information to connect to your EKS cluster:

- `--name`: Specifies which EKS cluster to connect to
- This command retrieves the cluster endpoint, certificate authority, and authentication tokens from AWS
- It automatically adds or updates this cluster's entry in your kubeconfig file (typically located at ~/.kube/config)
- After running this, kubectl will be able to communicate with this specific EKS cluster

```bash
aws eks list-clusters --region=us-east-1 # List the eks cluster available
aws eks update-kubeconfig --name <CLUSTER_NAME>
kubectl config use-context arn:aws:eks:us-east-1:<ACCOUNT_ID>:cluster/<CLUSTER_NAME>
```

View config to check it has been set correctly

```bash
kubectl config view
```

### Common Commands

#### Namespace Operations

```bash
# List all namespaces
kubectl get ns

# Get all resources in a namespace
kubectl get all -n <namespace>

# Same command with aws-vault
aws-vault exec p-sandbox -- kubectl get all -n <namespace>
```

#### Debugging pods stuck in PodInitializing state

This can be caused for a few reasons but a good practical example we had with this was where the Deployment resource (what I keep calling deploy node aha) was degraded.

This happens a lot and for a few different reasons but here we were able to run a few commands and identify that the init container was in a CrashLoopBackOff.

This was being caused by the password being incorrectly set for the RDS (which was itself caused by the db-instance-identifier not being set correctly in the Gitlab.ci file)

What we did....

1. List all containers (including init containers) in the pod:
   `aws-vault exec p-sandbox -- kubectl get all -n margin-calc`
   NOTE: You may not always see the init container from the first command. I believe it only appeared here because it is in an error state
2. Taking the init container name and get the overview logs for it. This will give us back something like the below
   `aws-vault exec p-sandbox -- kubectl logs margin-calc-6dbd95b6d7-msg2s -n margin-calc -c margin-calc-initcontainer`

```
NAME READY STATUS RESTARTS AGE
pod/margin-calc-6dbd95b6d7-msg2s 0/1 Init:CrashLoopBackOff 21 (2m53s ago) 90m
pod/margin-calc-846b6d9fbf-7s6pj 0/1 Init:CrashLoopBackOff 36 (4m34s ago) 170m
```

3. So we can see the issue, Init:CrashLoopBackOff. Now we can get the detailed info on the exact error
   `aws-vault exec p-sandbox -- kubectl get pod margin-calc-6dbd95b6d7-msg2s -n margin-calc -o jsonpath='{.spec.initContainers[*].name}'`
   And this returned to us the classic node error about auth for postgres not working

**The Flow**

```
ArgoCD Application (Degraded)
└── Deployment: margin-calc (Unhealthy - 0/1 ready)
    └── ReplicaSet: margin-calc-6dbd95b6d7 (Unhealthy)
        └── Pod: margin-calc-6dbd95b6d7-msg2s (Init:CrashLoopBackOff)
            └── Init Container: <some-init-container> (Failing)
```

#### Pod Operations

```bash
# List pods in a namespace
kubectl get pods -n <namespace>

# Get pod details
kubectl describe pod <pod-name> -n <namespace>

# Get pod logs
kubectl logs <pod-name> -n <namespace>

# Execute command in pod
kubectl exec -it <pod-name> -n <namespace> -- <command>
```

#### DNS and Network Debugging

```bash
# Check pod's DNS configuration
kubectl exec -it <pod-name> -n <namespace> -- cat /etc/resolv.conf

# Test DNS resolution using Node.js
kubectl exec -it <pod-name> -n <namespace> -- node -e "require('dns').resolve('domain.com', (err, addresses) => { if(err) console.error(err); else console.log(addresses); })"

# Test network connectivity
kubectl exec -it <pod-name> -n <namespace> -- node -e "fetch('https://domain.com').then(r => console.log('Connected successfully')).catch(e => console.error(e))"
```

### Other Useful Commands

Some other random commands, I've seen from Gabe that I NEED TO FIGURE OUT!

```bash
aws-vault exec playground
aws eks --region us-east-1 update-kubeconfig --name avst-kubera-playground
aws sts get-caller-identity
```

```bash
kubectl get pods -n orbit-backend
kubectl describe pod orbit-backend-5fd78dd75c-qwj67 -n orbit-backend
kubectl exec -n orbit-backend -it orbit-backend-798d757b77-dhh6m -c kubera-application-chart -- /bin/sh
```

1. **AWS Authentication and Cluster Configuration**:

   - `aws-vault exec p-sandbox`: Executes commands with AWS credentials from the specified profile
   - `aws eks update-kubeconfig`: Configures kubectl to use the specified EKS cluster
   - `aws sts get-caller-identity`: Verifies the AWS identity being used

If we have issue with our Kubectl config we can simply prefix any Kubectl command with an AWS profile e.g.

```bash
aws-vault exec p-sandbox -- kubectl get all -n orbit-web-service-feat-orb-158-auth
```

2. **Pod Management Commands**:
   - `kubectl get pods -n orbit-backend`: Lists all pods in the orbit-backend namespace
   - `kubectl describe pod [pod-name] -n orbit-backend`: Shows detailed information about a specific pod
   - `kubectl exec -it [pod-name] -c [container-name] -- /bin/sh`: Opens an interactive shell inside a container
     - `-n`: Specifies the namespace
     - `-it`: Enables interactive terminal
     - `-c`: Specifies which container to execute in (for multi-container pods)

These commands are essential for debugging, monitoring, and managing applications running in Kubernetes clusters.
