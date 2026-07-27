---
outline: deep
---

# Airflow

Cron jobs, but all grown up with a proper dashboard. Apache Airflow is an open-source platform for authoring, scheduling and monitoring workflows as code. You define your pipelines as DAGs (Directed Acyclic Graphs) in Python, and Airflow handles the scheduling, dependency management, retries and monitoring for you. It's a staple of the data engineering world for orchestrating ETL jobs and just about any multi-step batch process you can think of.

## The Basics

Airflow is used for the scheduling and orchestration of data pipelines/workflows. Orchestration refers to the sequencing, coordination, scheduling, and managing of complex pipelines from diverse sources, delivering data sets ready for consumption by BI applications, data science, and ML models.

### What is a DAG?

A DAG is simply a directed graph with no cycles. The terminology describes the nature of a workflow where you *never* look back to previous steps. It's a high-level descriptor of the execution - the steps being taken, aka the pipeline.

### Core Components

- **Web Server** - Flask server with Gunicorn serving the UI
- **Scheduler** - daemon in charge of scheduling workflows
- **Metastore** - database where metadata is stored
- **Executor** - class defining how tasks should be executed
- **Worker** - process/subprocess executing your task

## Installation

::: tip
Prefer the Docker Compose method below over a local virtualenv install.
:::

### Docker Compose

Airflow runs in a Docker container. The simplest way to spin up a new project is to pull the official `docker-compose.yaml` straight from the Airflow docs, then start it up:

```bash
curl -LfO 'https://airflow.apache.org/docs/apache-airflow/stable/docker-compose.yaml'
docker compose up
```

Default username and password are both `airflow`.

Docker Compose is a tool for defining and sharing multi-container applications. You configure services in a YAML file, then create and start them all with a single command.

### Local virtualenv (alternative)

```bash
python3 -m venv sandbox
source sandbox/bin/activate

pip install wheel
pip3 install apache-airflow==2.3.2

airflow db init        # init metastore + generate files/folders
airflow webserver      # start webserver at http://localhost:8080
airflow scheduler      # start scheduler (shows the example DAGs)
```

Default username/password: `airflow` / `airflow`.

::: warning
If installed via a virtualenv, activate it before running any `airflow` commands.
:::

### The CLI

Create a new user:

```bash
airflow users create -u admin -p admin -f H -l K -r Admin -e <YOUR_EMAIL>
```

`-u` username, `-p` password, `-f` first name, `-l` surname, `-r` role, `-e` email.

Kill the webserver - find the PID (`lsof -i tcp:8080`, usually the first Python process), then:

```bash
kill 5463
```

## Tasks, Operators & Hooks

- **Task** - manages the execution of an operator; a small wrapper/manager around an operator that ensures it executes correctly.
- **Operator** - has a single responsibility to perform one piece of work. Generic ones include `BashOperator` (runs Bash scripts) and `PythonOperator` (runs a Python function).
- **Hook** - an abstraction of a specific API that lets Airflow interact with an external system. You might use a hook inside a Python function that's then called by a task via the `PythonOperator`.

### Hooks vs Operators

A **hook** is a connection to a particular external service (database, cloud storage, messaging) - it manages the connection and provides a common interface. An **operator** is the workhorse: it defines the individual tasks executed as part of a workflow and their dependencies. Operators can execute arbitrary code and can use hooks to interact with external services.

In short: a hook is *how you connect*; an operator is *a defined task* that runs as part of a workflow.

## Providers

Like Terraform, Airflow has providers to connect to cloud platforms, databases, etc. Install via pip or `requirements.txt`:

```bash
pip3 install apache-airflow-providers-snowflake
```

Or in `requirements.txt`:

```
apache-airflow-providers-snowflake==3.2.0
```

then `pip3 install -r requirements.txt`.

## Creating a DAG

Create a project folder with a `dags` subfolder - Airflow picks code up from there.

::: warning
A DAG won't show if there are syntax errors - you'll see a "DAG import error" at the top of the UI.
:::

### Default Args

