$ErrorActionPreference = "Stop"
$body = @()
$urls = @("/packages.js","/rating.js","/push.js","/schedule.js","/booking_slots.js","/sw.js")
foreach ($f in $urls) {
    try {
        $r = Invoke-WebRequest -Uri "https://expert-platform-production-626e.up.railway.app$f" -TimeoutSec 10
        $content = $r.Content
        $lines = ($content -split "`n").Count
        Write-Output "$f Status:$($r.StatusCode) Size:$($content.Length) Lines:$lines"
        if ($content.Length -lt 500) {
            Write-Output "  Content: $($content.Substring(0, [Math]::Min(200, $content.Length)))"
        }
    } catch {
        Write-Output "$f Error: $($_.Exception.Message)"
    }
}