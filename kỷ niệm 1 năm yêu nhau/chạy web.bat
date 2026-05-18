@echo off
echo Dang khoi dong may chu web cuc bo...
echo Vui long khong tat cua so nay trong luc xem web.
start python -m http.server 8080
timeout /t 2 >nul
start http://localhost:8080/anniversary.html
