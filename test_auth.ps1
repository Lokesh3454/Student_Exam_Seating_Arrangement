$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Calling /api/auth/login with admin credentials..."
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $body
Write-Host "Status: Success"
Write-Host "Response:" ($response | ConvertTo-Json)

$adminToken = $response.token

Write-Host "`nTesting Protected Endpoint /api/faculty with Admin Token..."
$headers = @{
    Authorization = "Bearer $adminToken"
}
$faculty = Invoke-RestMethod -Uri "http://localhost:8080/api/faculty" -Method Get -Headers $headers
Write-Host "Faculty count:" $faculty.data.Count

Write-Host "`nTesting Student Login..."
$studentBody = @{
    username = "student"
    password = "student123"
} | ConvertTo-Json
$studentResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $studentBody
Write-Host "Student Role:" $studentResp.role

Write-Host "`nTesting Student Token on Admin Endpoint /api/faculty (Expected: 403 Forbidden)..."
$studentHeaders = @{
    Authorization = "Bearer $($studentResp.token)"
}
try {
    $denied = Invoke-RestMethod -Uri "http://localhost:8080/api/faculty" -Method Get -Headers $studentHeaders
    Write-Host "ERROR: Student was allowed to access /api/faculty!"
} catch {
    Write-Host "SUCCESS: Access Denied as expected! Status Code:" $_.Exception.Response.StatusCode.value__
}

Write-Host "`nTesting Unauthenticated Access on /api/students (Expected: 401 Unauthorized)..."
try {
    $unauth = Invoke-RestMethod -Uri "http://localhost:8080/api/students" -Method Get
    Write-Host "ERROR: Unauthenticated request was allowed!"
} catch {
    Write-Host "SUCCESS: Unauthorized as expected! Status Code:" $_.Exception.Response.StatusCode.value__
}
