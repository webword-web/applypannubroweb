<#
.SYNOPSIS
  Setup & Launch script for APPLY PANNU BRO ASP.NET Core Application
  Run this from the project root: .\run.ps1

.DESCRIPTION
  - Verifies .NET 8 SDK is installed (downloads installer page if not found)
  - Verifies SQL Server LocalDB is available
  - Restores NuGet packages
  - Builds the project
  - Starts the development server on http://localhost:5000

.NOTES
  Admin Login: admin / apb@2025
  Admin Panel: http://localhost:5000/admin
#>

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    APPLY PANNU BRO - Server Setup & Launch Script         " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────
# 1.  Check .NET SDK 8+
# ─────────────────────────────────────────────────────────────
Write-Host "[1/5] Checking .NET SDK..." -ForegroundColor Yellow

$dotnetCmd = Get-Command dotnet -ErrorAction SilentlyContinue
if (-not $dotnetCmd) {
    Write-Host ""
    Write-Host "  [ERROR] 'dotnet' command not found in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Please install .NET 8 SDK from:" -ForegroundColor White
    Write-Host "  https://dotnet.microsoft.com/en-us/download/dotnet/8.0" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  After installation, restart PowerShell and run this script again." -ForegroundColor White
    exit 1
}

$dotnetVersion = & dotnet --version 2>&1
$majorVersion = [int]($dotnetVersion -split '\.')[0]

if ($majorVersion -lt 8) {
    Write-Host ""
    Write-Host "  [WARNING] Detected .NET $dotnetVersion — this project requires .NET 8+." -ForegroundColor Yellow
    Write-Host "  Download: https://dotnet.microsoft.com/en-us/download/dotnet/8.0" -ForegroundColor Blue
    Write-Host ""
    $continue = Read-Host "  Try to continue anyway? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') { exit 1 }
} else {
    Write-Host "  [OK] .NET SDK $dotnetVersion detected." -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# 2.  Check SQL LocalDB or SQL Server
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/5] Checking SQL Server LocalDB..." -ForegroundColor Yellow

$sqllocaldb = Get-Command sqllocaldb -ErrorAction SilentlyContinue
if (-not $sqllocaldb) {
    Write-Host ""
    Write-Host "  [WARNING] 'sqllocaldb' command not found." -ForegroundColor Yellow
    Write-Host "  You need SQL Server LocalDB (included with Visual Studio) or a full SQL Server." -ForegroundColor White
    Write-Host "  Download LocalDB: https://docs.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  The app will still try to start. If the DB connection fails, update" -ForegroundColor White
    Write-Host "  the connection string in appsettings.json to point to your SQL Server." -ForegroundColor White
} else {
    # Make sure the MSSQLLocalDB instance exists and is running
    $localdbInfo = & sqllocaldb info MSSQLLocalDB 2>&1
    if ($localdbInfo -match "doesn't exist" -or $localdbInfo -match "does not exist") {
        Write-Host "  Creating MSSQLLocalDB instance..." -ForegroundColor Cyan
        & sqllocaldb create MSSQLLocalDB | Out-Null
    }
    $instanceStatus = & sqllocaldb info MSSQLLocalDB 2>&1
    if ($instanceStatus -match "Stopped") {
        Write-Host "  Starting MSSQLLocalDB instance..." -ForegroundColor Cyan
        & sqllocaldb start MSSQLLocalDB | Out-Null
    }
    Write-Host "  [OK] SQL LocalDB ready." -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# 3.  Restore NuGet Packages
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/5] Restoring NuGet packages..." -ForegroundColor Yellow

$restoreResult = & dotnet restore 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [ERROR] Package restore failed. Output:" -ForegroundColor Red
    Write-Host $restoreResult
    exit 1
}
Write-Host "  [OK] Packages restored." -ForegroundColor Green

# ─────────────────────────────────────────────────────────────
# 4.  Build Project
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/5] Building project..." -ForegroundColor Yellow

$buildResult = & dotnet build --no-restore 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [ERROR] Build failed. Output:" -ForegroundColor Red
    $buildResult | ForEach-Object { Write-Host "  $_" }
    Write-Host ""
    Write-Host "  Common fixes:" -ForegroundColor White
    Write-Host "  - Ensure all referenced NuGet packages are listed in the .csproj file" -ForegroundColor White
    Write-Host "  - Check for syntax errors in C# files" -ForegroundColor White
    exit 1
}
Write-Host "  [OK] Build successful." -ForegroundColor Green

# ─────────────────────────────────────────────────────────────
# 5.  Launch Development Server
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  App is starting at: http://localhost:5000              " -ForegroundColor White
Write-Host "  Admin Panel:        http://localhost:5000/admin         " -ForegroundColor White
Write-Host "  Default Login:      admin / apb@2025                   " -ForegroundColor White
Write-Host "  Press CTRL+C to stop the server                        " -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Open the browser after a short delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:5000"
} | Out-Null

# Run the app
& dotnet run --urls "http://localhost:5000"
