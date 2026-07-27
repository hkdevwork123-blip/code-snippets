---
outline: deep
---

# SQL

Structured Query Language / Sequel / Squeal / S-Q-L. Call it whatever you like, if you’re spending time interacting with a relational database, chances are you’re going to be using it!

## The Basics

### Databases

There are a variety of different databases and database technologies available, however for the most part when working with SQL you’ll usually be working within a relational database. This is one that has clearly defined ‘relationships’ between tables via primary and foreign keys. You join tables together on these keys to build up data sets.

While relational databases are the primary focus when working with SQL, it's important to distinguish between the underlying databases themselves and the software systems known as database management systems (DBMS). Databases refer to collections of data structured into tables, which are then managed using a DBMS.

There are various flavours or implementations of these DBMS, each offering different features, performance characteristics, and syntax variations. For clarity, each code block in this documentation includes notes specifying the database technology used. Below is a list of some of the databases I have worked with before

- **_SQL Server_** - DBMS developed by Microsoft
- **_PostgreSQL_**- Open-source relational DBMS
- **_MySQL_** - Open-source relational DBMS
- **_AWS Redshift_** - Cloud warehousing solution provided by AWS
- **_Athena_** - Interactive query service for AWS S3. Uses PrestoDB as it’s query engine
- **_SnowFlake_** - Cloud data platform

### Tables & Data Types

Tables are Logical entities stored inside of a database that represent and contain your data, e.g. customers, orders etc.

Each column / field in a table will have a corresponding data type e.g customer_id (INTEGER) or customer_name (CHARACTER VARYING(40)). Its's important to understand these as they affect the types of functions / transformations that can be applied to them.

| customer_id(PK, INTEGER) | customer_name (CHARACTER VARYING(40)) | customer_email(CHARACTER VARYING(40)) |
| ------------------------ | :-----------------------------------: | ------------------------------------: |
| 1                        |              Joe Bloggs               |                       joe-b@email.com |
| 2                        |              Jane Plain               |                      jane-p@email.com |

### Normalisation, Denormalistaion & The Data Warehouse

In a traditional normalised databse, we store data in seperate logical tables and attempt to minimize redeundant data. Normalised databases are great for transacitonal systems where there are multiple reads and writes to the database. In a denormalised database we decide that we're okay with some redundancy in exchange for improved efficiency and performance. By combining related data into fewer tables, denormalization reduces the need for joins, which can result in faster query execution and improved response times.

A common pattern for most designs is to have a transactional database (normalised), which serves as a central repository for day-to-day operational tasks, such as recording and managing real-time data. Alongside this, a data warehouse (denormalised) is often used as a separate entity optimized for reporting and analytical purposes.

The data warehouse consolidates data from multiple sources, including the transactional database, and provides a denormalised view for efficient reporting and analysis. In the data warehouse, data integration and transformation processes may occur, including merging data from various sources, applying business rules, aggregating data, and creating calculated measures.

### Keys

In SQL a key is field or a combination of fields that uniquely identifies a record within a database table. There are primarily two you need to be aware of.

- Primary Key (PK): Unique identifier for each record in a table
- Foreign Key (FK): Establishes the relationship between two tables. It does this by referring to the primary key or a unique key in another table

Going back to our simple customer table example, lets now add an orders table which will contain the customer_id as it's foreign key.

| order_id(PK) | customer_id (FK) | product |
| ------------ | :--------------: | ------: |
| 100          |        1         |    Card |
| 200          |        1         |   Paper |
| 300          |        2         |  Pencil |

Now we can make a join between the two tables...

```SQL
SELECT *
FROM customers AS c
INNER JOIN orders AS o
ON c.customer_id = o.customer_id
```

The resulting data set would look like the below...

