# Script de diagnostic réseau pour APIs SaaS
# Vérifie la connectivité DNS et HTTPS vers HubSpot et Zoho

Write-Host "=== Diagnostic Réseau - APIs SaaS ===" -ForegroundColor Cyan
Write-Host ""

# Domaines à tester
$domains = @(
    "api.hubapi.com",
    "accounts.zoho.eu",
    "www.zohoapis.eu",
    "books.zoho.eu"
)

# Test 1: Résolution DNS
Write-Host "1. Test de résolution DNS..." -ForegroundColor Yellow
foreach ($domain in $domains) {
    try {
        $result = Resolve-DnsName -Name $domain -ErrorAction Stop
        Write-Host "  ✓ $domain : " -NoNewline -ForegroundColor Green
        Write-Host "$($result[0].IPAddress)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ $domain : ÉCHEC - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Connectivité HTTPS (port 443)
Write-Host "2. Test de connectivité HTTPS (port 443)..." -ForegroundColor Yellow
foreach ($domain in $domains) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.ReceiveTimeout = 3000
        $tcpClient.SendTimeout = 3000
        $tcpClient.Connect($domain, 443)
        
        if ($tcpClient.Connected) {
            Write-Host "  ✓ $domain : Port 443 accessible" -ForegroundColor Green
        }
        $tcpClient.Close()
    } catch {
        Write-Host "  ✗ $domain : Port 443 bloqué - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Requête HTTPS réelle
Write-Host "3. Test de requête HTTPS..." -ForegroundColor Yellow
$testUrls = @{
    "HubSpot" = "https://api.hubapi.com"
    "Zoho EU" = "https://accounts.zoho.eu"
}

foreach ($service in $testUrls.Keys) {
    try {
        $response = Invoke-WebRequest -Uri $testUrls[$service] -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✓ $service : HTTP $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "  ⚠ $service : HTTP $statusCode (serveur accessible)" -ForegroundColor Yellow
        } else {
            Write-Host "  ✗ $service : ÉCHEC - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Test 4: Configuration proxy
Write-Host "4. Configuration proxy système..." -ForegroundColor Yellow
$proxySettings = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
if ($proxySettings.ProxyEnable -eq 1) {
    Write-Host "  ⚠ Proxy activé : $($proxySettings.ProxyServer)" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Aucun proxy configuré" -ForegroundColor Green
}

Write-Host ""

# Test 5: Serveurs DNS configurés
Write-Host "5. Serveurs DNS configurés..." -ForegroundColor Yellow
$dnsServers = Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object {$_.ServerAddresses.Count -gt 0}
foreach ($adapter in $dnsServers) {
    Write-Host "  Interface: $($adapter.InterfaceAlias)" -ForegroundColor Gray
    foreach ($dns in $adapter.ServerAddresses) {
        Write-Host "    - $dns" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Fin du diagnostic ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si des erreurs apparaissent ci-dessus, contactez votre administrateur réseau avec ce rapport." -ForegroundColor Yellow
