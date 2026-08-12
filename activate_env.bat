@echo off
REM Activa el entorno virtual compartido y las variables de entorno de GDAL/OSGeo,
REM luego posiciona la sesion en este proyecto.

call "C:\ws\SKP\venv\Scripts\activate.bat"
call "C:\ws\SKP\venv\Lib\site-packages\osgeo\setenv.cmd"

cd /d "%~dp0"