| customer_id(PK) | customer_name |   customer_email | order_id(PK) | customer_id (FK) | product |
| --------------- | :-----------: | ---------------: | -----------: | ---------------- | ------- |
| 1               |  Joe Bloggs   |  joe-b@email.com |          100 | 1                | Card    |
| 1               |  Joe Bloggs   |  joe-b@email.com |          200 | 1                | Paper   |
| 2               |  Jane Plain   | jane-p@email.com |          300 | 2                | Pencil  |

So we get all of the matching data from both tables. The \* symbol indicates we want to return all of the fields from both tables but we can update this very easily by simply specifying only the fields we're interested in returning.
::: tip
Just a note on the AS part of this query, that denotes an alias. An alias is like a shorthand representation that allows us to refer to the table or column. It can be particularly useful in cases where there are multiple tables involved in the query and there are overlapping column names. You can see this in the below query.
:::

```SQL
SELECT c.customer_id
, c.customer_email
, c.order_id
, c.product
FROM customers AS c
INNER JOIN orders AS o
ON c.customer_id = o.customer_id
```

| customer_id(PK) |   customer_email | order_id(PK) | product |
| --------------: | ---------------: | -----------: | ------- |
|               1 |  joe-b@email.com |          100 | Card    |
|               1 |  joe-b@email.com |          200 | Paper   |
|               2 | jane-p@email.com |          300 | Pencil  |

#### INNER JOIN Vs LEFT JOIN

In the above examples we have used an INNER JOIN to combine matching data in each table but there will be scenarios where records exist in one table but not in another. Let’s add another table to our database, Subscriptions.

| subscription_id(PK) | customer_id(FK) | subscription_type |
| ------------------: | --------------: | ----------------: |
|               sub_1 |               1 |          Standard |

Some customers may have subscribed and some may not have, we can see this by simply looking at the customer_id (FK) in the subscription table vs the customer_id's in the customers table.
:::details Expand to see customer table again!
| customer_id(PK) | customer_name | customer_email |
| ------------------------ | :-----------------------------------: | ------------------------------------: |
| 1 | Joe Bloggs | joe-b@email.com |
| 2 | Jane Plain | jane-p@email.com |
:::
There is currently only one record which belongs to customer_id (1) (Joe Bloggs). So if we wanted to return all customers, showing which have and haven't subscribed we would use a LEFT JOIN.
:::tip
Using an INNER JOIN here would only give us the records that match in both tables - excluding those customers that have not subscribed!
:::

```SQL
SELECT c.customer_id
, c.customer_email
, s.subscription_id
, s.subscription_type
FROM customers AS C
LEFT JOIN subscriptions AS S
ON C.customer_id = S.customer_id
```

The resulting data set would look like the below...

| customer_id(PK) |   customer_email | subscription_id(PK) | subscription_type |
| --------------: | ---------------: | ------------------: | ----------------: |
|               1 |  joe-b@email.com |               sub_1 |          Standard |
|               2 | jane-p@email.com |                NULL |              NULL |

See how we get the NULL values for customer_id (2). This is because there is no matching record for that customer in the subscriptions table. If we changed this to an INNER JOIN customer_id (2) would not be returned in the data set

### Indexes & Sort Keys

You could write a whole book on these; in fact I've actually got a massive one based around SQL Server 2017 sitting under my desk! However, in today’s world of cloud computing and modern columnar databases, you probably won’t be diving into these too much. Nonetheless, these are still concepts which are important to understand, even if only on a superficial level.

Indexes play a vital role in optimizing query performance in traditional relational databases. They help with faster data retrieval by creating additional data structures that allow the database engine to quickly locate and access specific rows based on the indexed columns. Similar to how an index in a book helps you find a specific topic or page quickly

Most columnar databases don't support indexes, as their underlying storage and query execution mechanisms are already optimized in ways which negate the need for traditional indexing structures. Sort keys are sort of the alternative to what you would consider a traditional index for a columnar database. They can help by defining the logical order of data within a column or set of columns, allowing the database engine to locate and retrieve data more efficiently.

## The Code Snippets

### SQL Server

---

#### Date / Time Stuff

---

##### Datetime format and declaring variables

