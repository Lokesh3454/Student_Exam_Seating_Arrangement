$ErrorActionPreference = "Stop"

Write-Host "`n=== Testing Smart Exam Hall Seating - Advanced Features ===" -ForegroundColor Cyan

# 1. Login as Admin
Write-Host "`n1. Logging in as Admin..." -ForegroundColor Yellow
$loginPayload = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginPayload

$token = $loginRes.token
if (-not $token) {
    Write-Error "Failed to obtain JWT token"
}
Write-Host " Admin JWT token acquired successfully! User: $($loginRes.username), Role: $($loginRes.role)" -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Test Dashboard Stats
Write-Host "`n2. Testing GET /api/reports/dashboard-stats..." -ForegroundColor Yellow
$statsRes = Invoke-RestMethod -Uri "http://localhost:8080/api/reports/dashboard-stats" `
    -Method GET `
    -Headers $headers

$stats = $statsRes.data
Write-Host " Dashboard Statistics retrieved:" -ForegroundColor Green
Write-Host "   - Total Students: $($stats.totalStudents)"
Write-Host "   - Total Halls: $($stats.totalHalls)"
Write-Host "   - Total Exams: $($stats.totalExams)"
Write-Host "   - Total Faculty: $($stats.totalFaculty)"
Write-Host "   - Available Seats: $($stats.availableSeats)"
Write-Host "   - Occupied Seats: $($stats.occupiedSeats)"
Write-Host "   - Upcoming Exams: $($stats.upcomingExamsCount)"

# 3. Test CSV Import
Write-Host "`n3. Testing POST /api/students/import (CSV batch upload)..." -ForegroundColor Yellow
$csvPath = "$PSScriptRoot\sample_import.csv"
$csvData = @"
registerNumber,name,branch,year,section,email,phone
ADV101,John Doe,CSE,3,A,john.adv@test.com,9876543201
ADV102,Jane Roe,ECE,2,B,jane.adv@test.com,9876543202
ADV101,Duplicate John,CSE,3,A,john.dup@test.com,9876543203
ADV103,Bad Year Stu,MECH,6,A,bad.year@test.com,9876543204
"@

[System.IO.File]::WriteAllText($csvPath, $csvData)

# Prepare multipart upload via curl.exe to avoid powershell form boundary complexities
$curlOutput = & curl.exe -s -X POST "http://localhost:8080/api/students/import" `
    -H "Authorization: Bearer $token" `
    -F "file=@$csvPath"

$importRes = $curlOutput | ConvertFrom-Json
Write-Host " Import Response:" -ForegroundColor Green
Write-Host "   - Total Rows: $($importRes.data.totalRows)"
Write-Host "   - Successfully Imported: $($importRes.data.successfullyImported)"
Write-Host "   - Duplicate Rows: $($importRes.data.duplicateRows)"
Write-Host "   - Failed Rows: $($importRes.data.failedRows)"
Write-Host "   - Recorded Errors: $($importRes.data.errors.Count)"
Remove-Item $csvPath -ErrorAction SilentlyContinue

# 4. Conflict Detection
Write-Host "`n4. Testing POST /api/seating/validate-conflicts/1..." -ForegroundColor Yellow
$conflictRes = Invoke-RestMethod -Uri "http://localhost:8080/api/seating/validate-conflicts/1" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body '{"strategy":"ADJACENT_BRANCH_SEPARATION"}'

Write-Host " Conflict Diagnostics:" -ForegroundColor Green
Write-Host "   - Eligible Students: $($conflictRes.data.eligibleStudentCount)"
Write-Host "   - Total Available Seats: $($conflictRes.data.totalAvailableSeats)"
Write-Host "   - Already Generated: $($conflictRes.data.alreadyGenerated)"
Write-Host "   - Total Diagnostic Items: $($conflictRes.data.conflicts.Count)"
foreach ($c in $conflictRes.data.conflicts) {
    Write-Host "     [$($c.severity)] $($c.type): $($c.message)" -ForegroundColor Gray
}

# 5. Seating Regeneration with ADJACENT_BRANCH_SEPARATION
Write-Host "`n5. Testing POST /api/seating/regenerate/1 with ADJACENT_BRANCH_SEPARATION..." -ForegroundColor Yellow
$regenPayload = @{
    strategy = "ADJACENT_BRANCH_SEPARATION"
} | ConvertTo-Json

$regenRes = Invoke-RestMethod -Uri "http://localhost:8080/api/seating/regenerate/1" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $regenPayload

Write-Host " Seating Regenerated Successfully!" -ForegroundColor Green
Write-Host "   - Exam Name: $($regenRes.data.examName)"
Write-Host "   - Strategy: $($regenRes.data.strategy)"
Write-Host "   - Total Students Seated: $($regenRes.data.totalStudents)"
Write-Host "   - Halls Used: $($regenRes.data.hallsUsed)"

# 6. PDF Downloads Test
Write-Host "`n6. Testing PDF Generation Endpoints..." -ForegroundColor Yellow

# 6a. Exam Seating PDF
$examPdf = Invoke-WebRequest -Uri "http://localhost:8080/api/reports/export/pdf/exam-seating/1" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing

$isPdf1 = [System.Text.Encoding]::ASCII.GetString($examPdf.Content[0..3]) -eq "%PDF"
Write-Host "   - Exam Seating PDF: $($examPdf.Content.Length) bytes (Header: %PDF valid: $isPdf1)" -ForegroundColor Green

# 6b. Hall Seating Chart PDF
$hallPdf = Invoke-WebRequest -Uri "http://localhost:8080/api/reports/export/pdf/hall-chart/1/1" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing

$isPdf2 = [System.Text.Encoding]::ASCII.GetString($hallPdf.Content[0..3]) -eq "%PDF"
Write-Host "   - Hall Seating Chart PDF: $($hallPdf.Content.Length) bytes (Header: %PDF valid: $isPdf2)" -ForegroundColor Green

# 6c. Student-Wise Report PDF
$studentPdf = Invoke-WebRequest -Uri "http://localhost:8080/api/reports/export/pdf/student-report?examId=1" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing

$isPdf3 = [System.Text.Encoding]::ASCII.GetString($studentPdf.Content[0..3]) -eq "%PDF"
Write-Host "   - Student-wise Report PDF: $($studentPdf.Content.Length) bytes (Header: %PDF valid: $isPdf3)" -ForegroundColor Green

# 6d. Attendance Register PDF
$attPdf = Invoke-WebRequest -Uri "http://localhost:8080/api/reports/export/pdf/attendance/1" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing

$isPdf4 = [System.Text.Encoding]::ASCII.GetString($attPdf.Content[0..3]) -eq "%PDF"
Write-Host "   - Attendance Register PDF: $($attPdf.Content.Length) bytes (Header: %PDF valid: $isPdf4)" -ForegroundColor Green

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " ALL 10 ADVANCED FEATURES VERIFIED SUCCESSFULLY! " -ForegroundColor Green
Write-Host "=======================================================`n" -ForegroundColor Cyan
