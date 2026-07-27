---
outline: deep
---

# Flink

Apache Flink is an open-source stream processing framework for distributed, high-performing, always available and data streaming applications. Also provides supports for Batch, Graph and Iterative processing.

Flink is considered the next generation Engine for stream processing.

Key features...

- Robust Fualt-tolerance, applciation can restart from exactly the same point
- Application state is rescalable, providing the possibility to add resources whilst the app is running
- Also maintans exactly one semantics, guranteeing every record will be processed once and not repeated

## The Basics

### Architecture & Programming Model

- Source: The source flink is using to get the data e.g. Kinesis, Kafka, file etc.
- Operations & Transfromations: Operators called to transform the data
- Sink: Where we dump the porcessed data e.g. Database, S3 etc.