```SQL
--------------DATE SCOPE VARIABLES--------------------------------------------
DECLARE @SD DATETIME = '2020-01-01 00:00:00.000' -- 1st January 2020
DECLARE @ED DATETIME = '2020-07-31 23:59:00.000' --  31st July 2020
-------------------------------------------------------------------------------

-----------The date 27 months back from ‘20180501’----------
DECLARE @StartDate DATE = DATEADD(MM, - 27, '20180501')
-----------The date 27 months back from today-----
DECLARE @EndDate DATE = DATEADD(MM, - 27, GETDATE())

```

##### Manipulating dates from a table

```SQL
---DECLARE DATE VARS FOR @SD1 AND @SD2---
DECLARE @RM INT =  (SELECT TOP 1 D.MONTHOFYEAR FROM BI.DBO.TBL_DATE D WHERE D.DATE=@SD1) --Reporting Month

DECLARE @RY INT =  (SELECT TOP 1 D.[YEAR] FROM BI.DBO.TBL_DATE D WHERE D.DATE=@SD1) --Reporting Year

```

##### List of useful date variables

```SQL
DECLARE @ThisDate DATETIME;-- Can simply use GETDATE() instead of variable

SET @ThisDate = getdate();

SELECT 'Beginning of this day' AS DEFINITION
	,dateadd(dd, datediff(dd, 0, @ThisDate), 0) AS 'DateOutput'
UNION
SELECT 'Beginning of next day'
	,dateadd(dd, datediff(dd, 0, @ThisDate) + 1, 0)
UNION
SELECT 'Beginning of previous day'
	,dateadd(dd, datediff(dd, 0, @ThisDate) - 1, 0)
UNION
SELECT 'Beginning of this week (Monday)'
	,dateadd(wk, datediff(wk, 0, @ThisDate), 0)
UNION
SELECT 'Beginning of next week (Monday)'
	,dateadd(wk, datediff(wk, 0, @ThisDate) + 1, 0)
UNION
SELECT 'Beginning of previous week (Monday)'
	,dateadd(wk, datediff(wk, 0, @ThisDate) - 1, 0)
UNION
SELECT 'Beginning of this month'
	,dateadd(mm, datediff(mm, 0, @ThisDate), 0)
UNION
SELECT 'Beginning of next month'
	,dateadd(mm, datediff(mm, 0, @ThisDate) + 1, 0)
UNION
SELECT 'Beginning of previous month'
	,dateadd(mm, datediff(mm, 0, @ThisDate) - 1, 0)
UNION
SELECT 'Beginning of this quarter (Calendar)'
	,dateadd(qq, datediff(qq, 0, @ThisDate), 0)
UNION
SELECT 'End of this Quarter'
	,dateadd(day, - 1, dateadd(qq, datediff(qq, 0, @ThisDate) + 1, 0))
UNION
SELECT 'Beginning of next quarter (Calendar)'
	,dateadd(qq, datediff(qq, 0, @ThisDate) + 1, 0)
UNION
SELECT 'Beginning of previous quarter (Calendar)'
	,dateadd(qq, datediff(qq, 0, @ThisDate) - 1, 0)
UNION
SELECT 'End of previous quarter (Calendar)'
	,DATEADD(dd, - 1, DATEADD(qq, DATEDIFF(qq, 0, @ThisDate), 0))
UNION
SELECT 'Beginning of this year'
	,dateadd(yy, datediff(yy, 0, @ThisDate), 0)
UNION
SELECT 'Beginning of next year'
	,dateadd(yy, datediff(yy, 0, @ThisDate) + 1, 0)
UNION
SELECT 'Beginning of previous year '
	,dateadd(yy, datediff(yy, 0, @ThisDate) - 1, 0)
UNION
SELECT 'End of last month '
	,dateadd(month, datediff(month, - 1, @ThisDate) - 1, - 1)
UNION
SELECT 'End of last month With Time '
	,DATEADD(s, - 1, DATEADD(mm, DATEDIFF(m, 0, @ThisDate) + 0, 0))
UNION
SELECT 'End of next month '
	,DATEADD(s, - 1, DATEADD(mm, DATEDIFF(m, 0, @ThisDate) + 2, 0))
----------------------------------------------------------------------
SELECT DATENAME(year, GETDATE()) AS [Year]
	,DATENAME(month, GETDATE()) AS [Month]
	,DATENAME(day, GETDATE()) AS [Day of Month Number]
	,DATENAME(dayofyear, GETDATE()) AS [Day In Year]
	,DATENAME(weekday, GETDATE()) AS [Day In Week]
	,DATENAME(DW, GETDATE()) AS [Day In Week]
```

