Write-Host "=== SAMOOR AUTOMATIC DEPLOYER ===" -ForegroundColor Yellow
$repoUrl = Read-Host "Вставьте ссылку на ваш репозиторий GitHub (например, https://github.com/username/repo)"
if (-not $repoUrl) {
    Write-Host "Ссылка не введена. Отмена." -ForegroundColor Red
    Exit
}

# Ensure .git is initialized
if (-not (Test-Path .git)) {
    git init
}

# Add all files
git add -A

# Commit
git commit -m "Complete deployment with admin and images"

# Set remote origin
git remote remove origin 2>$null
git remote add origin $repoUrl

# Push
Write-Host "Отправка файлов на GitHub..." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "Успешно отправлено! Railway сейчас начнет автодеплой." -ForegroundColor Green
} else {
    Write-Host "Попытка пуша в ветку main не удалась, пробуем ветку master..." -ForegroundColor Yellow
    git push -u origin master --force
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Успешно отправлено в ветку master!" -ForegroundColor Green
    } else {
        Write-Host "Ошибка при отправке. Проверьте правильность ссылки и авторизацию в Git." -ForegroundColor Red
    }
}
pause
