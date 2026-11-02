$ErrorActionPreference = 'Stop'
node "$PSScriptRoot/verify-built.mjs"
if ($LASTEXITCODE -ne 0) { throw 'Built verification failed' }