##### Calculate exact age

```SQL
DATEDIFF
(YEAR, DateOfBirth, GETDATE ()) -
CASE WHEN MONTH(DateOfBirth) > MONTH(GETDATE ()) OR
MONTH(DateOfBirth) = MONTH(GETDATE()) AND
DAY(DateOfBirth) > DAY(GETDATE ()) THEN 1 ELSE 0 END AS [Age]

```

##### Get week start date

```SQL

SET DATEFIRST 1; -- SET TO MAKE MONDAY WEEK START
DATEADD(dd, - (DATEPART(dw, Date) - 1), Date) AS WeekStart,

```

##### Dynamic rolling start and end date variables

```SQL
----ROLLING DATE SNAPSHOT – START / END OF EACH MONTH--------

DECLARE @SD DATE = DATEADD(MM, DATEDIFF(MM, 0, GETDATE()) - 1, 0)START OF PREVIOUS MONTH

DECLARE @ED DATETIME = DATEADD(S, - 1, DATEADD(MM, DATEDIFF(M, 0, GETDATE()) + 0, 0)) -- END OF LAST MONTH (WITH TIME)

---Running date scope from two set points------
DECLARE @StartDate DATETIME = CASE WHEN MONTH(GETDATE())>=5
THEN CONVERT(DATETIME, CONVERT(CHAR(4), DATEPART(YEAR, DATEADD(yy,0,GETDATE()))-0) + '-04-01')
ELSE CONVERT(DATETIME, CONVERT(CHAR(4), DATEPART(YEAR, DATEADD(yy,0,GETDATE()))-1) + '-04-01')
END

DECLARE @EndDate DATETIME = CASE WHEN MONTH(GETDATE())<=4
THEN CONVERT(DATETIME, CONVERT(CHAR(4), DATEPART(YEAR, DATEADD(yy,0,GETDATE()))-0) + '-04-30 23:59:59.000')
ELSE SYSDATETIME()
END
---CORRECT-------
SELECT @StartDate
SELECT @EndDate

```

##### Month-Year concatenated column

```SQL
CONCAT(DATENAME(MONTH,IPS.Date),'-',YEAR(IPS.Date)) AS [Month-Year-Admission]
```

##### Days, Hours, Minutes

```SQL

-----------------------EXAMPLE ONE---------------------------
,CAST(DATEDIFF(SECOND,REF.Date, Appt.Date)/86400 AS varchar(4)) +' days '+
CAST (DATEDIFF(SECOND,REF.Date,
CAST(Appt.Date AS DATETIME) +' '+ CAST(Appt.Time AS DATETIME))/3600%24 AS VARCHAR (4)) + ' hours ' +
CAST(DATEDIFF(SECOND,REF.Date,
CAST(Appt.Date AS DATETIME) +' '+ CAST(Appt.Time AS DATETIME))/60%60 AS VARCHAR (2)) + ' mins' AS Hrs_Mins_From_Ref_To_Assessment


-----------------------EXAMPLE TWO---------------------------
,CAST(DATEDIFF(SECOND,IP.Date, IP.DischargeDate)/86400 AS varchar(4)) +' days '+
CAST (DATEDIFF(SECOND,IP.Date, IP.DischargeDate)/3600%24 AS VARCHAR (4)) + ' hours ' +
CAST(DATEDIFF(SECOND, IP.Date, IP.DischargeDate)/60%60 AS VARCHAR (2)) + ' mins' AS Time_Admitted


```

