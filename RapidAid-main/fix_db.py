import sqlite3
conn = sqlite3.connect('rapidaid.db')
c = conn.cursor()
c.execute("UPDATE ambulances SET status = 'available'")
conn.commit()
print("All ambulances set to available")
c.execute("SELECT id, driver_name, status, latitude, longitude FROM ambulances")
print(c.fetchall())
conn.close()

