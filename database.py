import psycopg2


def connect_to_database():
    conn = psycopg2.connect("dbname='starwars' user=''")
    return conn


def write_to_database(command):
    conn = connect_to_database()
    cur = conn.cursor()
    with conn:
        with cur:
            cur.execute(command)


def database_reader(command):
    conn = connect_to_database()
    cur = conn.cursor()
    with conn:
        with cur:
            cur.execute(command)
            data_query = cur.fetchall()
            listed_query = [list(element) for element in data_query]
            return listed_query
