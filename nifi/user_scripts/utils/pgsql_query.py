import psycopg

conn = psycopg.connect(
    host="localhost",
    database="suppliers",
    user="YourUsername",
    password="YourPassword"
)
