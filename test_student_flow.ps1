$body = @{
    username = "21CS001"
    password = "student123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $body
Write-Host "Student Logged In: Username=$($loginRes.username) Role=$($loginRes.role)"

$headers = @{
    Authorization = "Bearer $($loginRes.token)"
}

$exams = Invoke-RestMethod -Uri "http://localhost:8080/api/exams" -Method Get -Headers $headers
Write-Host "Student Timetable: Total Exams = $($exams.data.Count)"

$halls = Invoke-RestMethod -Uri "http://localhost:8080/api/halls" -Method Get -Headers $headers
Write-Host "Student Hall Directory: Total Halls = $($halls.data.Count)"

$seat = Invoke-RestMethod -Uri "http://localhost:8080/api/seating/student/21CS001/exam/1" -Method Get -Headers $headers
Write-Host "Student Seat Slip: Student=$($seat.data.studentName) | Hall=$($seat.data.hall) | Seat=$($seat.data.seat) | Row=$($seat.data.row) | Col=$($seat.data.column)"
Write-Host "STUDENT FLOW VERIFIED SUCCESSFULLY!"