The `default_args` dictionary lets you define default arguments for the DAG (e.g. `start_date`) as a dictionary that you pass to the DAG object. See the [Airflow tutorial](https://airflow.apache.org/docs/apache-airflow/1.10.6/tutorial.html).

### Sensors

Event-triggered - responds to an event you provide (e.g. a table being filled with data). Two things to keep in mind:

- **`poke_interval`** - time between the sensor checking the condition
- **`timeout`** - when the sensor stops/fails

### Custom Operators

To build a reusable operator, subclass `BaseOperator` (all operators are subclasses of it). For example, an `ApiToS3Operator` that retrieves data from an API endpoint and saves it to an S3 bucket, using the `HttpHook` for the request.

### executor_config & memory_limit

Since moving Airflow to Kubernetes, some extra values need setting in the DAG (when using the `KubernetesPodOperator`):

- **`executor_config`** - additional configuration for the Kubernetes executor, which runs your tasks on the cluster. Also relates to the role Airflow assumes to access AWS.
- **`memory_limit`** - the maximum memory the task's pod can consume, e.g. `"7168Mi"` (7168 MiB). If the task exceeds it, Kubernetes terminates the container.

## Testing Tasks

You can test specific tasks from the terminal rather than the UI:

```bash
docker-compose ps    # list running containers/images
```

Take the scheduler container (e.g. `dags_airflow-scheduler_1`) and exec into it:

```bash
docker exec -it dags_airflow-scheduler_1 /bin/bash
```

You're now inside the VM and can run Airflow CLI commands, e.g. test a task:

```bash
airflow tasks test postgres_test create_table 2022-01-01
```

### Checking task data

- **Files in `/tmp`:** exec into the `dags_airflow-worker_1` container and run `ls /tmp/`.
- **Data in a created table:** exec into the `dags_postgres_1` container, run `psql -U airflow`, then your SQL.
- **Clean up `/tmp`:** `rm -r /tmp` (leaves one file `tmp...` which is permission-denied).

## MWAA Local Environment

A way to run a local copy of the `airflow-dags` repo (branch: `test-eap-api`). Recommended to create a branch first, since you may change DAG code. Requires Docker running.

There's a `mwaa-local-env.sh` script in the `mwaa_local` folder. `cd` in, then:

```bash
sh mwaa-local-env.sh build-image   # first time only
sh mwaa-local-env.sh start         # server at localhost:8080 (admin / test)
sh mwaa-local-env.sh stop
```

Code changes appear in the UI quickly.

### The local setup saga

- The image name is still MWAA-branded, but we're not using the MWAA variant - it's just a legacy naming convention (confusing; worth renaming).
- **`pull access denied for amazon/mwaa-local`** - pull the image again: `docker pull apache/airflow:2.8.0-python3.10`.
- **`database files are incompatible with server`** (Postgres 10 vs 14 data dir) - purge everything on Docker Desktop (delete all volumes and anything referencing `docker_postgres`), then `sh mwaa-local-env.sh start`.
- The script exports some env vars at the top, notably your analytics AWS profile. Set your `.aws` config profile to `analytics` (not `p-analytics-admin`, which didn't work).
- **`kpi-dig-connection is not defined`** - add a dummy connection for `kpi-dig-connection` in the UI.

### Setting additional connections

Set up extra connections in the UI - the `redshift_connection_id` and `api_connection_id` store the API key and Redshift login (host/passwords in 1Password). There's a `table` variable in the repo for creating the table to load data into.

## Airflow repo conventions

- Prefix commits with `feat:` to trigger a semantic release. Merging the PR auto-increments the tag version.
- When deploying to prod, add the version number **including the `v`**.

### Running unit tests locally

This repo uses a lot of packages, so isolate with a venv:

```bash
virtualenv venv
source venv/bin/activate

pip install "apache-airflow[amazon]==2.2.2" \
  --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.2.2/constraints-3.8.txt" \
  && pip install pyopenssl --upgrade \
  && pip install pytest requests-mock xmltodict

pytest -o log_cli=true
```

Tag extra libraries onto the end as needed (e.g. `oauthlib backoff` for the netsuite ticket).

::: tip Hook not recognized
If a hook you're extending (e.g. `RedshiftSQLHook`) isn't recognized, your Airflow version may not include it. Check `gitpod.yml` for the version we actually run and match it, e.g.:

```bash
pip install "apache-airflow[amazon]==2.6.3" \
  --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.6.3/constraints-3.10.txt"
```

`--constraint` points to a constraints file to maintain a consistent, compatible set of package versions.
:::

## Issues & Resolutions

We deal with a variety of DAG failures daily - API key changes (e.g. `linked_in` DAG), an endpoint switching to a paid model (`FX_Data`), or broken Athena queries. Check this CloudWatch log group: `airflow-Prod_Airflow_V222-Task`.

### No space left on device

```
ERROR/ForkPoolWorker-16] Failed to execute task [Errno 28] No space left on device
```

A large number of DAGs failed. Root cause: workers run in Fargate and were running out of disk. We keep a minimum number of workers, so some never die - they accumulate junk and fill up.

Interim fix: reduce minimum worker count to 1, then set it back to the original (6). To adjust: AWS -> Managed Apache Airflow -> environment (e.g. `Prod_Airflow_V222`) -> Edit -> Next -> "Minimum worker count".

### Atlassian API - Jackson exception

```
{"message":"com.fasterxml.jackson.databind.JsonMappingException: ...
```

A Java issue on [Atlassian's end](https://www.baeldung.com/jackson-exception).

### Column length issue

The CloudID work added the `entitlementNumber` to the `addon_license_id` field, causing a length error. Use the `analytics_admin` Redshift connection to view the errors:

```sql
SELECT *
FROM stl_load_errors;
```

### Docker Compose port clash

Got an error running `docker-compose up -d` because starting Docker also starts the local MWAA setup on port 8080. Stop that process, then run the command again.
