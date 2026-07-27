---
outline: deep
---

# Docker

Docker is essentially a way to containerize software so that it can run on any hardware. Right, but what does that actually mean…? In simple terms, Docker is a software platform that simplifies the process of building, running, managing and distributing applications. It does this by virtualizing the operating system of the computer on which it is installed and running.

## The Basics

### Dockerfile:

Defines how to build a Docker image for your application.
Specifies the base image, environment, dependencies, and steps to set up your application.

### docker-compose.yaml

Defines and manages multi-container Docker applications.
Allows you to configure how your application's services should run, including environment variables, ports, volumes, and more.
Makes it easier to run complex applications with multiple interconnected services.

### docker-compose vs docker compose

There are two ways to use Docker Compose:

1. `docker-compose` (with hyphen):

   - The legacy standalone Python-based tool
   - Installed separately from Docker
   - Being phased out but still widely used in older documentation and scripts
   - Version shown with `docker-compose --version`

2. `docker compose` (without hyphen):
   - The new integrated Go-based implementation
   - Built into Docker Engine (since Docker CLI 2.0)
   - Recommended current approach
   - Generally faster and more reliable
   - Version shown with `docker compose version`

Both commands accept the same arguments and options, but `docker compose` is the future-proof choice. If you're starting a new project, use `docker compose`. The hyphenated version is maintained for backward compatibility.

Key differences:

- Installation: `docker compose` comes with Docker Desktop, while `docker-compose` needs separate installation
- Performance: `docker compose` is generally faster as it's written in Go and integrated into Docker CLI
- Features: `docker compose` may have newer features not available in `docker-compose`
- Environment: `docker compose` uses the same environment variables as Docker CLI

## The Code Snippets

## Building Images

### Basic Build Command

```bash
# Build an image from a Dockerfile in current directory
docker build -t myapp:1.0 .

# Build with a specific Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with no cache
docker build --no-cache -t myapp:1.0 .

# Build with build arguments
docker build --build-arg ENV=production -t myapp:prod .
```

- `docker build` - the build command
- `-t myapp:local-scan` - tags the image with a name (change myapp to whatever you want)
- `.` the build context (current directory, where your Dockerfile is)

### Multi-stage Builds

```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:16-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["npm", "start"]
```

## Docker Compose

### Basic docker-compose.yml Example

```yaml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=mypassword
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Common Docker Compose Commands

```bash
# Start services
docker compose up

# Start in detached mode
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# Build and start services
docker compose up --build

# View logs
docker compose logs -f

# Scale a service
docker compose up -d --scale web=3

# Tear down a service and remove the data volume (clears all persistent data)
docker-compose -f src/db/postgres-local/compose.yaml down -v
```

## Container Management

### Starting and Stopping Containers

```bash
# Start a container
docker run -d --name myapp nginx

# Stop a container
docker stop myapp

# Stop all running containers
docker stop $(docker ps -q)

# Remove a container
docker rm myapp

# Remove container when it stops
docker run --rm nginx
```

### Command Substitution Explained

The command `$(docker ps -q)` is an example of command substitution in shell scripting:

1. `docker ps`: Lists all running containers
2. `-q` flag: "Quiet" mode - outputs only container IDs
3. `$()`: Command substitution - executes the command inside and uses its output

So `docker stop $(docker ps -q)` works in two steps:

1. First gets all container IDs: `docker ps -q`
2. Then stops each one: `docker stop <container-id1> <container-id2> ...`

Without `-q`, the command would fail because it would include column headers and other container information. The `-q` flag ensures we get only the IDs.

Example of what happens:

```bash
# If you have these containers running:
CONTAINER ID   IMAGE     COMMAND
abc123         nginx     "nginx -g"
def456         redis     "redis-server"

# docker ps -q outputs just:
abc123
def456

