#!/bin/sh
set -e

echo "Running PostgreSQL migrations..."
/app/bin/plausible eval '
{:ok,_}=Application.ensure_all_started(:ecto_sql)
{:ok,pid}=Plausible.Repo.start_link(pool_size: 2)
Ecto.Migrator.run(Plausible.Repo,"/app/lib/plausible-0.0.1/priv/repo/migrations",:up,all: true)
GenServer.stop(pid)
'
echo "PostgreSQL migrations completed."

# ── Create admin user from env vars (if not exists) ───────────────
# Why: Our migration script creates tables before Plausible app starts,
# which tricks the app's "fresh install" detection into skipping admin
# user creation from ADMIN_USER_EMAIL / ADMIN_USER_PWD env vars.
# Uses raw SQL to avoid dependency on schema modules that may not be loaded.
echo "Checking admin user..."
/app/bin/plausible eval '
{:ok,_}=Application.ensure_all_started(:ecto_sql)
{:ok,pid}=Plausible.Repo.start_link(pool_size: 2)

email = System.get_env("ADMIN_USER_EMAIL") || System.get_env("PLAUSIBLE_ADMIN_EMAIL") || ""
password = System.get_env("ADMIN_USER_PWD") || System.get_env("PLAUSIBLE_ADMIN_PASSWORD") || ""

if email == "" or password == "" do
  IO.puts("WARNING: ADMIN_USER_EMAIL or ADMIN_USER_PWD not set, skipping admin creation.")
else
  try do
    result = Plausible.Repo.query!("SELECT id FROM users WHERE email = $1", [email])

    if result.num_rows == 0 do
      name = System.get_env("ADMIN_USER_NAME") || "Admin"
      hash = Bcrypt.hash_pwd_salt(password)
      now = NaiveDateTime.utc_now()

      Plausible.Repo.query!(
        "INSERT INTO users (email, name, password_hash, inserted_at, updated_at, email_verified, totp_enabled, allow_next_upgrade_override) VALUES ($1, $2, $3, $4, $5, true, false, false)",
        [email, name, hash, now, now]
      )
      IO.puts("Admin user created: #{email}")
    else
      IO.puts("Admin user already exists: #{email}")
    end
  rescue
    e -> IO.puts("Warning: Could not create admin user: #{inspect(e)}")
  end
end

GenServer.stop(pid)
'

echo "Starting Plausible..."
exec /entrypoint.sh run