##### Time diff in hours

```SQL
--Most accurate way to derive time difference in hours----------------------------
AND N.AssessmentDate BETWEEN I.Date AND DATEADD(SECOND,43200,I.Date) -- WITHIN 12 HOURS OF ADMISSION
AND M.AssessmentDate BETWEEN I.Date AND DATEADD(SECOND,86400,I.Date) -- WITHIN 24 HOURS OF ADMISSION
AND N.AssessmentDate BETWEEN I.Date AND DATEADD(SECOND,259200,I.Date) -- WITHIN 72 HOURS OF ADMISSION

```

##### Cast date to serial number

```SQL

--https://stackoverflow.com/questions/40515866/ssms-2012-convert-datetime-to-excel-serial-number

SELECT TOP 1
	P.ID
	,p.DateOfBirth
	,CONVERT(INT,p.DateOfBirth) + 2  AS Serial_Number --Gives the serial number
	,P.PASID + ' | ' + TRY_CAST(CONVERT(INT,p.DateOfBirth) + 2 AS varchar(MAX)) AS My_Column -- Then have to cast it as varchar in the conncatennation - CAST/TRY_CAST both work in this instance
FROM BI_.dbo.tbl_table AS P
```

##### COALESCE in date calculations

If you need to create running counts where the end_date column may be NULL. Where an event is closed, the count will simply be between the start and end date. Where it is open it will count the end date as today's date.

```SQL
--count dates between two events where the EndDate may be NULL
DATEDIFF (DAY, T.StartDate, COALESCE (T.EndDate, GETDATE ())) AS [Days Events]

--Specifiying some additional criteria to filter for a certain period of time
AND DATEDIFF (DAY, T.StartDate, COALESCE(T.EndDate, GETDATE ())) >=29

AND DATEDIFF(WW,R.SDate, COALESCE(r.DdDate, GETDATE()))>=4 -- OPEN EVENTS OF MORE THAN 4 WEEKS

```

---

#### Filtering & Conditional Logic

---

Basic conditional logic

```SQL
DECLARE @X NVARCHAR(10) = 'Hello'
IF @X = 'Hello'
BEGIN
PRINT '@X = Hello'
END
ELSE
PRINT '@X != Hello'

```

---

##### WHERE, AND, OR...

---

Allow us to filter the data when querying.

```SQL
SELECT *
FROM BI_Metrics.dbo.LoggingTable AS L
WHERE ProcedureName LIKE '%20546%
```

Important syntax feature to remember when combining AND / OR statements. Use parentheses like the below to correctly apply the filtering

```SQL
AND (T.[Died on admission / 30 days after discharge] =1
OR (T.[Patient was transferred to physical health care provider during this admission] = 'Yes'
OR T.DiagnosisCode IS NOT NULL))
```

---

##### CASE Statements

---

Allow us to apply come conditional logic to fields WHEN x THEN y...

```SQL
CASE
WHEN DATEDIFF(DAY, IP.DischargeDate, RD.AdmissionDate) <= 28
THEN 'Yes'
ELSE 'No'

```

##### CASE with SUM

Allow us to make aggregates based of off conditional logic

```SQL
SUM (CASE WHEN A.FaceToFaceFlag = 'Yes' AND A.OutComeNationalCode IN ('5','6') THEN 1 ELSE 0 END) AS [Number of F2F Contacts],

SUM (CASE WHEN A.TelephoneContactFlag = 'Yes' AND A.OutComeNationalCode IN ('5','6')THEN 1 ELSE 0 END) AS [Number of Telephone Contacts]

```

---

#### Temp tables, CTE's, APPLY & Sub queries

All of these are great for providing separate logical instances of a query

##### Temp Tables

Basically just writting a query into a table which is only available temporarily within the session. Very similar to CTE's. Can also make them persistent outside of the session by using ##

