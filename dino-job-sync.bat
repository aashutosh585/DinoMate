@echo off
setlocal enabledelayedexpansion

REM ==========================================================
REM 🦕 DinoMate — 150+ Platform Job Aggregator & DB Sync CLI
REM ==========================================================

set KEYWORD=%~1
if "%KEYWORD%"=="" set KEYWORD=Software Engineer

set LOCATION=%~2
if "%LOCATION%"=="" set LOCATION=Remote

set LIMIT=%~3
if "%LIMIT%"=="" set LIMIT=30

set SAVETODB=%~4
if "%SAVETODB%"=="" set SAVETODB=false

set DRYRUN=true
if /I "%SAVETODB%"=="true" set DRYRUN=false

echo ==========================================================
echo  DinoMate Job Aggregator CLI Runner
echo ==========================================================
echo  Keyword:    %KEYWORD%
echo  Location:   %LOCATION%
echo  Limit:      %LIMIT%
echo  Save to DB: %SAVETODB% (dryRun: %DRYRUN%)
echo ----------------------------------------------------------
echo  Sending request to DinoMate Backend (http://localhost:8080/api/aggregator/scrape)...

curl -s -X POST "http://localhost:8080/api/aggregator/scrape" ^
  -H "Content-Type: application/json" ^
  -d "{\"keyword\":\"%KEYWORD%\",\"location\":\"%LOCATION%\",\"sources\":[\"greenhouse\",\"lever\",\"ashby\",\"linkedin\"],\"limit\":%LIMIT%,\"dryRun\":%DRYRUN%,\"triggerSource\":\"admin\"}"

echo.
echo ==========================================================
echo  Done! If Save to DB was true, new jobs are stored in PostgreSQL.
echo ==========================================================
