@echo off
chcp 65001 >nul
title 场景模板预览工具
echo.
echo  ========================================
echo   场景模板预览工具 (Vite + React)
echo   端口: 5174
echo  ========================================
echo.
echo  正在启动...
echo  启动后浏览器打开: http://localhost:5174
echo  按 Ctrl+C 停止
echo.

cd /d "%~dp0\.."
npx vite --config preview/vite.config.ts

pause