```SQL
-----Link for referral screening to referral number----------------------------------
DROP TABLE IF EXISTS #RefLookup

USE Ox_RiO

SELECT DISTINCT 'R' + CAST(AR.SequenceID AS NVARCHAR) AS 'SequenceID'  , 'Ref: (' + CONVERT(NVARCHAR(17), ar.ReferralDateTime, 106) + ') ' + ISNULL(GST.CodeDescription, '') + ISNULL(' (' + GS.CodeDescription + ')','') AS 'Referral_Screening'
,AR.TeamReferredTo
,AR.ReferralNumber
INTO #RefLookup
FROM dbo.AmsReferral as AR
INNER JOIN dbo.GenSpecialty AS GS on AR.SpecialtyReferredTo = Gs.Code
LEFT JOIN dbo.GenServiceTeam AS GST on GST.Code = AR.TeamReferredTo
----------------------------------------------------------------------------------------
SELECT *
FROM #RefLookup
```

##### APPLY

APPLY in SQL server is one of my favourite functions to use. It comes in two variations, OUTER and CROSS. OUTER works like a LEFT JOIN and CROSS works like an INNER JOIN. They allow you to do a lot of powerfull transformations including getting the first / last occurrence of an event.

```SQL
---MOST RECENT ACOMMODATION / EMPLOYEMENT STATUS--
OUTER APPLY (
	SELECT TOP 1 *
	FROM BI_Reporting.dbo.tbl_SocialInclusion AS SI
	WHERE SI.PASID = T.PASID
	ORDER BY SI.StatusDate DESC
	) AS SI
```

##### CTE's