# So the final command becomes:
docker stop abc123 def456
```

### Stop vs Down

The `stop` and `down` commands serve different purposes:

1. `docker stop`:

   - Stops running containers but keeps them on disk
   - Containers can be restarted with `docker start`
   - Does not remove networks, volumes, or images
   - Used for single containers or multiple containers with `docker stop $(docker ps -q)`
   - Example: `docker stop my-container`

2. `docker compose down`:
   - Stops AND removes containers defined in docker-compose.yml
   - Removes networks defined in docker-compose.yml
   - Can remove volumes with `-v` flag
   - Cleans up the entire compose environment
   - Example: `docker compose down -v`

When to use which:

- Use `stop` when you want to temporarily halt containers and resume later
- Use `down` when you want to completely tear down a compose environment
- Use `stop` for individual containers
- Use `down` for multi-container applications managed by compose

Stop our local next-app and postgres db containers running

```bash
cd docker-dev && docker compose -f compose.dev.yaml down
cd src/db/postgres-local && docker compose down
```

### Managing Images

```bash
# List images
docker images

# Remove an image
docker rmi nginx:latest

# Remove all unused images
docker image prune

# Remove all unused images (including unused containers)
docker system prune -a

# Force remove image
docker rmi -f nginx:latest
```

## Common Flags Explained

### Runtime Flags

- `-d`: Run container in detached mode (background)
- `-it`: Interactive mode with pseudo-TTY
- `-p`: Port mapping (e.g., -p 8080:80)
- `-v`: Volume mounting
- `-e`: Set environment variables
- `--name`: Assign a name to the container
- `--rm`: Remove container when it stops
- `--network`: Connect to a network

### Build Flags

- `-t`: Tag the image
- `-f`: Specify Dockerfile path
- `--no-cache`: Build without using cache
- `--build-arg`: Pass build arguments

### Compose Flags

- `-f`: Specify compose file
- `--build`: Build images before starting
- `--force-recreate`: Recreate containers
- `-v`: Remove volumes
- `--scale`: Scale service instances

## Cache Management

### Clearing Docker Cache

```bash
# Remove all unused containers, networks, images (both dangling and unreferenced)
docker system prune -a

# Remove build cache
docker builder prune

# Remove only dangling images
docker image prune

# Remove all unused volumes
docker volume prune

# Clear everything with force
docker system prune -af --volumes
```

### Build Cache Strategies

```bash
# Disable cache during build
docker build --no-cache .

# Use cache from specific image
docker build --cache-from myapp:latest .

# Build with specific target stage
docker build --target builder .
```

## Advanced Command Examples

### Clean Build with BuildKit Disabled

```bash
docker system prune -af && DOCKER_BUILDKIT=0 docker compose build --no-cache --progress=plain orbit-web-service
```

This command is a combination of multiple operations:

1. `docker system prune -af`:

   - Removes all unused containers, networks, images, and cached build layers
   - `-a`: Remove all unused images, not just dangling ones
   - `-f`: Force removal without confirmation

2. `&&`: Chain the commands (only runs second command if first succeeds)

3. `DOCKER_BUILDKIT=0`:

   - Temporarily disables BuildKit for this command
   - BuildKit is Docker's modern build system
   - Disabling it can help diagnose build issues with more detailed output

4. `docker compose build`:
   - Builds the service defined in docker-compose.yml
   - `--no-cache`: Forces a clean build without using cached layers
   - `--progress=plain`: Shows detailed build output instead of BuildKit's default concurrent output
   - `orbit-web-service`: The specific service to rebuild

This command is useful when you need to:

- Completely clean your Docker environment
- Rebuild a service from scratch
- Debug build issues with detailed output
- Ensure no cached layers are used

## Useful Tips

### Inspecting Containers

```bash
# View container logs
docker logs -f container_name

# Execute command in running container
docker exec -it container_name /bin/bash

# View container details
docker inspect container_name

# View container resource usage
docker stats container_name
```

### Network Management

```bash
# Create a network
docker network create mynetwork

# Connect container to network
docker network connect mynetwork container_name

# List networks
docker network ls

# Remove network
docker network rm mynetwork
```
