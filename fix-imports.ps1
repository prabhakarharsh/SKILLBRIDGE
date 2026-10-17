$files = Get-ChildItem -Path "c:\vibe coding school\skill\src\app" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match '@/pages/') {
        $newContent = $content -replace '@/pages/', '@/views/'
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Fixed: $($file.FullName)"
    }
}
Write-Host "Done!"
