---
outline: deep
---

# Java

Write once, run everywhere! Whether you're working on Windows, Mac, or Linux, Java doesn't care. Java was developed by Sun Microsystems (which is now the subsidiary of Oracle) in 1995 and is a high level, robust, object-oriented langauge.

## The Basics

### JDK, JRE & JVM & JAR

- JDK: Java Development Kit, needed to build and compile Java programs
- JRE: Java Runtime Environment, needed to execute / run Java programs. Can think of it like this, we write some Jave, then compile it to Java bytecode and then we need the JRE to run that bytecode
- JVM: Java Virtual Machine, how we run Java programs. We configure the settings and then rely on the JVM to manage program resources during execution. We write Java Code, this get's compiled into byte code and run on the JVM
- JAR: A JAR file is a compressed archive format that contains multiple Java-related files, such as class files, resources, and metadata. It allows developers to bundle Java applications, libraries, or modules into a single file for easier distribution and deployment.

### `javac` (Java Compiler)

- `javac` is the **Java compiler** that turns human‑readable `.java` source files into `.class` bytecode files.
- It is included with the **JDK** (not just the JRE). If you have a real JDK installed, you should have `javac`.
- Basic workflow:
  - Write source: `MyProgram.java`
  - Compile: `javac MyProgram.java` → produces `MyProgram.class`
  - Run: `java MyProgram`
- To check which compiler you’re using:
  - `javac -version` → shows the JDK/compiler version
  - `java -version` → shows the JVM/runtime version

### Public Static Void

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```

So Java has a bit more boilerplate than some other languages. Firstly, every Java program has to have a class, all code must be inside of this. Now lets break down the second part which defines the entry point of the program.

- public: access modifier. It indicates that the main method is accessible from anywhere. In simpler terms, it's like saying, "Everyone can use this method." In Java, methods can have different access levels, such as public, private, protected, and package-private (no access modifier). public is used for the main method because it needs to be accessible from outside the class, so the JVM can find and run it.
- static: A keyword that means the method or variable belongs to the class itself, rather than to an instance (object) of the class
- void: The return type of the main method. Indicates that the main method doesn't return any value when it's done running
- main: Name of the method. This is a special name recognized by the JVM.
- String[] args: Typical way to accept command-line arguments in the main method, and it's essentially the default way to do so

#### How to run....

If you want to do some quick simple experiments you can use the `jshell`, typing this in the terminal will open an interactive Java environment. And we can do our hello world with just...

```java
System.out.print("Hello World");
```

Cd into the relevant section of the folder where your program is.

Compile Your Java Program: Use the javac command to compile your Java source code into bytecode.
This will generate a file called HelloWrold.class in the same directory.

```bash
javac HelloWorld.java
```

Run Your Java Program: After successfully compiling your program, use the java command to run it

```bash
java HelloWorld
```

You can also combine these two commands into one!

```bash
javac HelloWorld.java && java HelloWorld
```

### Data Types in Java

- Primitive Types: Boolean, Int, Double, Char
- Reference Types: String, Arrays, Classes & Objects

When you declare a variable in Java you must set a data type...

```Java
int number = 100;
String name = "name";
```

### Java Packages & Folder Naming

- Java uses **packages** (e.g. `com.example.app`) to group classes and avoid name clashes.
- Convention: use your **domain name reversed** as the base package:
  - `example.com` → `com.example`
  - `myorg.org` → `org.myorg`
- Each `.` in the package name becomes a **folder** in `src`:
- `package com.example.app;` → `src/com/example/app/MyClass.java`
- Using reversed domain names (`com.example.app`) makes package names **globally unique** (tied to a domain you own).
- The folder-per-segment rule (`com/example/app`) keeps code **organized and predictable** for tools, IDEs, and large teams.
- Following this convention avoids class name collisions and makes it easy to integrate with standard Java build tools and libraries.

## Maven

Maven is a widely used build automation tool primarily used for Java projects. It provides a way to manage dependencies, compile code, run tests, package applications, and more. It simplifies the build process by defining a standardized project structure and managing project dependencies.

Maven uses a configuration file called pom.xml (Project Object Model) that describes the project's metadata, dependencies, build settings, and other project configuration details. The POM is the heart of Maven and provides a declarative way to define and manage a project.

Install maven...

```bash
brew install maven
```

Check installation

```bash
mvn --version
```

Here's a clean write-up you can paste into your doc site:

### Maven & POM.xml

The pom.xml (Project Object Model) is Maven's configuration file — equivalent to package.json in Node. It defines your project's metadata, dependencies, build plugins, and repositories.

#### Dependencies

Dependencies are declared in the `<dependencies>` section:

```xml
<dependency>
    <groupId>com.atlassian.jira</groupId>
    <artifactId>jira-api</artifactId>
    <version>9.9.0</version>
    <scope>provided</scope>
