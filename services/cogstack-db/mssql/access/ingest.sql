SET XACT_ABORT ON;
-- Validate UTF-16 lengths before conversion to SQL Server's 128-unit fields.
IF DATALENGTH(@ingest_user) > 256 OR DATALENGTH(@ingest_password) > 256
BEGIN
    THROW 51000, 'The ingestion login or password exceeds SQL Server length limits.', 1;
END;
BEGIN TRANSACTION;

-- Never turn an administrator, database owner, or existing role member into
-- the application account. Choose a separate SQL login for ingestion.
IF @ingest_user = ORIGINAL_LOGIN()
   OR EXISTS (
       SELECT 1 FROM sys.server_role_members
       WHERE member_principal_id = SUSER_ID(@ingest_user)
   )
   OR EXISTS (SELECT 1 FROM sys.databases WHERE owner_sid = SUSER_SID(@ingest_user))
   OR EXISTS (
       SELECT 1 FROM sys.server_permissions
       WHERE grantee_principal_id = SUSER_ID(@ingest_user)
         AND state IN ('G', 'W') AND permission_name <> 'CONNECT SQL'
   )
   OR EXISTS (
       SELECT 1 FROM sys.server_principals
       WHERE name = @ingest_user AND type <> 'S'
   )
BEGIN
    THROW 51000, 'Choose a separate, unprivileged SQL ingestion login.', 1;
END;

DECLARE @login_sql nvarchar(max);
IF SUSER_ID(@ingest_user) IS NULL
    SET @login_sql = N'CREATE LOGIN ' + QUOTENAME(@ingest_user)
        + N' WITH PASSWORD = N' + QUOTENAME(@ingest_password, '''') + N', CHECK_POLICY = ON';
ELSE
    SET @login_sql = N'ALTER LOGIN ' + QUOTENAME(@ingest_user)
        + N' WITH PASSWORD = N' + QUOTENAME(@ingest_password, '''');
EXEC sys.sp_executesql @login_sql;

IF USER_ID(@ingest_user) IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1 FROM sys.database_role_members
        WHERE member_principal_id = USER_ID(@ingest_user)
    ) OR EXISTS (
        SELECT 1 FROM sys.schemas WHERE principal_id = USER_ID(@ingest_user)
    ) OR EXISTS (
        SELECT 1 FROM sys.objects WHERE principal_id = USER_ID(@ingest_user)
    ) OR EXISTS (
        SELECT 1 FROM sys.database_principals
        WHERE name = @ingest_user AND sid <> SUSER_SID(@ingest_user)
    ) OR EXISTS (
        SELECT 1 FROM sys.database_permissions
        WHERE grantee_principal_id = USER_ID(@ingest_user)
          AND state IN ('G', 'W')
          AND permission_name NOT IN ('CONNECT', 'SELECT', 'INSERT', 'UPDATE', 'DELETE')
    )
    BEGIN
        THROW 51000, 'The ingestion database user has ownership, role membership, or a different login mapping.', 1;
    END;
END
ELSE
BEGIN
    DECLARE @user_sql nvarchar(max) = N'CREATE USER ' + QUOTENAME(@ingest_user)
        + N' FOR LOGIN ' + QUOTENAME(@ingest_user);
    EXEC sys.sp_executesql @user_sql;
END;

DECLARE @grant_sql nvarchar(max) = N'GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::[CogStack] TO '
    + QUOTENAME(@ingest_user);
EXEC sys.sp_executesql @grant_sql;
COMMIT TRANSACTION;
