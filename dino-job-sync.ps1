<#
.SYNOPSIS
    DinoMate Job Aggregator CLI Runner - Syncs real jobs from 150+ platforms directly into PostgreSQL DB.
.EXAMPLE
    .\dino-job-sync.ps1 -Keyword "SDE Intern" -Location "Remote" -Limit 30 -SaveToDb
    .\dino-job-sync.ps1 -Keyword "AI Engineer" -Location "Remote" -Cluster "faang" -SaveToDb
#>

param(
    [string]$Keyword = "Software Engineer",
    [string]$Location = "Remote",
    [string]$Cluster = "startups",
    [string]$Sources = "",
    [int]$Limit = 30,
    [switch]$SaveToDb = $false,
    [string]$BackendUrl = "http://localhost:8080/api/aggregator/scrape"
)

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🦕 DinoMate — 150+ Platform Job Aggregator & DB Sync CLI" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# Determine source cluster
$sourceList = @()
if ($Sources -ne "") {
    $sourceList = $Sources -split "," | ForEach-Object { $_.Trim() }
} else {
    switch ($Cluster.ToLower()) {
        "startups"    { $sourceList = @("greenhouse", "lever", "ashby", "wellfound") }
        "faang"       { $sourceList = @("google", "amazon", "microsoft", "apple", "meta", "openai", "anthropic", "nvidia") }
        "internships" { $sourceList = @("internshala", "greenhouse", "ashby", "linkedin", "google", "microsoft") }
        "remote"      { $sourceList = @("weworkremotely", "remotive", "remoteok", "himalayas", "hackernews") }
        "india"       { $sourceList = @("naukri", "internshala", "linkedin", "indeed") }
        default       { $sourceList = @("greenhouse", "lever", "ashby", "linkedin") }
    }
}

$dryRun = -not $SaveToDb.IsPresent

Write-Host "• Keyword:     $Keyword" -ForegroundColor Cyan
Write-Host "• Location:    $Location" -ForegroundColor Cyan
Write-Host "• Cluster:     $Cluster" -ForegroundColor Cyan
Write-Host "• Sources:     $($sourceList -join ', ')" -ForegroundColor Cyan
Write-Host "• Limit:       $Limit" -ForegroundColor Cyan
Write-Host "• Save to DB:  $($SaveToDb.IsPresent) (dryRun: $dryRun)" -ForegroundColor ($SaveToDb ? "Yellow" : "Gray")
Write-Host "----------------------------------------------------------"
Write-Host "⚡ Calling DinoMate Aggregator..." -ForegroundColor Yellow

$payload = @{
    keyword       = $Keyword
    location      = $Location
    sources       = $sourceList
    limit         = $Limit
    dryRun        = $dryRun
    triggerSource = "admin"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $BackendUrl -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 60

    if ($response.success) {
        Write-Host " Success! Execution time: $($response.executionTimeMs) ms" -ForegroundColor Green
        Write-Host "• Fetched:         $($response.normalizedCount) normalized jobs" -ForegroundColor Cyan
        
        if ($response.dbStats) {
            Write-Host " Database Sync Stats:" -ForegroundColor Green
            Write-Host "   - Inserted into DB: $($response.dbStats.insertedCount)" -ForegroundColor Green
            Write-Host "   - Skipped (Dupl):   $($response.dbStats.skippedCount)" -ForegroundColor Yellow
            Write-Host "   - Failed:           $($response.dbStats.failedCount)" -ForegroundColor Red
        }

        Write-Host "`n Preview of Retrieved Jobs:" -ForegroundColor Magenta
        $count = 0
        foreach ($job in $response.jobs) {
            $count++
            $dbBadge = if ($job.savedToDb) { "[SAVED IN DB]" } else { "" }
            Write-Host " $count. [$($job.company)] $($job.title) - $($job.location) $dbBadge" -ForegroundColor White
            Write-Host "    Source: $($job.source) | Apply: $($job.url)" -ForegroundColor DarkGray
            if ($job.skills) {
                Write-Host "    Skills: $($job.skills -join ', ')" -ForegroundColor DarkCyan
            }
            if ($count -ge 10) {
                $rem = $response.jobs.Count - 10
                if ($rem -gt 0) {
                    Write-Host "   ... and $rem more jobs." -ForegroundColor DarkGray
                }
                break
            }
        }
    } else {
        Write-Host " Aggregator returned notice: $($response.message)" -ForegroundColor Yellow
        if ($response.errors) {
            foreach ($err in $response.errors) {
                Write-Host "   Error: $err" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host " Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host " Ensure DinoMate Spring Boot backend is running on port 8080 and DinoMate Scraper is active." -ForegroundColor Yellow
}
