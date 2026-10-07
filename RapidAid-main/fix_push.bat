@echo off
cd /d "%~dp0RapidAid"
git add -A
git commit --amend -m "Fixed API keys - using environment variables"
git push origin main --force
pause
</parameter>
</create_file>
