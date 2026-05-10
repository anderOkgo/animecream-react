@ECHO OFF
SETLOCAL

:: Si se envía el parámetro 'img', saltamos directamente a la parte de WinSCP
IF /I "%1"=="img" GOTO :ONLY_IMG

:: --- MODO NORMAL ---
IF EXIST setter.bat (CD.. & DEL /F /Q dist\img\tarjeta\) ELSE ( DEL /F /Q dist\img\tarjeta\ )
IF EXIST setter.bat (CD.. & CALL com\setter.bat) ELSE ( CALL com\setter.bat )
"keys/WinSCP.com" ^
  /command ^
    "open ftp://%FTPUsername.txt%:%FTPPss.txt%@%FTPserver.txt%" ^
    "option batch off" ^
    "synchronize both ""%LocalPathBup.txt%\img\tarjeta\"" /img/tarjeta/" ^
    "rmdir assets" ^
    "synchronize remote ""%LocalPath.txt%\"" /%FTPFolder.txt%" ^
    "exit"
GOTO :END

:: --- MODO SOLO IMÁGENES ---
:ONLY_IMG
IF EXIST setter.bat (CD.. & CALL com\setter.bat) ELSE ( CALL com\setter.bat )

"keys/WinSCP.com" ^
  /command ^
    "open ftp://%FTPUsername.txt%:%FTPPss.txt%@%FTPserver.txt%" ^
    "option batch off" ^
    "synchronize both ""%LocalPathBup.txt%\img\tarjeta\"" /img/tarjeta/" ^
    "exit"

:END
IF %ERRORLEVEL% EQU 0 (Echo No error found) ELSE (Echo An error was found)
PAUSE
