param([int]$Port = 4174)
node (Join-Path $PSScriptRoot 'server.mjs') --port $Port