</dependency>
```

Scope controls when the dependency is available:

| Scope               | Meaning                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `compile` (default) | Available everywhere, bundled into your JAR                                     |
| `provided`          | Available at compile time but NOT bundled — the runtime (e.g. Jira) provides it |
| `test`              | Only available during testing                                                   |
| `runtime`           | Not needed at compile time, but bundled for runtime                             |

#### Transitive Dependencies

When you declare a dependency, that library has its own pom.xml with its own dependencies. Maven resolves the entire chain automatically. These inherited dependencies are called transitive dependencies.

```
your-plugin
└── jira-api:9.9.0 (you declared this)
└── entityengine:3.0.8 (transitive — jira-api needs it)
└── jta:1.0.1 (transitive — entityengine needs it)
```

You never asked for jta, but Maven pulls it in because it followed the chain.

#### Exclusions

Sometimes a transitive dependency causes problems — it can't be found in any repository, conflicts with another version, or simply isn't needed. You can block it with an exclusion:

```xml
<dependency>
    <groupId>com.atlassian.jira</groupId>
    <artifactId>jira-api</artifactId>
    <version>9.9.0</version>
    <scope>provided</scope>
    <exclusions>
        <exclusion>
            <groupId>jta</groupId>
            <artifactId>jta</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

This tells Maven: "give me jira-api, but don't try to resolve jta in its dependency chain."

#### When it's safe to exclude

- provided or test scope transitive deps (not bundled anyway)
- Artifacts that no longer exist in any Maven repository
- Relocated/renamed artifacts already available under a different name

#### When to be careful

- compile scope transitive deps that get bundled — excluding them can cause ClassNotFoundException at runtime
- Dependencies you're unsure about — test thoroughly after excluding
- Debugging Dependency Issues

```bash
# To see the full dependency tree:
mvn dependency:tree

# To find where a specific artifact is pulled in from:
mvn dependency:tree -Dincludes=jta:jta

# To see verbose output including conflicts and scope info:
mvn dependency:tree -Dverbose
```

#### Repositories

Maven downloads dependencies from repositories. These are configured in the `<repositories>` section of your POM:

```xml
<repositories>
    <repository>
        <id>atlassian-public</id>
        <url>https://packages.atlassian.com/mvn/maven-atlassian-external/</url>
    </repository>
</repositories>
```

If an artifact can't be found in any configured repository, the build fails. This is a common cause of build breaks when repository URLs change or old artifacts are removed.

#### Parent / Aggregator POMs

A parent POM with `<packaging>`pom`</packaging>` doesn't produce a JAR — it groups submodules:

```xml
<project>
    <packaging>pom</packaging>
    <modules>
        <module>assistant</module>
    </modules>
</project>
```

This tells Maven "build the assistant subdirectory as a child module." The child module has its own pom.xml with the actual dependencies and plugins.

#### Common Commands

| Command               | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `mvn clean`           | Deletes the `target/` build directory                           |
| `mvn compile`         | Compiles the source code                                        |
| `mvn package`         | Compiles, tests, and packages into a JAR                        |
| `mvn dependency:tree` | Shows the full dependency tree                                  |
| `atlas-run`           | AMPS wrapper — builds and runs a Jira instance with your plugin |
| `atlas-clean`         | AMPS wrapper — cleans build artifacts                           |

#### Key Differences from npm

|                  | Maven                            | npm                                                    |
| ---------------- | -------------------------------- | ------------------------------------------------------ |
| Config file      | `pom.xml`                        | `package.json`                                         |
| Lock file        | None (versions pinned in POM)    | `package-lock.json`                                    |
| Install command  | `mvn install`                    | `npm install`                                          |
| Local cache      | `~/.m2/repository/`              | `node_modules/`                                        |
| Transitive deps  | Resolved from each library's POM | Resolved from each package's `package.json`            |
| Missing dep      | Build fails hard                 | Almost never happens (npm registry retains everything) |
| Scope equivalent | `provided`                       | `peerDependencies` (loosely)                           |

## AWS Lambda + Java

This can be a bit of a pain to set up.

- Using VS Code to create a maven project sets an unsupported JDK in the pom.xml, so you won’t be able to build a jar until you change the source and target dependencies. This isn’t an issue in IntelliJ
- To build your jar you can run mvn clean package from source of the folder. The jar will go into the target folder
- Manually create a lambda function from the console, set the runtime to Java 11.
- Upload your jar file. You will need to edit the runtime settings so that the handler matches your package name, class and method

### Doing this using terraform...

If using maven there needs to be a directory structur simialr to the below

```bash
mkdir -p src/main/java/com/example
```

Other commands...

```bash
unzip -l target/java-events-1.0-SNAPSHOT.jar
unzip -l target/java-events-1.0-SNAPSHOT.jar | grep app
mkdir -p
mvn clean install
unzip -l target/java-events-1.0-SNAPSHOT.jar | grep app
```