Common Table Expressions (CTE's) are a fantastic way to break up multiple queries and have them act almost as sepereate tables which you can then JOIN to and query independently

```SQL
WITH AppCTE AS

(SELECT
A.PASID,
A.TeamCode,
A.AppointmentDate,
ROW_NUMBER () OVER (PARTITION BY A.PASID ORDER BY A.AppointmentDate ASC) AS RowNum
FROM BI_Reporting.dbo.tbl_Appointment AS A
WHERE A.AppointmentDate BETWEEN '2018-01-01' AND '2018-02-01'
)

SELECT *
FROM AppCTE
WHERE AppCTE.RowNum = 1


--And then if we wanted to join two CTE’s together the syntax would be as follows--

;WITH CTE1 -- ; SEMICOLAN BEFORE THE FIRST CTE
AS (
	SELECT T.PASID
		,ROW_NUMBER() OVER (
			PARTITION BY t.PASID ORDER BY t.[TeamReferralEndDate] DESC
			) AS 'most recent updated date Flag'
	FROM [BI_Reporting].[dbo].[tbl_Team] t
	WHERE t.TeamCode IN ('GRWPCP')
		AND YEAR(t.TeamReferralEndDate) BETWEEN 2016 AND 2019

	), -- COMMA AFTER FIRST CTE BEFORE SECOND ONE

	CTE2
AS (
	SELECT T.PASID
		,ROW_NUMBER() OVER (
			PARTITION BY t.PASID ORDER BY t.[TeamReferralEndDate] DESC
			) AS 'most recent updated date Flag'
	FROM [BI_Reporting].[dbo].[tbl_Team] t
	WHERE t.TeamCode IN (
			'BRWPCP'
			,'BREPCP'
			)
		AND YEAR(t.TeamReferralEndDate) BETWEEN 2016 AND 2019
		)
-----JOIN THE CTE'S-----------------------
SELECT *
FROM cte1 AS C1
LEFT JOIN CTE2 AS C2 ON C1.PASID = C2.PASID
WHERE C1.[most recent updated date Flag] = 1
AND C2.[most recent updated date Flag]=1
-----------------------------------------

```

---

#### ROW_NUMBER & Ranking

Another great way of extracting events based on ranking / time criteria

```SQL
,ROW_NUMBER () OVER (PARTITION BY AT.PASID, CAST(AT.ActionDateTime AS DATE) ORDER BY AT.ActionDateTime desc)AS FirstAction
,ROW_NUMBER () OVER (PARTITION BY R.PASID ORDER BY R.TeamReferralStartDate DESC) AS Ref_Rank -- Most Recent Referral
,ROW_NUMBER () OVER (PARTITION BY R.PASID, R.TeamCode ORDER BY R.TeamReferralStartDate DESC) AS Ref_Rank -- Most Recent Team Referral

```

### Redshift / PostgreSQL

#### Postgres Server Vs Database

**PostgreSQL Server:**

The PostgreSQL server is the actual database management system software that manages and handles database operations.
It is a process or set of processes that run on a computer and provide the interface for clients to connect, query, and interact with databases.
The server manages connections, authentication, query execution, and other aspects of database operations

**PostgreSQL Database:**

A database in PostgreSQL is a container for a set of related data and a collection of objects (such as tables, views, indexes, etc.) that organize and store that data.
Multiple databases can reside on a single PostgreSQL server, and each database operates independently.

#### Postgres.app

Nifty full-featured PostgreSQL installation packaged as a standard Mac app. [Postgres.app](https://postgresapp.com/)

#### Ports 5432 and the constant running DB

I somehow managed to set up a constantly running PostgresDB on port 5432. I'm not entirely sure how this happen as I went through a phase of installing different postgres instances and then also the Postgres.app mentioned above. With a bit of AI help I found the offending agent, which was launching the process everytime my system started...

Firstly though two other new things to note...

1. Launch Agents:

- Run on behalf of the logged-in user
- Located in ~/Library/LaunchAgents/
- Used for user-specific services
- Only active when a user is logged in

2. Launch Daemons:

- Run at system level (root)
- Located in /Library/LaunchDaemons/
- Run regardless of who's logged in
- Start during system boot
- Used for system-wide services

```bash
# Lists all files in the LaunchAgents directory
# Filters (using grep) for any files containing "postgres" (case-insensitive)
ls -la ~/Library/LaunchAgents/ | grep -i postgres

# Displays the contents of the PostgreSQL launch daemon configuration file
cat /Library/LaunchDaemons/postgresql-15.plist
```

The below output is a plist File (property list file). A plist (Property List) file is an XML-based configuration file format used by macOS to store various settings and service configurations. For the below it configures PostgreSQL version 15 as a system service with the following settings:

- KeepAlive: false - Won't automatically restart if the service crashes
- Label: postgresql-15 - Unique identifier for the PostgreSQL service
- ProgramArguments - Specifies the PostgreSQL executable path and its arguments:
- Path to postmaster: /Library/PostgreSQL/15/bin/postmaster
- Data directory flag: -D
- Data directory path: /Library/PostgreSQL/15/data
- RunAtLoad: true - Service will start automatically at system boot
- UserName: postgres - Service runs under the 'postgres' system user

```xml
<?xml version="1.0" encoding="UTF-8"?>
	    	<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
	    	<plist version="1.0">
		    <dict>
			<key>KeepAlive</key>
			<false/>
			<key>Label</key>
			<string>postgresql-15</string>
			<key>ProgramArguments</key>
			<array><string>/Library/PostgreSQL/15/bin/postmaster</string>
<string>-D</string>
<string>/Library/PostgreSQL/15/data</string>
</array>
			<key>RunAtLoad</key>
			<true/>

			<key>UserName</key>
			<string>postgres</string>


		    </dict>
	    	</plist>
```

This ended causing a few issues for me when using docker-compose as I'd then have to change the port mappings on the config like the below

```yaml
version: "3.8"
services:
  postgres:
    container_name: container-pg
    image: postgres
    hostname: localhost
    # Map the container's port 5432 to the host's port 5432. If you have other PostgreSQL instances
    # running locally, adjust the host port (e.g., '5433:5432') to avoid conflicts.
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: root
      POSTGRES_DB: test_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  pgadmin:
    container_name: container-pgadmin
    image: dpage/pgadmin4
    depends_on:
      - postgres
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: root
    restart: unless-stopped

volumes:
  postgres-data:
```

This results in needing to set the below as your DB env var

```
DB_URL=postgresql://admin:root@localhost:5433/test_db
```

So decided to kill this once and for all!

First let's just do some spot checks to make sure there isn't anything relying on this

```bash
# List Open Files: Filters to only show processes using port 5432
sudo lsof -i :5432
```

And an alternative that does a similiar thing...

```bash
# Check if port is listening (simpler output)
netstat -an | grep 5432
```

Now we can stop this with the following steps...

1. Stop PostgreSQL Service

```bash
# Unload the LaunchDaemon (stops the service)
sudo launchctl unload /Library/LaunchDaemons/postgresql-15.plist
```

2. Disable Auto-Start (Prevent Future Issues)

```bash
# Disable the LaunchDaemon permanently
sudo launchctl disable system/postgresql-15
```

3. Verify PostgreSQL is Stopped

```bash
# Check if port 5432 is free
sudo lsof -i :5432
# Should show no output if successful
```

4. Start/stop manually when needed using the Postgres app. This seems to just default to my user db and not entirely sure how to change it but it works fine. If you were to use this for development the resulting DB_URL would be the below.

```
DB_URL=postgresql://hectorkurtyanek@localhost:5432/hectorkurtyanek
```

![design](/images/postgressapp.png)

#### Postgres Command Line

- List all versions of Postgres installed: `brew list | grep postgresql`
- Check the config, can be useful for things like finding the data directory (--datadir): `pg_config --configure`
- Show data directory when connected to PostgreSQL server: `SHOW data_directory;`
- List specific data directory, may need sudo for this: `sudo ls -l /Library/PostgreSQL/15/data`
- Determine the connection status of a PostgreSQL server: `pg_isready`
- Connect to a databse shorthand: `psql -U postgres`
- Connect to a database... again: `\c test-drizzle`
- Connect to a Database: `psql -d db_name -U user_name`
- Check Postgres Version (without connecting): `pg_config --version`
- Check Postgres Version: `SELECT VERSION();`
- Alter user password: `ALTER USER postgres PASSWORD 'password_update';`
- List All Databases: `\l`
- Access or Switch a Database: `\c db_name`
- List All Tables: `\dt`
- Describe All Tables: `\d`
- Describe a Specific Table: `\d tab_name`
- List All Schemas: `\dn`
- List All Views: `\dv`
- List All Functions: `\df`
- List All Users: `\du`
- Show Commands History: `\s`
- Save Query’s Results to a Specific File: `\o file_name`
- Run psql Commands/queries From a Particular File: `\i file_name`
- Execute Previous Command: `\g`
- Show Query Execution Time: `\timing`
- Get Output in HTML Format: `\H`
- Align Columns Output: `\a`
- Get Help: `\h`
- Get All psql Commands: `\?`
- Clear Screen: `\! cls`
- Quit psql: `\q`
- Connect to specific db: `\c <db_name>`
- Clear query buffer: `\r`
- Get all tables avaialable (can use with psql also):

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
      table_name
```

##### Postgres - stopping processes

Had a bit of fun when trying to stop a server running. Basically ran a kill -9 which is generally discouraged because it forcefully terminates the process without giving it a chance to perform a clean shutdown. This caused a lot of issues when trying to get the server back running again, although I did think the below command was usefull, as you can basically kill all processes at once running on a certain port. Anyway best bet here is to just stop and restart the server with brew commands

- List processes running on certain ports: `sudo lsof -i :5432`
- Kill all processes running on certain ports: `sudo kill -9 $(sudo lsof -t -i:5432)`
- Start Postgres server: `brew services start postgresql`
- Stop Postgres server: `brew services stop postgresql`
- Restart Postgres server: `brew services restart postgresql`

---

#### Date / Time Stuff

---

### Data Build Tool - Dbt

## Additional Resources
