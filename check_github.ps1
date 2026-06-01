$result = Test-NetConnection github.com -Port 443 -WarningAction SilentlyContinue
Write-Output $result.TcpTestSucceeded
