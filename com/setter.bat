@ECHO OFF
IF EXIST ".env" (
  FOR /F "usebackq eol=# tokens=1,* delims==" %%A IN (".env") DO (
    IF NOT "%%A"=="" SET "%%A=%%B"
  )
) ELSE (
  ECHO [setter] ERROR: .env not found. Copy .env.example to .env and fill it in, or run 0.symbolics.bat.
  EXIT /B 1
)
