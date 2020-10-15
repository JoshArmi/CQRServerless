CREATE TABLE "events"
(
   EVENT_ID SERIAL PRIMARY KEY,
   EVENT_TYPE CHAR(50),
   AGGREGATE_ID CHAR(50),
   AGGREGATE_TYPE CHAR(50),
   METADATA JSON,
   EVENT_TIME TIMESTAMP,
   ACTOR CHAR(50)
);
